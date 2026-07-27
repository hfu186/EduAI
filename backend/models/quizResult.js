const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subSectionId: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection" },
  score: Number,
  totalQuestions: Number,
  answers: Array, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizResult", quizResultSchema);