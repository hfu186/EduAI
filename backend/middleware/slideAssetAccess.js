const jwt = require("jsonwebtoken");
const path = require("path");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Section = require("../models/section");
const SubSection = require("../models/subSection");

module.exports = async (req, res, next) => {
  try {
    const fileName = decodeURIComponent(req.path.slice(1));
    if (!fileName || fileName !== path.basename(fileName) || !/\.pdf$/i.test(fileName)) {
      return res.status(404).json({ success: false, message: "Slide file not found." });
    }

    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication is required to view slides." });
    }

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: "Invalid authentication token." });
    }

    const publicFileUrl = `/uploads/slides/${fileName}`;
    const subSection = await SubSection.findOne({
      $or: [
        { "slides.fileUrl": publicFileUrl },
        { "slide.fileUrl": publicFileUrl },
      ],
    }).select("_id");
    if (!subSection) {
      return res.status(404).json({ success: false, message: "Slide file not found." });
    }

    const section = await Section.findOne({ subSection: subSection._id }).select("course");
    const course = section
      ? await Course.findById(section.course).select("instructor")
      : null;
    if (!course) {
      return res.status(404).json({ success: false, message: "Slide course not found." });
    }

    const isCourseInstructor = String(course.instructor) === String(user.id);
    const isEnrolled = await Enrollment.exists({
      userId: user.id,
      courseId: course._id,
    });
    if (user.accountType !== "Admin" && !isCourseInstructor && !isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "Full slide files are only available to enrolled learners. Use the course preview instead.",
      });
    }

    res.set("Cache-Control", "private, no-store");
    return next();
  } catch (error) {
    console.error("SLIDE_ASSET_ACCESS_ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not authorize access to this slide.",
    });
  }
};
