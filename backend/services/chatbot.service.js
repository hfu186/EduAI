const crypto = require("crypto");
const { PineconeStore } = require("@langchain/pinecone");
const { createEmbeddings, TaskType } = require("../config/embeddings");
const { getGroqClient, getPineconeIndex } = require("../config/groqSDK");
const retryWithBackoff = require("../utils/retrywithBackoff");
const { GROQ_CHAT_MODEL, GROQ_FAST_CHAT_MODEL } = require("../config/ai");

const TOP_K_RESULTS = 6;
const MAX_CONTEXT_CHARS = 12000;
const MAX_HISTORY_TURNS = 6;

const withRetry = (fn, label = "groq") => retryWithBackoff(fn, { label });


const sanitizeText = (text) =>
  (text || "")
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .replace(/\uFFFD/g, "")
    .trim();


const retrieveContext = async ({
  namespace,
  query,
  topK = TOP_K_RESULTS,
  pageNumber = null,
}) => {
  const embeddings = createEmbeddings(TaskType.RETRIEVAL_QUERY);

  const vectorStore = await PineconeStore.fromExistingIndex(
    embeddings,
    {
      pineconeIndex: getPineconeIndex(),
      namespace: namespace.toString(),
    }
  );

  // Filter by a specific slide when requested.
  const filter = Number.isInteger(Number(pageNumber))
    && pageNumber !== null
    ? {
        pageNumber: {
          $eq: Number(pageNumber),
        },
      }
    : undefined;

  let matches = [];
  let scores = [];

  try {
    const scored = await vectorStore.similaritySearchWithScore(
      query,
      topK,
      filter
    );

    matches = scored.map(([doc]) => doc);
    scores = scored.map(([, score]) => score);

    // Debug retrieval results.
    console.log("========== RAG RETRIEVAL ==========");
    console.log("Namespace:", namespace);
    console.log("Query:", query);
    console.log("Page filter:", pageNumber ?? "All pages");

    matches.forEach((doc, index) => {
      console.log({
        rank: index + 1,
        pageNumber: doc.metadata?.pageNumber,
        chunkId: doc.metadata?.chunkId,
        score: scores[index],
        content: doc.pageContent?.slice(0, 200),
      });
    });

    console.log("===================================");
  } catch (searchErr) {
    console.error("similaritySearch failed:", searchErr);
    throw searchErr;
  }

  const context = matches
    .map((doc) => {
      const page = doc.metadata?.pageNumber ?? "Unknown";
      const chunk = doc.metadata?.chunkId ?? "Unknown";
      const content = sanitizeText(doc.pageContent);

      return content
        ? `[Slide ${page} | Chunk ${chunk}]\n${content}`
        : "";
    })
    .filter(Boolean)
    .join("\n\n")
    .slice(0, MAX_CONTEXT_CHARS);

  return { context, matches, scores };
};


// ─── Eval (chỉ dùng khi EVAL_MODE=true) ─────────────────────────────────────

const chunkHash = (text = "") =>
  crypto
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

const buildEvalInfo = ({ matches, scores, retrievalMs, latencyMs, model }) => ({
  retrieved_chunks: matches.map(getChunkId).join("|"),
  scores,
  previews: matches.map((m) => sanitizeText(m?.pageContent).slice(0, 120)),
  retrieval_ms: retrievalMs,
  latency_ms: latencyMs,
  model,
});

// ─── Chat ───────────────────────────────────────────────────────────────────

const buildChatSystemPrompt = () =>
  `You are a helpful course assistant. Answer the user's question using ONLY the lesson context provided below.
- If the context does not contain the answer, say clearly that you don't have enough information from the lesson material, then you may answer briefly from general knowledge but say so explicitly.
- Be concise and use the same language the user asked in.
- Do not invent facts, citations, or details that are not supported by the context.`;

/**
 * @param {Object}  params
 * @param {string}  params.namespace 
 * @param {string}  params.question
 * @param {Array}   [params.history]  
 * @param {boolean} [params.stream]
 * @param {boolean} [params.fast]    
 */

const answerWithRAG = async ({
  namespace,
  question,
  history = [],
  stream = false,
  fast = false,
  pageNumber = null,
}) => {
  if (!question || !question.trim()) {
    throw new Error("Question is required.");
  }

  const startedAt = Date.now();

  const {
    context,
    matches,
    scores,
  } = await retrieveContext({
    namespace,
    query: question,
    topK: pageNumber !== null ? 10 : TOP_K_RESULTS,
    pageNumber,
  });

  const messages = [
    { role: "system", content: buildChatSystemPrompt() },
    ...history.slice(-MAX_HISTORY_TURNS).map((m) => ({ role: m.role, content: m.content })),
    {
      role: "user",
      content: `Lesson context:\n${context || "(no relevant context found)"}\n\nQuestion: ${question}`,
    },
  ];

  const groq = getGroqClient();
  const model = fast ? GROQ_FAST_CHAT_MODEL : GROQ_CHAT_MODEL;

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

  if (process.env.EVAL_MODE === "true") {
    const evalInfo = buildEvalInfo({
      matches,
      scores,
      retrievalMs,
      latencyMs: Date.now() - startedAt,
      model,
    });
    return { answer, matches, eval: evalInfo };
  }

  return { answer, matches };
};

module.exports = {
  TOP_K_RESULTS,
  retrieveContext,
  answerWithRAG,
};