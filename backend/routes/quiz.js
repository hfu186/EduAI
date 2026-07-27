const express = require("express");
const router = express.Router();
const { auth, isStudent } = require("../middleware/auth");
const { submitQuiz, generateAIQuiz } = require("../controllers/ai/quiz");
router.post("/submit", auth, isStudent, submitQuiz);
router.post(
  "/generate-ai",
  auth,
  generateAIQuiz
);
module.exports = router;