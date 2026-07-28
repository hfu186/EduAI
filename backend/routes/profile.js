const express = require("express");
const router = express.Router();

const { auth, isInstructor } = require("../middleware/auth");
const{getInstructorCourses} = require("../controllers/course/course");
const {
    updateProfile,
    updateUserProfileImage,
    getUserDetails,
    getEnrolledCourses,
    deleteAccount,
    getAllInstructors,
    getInstructorPublicProfile,
    instructorDashboard,
    requestInstructor,
    getInstructorRequestStatus
} = require('../controllers/user/profile');

router.delete('/deleteProfile', auth, deleteAccount);
router.put('/updateProfile', auth, updateProfile);
router.get('/getUserDetails', auth, getUserDetails);


router.get('/getEnrolledCourses', auth, getEnrolledCourses);
router.put('/updateUserProfileImage', auth, updateUserProfileImage);

router.get('/instructorDashboard', auth, isInstructor, instructorDashboard);
router.post('/request-instructor', auth, requestInstructor);
router.get('/instructor-request-status', auth, getInstructorRequestStatus);
router.get("/all-instructors", getAllInstructors);
router.get("/instructor/:instructorId", getInstructorPublicProfile);
router.get("/instructorCourses", auth, isInstructor, getInstructorCourses);

module.exports = router;
