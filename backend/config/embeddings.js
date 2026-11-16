require("dotenv").config();
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { GEMINI_EMBEDDING_MODEL, EMBEDDING_OUTPUT_DIMENSIONS } = require("./ai");
const TASK_TYPES = {
  RETRIEVAL_QUERY: "RETRIEVAL_QUERY",
  RETRIEVAL_DOCUMENT: "RETRIEVAL_DOCUMENT",
};

const l2Normalize = (v) => {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  return norm === 0 ? v : v.map((x) => x / norm);
};

const fitDimension = (v, dims) =>
  l2Normalize(dims && v.length > dims ? v.slice(0, dims) : v);

class FixedDimensionEmbeddings {
  constructor(base, dims) {
    this.base = base;
    this.dims = dims;
  }

  async embedDocuments(texts) {
    const vectors = await this.base.embedDocuments(texts);
    return vectors.map((v) => fitDimension(v, this.dims));
  }

  async embedQuery(text) {
    return fitDimension(await this.base.embedQuery(text), this.dims);
  }
}

const createEmbeddings = (taskType) => {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is missing");
  }

  const base = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: GEMINI_EMBEDDING_MODEL,
    taskType,
    outputDimensionality: EMBEDDING_OUTPUT_DIMENSIONS,
  });

  return new FixedDimensionEmbeddings(base, EMBEDDING_OUTPUT_DIMENSIONS);
};

module.exports = { createEmbeddings, TaskType: TASK_TYPES };