const Groq = require("groq-sdk");
const { Pinecone } = require("@pinecone-database/pinecone");

let groqClient = null;
const getGroqClient = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

let pineconeClient = null;
const getPineconeIndex = () => {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }
  return pineconeClient.Index(process.env.PINECONE_INDEX);
};

module.exports = { getGroqClient, getPineconeIndex };