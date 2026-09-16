import * as courseService from "../../services/course.service.js"

const errorStatus = (error) => error.statusCode || 500

export const getInstructorCourses = async (req, res) => {
  try {
    const courses = await courseService.getInstructorCourses(req.user.id)
    return res.status(200).json({ success: true, data: courses })
  } catch (error) {
    console.error("GET INSTRUCTOR COURSES ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor courses",
    })
  }
}

export const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse({
      ...req.body,
      thumbnail: req.files?.thumbnailImage,
      instructorId: req.user.id,
    })
    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: course,
    })
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error)
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Failed to create course",
      error: error.message,
    })
  }
}

export const editCourse = async (req, res) => {
  try {
    const updatedCourse = await courseService.editCourse({
      courseId: req.body.courseId,
      updates: req.body,
      thumbnail: req.files?.thumbnailImage,
    })
    return res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error("EDIT COURSE ERROR:", error)
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Internal server error",
      error: error.message,
    })
  }
}

export const getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses()
    return res.status(200).json({ success: true, data: courses })
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message })
  }
}

export const getCourseById = async (req, res) => {
  try {
    const courseDetails = await courseService.getCourseById(req.params.courseId)
    return res.status(200).json({ success: true, data: { courseDetails } })
  } catch (error) {
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.message,
    })
  }
}

export const getCourseLearningData = async (req, res) => {
  try {
    const course = await courseService.getCourseLearningData(req.params.courseId)
    if (!course) return res.status(404).json({ success: false })
    return res.json({ success: true, data: course })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const deleteCourse = async (req, res) => {
  try {
    await courseService.deleteCourse(req.params.courseId)
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.message,
    })
  }
}

export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await courseService.updateCourse({
      courseId: req.params.courseId,
      updates: req.body,
      thumbnail: req.files?.thumbnailImage,
    })
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error("UPDATE COURSE ERROR:", error)
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Failed to update course",
      error: error.message,
    })
  }
}

export const publishCourse = async (req, res) => {
  try {
    await courseService.publishCourse({
      courseId: req.params.courseId,
      instructorId: req.user.id,
    })
    return res.status(200).json({
      success: true,
      message: "Course submitted for review successfully",
    })
  } catch (error) {
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.message,
    })
  }
}

export const getFullCourseDetails = async (req, res) => {
  try {
    const data = await courseService.getFullCourseDetails({
      courseId: req.params.courseId,
      userId: req.user.id,
    })
    res.set({ "Cache-Control": "no-store" })
    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error("GET FULL COURSE DETAILS ERROR:", error)
    return res.status(errorStatus(error)).json({
      success: false,
      message:
        error.statusCode === 404 || error.statusCode === 403
          ? error.message
          : "Failed to fetch course details",
    })
  }
}

export const getSectionDetails = async (req, res) => {
  try {
    const section = await courseService.getSectionDetails(req.params.sectionId)
    return res.status(200).json({ success: true, data: section })
  } catch (error) {
    console.error("GET SECTION DETAILS ERROR:", error)
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Failed to fetch section details",
    })
  }
}

export const getSubSectionDetails = async (req, res) => {
  try {
    const subsection = await courseService.getSubSectionDetails(
      req.params.subsectionId
    )
    return res.status(200).json({ success: true, data: subsection })
  } catch (error) {
    console.error("GET SUBSECTION DETAILS ERROR:", error)
    return res.status(errorStatus(error)).json({
      success: false,
      message: error.statusCode ? error.message : "Failed to fetch subsection details",
    })
  }
}
