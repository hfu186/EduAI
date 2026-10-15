const express = require("express");
const router = express.Router();
const { auth, isStudent } = require("../middleware/auth");
const {
  submitQuiz,
  generateAIQuiz,
  reportAIQuizIssue,
  getInstructorQuizReports,
  updateQuizReportStatus,
  fixReportedQuizQuestion,
} = require("../controllers/ai/quiz");
const { isInstructor } = require("../middleware/auth");

router.get("/reports", auth, isInstructor, getInstructorQuizReports);
router.patch("/reports/:reportId/status", auth, isInstructor, updateQuizReportStatus);
router.patch("/reports/:reportId/fix", auth, isInstructor, fixReportedQuizQuestion);
router.post("/submit", auth, isStudent, submitQuiz);
router.post("/report-issue", auth, reportAIQuizIssue);
router.post(
  "/generate-ai",
  auth,
  generateAIQuiz
);
module.exports = router;