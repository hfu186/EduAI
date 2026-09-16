const path = require("path");
const fs = require("fs");
const PDFParser = require("pdf2json");
const { fromPath } = require("pdf2pic");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { TaskType } = require("@google/generative-ai");
const { PineconeStore } = require("@langchain/pinecone");
const { Pinecone } = require("@pinecone-database/pinecone");
const Groq = require("groq-sdk");
const retryWithBackoff = require("../utils/retrywithBackoff");
const SubSection = require("../models/subSection");
const {
  GEMINI_EMBEDDING_MODEL,
  GEMINI_VISION_MODEL,
  GROQ_CHAT_MODEL,
  GROQ_FAST_CHAT_MODEL,
  EMBEDDING_OUTPUT_DIMENSIONS,
} = require("../config/ai");

/**
 * ---------------------------------------------------------------------------
 * One file, two jobs:
 *   1) INGESTION  — PDF -> text -> chunks -> embeddings -> Pinecone
 *      (extractTextFromPDF, processSlideForAI)
 *   2) RAG / CHAT — embed a question -> retrieve chunks -> ask Groq
 *      (retrieveContext, generateQuizJSON, answerWithRAG)
 * They share the same Pinecone index + embedding model config, which is the
 * main reason to keep them in one file: if the embedding model or dimension
 * changes, there's only one place to update instead of two files drifting
 * out of sync (this is literally what caused the 768 vs 3072 dimension bug).
 * ---------------------------------------------------------------------------
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const EMBEDDING_MODEL = GEMINI_EMBEDDING_MODEL;
const VISION_MODEL = GEMINI_VISION_MODEL; // NOTE: was "gemini-2.0-flash" (shut down 2026-06-01)
const CHAT_MODEL = GROQ_CHAT_MODEL;
const FAST_CHAT_MODEL = GROQ_FAST_CHAT_MODEL;

const MAX_CHARS = 15000;
const MIN_CHARS = 50;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const TMP_DIR = "/tmp/pdf2pic_slides";
const VISION_CALL_DELAY_MS = Number(process.env.VISION_CALL_DELAY_MS ?? 300);

const TOP_K_RESULTS = 6;
const MAX_CONTEXT_CHARS = 12000;
const MAX_HISTORY_TURNS = 6;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Shared clients ─────────────────────────────────────────────────────────

let groqClient = null;
const getGroqClient = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

let pineconeClient = null;
const getPineconeIndex = () => {
  if (!pineconeClient) pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  return pineconeClient.Index(process.env.PINECONE_INDEX);
};

const l2Normalize = (vector) => {
  const norm = Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
  return norm === 0 ? vector : vector.map((x) => x / norm);
};

const truncateToDimension = (vector, dimensions) => {
  if (!dimensions || vector.length <= dimensions) return vector;
  return l2Normalize(vector.slice(0, dimensions));
};


class DimensionTruncatedEmbeddings {
  constructor(baseEmbeddings, dimensions) {
    this.base = baseEmbeddings;
    this.dimensions = dimensions;
  }

  async embedDocuments(texts) {
    const vectors = await this.base.embedDocuments(texts);
    return vectors.map((v) => truncateToDimension(v, this.dimensions));
  }

  async embedQuery(text) {
    const vector = await this.base.embedQuery(text);
    return truncateToDimension(vector, this.dimensions);
  }
}

const createEmbeddings = (taskType) => {
  const base = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: EMBEDDING_MODEL,
    taskType,
  });
  return new DimensionTruncatedEmbeddings(base, EMBEDDING_OUTPUT_DIMENSIONS);
};

const withRetry = (fn, label = "groq") => retryWithBackoff(fn, { label });
const extractTextLegacy = (filePath) =>
  new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData) =>
      reject(new Error(`PDF parse error: ${errData.parserError}`))
    );

    pdfParser.on("pdfParser_dataReady", () => {
      const rawText = pdfParser.getRawTextContent();

      let decoded;
      try {
        decoded = decodeURIComponent(rawText);
      } catch {
        decoded = rawText.replace(/%[0-9A-F]{2}/gi, " ");
      }

      const cleanText = decoded
        .replace(/----------------Page \(\d+\) Break----------------/g, "")
        .replace(/^[A-Z]\.\w+\s*\(\d+\)\s*/gm, "")
        .replace(/[A-Z]:\\[\w\\\.]+/g, "")
        .replace(/Volume in drive.+/g, "")
        .replace(/Volume Serial Number.+/g, "")
        .replace(/Directory of.+/g, "")
        .replace(/\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\s+[\d,]+\s+\S+\.dll/g, "")
        .replace(/[^\x20-\x7E\u00C0-\u1EF9]/g, " ")
        .replace(/\r\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      resolve(cleanText);
    });

    pdfParser.loadPDF(filePath);
  });

