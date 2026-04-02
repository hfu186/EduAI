const Course = require("../models/course");
const Section = require("../models/section");

exports.createSection = async ({ sectionName, courseId, instructorId }) => {
  if (!sectionName || !courseId) {
    throw new Error("sectionName and courseId are required");
  }

  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  if (course.instructor.toString() !== instructorId) {
    throw new Error("Unauthorized");
  }

  const newSection = await Section.create({
    sectionName,
    course: courseId,
  });

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { $push: { courseContent: newSection._id } },
    { new: true }
  ).populate({
    path: "courseContent",
    populate: { path: "subSection" },
  });

  return updatedCourse;
};

exports.updateSection = async ({ sectionId, sectionName, courseId }) => {
  await Section.findByIdAndUpdate(sectionId, { sectionName });

  return Course.findById(courseId).populate({
    path: "courseContent",
    populate: { path: "subSection" },
  });
};

exports.deleteSection = async ({ sectionId, courseId }) => {
  await Course.findByIdAndUpdate(courseId, {
    $pull: { courseContent: sectionId },
  });

  await Section.findByIdAndDelete(sectionId);

  return Course.findById(courseId).populate({
    path: "courseContent",
    populate: { path: "subSection" },
  });
};
