
module.exports = {
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || "models/gemini-embedding-001",
  EMBEDDING_OUTPUT_DIMENSIONS: Number(process.env.EMBEDDING_OUTPUT_DIMENSIONS ?? 768),
  GEMINI_VISION_MODEL: process.env.GEMINI_VISION_MODEL || "gemini-3.5-flash-lite",
  GROQ_CHAT_MODEL: process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b",
  GROQ_FAST_CHAT_MODEL: process.env.GROQ_FAST_CHAT_MODEL || "openai/gpt-oss-20b",
};