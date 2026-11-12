require("dotenv").config();
const os = require("os");
const path = require("path");
const fs = require("fs");
const PDFParser = require("pdf2json");
const { fromPath } = require("pdf2pic");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { PineconeStore } = require("@langchain/pinecone");
const { createEmbeddings, TaskType } = require("../config/embeddings");
const { getPineconeIndex } = require("../config/groqSDK");
const { GEMINI_VISION_MODEL } = require("../config/ai");
const retryWithBackoff = require("../utils/retrywithBackoff");
const SubSection = require("../models/subSection");

const MIN_CHARS_PER_PAGE = 20;
const MIN_TOTAL_CHARS = 100;
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const VISION_CALL_DELAY_MS = Number(process.env.VISION_CALL_DELAY_MS ?? 300);
const PAGE_BREAK_REGEX = /----------------Page \(\d+\) Break----------------/;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


const sanitizePageText = (text = "") => {
  let decoded;
  try {
    decoded = decodeURIComponent(text);
  } catch {
    decoded = text.replace(/%[0-9A-F]{2}/gi, " ");
  }

  return decoded
    .replace(/^[A-Z]\.\w+\s*\(\d+\)\s*/gm, "")
    .replace(/[A-Z]:\\[\w\\\.]+/g, "")
    .replace(/Volume in drive.+/g, "")
    .replace(/Volume Serial Number.+/g, "")
    .replace(/Directory of.+/g, "")
    .replace(/\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\s+[\d,]+\s+\S+\.dll/g, "")
    .replace(/[^\x20-\x7E\u00C0-\u1EF9]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
};

const parsePDF = (filePath) =>
  new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1);

    parser.on("pdfParser_dataError", (err) =>
      reject(new Error(`PDF parse error: ${err.parserError}`))
    );

    parser.on("pdfParser_dataReady", (data) => {
      const rawPages = parser.getRawTextContent().split(PAGE_BREAK_REGEX);
      const pageCount = data?.Pages?.length || rawPages.length;
      resolve({ pageCount, rawPages: rawPages.slice(0, pageCount) });
    });

    parser.loadPDF(filePath);
  });


const extractPagesWithVision = async (filePath, pageNumbers) => {
  console.log(`Vision fallback: ${pageNumbers.length} pages`);

  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), "pdf2pic_")
  );

  try {
    const model = new GoogleGenerativeAI(
      process.env.GOOGLE_API_KEY
    ).getGenerativeModel({
      model: GEMINI_VISION_MODEL,
    });

    const converter = fromPath(filePath, {
      density: 150,
      saveFilename: "slide",
      savePath: tmpDir,
      format: "png",
      width: 1280,
      height: 960,
    });

    const pages = [];

    for (const pageNumber of pageNumbers) {
      try {
        const image = await converter(pageNumber, {
          responseType: "base64",
        });

        const response = await retryWithBackoff(
          () =>
            model.generateContent([
              {
                inlineData: {
                  data: image.base64,
                  mimeType: "image/png",
                },
              },
              `This is slide ${pageNumber}.
               Extract all visible text, headings, bullet points,
               tables, charts, diagrams and labels.
               Preserve important details and explain visual
               information clearly in English.`,
            ]),
          { label: `vision-slide-${pageNumber}` }
        );

        const text = sanitizePageText(
          response.response.text()
        );

        if (text.length >= MIN_CHARS_PER_PAGE) {
          pages.push({ pageNumber, text });
        } else {
          console.warn(
            `Vision returned insufficient content: slide ${pageNumber}`
          );
        }
      } catch (err) {
        console.warn(
          `Vision failed on slide ${pageNumber}: ${err.message}`
        );
      }

      if (VISION_CALL_DELAY_MS > 0) {
        await sleep(VISION_CALL_DELAY_MS);
      }
    }

    return pages;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
};



