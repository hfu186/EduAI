const Enrollment = require("../models/enrollment");

const createEnrollmentIfMissing = async (userId, courseId) => {
  try {
    const result = await Enrollment.updateOne(
      { userId, courseId },
      { $setOnInsert: { userId, courseId } },
      { upsert: true }
    );
    return Boolean(result.upsertedCount);
  } catch (error) {
    if (error.code === 11000) return false;
    throw error;
  }
};

const getEnrollmentCounts = async (courseIds) => {
  if (!courseIds.length) return new Map();

  const counts = await Enrollment.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);

  return new Map(counts.map(({ _id, count }) => [String(_id), count]));
};

const attachEnrollmentStudents = async (courses) => {
  const isArray = Array.isArray(courses);
  const courseList = (isArray ? courses : [courses]).filter(Boolean);
  if (!courseList.length) return isArray ? [] : null;

  const courseIds = courseList.map((course) => course._id);
  const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
    .select("courseId userId")
    .lean();
  const studentsByCourse = new Map();

  for (const enrollment of enrollments) {
    const courseId = String(enrollment.courseId);
    const students = studentsByCourse.get(courseId) || [];
    students.push(enrollment.userId);
    studentsByCourse.set(courseId, students);
  }

  const result = courseList.map((course) => ({
    ...(course.toObject ? course.toObject() : course),
    studentsEnrolled: studentsByCourse.get(String(course._id)) || [],
  }));

  return isArray ? result : result[0];
};

module.exports = {
  attachEnrollmentStudents,
  createEnrollmentIfMissing,
  getEnrollmentCounts,
};
