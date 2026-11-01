const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completedSubSections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSection",
    },
  ],
  quizResults: [
    {
      subSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
      },
      score: Number,
      total: Number,
      submittedAt: Date,
    },
  ],
  aiQuizAttempts: [
    {
      subSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
      },
      questions: [
        {
          question: String,
          options: [String],
          correctAnswer: Number,
        },
      ],
      quizVersion: Number,
      answers: [
        {
          questionIndex: Number,
          optionIndex: Number,
        },
      ],
      score: Number,
      correctCount: Number,
      totalQuestions: Number,
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