const extractPagesFromPDF = async (filePath) => {
  const { pageCount, rawPages } = await parsePDF(filePath);

  const normalPages = Array.from(
    { length: pageCount },
    (_, i) => ({
      pageNumber: i + 1,
      text: sanitizePageText(rawPages[i] || ""),
    })
  );

  const missingPages = normalPages
    .filter(
      (page) => page.text.length < MIN_CHARS_PER_PAGE
    )
    .map((page) => page.pageNumber);

  console.log("PDF page count:", pageCount);
  console.log("Normal extraction:", normalPages.length - missingPages.length);
  console.log("Missing pages:", missingPages);

  const visionPages = missingPages.length
    ? await extractPagesWithVision(filePath, missingPages)
    : [];

  const visionMap = new Map(
    visionPages.map((page) => [
      page.pageNumber,
      page.text,
    ])
  );

  const finalPages = normalPages
    .map((page) => ({
      ...page,
      text: page.text.length >= MIN_CHARS_PER_PAGE
        ? page.text
        : visionMap.get(page.pageNumber) || "",
    }))
    .filter((page) => page.text.length >= MIN_CHARS_PER_PAGE);

  console.log(
    `Final extracted pages: ${finalPages.length}/${pageCount}`
  );

  return finalPages;
};



const splitPagesIntoDocs = async (pages, { subSectionId }) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const allDocs = [];

  for (const page of pages) {
    const docs = await splitter.createDocuments(
      [`=== Slide ${page.pageNumber} ===\n${page.text}`],
      [{ subSectionId, pageNumber: page.pageNumber }]
    );

    docs.forEach((doc, idx) => {
      doc.metadata.chunkId = `p${page.pageNumber}_c${idx}`;
      doc.metadata.id = `${subSectionId}_p${page.pageNumber}_c${idx}`;
    });

    allDocs.push(...docs);
  }

  return allDocs;
};

const clearNamespace = async (namespace) => {
  try {
    await getPineconeIndex().namespace(namespace).deleteAll();
  } catch (err) {
    console.warn(`clearNamespace skipped: ${err.message}`);
  }
};

const uploadDocsToPinecone = async (docs, namespace) => {
  const embeddings = createEmbeddings(TaskType.RETRIEVAL_DOCUMENT);
  const store = new PineconeStore(embeddings, {
    pineconeIndex: getPineconeIndex(),
    namespace,
  });

  await retryWithBackoff(
    () => store.addDocuments(docs, { ids: docs.map((d) => d.metadata.id) }),
    { label: "pinecone-upsert" }
  );
};

const markSubSectionAsIndexed = (subSectionId, totalChunks) =>
  SubSection.findByIdAndUpdate(subSectionId, {
    aiMetadata: { isIndexed: true, totalChunks, lastProcessed: new Date() },
  });


/**
 * Index slide PDF vào Pinecone để phục vụ RAG.
 * @param {string} subSectionId
 * @param {string} relativeFilePath  đường dẫn tương đối so với process.cwd()
 * @returns {Promise<boolean>} true nếu index thành công
 */
const processSlideForAI = async (subSectionId, relativeFilePath) => {
  try {
    const namespace = subSectionId.toString();
    const filePath = path.join(process.cwd(), relativeFilePath);

    const pages = await extractPagesFromPDF(filePath);
    if (!pages.length) throw new Error("No text extracted from PDF");

    const docs = await splitPagesIntoDocs(pages, { subSectionId: namespace });
    if (!docs.length) throw new Error("No documents generated from PDF");
    console.log("Total documents:", docs.length);

    await clearNamespace(namespace);
    await uploadDocsToPinecone(docs, namespace);
    await markSubSectionAsIndexed(subSectionId, docs.length);

    console.log(`[INGEST SUCCESS]: ${namespace}`);
    return true;
  } catch (error) {
    console.error("[INGEST ERROR]:", error.message);
    console.error("Stack:", error.stack);
    return false;
  }
};

module.exports = { processSlideForAI };