const getPDFPageCount = (filePath) =>
  new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", reject);
    pdfParser.on("pdfParser_dataReady", (data) => {
      resolve(data?.Pages?.length || 1);
    });
    pdfParser.loadPDF(filePath);
  });

const cleanupTmpFiles = () => {
  try {
    const files = fs.readdirSync(TMP_DIR);
    files.forEach((f) => fs.unlinkSync(path.join(TMP_DIR, f)));
  } catch {
  }
};

const extractTextVisionFallback = async (filePath) => {
  console.log(`Switching to Vision AI fallback (${VISION_MODEL})...`);
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  const model = genAI.getGenerativeModel({ model: VISION_MODEL });

  const pageCount = await getPDFPageCount(filePath);
  console.log(`Total pages: ${pageCount}`);

  const converter = fromPath(filePath, {
    density: 150,
    saveFilename: "slide",
    savePath: TMP_DIR,
    format: "png",
    width: 1280,
    height: 960,
  });

  const pageDescriptions = [];

  for (let i = 1; i <= pageCount; i++) {
    try {
      const result = await converter(i, { responseType: "base64" });

      const response = await withRetry(
        () =>
          model.generateContent([
            {
              inlineData: { data: result.base64, mimeType: "image/png" },
            },
            `This is slide ${i}. Describe all content: the title, key points, tables, charts, and diagrams if present. Present the explanation clearly and completely in English.`,
          ]),
        `vision-slide-${i}`
      );

      const text = response.response.text();
      pageDescriptions.push(`=== Slide ${i} ===\n${text}`);
    } catch (err) {
      console.warn(`Skipped slide ${i}: ${err.message}`);
    }

    if (VISION_CALL_DELAY_MS > 0 && i < pageCount) {
      await sleep(VISION_CALL_DELAY_MS);
    }
  }
  cleanupTmpFiles();

  return pageDescriptions.join("\n\n");
};

const extractTextFromPDF = async (filePath) => {
  const legacyText = await extractTextLegacy(filePath);

  if (legacyText.length >= MIN_CHARS) {
    console.log(`📝 Text extracted normally (${legacyText.length} chars)`);
    return legacyText;
  }

  return await extractTextVisionFallback(filePath);
};

const splitTextIntoDocs = async (text, metadata) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const docs = await splitter.createDocuments([text]);

  docs.forEach((doc) => {
    doc.metadata = { ...doc.metadata, ...metadata };
  });

  return docs;
};

const uploadVectorsToPinecone = async (docs, embeddings, namespace) => {
  const index = getPineconeIndex();

  await retryWithBackoff(
    () => PineconeStore.fromDocuments(docs, embeddings, { pineconeIndex: index, namespace }),
    { label: "pinecone-upsert" }
  );
};

const markSubSectionAsIndexed = (subSectionId, totalChunks) =>
  SubSection.findByIdAndUpdate(subSectionId, {
    aiMetadata: { isIndexed: true, totalChunks, lastProcessed: new Date() },
  });

/**
 * @param {string} subSectionId
 * @param {string} relativeFilePath
 */
const processSlideForAI = async (subSectionId, relativeFilePath) => {
  try {
    const filePath = path.join(process.cwd(), relativeFilePath);

    let fullText = await extractTextFromPDF(filePath);

    if (fullText.length < MIN_CHARS) {
      return false;
    }

    if (fullText.length > MAX_CHARS) {
      fullText = fullText.substring(0, MAX_CHARS);
    }

    const docs = await splitTextIntoDocs(fullText, { subSectionId: subSectionId.toString() });
    const embeddings = createEmbeddings(TaskType.RETRIEVAL_DOCUMENT);

    await uploadVectorsToPinecone(docs, embeddings, subSectionId.toString());
    await markSubSectionAsIndexed(subSectionId, docs.length);

    console.log(`AI has finished processing: ${subSectionId}`);
    return true;
  } catch (error) {
    console.error(`ERROR]: ${error.message}`);
    return false;
  }
};

