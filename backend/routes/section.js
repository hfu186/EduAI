const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middleware/auth");
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/components/section");

router.post("/", auth, isInstructor, createSection);
router.post("/update", auth, isInstructor, updateSection);
router.delete("/delete", auth, isInstructor, deleteSection);

module.exports = router;
