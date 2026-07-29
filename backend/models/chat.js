const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false }, 
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

chatSchema.index({ student: 1, instructor: 1 }, { unique: true });

module.exports = mongoose.model("Chat", chatSchema);