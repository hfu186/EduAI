const path = require("path");
const Submission = require("../models/submission");
const Course = require("../models/course");
const CourseProgress = require("../models/courseProgress");
const { saveUploadedFiles, ensureDirectoryExists } = require("../utils/uploadHelper");
const mailSender = require("../utils/mailSender");
const { createNotification } = require("../utils/notification");

const createServiceError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const submitAssignment = async ({
  assignmentId,
  courseId,
  subSectionId,
  studentId,
  submissionFile,
}) => {
  if (!submissionFile || !assignmentId || !courseId || !subSectionId) {
    throw createServiceError(
      "Missing required information: file, assignmentId, courseId, or subSectionId",
      400
    );
  }

  const uploadDir = path.join(__dirname, "..", "uploads", "submissions");
  ensureDirectoryExists(uploadDir);

  const [savedFile] = await saveUploadedFiles(
    submissionFile,
    uploadDir,
    "/uploads/submissions"
  );

  let submission = await Submission.findOne({ assignmentId, studentId });

  if (!submission) {
    submission = await Submission.create({
      assignmentId,
      studentId,
      fileName: savedFile.fileName,
      fileUrl: savedFile.fileUrl,
      status: "Pending",
      submittedAt: Date.now(),
    });
  } else {
    submission.fileName = savedFile.fileName;
    submission.fileUrl = savedFile.fileUrl;
    submission.submittedAt = Date.now();
    submission.status = "Pending";
    submission.grade = null;
    await submission.save();
  }

  const course = await Course.findById(courseId);
  let courseProgress = await CourseProgress.findOne({
    courseID: courseId,
    userId: studentId,
  });

  if (!courseProgress) {
    courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId: studentId,
      completedSubSections: [],
    });
  }

  if (!courseProgress.completedSubSections.includes(subSectionId)) {
    courseProgress.completedSubSections.push(subSectionId);
    await courseProgress.save();
  }

  if (course?.instructor) {
    await createNotification({
      recipient: course.instructor,
      type: "assignment_submitted",
      title: "New assignment submission",
      message: `A student submitted assignment "${submission._id}" in course "${course.courseName}".`,
      link: `/course/${course._id}`,
      relatedCourse: course._id,
      relatedSubmission: submission._id,
    });
  }

  return submission;
};

const getAssignmentSubmissions = async (assignmentId) => {
  if (!assignmentId) {
    throw createServiceError("Missing assignmentId", 400);
  }

  return Submission.find({ assignmentId })
    .populate("studentId", "firstName lastName email image")
    .sort({ submittedAt: -1 });
};

const gradeAssignment = async ({ submissionId, grade, feedback }) => {
  if (!submissionId || grade === undefined) {
    throw createServiceError("Missing submissionId or grade", 400);
  }

  const updatedSubmission = await Submission.findByIdAndUpdate(
    submissionId,
    {
      grade,
      feedback,
      status: "Graded",
      gradedAt: Date.now(),
    },
    { new: true }
  ).populate("studentId", "firstName lastName email");

  if (!updatedSubmission) {
    throw createServiceError("Submission not found", 404);
  }

  await mailSender(
    updatedSubmission.studentId.email,
    "Your assignment has been graded",
    `Hello ${updatedSubmission.studentId.firstName},   
      Your assignment has been graded with a score of: ${grade}.
      Instructor feedback: ${feedback || "No feedback provided"}.
      Please log in to the system to view the details.
      Thank you for your submission!`
  );

  await createNotification({
    recipient: updatedSubmission.studentId._id,
    type: "assignment_graded",
    title: "Assignment graded",
    message: `Your assignment has been graded with a score of ${grade}. ${feedback ? `Feedback: ${feedback}` : ""}`.trim(),
    link: "/dashboard/my-courses",
    relatedSubmission: updatedSubmission._id,
  });

  return updatedSubmission;
};

const deleteSubmission = async ({ assignmentId, studentId }) => {
  const deleted = await Submission.findOneAndDelete({ assignmentId, studentId });

  if (!deleted) {
    throw createServiceError("Submission not found", 404);
  }

  return deleted;
};

const checkStudentSubmission = ({ assignmentId, studentId }) =>
  Submission.findOne({ assignmentId, studentId });

module.exports = {
  submitAssignment,
  getAssignmentSubmissions,
  gradeAssignment,
  deleteSubmission,
  checkStudentSubmission,
};
