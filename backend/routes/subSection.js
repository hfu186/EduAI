const express = require("express");
const router = express.Router();

const { auth, isInstructor, isStudent } = require("../middleware/auth");
const { createSubSection, updateSubSection, deleteSubSection } = require("../controllers/components/subSection");
const { submitQuiz } = require("../controllers/ai/quiz");
const { uploadSlide } = require("../controllers/components/slide");
const upload = require("../middleware/uploadSlide");

router.post(
  "/",
  auth,
  isInstructor,
  createSubSection
);


router.post(
  "/update",
  auth,
  isInstructor,
  updateSubSection
);

router.post(
  "/delete",
  auth,
  isInstructor,
  deleteSubSection
);

router.post(
  "/quiz/:subSectionId/submit",
  auth,
  isStudent,
  submitQuiz
);

router.post(
  "/subsections/:subSectionId/slides",
  auth,
  isInstructor,
  upload.single("slide"),
  uploadSlide
);

module.exports = router;