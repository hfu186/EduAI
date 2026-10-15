const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["slide", "quiz", "assignment"],
    required: true,
  },

  slide: {
    fileName: String,
    fileUrl: String,
  },
  slides: [
    {
      fileName: String,
      fileUrl: String,
    },
  ],

  quiz: {
    source: {
      type: String,
      enum: ["manual", "ai"],
    },

    status: {
      type: String,
      enum: ["draft", "approved"],
      default: "draft",
    },

    version: {
      type: Number,
      default: 1,
    },

    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
      },
    ],

    generatedByAI: {
      type: Boolean,
      default: false,
    },

    previousVersions: [
      {
        version: Number,
        questions: [
          {
            question: String,
            options: [String],
            correctAnswer: Number,
          },
        ],
        generatedAt: Date,
      },
    ],

    generatedAt: Date,
    approvedAt: Date,
  },

  assignment: {
    description: String,
    deadline: Date,
    fileUrl: String,
    answerKeyUrl: String,
  },

  aiMetadata: {
    isIndexed: {
      type: Boolean,
      default: false,
    },
    totalChunks: Number,
    lastProcessed: Date,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("SubSection", subSectionSchema);
