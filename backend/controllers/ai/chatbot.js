const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");
const Groq = require("groq-sdk");
const { hasSubSectionCourseAccess } = require("../../utils/courseAccess");
const { createEmbeddings, TaskType } = require("../../config/embeddings");
const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b";
const TOP_K_RESULTS = 5;

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



const createGroqClient = () => new Groq({ apiKey: process.env.GROQ_API_KEY });

const getVectorStore = async (embeddings, namespace) => {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.Index(process.env.PINECONE_INDEX);

  return PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace,
  });
};

const buildSystemPrompt = (context) => `
You are an intelligent, friendly, and enthusiastic learning assistant.

RULES:
1. If the student greets (hello, hi, hey, etc.), reply politely and ask how you can help with today’s lesson. Do NOT use lesson content.
2. Answer the question STRICTLY using ONLY the explicit facts provided in the "Lesson content" section below.
3. If the answer cannot be directly derived from the provided "Lesson content", state clearly that the lesson content does not contain this information. Absolute rule: DO NOT use your pre-trained background knowledge to guess or extrapolate.
4. If the question is completely unrelated to the lesson topic and not a greeting, inform them that the question is outside the lesson scope.

Lesson content:
${context}


FORMATTING (critical — this response renders as raw, unparsed text inside a chat bubble, NOT Markdown):
- Do NOT use ANY Markdown syntax at all: no "**bold**", no "*italic*", no "-" or "*" bullet lists, no "#" headings, no "|" tables, no backticks. The widget displays these symbols literally as characters — they are never rendered as formatting.
- Write in plain prose sentences and short paragraphs only.
- If you need to list a few items, write them as a normal sentence ("There are three approaches: X, Y, and Z.") or put each item on its own plain line with no leading symbol.
- Keep it short, conversational, and free of any special characters used for styling

IMPORTANT: - If user ask by their native language, answer in their native language. If you don't know the language, answer in English.
. Keep it short and helpful.`;

const sanitizeText = (text = "") =>
  text
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/\uFFFD/g, "")
    .trim();

const chunkHash = (text = "") =>
  require("crypto")
    .createHash("sha1")
    .update(
      String(text)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim()
    )
    .digest("hex")
    .slice(0, 8);

const getChunkId = (doc) => `c_${chunkHash(doc?.pageContent ?? doc?.metadata?.text ?? "")}`;

const buildContextFromResults = (results) => {
  if (!results?.length) return "No lesson content available.";

  return sanitizeText(
    results
      .map((doc) => doc?.pageContent ?? "")
      .filter(Boolean)
      .join("\n\n")
  );
};

const generateGroqAnswer = async (question, context) => {
  const groq = createGroqClient();

  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.3,
    messages: [
      { role: "system", content: buildSystemPrompt(context) },
      { role: "user", content: question },
    ],
  });

  const answer = response?.choices?.[0]?.message?.content;

  if (!answer) {
    throw new Error("Empty response from Groq");
  }

  return answer;
};

exports.chatWithSlide = async (req, res) => {
  try {
    const { question, subSectionId } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a question.",
      });
    }

    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing subSectionId.",
      });
    }

    if (
      !(await hasSubSectionCourseAccess({
        userId: req.user.id,
        accountType: req.user.accountType,
        subSectionId,
      }))
    ) {
      return res.status(403).json({
        success: false,
        message: "Enroll in this course to use the lesson assistant.",
      });
    }

    const safeQuestion = sanitizeText(String(question));
    const embeddings = createEmbeddings(
      TaskType.RETRIEVAL_QUERY
    ); 
    const vectorStore = await getVectorStore(
      embeddings,
      subSectionId.toString()
    );

    const startedAt = Date.now();
    let searchResults = [];
    let scores = [];

    try {
      const scored = await vectorStore.similaritySearchWithScore(
        safeQuestion,
        TOP_K_RESULTS
      );
      searchResults = scored.map(([doc]) => doc);
      scores = scored.map(([, score]) => score);
    } catch (error) {
      console.warn("Similarity search failed:", error.message);
    }

    const retrievalMs = Date.now() - startedAt;
    const context = buildContextFromResults(searchResults);

    const answer = await generateGroqAnswer(safeQuestion, context);
    const latencyMs = Date.now() - startedAt;

    const payload = {
      success: true,
      answer,
    };

    if (process.env.EVAL_MODE === "true") {
      payload.eval = {
        retrieved_chunks: searchResults
          .map((doc) => getChunkId(doc))
          .join("|"),
        scores,
        previews: searchResults.map((doc) =>
          sanitizeText(doc?.pageContent ?? "").slice(0, 120)
        ),
        retrieval_ms: retrievalMs,
        latency_ms: latencyMs,
        model: CHAT_MODEL,
      };
    }

    return res.status(200).json(payload);

  } catch (error) {
    console.error("CHAT_WITH_SLIDE_ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the question. Please try again later.",
    });
  }
};