// =============================================================================
// 2) RAG / CHAT — retrieve chunks -> ask Groq (quiz generation + chatbot)
// =============================================================================

const sanitizeText = (text) =>
  (text || "")
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/\uFFFD/g, "")
    .trim();

const retrieveContext = async ({ namespace, query, topK = TOP_K_RESULTS }) => {
  const embeddings = createEmbeddings(TaskType.RETRIEVAL_QUERY);
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: getPineconeIndex(),
    namespace: namespace.toString(),
  });

  let matches = [];
  try {
    matches = await vectorStore.similaritySearch(query, topK);
  } catch (searchErr) {
    console.warn("similaritySearch failed:", searchErr.message);
  }

  const context = matches
    .map((m) => sanitizeText(m?.pageContent))
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_CONTEXT_CHARS);

  return { context, matches };
};

const buildQuizPrompt = (context, numberOfQuestions) =>
  `You are an expert educator. Based ONLY on the lesson content below, create exactly ${numberOfQuestions} multiple-choice questions.

Lesson Content:
${context}

Rules:
- Questions must be strictly based on the lesson content above.
- Each question must have exactly 4 options (A, B, C, D).
- correctAnswer is the index (0 = A, 1 = B, 2 = C, 3 = D).
- Write questions and answers in English.
- Return ONLY a valid JSON object (no markdown, no explanation, no extra text) with this exact shape:

{
  "questions": [
    {
      "question": "Question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Short explanation of why the answer is correct"
    }
  ]
}`;

const buildChatSystemPrompt = () =>
  `You are a helpful course assistant. Answer the user's question using ONLY the lesson context provided below.
- If the context does not contain the answer, say clearly that you don't have enough information from the lesson material, then you may answer briefly from general knowledge but say so explicitly.
- Be concise and use the same language the user asked in.
- Do not invent facts, citations, or details that are not supported by the context.`;

const generateQuizJSON = async (context, numberOfQuestions) => {
  const groq = getGroqClient();

  const response = await withRetry(() =>
    groq.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: buildQuizPrompt(context, numberOfQuestions) }],
    })
  );

  const rawText = response.choices[0]?.message?.content ?? "";
  console.log("Groq raw (first 300 chars):", rawText.substring(0, 300));

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(cleaned);
  }

  const questions = Array.isArray(parsed) ? parsed : parsed.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Invalid quiz format returned from AI.");
  }

  return questions;
};

/**
 * @param {Object} params
 * @param {string} params.namespace
 * @param {string} params.question
 * @param {Array}  [params.history]  [{ role: "user"|"assistant", content }]
 * @param {boolean} [params.stream]
 * @param {boolean} [params.fast]    use the cheaper/faster chat model
 */
const answerWithRAG = async ({ namespace, question, history = [], stream = false, fast = false }) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  const { context, matches } = await retrieveContext({ namespace, query: question });

  const messages = [
    { role: "system", content: buildChatSystemPrompt() },
    ...history.slice(-MAX_HISTORY_TURNS).map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user",
      content: `Lesson context:\n${context || "(no relevant context found)"}\n\nQuestion: ${question}`,
    },
  ];

  const groq = getGroqClient();
  const model = fast ? FAST_CHAT_MODEL : CHAT_MODEL;

  if (stream) {
    const streamResponse = await withRetry(() =>
      groq.chat.completions.create({ model, temperature: 0.4, messages, stream: true })
    );
    return { stream: streamResponse, matches };
  }

  const response = await withRetry(() =>
    groq.chat.completions.create({ model, temperature: 0.4, messages })
  );

  const answer = response.choices[0]?.message?.content ?? "";
  return { answer, matches };
};

module.exports = {
  // ingestion
  processSlideForAI,
  extractTextFromPDF,
  // retrieval / generation
  EMBEDDING_MODEL,
  CHAT_MODEL,
  FAST_CHAT_MODEL,
  TOP_K_RESULTS,
  retrieveContext,
  generateQuizJSON,
  answerWithRAG,
  sanitizeText,
};