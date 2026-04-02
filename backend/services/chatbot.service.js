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

const MAX_CHARS = 15000;
const MIN_CHARS = 50;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const EMBEDDING_MODEL = "models/gemini-embedding-001";
const VISION_MODEL = "gemini-2.0-flash";
const TMP_DIR = "/tmp/pdf2pic_slides";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Bước 1A: Extract text thông thường từ PDF (dùng pdf2json)
 */
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
  console.log("Switching to Vision AI fallback...");
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
        `Đây là slide số ${i}. Hãy mô tả toàn bộ nội dung: tiêu đề, các điểm chính, bảng, biểu đồ, sơ đồ nếu có. Trình bày rõ ràng đầy đủ bằng tiếng Việt.`,
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

const createEmbeddings = () =>
  new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: EMBEDDING_MODEL,
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });

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