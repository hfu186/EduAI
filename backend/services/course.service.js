import Course from "../models/course.js"
import Category from "../models/category.js"
import Section from "../models/section.js"
import SubSection from "../models/subSection.js"
import User from "../models/user.js"
import CourseProgress from "../models/courseProgress.js"
import Enrollment from "../models/enrollment.js"
import enrollmentService from "./enrollment.service.js"
import fs from "fs"
import path from "path"
import mongoose from "mongoose"
import { fileURLToPath } from "url"
import uploadHelper from "../utils/uploadHelper.js"
import RatingAndReview from "../models/ratingAndReview.js"
import { PDFDocument } from "pdf-lib"
const { attachEnrollmentStudents } = enrollmentService
const serviceDirectory = path.dirname(fileURLToPath(import.meta.url))

const parseArrayField = (value) =>
  typeof value === "string" ? JSON.parse(value) : value

const populateCourse = (query) =>
  query
    .populate({
      path: "instructor",
      populate: { path: "additionalDetails" },
    })
    .populate("category")
    .populate({
      path: "ratingAndReviews",
      populate: {
        path: "user",
        select: "firstName lastName email image",
      },
    })
    .populate({
      path: "courseContent",
      populate: { path: "subSection" },
    })

const removeTemporaryFile = (file) => {
  if (!file?.tempFilePath) return

  fs.unlink(file.tempFilePath, (error) => {
    if (error) {
      console.error("Error deleting temporary file:", error)
    }
  })
}

export const getInstructorCourses = async (instructorId) => {
  const courses = await Course.find({ instructor: instructorId })
    .populate("category")
    .sort({ createdAt: -1 })
  return attachEnrollmentStudents(courses)
}

export const createCourse = async ({
  courseName,
  courseDescription,
  whatYouWillLearn,
  price,
  category,
  status,
  tag,
  level,
  instructions,
  thumbnail,
  instructorId,
}) => {
  if (
    !courseName ||
    !courseDescription ||
    !whatYouWillLearn ||
    !price ||
    !category ||
    !thumbnail
  ) {
    const error = new Error("All fields are required")
    error.statusCode = 400
    throw error
  }

  const categoryDetails = await Category.findById(category)
  if (!categoryDetails) {
    const error = new Error("Category not found")
    error.statusCode = 404
    throw error
  }

  const newCourse = await Course.create({
    courseName,
    courseDescription,
    instructor: instructorId,
    whatYouWillLearn,
    price,
    category: categoryDetails._id,
    tag: parseArrayField(tag),
    level: level || "Beginner",
    instructions: parseArrayField(instructions),
    thumbnail: uploadHelper.getFileBase64(thumbnail),
    status,
  })

  await User.findByIdAndUpdate(
    instructorId,
    { $push: { courses: newCourse._id } },
    { new: true }
  )
  await Category.findByIdAndUpdate(
    category,
    { $push: { courses: newCourse._id } },
    { new: true }
  )

  removeTemporaryFile(thumbnail)
  return newCourse
}

const updateCourseFields = (course, updates, thumbnail) => {
  if (thumbnail) {
    course.thumbnail = uploadHelper.getFileBase64(thumbnail)
  }

  for (const key in updates) {
    if (!Object.hasOwn(updates, key)) continue

    if (key === "tag" || key === "instructions") {
      course[key] = parseArrayField(updates[key])
    } else if (key !== "thumbnailImage" && key !== "courseId") {
      course[key] = updates[key]
    }
  }
}

export const editCourse = async ({ courseId, updates, thumbnail }) => {
  const course = await Course.findById(courseId)
  if (!course) {
    const error = new Error("Course not found")
    error.statusCode = 404
    throw error
  }

  updateCourseFields(course, updates, thumbnail)
  await course.save()
  removeTemporaryFile(thumbnail)

  return populateCourse(Course.findById(courseId)).exec()
}
export const getAllCourses = async () => {
    const courses = await Course.find({ status: "Published" })
        .populate({
            path: "instructor",
            select: "firstName lastName email image",
        })
        .populate({
            path: "courseContent",
            populate: { path: "subSection" },
        })
        .populate("category")
        .sort({ createdAt: -1 })
        .exec();

    const reviews = await RatingAndReview.find({})
        .populate("user", "firstName lastName email image")
        .exec();

    return courses.map((course) => {
        const courseReviews = reviews.filter(
            (review) =>
                review.course.toString() === course._id.toString()
        );

        return {
            ...course.toObject(),
            ratingAndReviews: courseReviews,
        };
    });
};
export const getCourseById = async (courseId) => {
  const courseDetails = await populateCourse(
    Course.findById(courseId)
  ).exec();

  if (!courseDetails) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  const reviews = await RatingAndReview.find({
    course: courseId,
  })
    .populate("user", "firstName lastName email image")
    .exec();

  
  const courseWithReviews = {
    ...courseDetails.toObject(),
    ratingAndReviews: reviews,
  };

  return attachEnrollmentStudents(courseWithReviews);
};

