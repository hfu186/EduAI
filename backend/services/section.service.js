const Course = require("../models/course");
const Section = require("../models/section");
const SubSection = require("../models/subSection");
const CourseProgress = require("../models/courseProgress");
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
exports.deleteSection = async ({
  sectionId,
  courseId,
}) => {
  const section = await Section.findById(sectionId);

  if (!section) {
    throw new Error("Section not found");
  }

  const subSectionIds = section.subSection || [];

  await Course.findByIdAndUpdate(courseId, {
    $pull: {
      courseContent: sectionId,
    },
  });

  if (subSectionIds.length > 0) {
    await CourseProgress.updateMany(
      {
        courseID: courseId,
        completedSubSections: {
          $in: subSectionIds,
        },
      },
      {
        $pull: {
          completedSubSections: {
            $in: subSectionIds,
          },
        },
      }
    );

    await SubSection.deleteMany({
      _id: {
        $in: subSectionIds,
      },
    });
  }

  await Section.findByIdAndDelete(sectionId);

  return Course.findById(courseId).populate({
    path: "courseContent",
    populate: {
      path: "subSection",
    },
  });
};
