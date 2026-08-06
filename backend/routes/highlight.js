const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getHighlights,
  createHighlight,
  deleteHighlight,
  clearHighlights,
} = require("../controllers/course/highlight");

router.get("/:subSectionId", auth, getHighlights);
router.post("/", auth, createHighlight);
router.delete("/:highlightId", auth, deleteHighlight);
router.delete("/clear/:subSectionId", auth, clearHighlights);

module.exports = router;