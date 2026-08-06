const mongoose = require("mongoose");

const highlightSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subSection: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection", required: true },
  pdfUrl: { type: String, required: true },
  text: { type: String, required: true },
  pages: [
    {
      pageNumber: Number,
      rects: [
        {
          left: Number,
          top: Number,
          width: Number,
          height: Number,
        },
      ],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("Highlight", highlightSchema);