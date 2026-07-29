const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
// AUTH ENDPOINTS
export const endpoints = {
  SENDOTP_API: BASE_URL + "/auth/sendotp",
  SIGNUP_API: BASE_URL + "/auth/signup",
  LOGIN_API: BASE_URL + "/auth/login",
  RESETPASSTOKEN_API: BASE_URL + "/auth/reset-password-token",
  RESETPASSWORD_API: BASE_URL + "/auth/reset-password",
}

// PROFILE ENDPOINTS
export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_INSTRUCTOR_DATA_API: BASE_URL + "/profile/instructorDashboard",
  GET_ALL_INSTRUCTORS_API: BASE_URL + "/profile/all-instructors",
  GET_INSTRUCTOR_PROFILE_API: BASE_URL + "/profile/instructor",
  REQUEST_INSTRUCTOR_API: BASE_URL + "/profile/request-instructor",
  GET_INSTRUCTOR_REQUEST_STATUS_API: BASE_URL + "/profile/instructor-request-status",
}

// STUDENTS ENDPOINTS
export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
  CREATE_QR_PAYMENT_API: BASE_URL + "/payment/create-payment",
  CHECK_QR_PAYMENT_STATUS_API: BASE_URL + "/payment/check-status",
}
export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course",
  GET_COURSE_DETAILS_API: BASE_URL + "/course", 
  CREATE_COURSE_API: BASE_URL + "/course",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/categories",
  ENROLL_FREE_COURSE: BASE_URL + "/payment/enroll-free",
  PUBLISH_COURSE_API: BASE_URL + "/course/publish",
  CREATE_SECTION_API: BASE_URL + "/section",
  UPDATE_SECTION_API: BASE_URL + "/section/update",
  DELETE_SECTION_API: BASE_URL + "/section/delete",
  DELETE_COURSE_API: BASE_URL + "/course",
  CREATE_SUBSECTION_API: BASE_URL + "/subsection",
  UPDATE_SUBSECTION_API: BASE_URL + "/subsection/update", 
  DELETE_SUBSECTION_API: BASE_URL + "/subsection/delete",
  GET_FULL_COURSE_DETAILS: `${BASE_URL}/course/getFullCourseDetails`,
  UPDATE_COURSE_PROGRESS: `${BASE_URL}/course/updateCourseProgress`,
  CHECK_SUBMISSION_API: BASE_URL + "/submission/check-submission",
  DELETE_SUBMISSION_API: BASE_URL + "/submission/delete-submission",
  GET_SECTION_DETAILS: `${BASE_URL}/course/getSectionDetails`,
  GET_SUBSECTION_DETAILS: `${BASE_URL}/course/getSubSectionDetails`,
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/profile/instructorCourses",
  SUBMIT_ASSIGNMENT_API: BASE_URL + "/submission/submit-assignment",
  GET_ASSIGNMENT_SUBMISSIONS_API: BASE_URL + "/submission/assignment-submissions",
  GRADE_ASSIGNMENT_API: BASE_URL + "/submission/grade-submission",
  SUBMIT_QUIZ_API: BASE_URL + "/quiz/submit",

}

export const aiEndpoints = {
  CHAT_WITH_AI_API: BASE_URL + "/chatbot/chat", 
  GENERATE_AI_QUIZ_API: BASE_URL + "/quiz/generate-ai",
}


export const conversationEndpoints = {
  CREATE_OR_GET_CHAT_API: BASE_URL + "/chat",
  GET_MY_CHATS_API: BASE_URL + "/chat",
  GET_CHAT_BY_ID_API: BASE_URL + "/chat", 
  DELETE_CHAT_API: BASE_URL + "/chat", 
  UPLOAD_CHAT_FILE_API: BASE_URL + "/message/upload",
  SEND_MESSAGE_API: BASE_URL + "/message",
  GET_MESSAGES_API: BASE_URL + "/message", 
  MARK_READ_API: BASE_URL + "/message", 
}


export const catalogData = {
  CATALOGPAGEDATA_API: BASE_URL + "/course/CategoryPageDetails",
};

export const ratingsEndpoints = {
  REVIEWS_DETAILS_API: BASE_URL + "/course/getReviews",
  CREATE_RATING_API: BASE_URL + "/course/createRating",  
}

export const notificationEndpoints = {
  GET_NOTIFICATIONS_API: BASE_URL + "/notifications",
  MARK_NOTIFICATION_READ_API: BASE_URL + "/notifications",
  MARK_ALL_NOTIFICATIONS_READ_API: BASE_URL + "/notifications/mark-all-read",
}

export const adminEndpoints={
  GET_ALL_USERS: BASE_URL + "/admin/all-users",
  DELETE_USER: BASE_URL + "/admin/delete-user",
  PROMOTE_USER: BASE_URL + "/admin/promote-user",
  GET_ALL_COURSES: BASE_URL + "/admin/all-courses",
  APPROVE_COURSE: BASE_URL + "/admin/approve-course",
  GET_INSTRUCTOR_REQUESTS: BASE_URL + "/admin/instructor-requests",
  REVIEW_INSTRUCTOR_REQUEST: BASE_URL + "/admin/instructor-requests",
  GET_ADMIN_STATS: BASE_URL + "/admin/stats",
  GET_REVENUE_STATS: BASE_URL + "/admin/revenue-stats",
  GET_REVENUE_30DAYS: BASE_URL + "/admin/revenue-30days",
  GET_TOP_COURSES: BASE_URL + "/admin/top-courses",
  GET_INSTRUCTOR_EARNINGS: BASE_URL + "/admin/instructor-earnings",
  GET_ENROLLMENT_GROWTH: BASE_URL + "/admin/enrollment-growth",
  GET_AVERAGE_ORDER_VALUE: BASE_URL + "/admin/avg-order-value",
  CREATE_CATEGORY_API: BASE_URL + "/admin/create-category",
  UPDATE_CATEGORY_API: BASE_URL + "/admin/update-category",
  DELETE_CATEGORY_API: BASE_URL + "/admin/delete-category",
  GET_ALL_CATEGORY_API: BASE_URL + "/course/categories"
}

// SETTINGS PAGE API
export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateUserProfileImage",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changepassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteProfile",
}