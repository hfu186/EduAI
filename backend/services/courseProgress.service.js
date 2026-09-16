const crypto = require("crypto");
const SubSection = require("../models/subSection");
const Certificate = require("../models/certificate");
const CourseProgress = require("../models/courseProgress");
const Course = require("../models/course");
const User = require("../models/user");
const { updateStreak } = require("../utils/streak");
const mailSender = require("../utils/mailSender");
const { certEmailTemplate } = require("../mail/templates/certificate");

const createServiceError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getCourseWithContent = (courseId) =>
  Course.findById(courseId).populate({
    path: "courseContent",
    populate: { path: "subSection" },
  });

const getValidSubSectionIds = (course) =>
  course.courseContent.flatMap(
    (section) =>
      section.subSection?.map((subSection) => subSection._id.toString()) || []
  );

const generateCertificate = async (userId, courseId) => {
  const existing = await Certificate.findOne({ user: userId, course: courseId });
  if (existing) return;

  const code = `CERT-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

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

  console.log(`Certificate generated for User: ${userId} in Course: ${courseId}`);
};

const countCompletedSubSections = (completedSubSections, validIds) =>
  completedSubSections.filter((id) => validIds.includes(id.toString())).length;

const updateCourseProgress = async ({ courseId, subsectionId, userId }) => {
  const subsection = await SubSection.findById(subsectionId);
  if (!subsection) {
    throw createServiceError("Lesson not found", 404);
  }

  const course = await getCourseWithContent(courseId);
  if (!course) {
    throw createServiceError("Course not found", 404);
  }

  const validSubSectionIds = getValidSubSectionIds(course);
  if (!validSubSectionIds.includes(subsectionId.toString())) {
    throw createServiceError("Lesson does not belong to this course", 400);
  }

  let courseProgress = await CourseProgress.findOne({
    courseID: courseId,
    userId,
  });

  if (!courseProgress) {
    courseProgress = await CourseProgress.create({
      courseID: courseId,
      userId,
      completedSubSections: [subsectionId],
    });
  } else {
    const alreadyCompleted = courseProgress.completedSubSections.some(
      (id) => id.toString() === subsectionId.toString()
    );

    if (alreadyCompleted) {
      return {
        completedSubSections: courseProgress.completedSubSections,
        isCompletedAll: false,
        alreadyCompleted: true,
      };
    }

    courseProgress.completedSubSections.push(subsectionId);
    await courseProgress.save();
  }

  const user = await User.findById(userId);
  if (user) await updateStreak(user);

  const completedCount = countCompletedSubSections(
    courseProgress.completedSubSections,
    validSubSectionIds
  );
  const isCompletedAll =
    validSubSectionIds.length > 0 &&
    completedCount >= validSubSectionIds.length;

  if (isCompletedAll) {
    await generateCertificate(userId, courseId);
  }

  return {
    completedSubSections: courseProgress.completedSubSections,
    isCompletedAll,
    alreadyCompleted: false,
  };
};

const getProgressPercentage = async ({ courseId, userId }) => {
  if (!courseId) {
    throw createServiceError("Course ID not provided.", 400);
  }

  const course = await getCourseWithContent(courseId);
  if (!course) {
    throw createServiceError("Course not found", 404);
  }

  const courseProgress = await CourseProgress.findOne({
    courseID: courseId,
    userId,
  });
  const validSubSectionIds = getValidSubSectionIds(course);
  const totalLectures = validSubSectionIds.length;

  if (totalLectures === 0) {
    return {
      data: 0,
      completed: 0,
      total: 0,
      message: "Course has no content",
    };
  }

  const uniqueCompletedIds = [
    ...new Set(
      (courseProgress?.completedSubSections || [])
        .filter((id) => validSubSectionIds.includes(id.toString()))
        .map((id) => id.toString())
    ),
  ];
  const completedCount = Math.min(uniqueCompletedIds.length, totalLectures);
  const progressPercentage = Math.round(
    (completedCount / totalLectures) * 100
  );

  if (courseProgress) {
    courseProgress.completedSubSections = uniqueCompletedIds;
    await courseProgress.save();
  }

  return {
    data: progressPercentage,
    completed: completedCount,
    total: totalLectures,
    message: "Successfully fetched course progress",
  };
};

module.exports = {
  updateCourseProgress,
  getProgressPercentage,
};
