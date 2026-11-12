
const { getGroqClient } = require("../config/groqSDK");
const { GROQ_CHAT_MODEL } = require("../config/ai");

const buildQuizPrompt = (context, numberOfQuestions) =>
  `You are an expert educator. Based ONLY on the lesson content below, create exactly ${numberOfQuestions} multiple-choice questions.

Lesson Content:
${context}

Rules:
- Questions must be strictly based on the lesson content above.
- Each question must have exactly 4 options (A, B, C, D).
- correctAnswer is the index (0 = A, 1 = B, 2 = C, 3 = D).
- Write questions and answers in English.
- Return ONLY a valid JSON object (no markdown, no explanation, no extra text) with this exact shape:

{
  "questions": [
    {
      "question": "Question here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Short explanation of why the answer is correct"
    }
  ]
}`;

const stripCodeFence = (text) =>
  text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

const generateQuizJSON = async (context, numberOfQuestions) => {
  const response = await getGroqClient().chat.completions.create({
    model: GROQ_CHAT_MODEL,
    temperature: 0.5,
    messages: [{ role: "user", content: buildQuizPrompt(context, numberOfQuestions) }],
  });

  const rawText = response?.choices?.[0]?.message?.content ?? "";
  if (!rawText) throw new Error("Groq returned empty response.");

  const parsed = JSON.parse(stripCodeFence(rawText));
  const questions = Array.isArray(parsed) ? parsed : parsed?.questions;

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Invalid quiz format returned from AI.");
  }

  return questions;
};

module.exports = { generateQuizJSON };