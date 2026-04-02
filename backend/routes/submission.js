const express = require("express");
const router = express.Router();
const { auth, isInstructor, isStudent } = require("../middleware/auth");
const {
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
  deleteSubmission,
  checkStudentSubmission
} = require("../controllers/submission");


router.post("/submit-assignment", auth, submitAssignment);
router.get("/check-submission/:assignmentId", auth, checkStudentSubmission);
router.get("/assignment-submissions/:assignmentId", auth, isInstructor, getAssignmentSubmissions);
router.post("/grade-submission", auth, isInstructor, gradeAssignment);
router.post("/delete-submission", auth, deleteSubmission);
module.exports = router;