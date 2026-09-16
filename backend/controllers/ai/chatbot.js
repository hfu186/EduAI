const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { TaskType } = require("@google/generative-ai");
const { PineconeStore } = require("@langchain/pinecone");
const Groq = require("groq-sdk");

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "models/gemini-embedding-001";
// "llama-3.1-8b-instant" is listed as Enterprise-only on Groq (contact-sales
// pricing, no public rate limit) — not available on a normal/free API key.
// Swapped for "openai/gpt-oss-20b": fast, cheap, works on free tier.
const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b";
const TOP_K_RESULTS = 3;

// Must match the actual dimension of your Pinecone index (see create-index.js).
const EMBEDDING_OUTPUT_DIMENSIONS = Number(process.env.EMBEDDING_OUTPUT_DIMENSIONS ?? 768);

/**
 * @langchain/google-genai (JS) silently ignores an `outputDimensionality`
 * constructor option — unlike the Python package — so
 * "models/gemini-embedding-001" always returns the full 3072-dim vector no
 * matter what you pass. This truncates + L2-renormalizes the vector to the
 * target size, which is Google's own recommended approach for using a
 * smaller dimension with Matryoshka-trained embedding models when the
 * client library can't request it directly.
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

const createEmbeddings = () => {
  const base = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: EMBEDDING_MODEL,
    taskType: TaskType.RETRIEVAL_QUERY,
  });
  return new DimensionTruncatedEmbeddings(base, EMBEDDING_OUTPUT_DIMENSIONS);
};

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
2. If the question is related to the lesson, answer based only on the lesson content below. Keep it concise and easy to understand.
3. If the question is unrelated to the lesson and not a greeting, inform them that the question is outside the lesson scope and suggest asking the instructor.

Lesson content:
${context}

FORMATTING (critical — this response renders as raw, unparsed text inside a chat bubble, NOT Markdown):
- Do NOT use ANY Markdown syntax at all: no "**bold**", no "*italic*", no "-" or "*" bullet lists, no "#" headings, no "|" tables, no backticks. The widget displays these symbols literally as characters — they are never rendered as formatting.
- Write in plain prose sentences and short paragraphs only.
- If you need to list a few items, write them as a normal sentence ("There are three approaches: X, Y, and Z.") or put each item on its own plain line with no leading symbol.
- Keep it short, conversational, and free of any special characters used for styling.

IMPORTANT: - If user ask by their native language, answer in their native language. If you don't know the language, answer in English.
. Keep it short and helpful.`;

const sanitizeText = (text = "") =>
  text
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/\uFFFD/g, "")
    .trim();

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

    const safeQuestion = sanitizeText(String(question));

    const embeddings = createEmbeddings();
    const vectorStore = await getVectorStore(
      embeddings,
      subSectionId.toString()
    );

    let searchResults = [];

    try {
      searchResults = await vectorStore.similaritySearch(
        safeQuestion,
        TOP_K_RESULTS
      );
    } catch (error) {
      console.warn("Similarity search failed:", error.message);
    }

    const context = buildContextFromResults(searchResults);

    const answer = await generateGroqAnswer(safeQuestion, context);

    return res.status(200).json({
      success: true,
      answer,
    });

  } catch (error) {
    console.error("CHAT_WITH_SLIDE_ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the question. Please try again later.",
    });
  }
};