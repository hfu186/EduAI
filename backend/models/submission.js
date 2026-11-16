const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubSection",
    required: true,
  },

  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  subSectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubSection",
    required: true,
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  fileName: String,
  fileUrl: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["Pending", "Graded"],
    default: "Pending",
  },

  grade: Number,
  feedback: String,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  gradedAt: Date,
});

module.exports = mongoose.model("Submission", submissionSchema);