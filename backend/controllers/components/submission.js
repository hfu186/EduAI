const Submission = require("../../models/submission");
const CourseProgress = require("../../models/courseProgress");
const SubSection = require("../../models/subSection");
const path = require("path");
const { saveUploadedFiles, ensureDirectoryExists } = require("../../utils/uploadHelper");
const mailSender = require("../../utils/mailSender");
const { createNotification } = require("../../utils/notification");

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, courseId, subSectionId } = req.body;
    const studentId = req.user.id;
    const submissionFile = req.files?.submissionFile;

    if (!submissionFile || !assignmentId || !courseId || !subSectionId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required information: file, assignmentId, courseId, or subSectionId" 
      });
    }

    const uploadDir = path.join(__dirname, "..", "uploads", "submissions");
    ensureDirectoryExists(uploadDir);

    const [savedFile] = await saveUploadedFiles(submissionFile, uploadDir, "/uploads/submissions");

    let submission = await Submission.findOne({ assignmentId, studentId });

    if (!submission) {
      submission = await Submission.create({
        assignmentId,
        studentId,
        fileName: savedFile.fileName,
        fileUrl: savedFile.fileUrl,
        status: "Pending",  
        submittedAt: Date.now()
      });
    } else {
      submission.fileName = savedFile.fileName;
      submission.fileUrl = savedFile.fileUrl;
      submission.submittedAt = Date.now();
      submission.status = "Pending"; 
      submission.grade = null; 
      await submission.save();
    }


    const course = await require("../../models/course").findById(courseId);

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

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully!",
      data: submission,
      progressUpdated: true
    });

  } catch (error) {
    console.error("SUBMIT ASSIGNMENT ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "System error while submitting assignment", 
      error: error.message 
    });
  }
};

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({ success: false, message: "Missing assignmentId" });
    }

    const submissions = await Submission.find({ assignmentId })
      .populate("studentId", "firstName lastName email image") 
      .sort({ submittedAt: -1 }); 

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });

  } catch (error) {
    console.error("GET SUBMISSIONS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch submissions",
      error: error.message,
    });
  }
};

/* ================= 3. INSTRUCTOR GRADES ASSIGNMENT ================= */
exports.gradeAssignment = async (req, res) => {
  try {
    const { submissionId, grade, feedback } = req.body;

    if (!submissionId || grade === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing submissionId or grade" 
      });
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { 
        grade, 
        feedback, 
        status: "Graded", 
        gradedAt: Date.now()
      },
      { new: true }
    ).populate("studentId", "firstName lastName email");

    if (!updatedSubmission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Optional: send an email notification to the student here if needed.
    // await mailSender(updatedSubmission.studentId.email, "Your assignment has been graded", ...);

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

    return res.status(200).json({
      success: true,
      message: "Assignment graded successfully",
      data: updatedSubmission,
    });

  } catch (error) {
    console.error("GRADE ASSIGNMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Error while grading assignment",
      error: error.message,
    });
  }
};
exports.deleteSubmission = async (req, res) => {
  const deleted = await Submission.findOneAndDelete({
    assignmentId: req.body.assignmentId,
    studentId: req.user.id,
  })

  if (!deleted) {
    return res.status(404).json({ success: false, message: "Submission not found" })
  }

  res.json({ success: true })
}
exports.checkStudentSubmission = async (req, res) => {
  const submission = await Submission.findOne({
    assignmentId: req.params.assignmentId,
    studentId: req.user.id,
  })

  res.json({ success: true, data: submission })
}

