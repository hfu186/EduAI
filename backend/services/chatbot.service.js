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
const SubSection = require("../models/subSection");

// ─── Constants ────────────────────────────────────────────────────────────────
// NOTE: pulled from env the same way ai_service.js does, so ingestion and
// retrieval can never silently drift onto different embedding configs again.

const MAX_CHARS = 15000;
const MIN_CHARS = 50;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "models/gemini-embedding-001";
const VISION_MODEL = process.env.GEMINI_VISION_MODEL || "gemini-3.5-flash-lite";
const TMP_DIR = "/tmp/pdf2pic_slides";

// Must match the actual dimension of your Pinecone index (see create-index.js).
// Same env var / same default as ai_service.js and chatbot.js — this is the
// value that was missing here before, which caused ingestion to upload
// full 3072-dim vectors into a 768-dim index (upsert failure -> nothing
// ever got indexed -> empty retrieval downstream).
const EMBEDDING_OUTPUT_DIMENSIONS = Number(process.env.EMBEDDING_OUTPUT_DIMENSIONS ?? 768);

// ─── Embedding dimension fix (kept identical to ai_service.js / chatbot.js) ──

/**
 * @langchain/google-genai (JS) silently ignores an `outputDimensionality`
 * constructor option — unlike the Python package — so
 * "models/gemini-embedding-001" always returns the full 3072-dim vector no
 * matter what you pass. This truncates + L2-renormalizes the vector to the
 * target size, which is Google's own recommended approach for using a
 * smaller dimension with Matryoshka-trained embedding models when the
 * client library can't request it directly.
 *
 * IMPORTANT: this must be applied on BOTH sides — when embedding documents
 * for upload (here) and when embedding queries for search (ai_service.js /
 * chatbot.js) — or the vectors won't be comparable and/or Pinecone will
 * reject the upsert outright.
 */
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

      const response = await model.generateContent([
        {
          inlineData: {
            data: result.base64,
            mimeType: "image/png",
          },
        },
        `This is slide ${i}. Describe all content: the title, key points, tables, charts, and diagrams if present. Present the explanation clearly and completely in English.`,
      ]);

      const text = response.response.text();
      pageDescriptions.push(`=== Slide ${i} ===\n${text}`);
    } catch (err) {
      console.warn(`Skipped slide ${i}: ${err.message}`);
    }
  }
  cleanupTmpFiles();

  return pageDescriptions.join("\n\n");
};

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

const extractTextFromPDF = async (filePath) => {
  const legacyText = await extractTextLegacy(filePath);

  if (legacyText.length >= MIN_CHARS) {
    console.log(`📝 Text extracted normally (${legacyText.length} chars)`);
    return legacyText;
  }

  return await extractTextVisionFallback(filePath);
};

// Now truncates to EMBEDDING_OUTPUT_DIMENSIONS, same as the query-side
// embeddings in ai_service.js / chatbot.js, so ingested vectors actually
// match what similaritySearch will send later.
const createEmbeddings = () => {
  const base = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: EMBEDDING_MODEL,
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });
  return new DimensionTruncatedEmbeddings(base, EMBEDDING_OUTPUT_DIMENSIONS);
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
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.Index(process.env.PINECONE_INDEX);

  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex: index,
    namespace,
  });
};

const markSubSectionAsIndexed = (subSectionId, totalChunks) =>
  SubSection.findByIdAndUpdate(subSectionId, {
    aiMetadata: {
      isIndexed: true,
      totalChunks,
      lastProcessed: new Date(),
    },
  });

/**
 * @param {string} subSectionId
 * @param {string} relativeFilePath
 */
exports.processSlideForAI = async (subSectionId, relativeFilePath) => {

  try {
    const filePath = path.join(process.cwd(), relativeFilePath);

    let fullText = await extractTextFromPDF(filePath);

    if (fullText.length < MIN_CHARS) {
      return false;
    }

    if (fullText.length > MAX_CHARS) {
      fullText = fullText.substring(0, MAX_CHARS);
    }

    const docs = await splitTextIntoDocs(fullText, {
      subSectionId: subSectionId.toString(),
    });
    const embeddings = createEmbeddings();

    await uploadVectorsToPinecone(docs, embeddings, subSectionId.toString());

    await markSubSectionAsIndexed(subSectionId, docs.length);

    console.log(`AI has finished processing: ${subSectionId}`);
    return true;
  } catch (error) {
    console.error(`ERROR]: ${error.message}`);
    return false;
  }
};