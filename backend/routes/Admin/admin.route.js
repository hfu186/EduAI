const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../../middleware/auth");
const { 
    getAllUsers, 
    deleteUser, 
    promoteUserToInstructor,
    getAllCourses, 
    approveCourse, 
    getInstructors,
    getTotalRevenue,
    getAdminStats,
    getRevenue30Days,
    getTopCourses,
    getInstructorEarnings,
    getEnrollmentGrowth,
    getAverageOrderValue,
  
} = require("../../controllers/Admin/admin.controller");
const { createCategory, updateCategory, deleteCategory } = require("../../controllers/course/category")
router.post("/create-category", auth, isAdmin, createCategory);
router.put("/update-category/:categoryId", auth, isAdmin, updateCategory);
router.delete("/delete-category/:categoryId", auth, isAdmin, deleteCategory);
router.get("/all-users", auth, isAdmin, getAllUsers);
router.delete("/delete-user/:userId", auth, isAdmin, deleteUser);
router.patch("/promote-user/:userId", auth, isAdmin, promoteUserToInstructor);
router.get("/all-courses", auth, isAdmin, getAllCourses);
router.post("/approve-course", auth, isAdmin, approveCourse);
router.get("/all-instructors", auth, isAdmin, getInstructors);
router.get("/stats", auth, isAdmin, getAdminStats);
router.get("/revenue-stats", auth, isAdmin, getTotalRevenue);
router.get("/revenue-30days", auth, isAdmin, getRevenue30Days);
router.get("/top-courses", auth, isAdmin, getTopCourses);
router.get("/instructor-earnings", auth, isAdmin, getInstructorEarnings);
router.get("/enrollment-growth", auth, isAdmin, getEnrollmentGrowth);
router.get("/avg-order-value", auth, isAdmin, getAverageOrderValue);
module.exports = router;