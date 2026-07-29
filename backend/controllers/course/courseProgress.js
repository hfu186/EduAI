const mongoose = require("mongoose");
const SubSection = require("../../models/subSection");
const Certificate = require("../../models/certificate");
const CourseProgress = require("../../models/courseProgress");
const Course = require("../../models/course");
const User = require("../../models/user");
const { updateStreak } = require("../../utils/streak");
const crypto = require("crypto"); 
const mailSender = require("../../utils/mailSender");
const { certEmailTemplate } = require("../../mail/templates/certificate");


const generateCertificate = async (userId, courseId) => {
  const existing = await Certificate.findOne({ user: userId, course: courseId });
  if (!existing) {
    const code = `CERT-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    await Certificate.create({
      user: userId,
      course: courseId,
      certificateCode: code,
    });
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);
      const certLink = `${process.env.CLIENT_URL}/dashboard/certificates/${code}`;
      
      await mailSender(
        user.email,
        "Congratulations! You have earned a course completion certificate",
        certEmailTemplate(user.firstName, course.courseName, certLink)
      );
    console.log(`🎓 Certificate generated for User: ${userId} in Course: ${courseId}`);
  }
};

exports.updateCourseProgress = async (req, res) => {
  const { courseId, subsectionId } = req.body;
  const userId = req.user.id;

  try {
    const subsection = await SubSection.findById(subsectionId);
    if (!subsection) {
      return res.status(404).json({ success: false, message: "Lesson not found" });
    }

    let courseProgress = await CourseProgress.findOne({ courseID: courseId, userId: userId });
    let isNewCompletion = false;

    if (!courseProgress) {
      courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedSubSections: [subsectionId],
      });
      isNewCompletion = true;
    } else {
      if (courseProgress.completedSubSections.includes(subsectionId)) {
        return res.status(200).json({ success: true, message: "Already completed" });
      }
      courseProgress.completedSubSections.push(subsectionId);
      await courseProgress.save();
      isNewCompletion = true;
    }

    if (isNewCompletion) {
      const user = await User.findById(userId);
      if (user) {
        await updateStreak(user); 
      }

      const course = await Course.findById(courseId).populate({
        path: "courseContent",
        populate: { path: "subSection" },
      });

      let totalLectures = 0;
      course.courseContent.forEach((sec) => {
        totalLectures += sec.subSection?.length || 0;
      });

      const completedCount = courseProgress.completedSubSections.length;
      let isCompletedAll = false; 

      if (totalLectures > 0 && completedCount >= totalLectures) {
        await generateCertificate(userId, courseId);
        isCompletedAll = true; 
      }
      
    }

    return res.status(200).json({
      success: true,
      message: "Progress updated",
      data: courseProgress.completedSubSections,
      
      isCompletedAll: isCompletedAll    });

  } catch (error) {
    console.error("UPDATE_PROGRESS_ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getProgressPercentage = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    return res.status(400).json({ error: "Course ID not provided." });
  }

  try {
    let courseProgress = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    if (!courseProgress) {
      return res.status(200).json({
        data: 0,
        message: "Course not started yet",
      });
    }

    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: {
        path: "subSection",
      },
    });

    if (!course) {
      return res.status(400).json({ error: "Invalid Course ID" });
    }

    let totalLectures = 0;
    let validSubSectionIds = [];

    course.courseContent.forEach((sec) => {
      totalLectures += sec.subSection?.length || 0;
      sec.subSection?.forEach((sub) => {
        validSubSectionIds.push(sub._id.toString());
      });
    });

    if (totalLectures === 0) {
      return res.status(200).json({
        data: 100,
        message: "Course has no content",
      });
    }

    const actualCompleted = courseProgress.completedSubSections.filter((id) =>
      validSubSectionIds.includes(id.toString())
    );

    const completedLecturesCount = actualCompleted.length;
    let isCompletedAll = false; 
    let progressPercentage =
      (completedLecturesCount / totalLectures) * 100;
    
    const multiplier = Math.pow(10, 2);
    progressPercentage =
      Math.round(progressPercentage * multiplier) / multiplier;

    return res.status(200).json({
      data: progressPercentage,
      message: "Successfully fetched course progress",
    });
  } catch (error) {
    console.error("GET_PROGRESS_ERROR:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