export const getCourseLearningData = async (courseId) =>
  Course.findById(courseId).select("lectures quizzes assignments slides")

export const deleteCourse = async (courseId) => {
  const course = await Course.findById(courseId)
  if (!course) {
    const error = new Error("Course not found")
    error.statusCode = 404
    throw error
  }

  await User.findByIdAndUpdate(course.instructor, {
    $pull: { courses: courseId },
  })
  await Category.findByIdAndUpdate(course.category, {
    $pull: { courses: courseId },
  })

  await Promise.all([
    Enrollment.deleteMany({ courseId }),
    CourseProgress.deleteMany({ courseId }),
  ])

  for (const sectionId of course.courseContent) {
    const section = await Section.findById(sectionId)
    if (section) {
      for (const subSectionId of section.subSection) {
        await SubSection.findByIdAndDelete(subSectionId)
      }
    }
    await Section.findByIdAndDelete(sectionId)
  }

  await Course.findByIdAndDelete(courseId)
}

export const updateCourse = async ({ courseId, updates, thumbnail }) => {
  const course = await Course.findById(courseId)
  if (!course) {
    const error = new Error("Course not found")
    error.statusCode = 404
    throw error
  }

  updateCourseFields(course, updates, thumbnail)
  await course.save()
  removeTemporaryFile(thumbnail)

  return attachEnrollmentStudents(
    await populateCourse(Course.findById(courseId)).exec()
  )
}

export const publishCourse = async ({ courseId, instructorId }) => {
  const course = await Course.findById(courseId).populate({
    path: "courseContent",
    populate: { path: "subSection" },
  })

  if (!course) {
    const error = new Error("Course not found")
    error.statusCode = 404
    throw error
  }
  if (course.instructor.toString() !== instructorId) {
    const error = new Error("Forbidden")
    error.statusCode = 403
    throw error
  }
  if (!course.courseContent.length) {
    const error = new Error("Add at least one section")
    error.statusCode = 400
    throw error
  }

  course.status = "Pending"
  await course.save()
}
export const getFullCourseDetails = async ({
  courseId,
  userId,
  accountType,
  previewSubSectionId,
}) => {
  if (!mongoose.isValidObjectId(courseId)) {
    const error = new Error("Invalid course id")
    error.statusCode = 400
    throw error
  }

  const courseDetails = await populateCourse(Course.findById(courseId)).exec()
  if (!courseDetails) {
    const error = new Error("Course not found")
    error.statusCode = 404
    throw error
  }

  const instructorId = courseDetails.instructor?._id ?? courseDetails.instructor
  const isInstructor = String(instructorId) === String(userId)
  const isAdmin = accountType === "Admin"

  const [enrollment, courseProgress] = await Promise.all([
    Enrollment.exists({ userId, courseId }),
    CourseProgress.findOne({ userId, courseId })
      .select("completedSubSections")
      .lean(),
  ])
  const isEnrolled = !!enrollment
  const hasFullAccess = isInstructor || isAdmin || isEnrolled

  if (!hasFullAccess && !previewSubSectionId) {
    const error = new Error("You are not enrolled in this course")
    error.statusCode = 403
    throw error
  }

  let responseCourse = await attachEnrollmentStudents(courseDetails)
  if (!hasFullAccess) {
    if (!mongoose.isValidObjectId(previewSubSectionId)) {
      const error = new Error("Invalid preview subsection")
      error.statusCode = 400
      throw error
    }

    const previewSection = courseDetails.courseContent.find((section) =>
      (section.subSection || []).some(
        (subSection) => String(subSection._id) === String(previewSubSectionId)
      )
    )
    const previewSubSection = (previewSection?.subSection || []).find(
      (subSection) => String(subSection._id) === String(previewSubSectionId)
    )
    if (!previewSubSection || previewSubSection.type !== "slide") {
      const error = new Error("Only slide subsections can be previewed")
      error.statusCode = 403
      throw error
    }

    const courseObject = responseCourse.toObject
      ? responseCourse.toObject()
      : responseCourse
    courseObject.courseContent = courseObject.courseContent.map((section) => {
      const matchingSubSection = (section.subSection || []).find(
        (subSection) => String(subSection._id) === String(previewSubSectionId)
      )
      return {
        ...section,
        subSection: matchingSubSection
          ? [
              {
                ...matchingSubSection,
                slides: [
                  {
                    fileName: `${matchingSubSection.title} - 3-page preview`,
                    fileUrl: `/course/${courseId}/preview/${previewSubSectionId}`,
                  },
                ],
              },
            ]
          : [],
      }
    })
    responseCourse = courseObject
  }

  return {
    courseDetails: responseCourse,
    completedSubSections: hasFullAccess
      ? courseProgress?.completedSubSections || []
      : [],
    isTrial: !hasFullAccess,
    previewSubSectionId: !hasFullAccess ? previewSubSectionId : null,
  }
}

