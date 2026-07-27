const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  certificateCode: {
    type: String,
    unique: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Certificate", certificateSchema);