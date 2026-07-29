const express = require("express");
const router = express.Router();
const { auth, isInstructor } = require("../middleware/auth");
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  editCourse,
  publishCourse,
  getInstructorCourses,
  deleteCourse,
  getCourseLearningData,
  getFullCourseDetails,      
  getSectionDetails,         
  getSubSectionDetails,
} = require("../controllers/course/course");
const { updateCourseProgress } = require("../controllers/course/courseProgress");
const {
  showAllCategories,
  getCategoryPageDetails, 
} = require("../controllers/course/category");
const {
  createRating,
  getAverageRating,
  getAllRatingReview,
} = require("../controllers/course/RatingAndReview");


router.get("/categories", showAllCategories);
router.get("/getReviews", getAllRatingReview);
router.post("/createRating", auth, createRating);
router.get("/getAverageRating", getAverageRating);
router.post("/", auth, isInstructor, createCourse);
router.post("/editCourse", auth, isInstructor, editCourse);
router.post("/updateCourseProgress", auth, updateCourseProgress);
router.get("/", getAllCourses);
router.get("/instructor", auth, isInstructor, getInstructorCourses);

router.patch("/publish/:courseId", auth, isInstructor, publishCourse);
router.get("/getFullCourseDetails/:courseId", auth, getFullCourseDetails);
router.get("/getSectionDetails/:sectionId", auth, getSectionDetails);       
router.get("/getSubSectionDetails/:subsectionId", auth, getSubSectionDetails);
router.get("/:courseId", getCourseById);
router.put("/:courseId", auth, isInstructor, updateCourse);
router.delete("/:courseId", auth, isInstructor, deleteCourse);
router.get("/:courseId/learning", getCourseLearningData);
router.get("/categoryPageDetails/:categoryId",getCategoryPageDetails);

module.exports = router;