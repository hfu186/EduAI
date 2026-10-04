const mongoose = require("mongoose");

const quizReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    subSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
      required: true,
    },
    questionIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
    },
    issueType: {
      type: String,
      enum: [
        "incorrect_answer",
        "unclear_question",
        "incorrect_options",
        "other",
      ],
      required: true,
    },
    details: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizReport", quizReportSchema);