export const getSubSectionSlidePreview = async ({
  courseId,
  subSectionId,
  userId,
}) => {
  if (
    !mongoose.isValidObjectId(courseId) ||
    !mongoose.isValidObjectId(subSectionId)
  ) {
    const error = new Error("Invalid course or subsection id")
    error.statusCode = 400
    throw error
  }

  const section = await Section.findOne({
    course: courseId,
    subSection: subSectionId,
  }).select("_id")
  if (!section) {
    const error = new Error("Slide subsection not found in this course")
    error.statusCode = 404
    throw error
  }

  const subSection = await SubSection.findById(subSectionId).select(
    "type slide slides"
  )
  if (!subSection || subSection.type !== "slide") {
    const error = new Error("Only slide subsections can be previewed")
    error.statusCode = 403
    throw error
  }

  const slideFiles = [
    ...(subSection.slides || []),
    ...(subSection.slide?.fileUrl ? [subSection.slide] : []),
  ]
  if (!slideFiles.length) {
    const error = new Error("This subsection does not contain any slides")
    error.statusCode = 404
    throw error
  }

  const previewDocument = await PDFDocument.create()
  let remainingPages = 3

  for (const slideFile of slideFiles) {
    if (remainingPages === 0) break

    const fileUrl = slideFile.fileUrl
    const match = typeof fileUrl === "string"
      ? fileUrl.match(/^\/uploads\/slides\/([^/]+\.pdf)$/i)
      : null
    if (!match) {
      const error = new Error("A slide file cannot be used to generate a preview")
      error.statusCode = 422
      throw error
    }

    const filePath = path.join(
      serviceDirectory,
      "..",
      "uploads",
      "slides",
      path.basename(match[1])
    )
    const sourceDocument = await PDFDocument.load(await fs.promises.readFile(filePath))
    const pageCount = Math.min(sourceDocument.getPageCount(), remainingPages)
    const pages = await previewDocument.copyPages(
      sourceDocument,
      Array.from({ length: pageCount }, (_, index) => index)
    )
    pages.forEach((page) => previewDocument.addPage(page))
    remainingPages -= pageCount
  }

  if (previewDocument.getPageCount() === 0) {
    const error = new Error("No pages are available in this subsection preview")
    error.statusCode = 422
    throw error
  }

  previewDocument.setTitle("Course trial preview")
  const previewBytes = await previewDocument.save()
  return Buffer.from(previewBytes)
}

export const getSectionDetails = async (sectionId) => {
  const section = await Section.findById(sectionId).populate("subSection")
  if (!section) {
    const error = new Error("Section not found")
    error.statusCode = 404
    throw error
  }
  return section
}

export const getSubSectionDetails = async (subsectionId) => {
  const subsection = await SubSection.findById(subsectionId)
  if (!subsection) {
    const error = new Error("Subsection not found")
    error.statusCode = 404
    throw error
  }
  return subsection
}
