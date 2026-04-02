// test-embedding.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDj954Zkji8QyoeV-zAMsRd9WE89QNl-f0");

async function listModels() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDj954Zkji8QyoeV-zAMsRd9WE89QNl-f0`
  );
  const data = await response.json();
  
  const embeddingModels = data.models?.filter(m => 
    m.supportedGenerationMethods?.includes("embedContent")
  );
  
  console.log("Embedding models available:");
  embeddingModels?.forEach(m => console.log(" -", m.name));
}

listModels();