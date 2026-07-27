const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String },
    fileUrl: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Graded"], default: "Pending" },
    grade: { type: Number },
    feedback: { type: String },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date }
});

module.exports = mongoose.model("Submission", submissionSchema);