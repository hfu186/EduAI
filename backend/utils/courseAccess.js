const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const Section = require("../models/section");
const mongoose = require("mongoose");

const hasFullCourseAccess = async ({ userId, accountType, courseId }) => {
  if (accountType === "Admin") return true;
  if (!mongoose.isValidObjectId(courseId)) return false;

  const course = await Course.findById(courseId).select("instructor");
  if (!course) return false;
  if (String(course.instructor) === String(userId)) return true;

  return Boolean(await Enrollment.exists({ userId, courseId }));
};

const hasSubSectionCourseAccess = async ({
  userId,
  accountType,
  subSectionId,
  courseId,
}) => {
  if (!mongoose.isValidObjectId(subSectionId)) return false;
  if (courseId && !mongoose.isValidObjectId(courseId)) return false;

  const section = await Section.findOne({
    subSection: subSectionId,
    ...(courseId ? { course: courseId } : {}),
  }).select("course");
  if (!section) return false;

  return hasFullCourseAccess({
    userId,
    accountType,
    courseId: section.course,
  });
};

module.exports = { hasFullCourseAccess, hasSubSectionCourseAccess };
