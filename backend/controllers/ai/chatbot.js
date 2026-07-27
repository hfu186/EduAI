const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { TaskType } = require("@google/generative-ai");
const { PineconeStore } = require("@langchain/pinecone");
const Groq = require("groq-sdk");

const EMBEDDING_MODEL = "models/gemini-embedding-001";
const CHAT_MODEL = "llama-3.1-8b-instant";
const TOP_K_RESULTS = 3;

const createEmbeddings = () =>
  new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: EMBEDDING_MODEL,
    taskType: TaskType.RETRIEVAL_QUERY,
  });

const createGroqClient = () =>
  new Groq({ apiKey: process.env.GROQ_API_KEY });

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

IMPORTANT: Respond strictly in English. Keep it short and helpful.`;

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
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing the question. Please try again later.",
    });
  }
};