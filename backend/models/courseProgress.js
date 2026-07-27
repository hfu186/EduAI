const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseID: {
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
});

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
