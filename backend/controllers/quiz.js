const SubSection = require("../models/subSection");
const CourseProgress = require("../models/courseProgress");
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { TaskType } = require("@google/generative-ai");
const { PineconeStore } = require("@langchain/pinecone");
const Groq = require("groq-sdk");

const EMBEDDING_MODEL = "models/gemini-embedding-001";
const CHAT_MODEL = "llama-3.1-8b-instant";
const TOP_K_RESULTS = 6;
const PASS_THRESHOLD = 80;

const createEmbeddings = () =>
  new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: EMBEDDING_MODEL,
    taskType: TaskType.RETRIEVAL_QUERY,
  });

const createGroqClient = () =>
  new Groq({ apiKey: process.env.GROQ_API_KEY });

const getPineconeVectorStore = async (embeddings, namespace) => {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.Index(process.env.PINECONE_INDEX);

  return PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace,
  });
};

const buildQuizPrompt = (context, numberOfQuestions) =>
  `You are an expert educator. Based ONLY on the lesson content below, create exactly ${numberOfQuestions} multiple-choice questions.

Lesson Content:
${context}

Rules:
- Questions must be strictly based on the lesson content above.
- Each question must have exactly 4 options (A, B, C, D).
- correctAnswer is the index (0 = A, 1 = B, 2 = C, 3 = D).
- Write questions and answers in English.
- Return ONLY a valid JSON array. No markdown, no explanation, no extra text.

JSON format:
[
  {
    "question": "Question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Short explanation of why the answer is correct"
  }
]`;

/**
 * POST /api/quiz/submit
 * Body: { courseId, subSectionId, answers: [{ questionIndex, optionIndex }] }
 */
exports.submitQuiz = async (req, res) => {
  try {
    const { courseId, subSectionId, answers } = req.body;
    const userId = req.user.id;

    if (!courseId || !subSectionId || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: courseId, subSectionId, answers.",
      });
    }

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection || subSection.type !== "quiz") {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    const quizData = subSection.quiz.questions;
    if (!quizData?.length) {
      return res.status(400).json({ success: false, message: "Quiz has no questions." });
    }

    let correctCount = 0;
    answers.forEach((ans) => {
      const question = quizData[ans.questionIndex];
      if (question && Number(ans.optionIndex) === Number(question.correctAnswer)) {
        correctCount++;
      }
    });

    const totalQuestions = quizData.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = score >= PASS_THRESHOLD;

    let courseProgress = await CourseProgress.findOneAndUpdate(
      { courseID: courseId, userId },
      { $setOnInsert: { completedSubSections: [], quizResults: [] } },
      { upsert: true, new: true }
    );

    courseProgress.quizResults.push({
      subSection: subSectionId,
      score,
      total: totalQuestions,
      submittedAt: new Date(),
    });

    if (isPassed && !courseProgress.completedSubSections.includes(subSectionId)) {
      courseProgress.completedSubSections.push(subSectionId);
    }

    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: isPassed
        ? "Congratulations! You passed."
        : "Score is too low to pass.",
      data: {
        score,
        correctCount,
        totalQuestions,
        pass: isPassed,
        completedSubSections: courseProgress.completedSubSections,
      },
    });
  } catch (error) {
    console.error("SUBMIT_QUIZ_ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz.",
    });
  }
};

/**
 * POST /api/quiz/generate
 * Body: { subSectionId, numberOfQuestions? }
 */
exports.generateAIQuiz = async (req, res) => {
  try {
    const { subSectionId, numberOfQuestions = 5 } = req.body;

    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing subSectionId.",
      });
    }

    const clampedCount = Math.min(Math.max(Number(numberOfQuestions) || 5, 1), 10);

    const embeddings = createEmbeddings();
    const vectorStore = await getPineconeVectorStore(
      embeddings,
      subSectionId.toString()
    );

    let results = [];
    try {
      results = await vectorStore.similaritySearch(
        "Core concepts, definitions, key knowledge, important points",
        TOP_K_RESULTS
      );
    } catch (searchErr) {
      console.warn("similaritySearch failed:", searchErr.message);
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Lesson content not found. Please ensure the slides have been processed.",
      });
    }

    const context = results
      .map((r) => r?.pageContent ?? "")
      .filter(Boolean)
      .join("\n\n")
      .replace(/\0/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
      .replace(/\uFFFD/g, "")
      .trim();

    console.log(`Context length for quiz generation: ${context.length}`);

    let questions;
    try {
      const groq = createGroqClient();

      const response = await groq.chat.completions.create({
        model: CHAT_MODEL,
        temperature: 0.5,
        messages: [
          {
            role: "user",
            content: buildQuizPrompt(context, clampedCount),
          },
        ],
      });

      const rawText = response.choices[0]?.message?.content ?? "";
      console.log("Groq raw (first 300 chars):", rawText.substring(0, 300));

      const cleanedJson = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      questions = JSON.parse(cleanedJson);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid quiz format returned from AI.");
      }
    } catch (groqErr) {
      console.error("Quiz generation error:", groqErr.message);
      return res.status(500).json({
        success: false,
        message: "Unable to generate quiz. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      data: questions,
      meta: {
        total: questions.length,
        subSectionId,
      },
    });
  } catch (error) {
    console.error("AI_GENERATE_QUIZ_ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating the quiz.",
    });
  }
};