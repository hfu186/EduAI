const Submission = require("../../models/submission");
const CourseProgress = require("../../models/courseProgress");
const SubSection = require("../../models/subSection");
const path = require("path");
const fs = require("fs");
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
        message: "Thiếu thông tin (File, assignmentId, courseId hoặc subSectionId)" 
      });
    }

    const uploadDir = path.join(__dirname, "..", "uploads", "submissions");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExtension = path.extname(submissionFile.name);
    const fileName = `${Date.now()}-${studentId}-${assignmentId}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    
    await submissionFile.mv(filePath);

    let submission = await Submission.findOne({ assignmentId, studentId });

    if (!submission) {
      submission = await Submission.create({
        assignmentId,
        studentId,
        fileName: submissionFile.name,
        fileUrl: `/uploads/submissions/${fileName}`,
        status: "Pending",  
        submittedAt: Date.now()
      });
    } else {
      submission.fileName = submissionFile.name;
      submission.fileUrl = `/uploads/submissions/${fileName}`;
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
        title: "Có bài nộp bài tập mới",
        message: `Học viên vừa nộp bài cho bài tập "${submission._id}" trong khóa học "${course.courseName}".`,
        link: `/course/${course._id}`,
        relatedCourse: course._id,
        relatedSubmission: submission._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nộp bài thành công!",
      data: submission,
      progressUpdated: true
    });

  } catch (error) {
    console.error("SUBMIT ASSIGNMENT ERROR:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi hệ thống khi nộp bài", 
      error: error.message 
    });
  }
};

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({ success: false, message: "Thiếu assignmentId" });
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
      message: "Không thể lấy danh sách bài nộp",
      error: error.message,
    });
  }
};

/* ================= 3. GIẢNG VIÊN CHẤM ĐIỂM (GRADE) ================= */
exports.gradeAssignment = async (req, res) => {
  try {
    const { submissionId, grade, feedback } = req.body;

    if (!submissionId || grade === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu submissionId hoặc điểm số" 
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
      return res.status(404).json({ success: false, message: "Không tìm thấy bài nộp" });
    }

    // (Tuỳ chọn) Gửi email thông báo cho sinh viên tại đây nếu cần
    // await mailSender(updatedSubmission.studentId.email, "Bài tập đã được chấm", ...);

    await mailSender(
      updatedSubmission.studentId.email,
      "Bài tập của bạn đã được chấm điểm",
      `Xin chào ${updatedSubmission.studentId.firstName},   
      Bài tập của bạn đã được chấm với điểm số: ${grade}.
      Phản hồi từ giảng viên: ${feedback || "Không có phản hồi"}.
      Vui lòng đăng nhập vào hệ thống để xem chi tiết.
      Cảm ơn bạn đã nộp bài!`
    );

    await createNotification({
      recipient: updatedSubmission.studentId._id,
      type: "assignment_graded",
      title: "Bài tập đã được chấm điểm",
      message: `Bài tập của bạn đã được chấm với điểm số ${grade}. ${feedback ? `Phản hồi: ${feedback}` : ""}`.trim(),
      link: "/dashboard/my-courses",
      relatedSubmission: updatedSubmission._id,
    });

    return res.status(200).json({
      success: true,
      message: "Đã chấm điểm thành công",
      data: updatedSubmission,
    });

  } catch (error) {
    console.error("GRADE ASSIGNMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi chấm điểm",
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


