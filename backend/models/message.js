const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: false, default: "" }, 
    messageType: { type: String, enum: ["text", "image", "file"], default: "text" },
    fileUrl: { type: String, default: null },
    fileName: { type: String, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.pre("validate", function (next) {
  if (!this.content && !this.fileUrl) {
    return next(new Error("Messages must have content or file "));
  }
  next();
});

module.exports = mongoose.model("Message", messageSchema);