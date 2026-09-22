const User = require("../models/user");
const Course = require("../models/course");
const Profile = require("../models/profile");
const Orders = require("../models/order");
const mailSender = require("../utils/mailSender");
const { courseStatusTemplate } = require("../mail/templates/reviewCourse");
const { createNotification } = require("../utils/notification");

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureInstructorProfile = async (user, requestDetails) => {
  if (!requestDetails) {
    return;
  }

  let profile = null;
  if (user.additionalDetails) {
    profile = await Profile.findById(user.additionalDetails);
  }

  if (!profile) {
    profile = await Profile.create({
      qualifications: requestDetails.qualifications || "",
      experience: requestDetails.experience || "",
    });
    user.additionalDetails = profile._id;
    await user.save();
  } else {
    profile.qualifications = requestDetails.qualifications || profile.qualifications;
    profile.experience = requestDetails.experience || profile.experience;
    await profile.save();
  }
};

const getAllUsers = async () => User.find({}).populate("additionalDetails");

const updateInstructorStatus = async ({ instructorId, status }) => {
  if (!["active", "suspended"].includes(status)) {
    throw createError(400, "Status must be active or suspended");
  }

  const instructor = await User.findById(instructorId);
  if (!instructor) {
    throw createError(404, "User not found");
  }

  if (instructor.accountType !== "Instructor") {
    throw createError(400, "Only instructor accounts can be suspended or reactivated");
  }

  instructor.status = status;
  await instructor.save();

  return {
    _id: instructor._id,
    status: instructor.status,
    message: `Instructor ${status === "suspended" ? "suspended" : "reactivated"} successfully`,
  };
};

const deleteUser = async ({ userId }) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw createError(404, "User not found");
  }

  return { message: "User deleted successfully" };
};

const promoteUserToInstructor = async ({ userId }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw createError(404, "User not found");
  }

  if (user.accountType === "Admin") {
    throw createError(400, "Admin account cannot be converted");
  }

  if (user.accountType === "Instructor") {
    throw createError(400, "User is already an instructor");
  }

  user.accountType = "Instructor";
  user.instructorRequestStatus = "approved";
  await user.save();

  await ensureInstructorProfile(user, user.instructorRequestDetails);

  await mailSender(
    user.email,
    "Congratulations! You are now an Instructor on EduSpace",
    `
    <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2>Congratulations!</h2>

        <p>Dear ${user.firstName},</p>

        <p>We are pleased to inform you that your account has been approved as an <strong>Instructor</strong> on EduSpace.</p>

        <p>You can now:</p>
        <ul>
            <li>Create new courses</li>
            <li>Manage your courses</li>
            <li>Upload lectures and learning materials</li>
            <li>Interact with your students</li>
        </ul>

        <p>Log in to your account to get started.</p>

        <p>Best regards,<br><strong>EduSpace Team</strong></p>
    </div>
    `
  );

  const updatedUser = await User.findById(userId)
    .populate("additionalDetails")
    .select("-password -token -resetPasswordToken -resetPasswordExpires");

  return {
    message: "User promoted to instructor successfully",
    data: updatedUser,
  };
};

const getAllCourses = async () =>
  Course.find({})
    .populate("instructor")
    .populate("category")
    .populate({
      path: "courseContent",
      populate: { path: "subSection" },
    })
    .sort({ createdAt: -1 });

const approveCourse = async ({ courseId, status }) => {
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { status },
    { new: true }
  ).populate("instructor");

  if (!updatedCourse) {
    throw createError(404, "Course not found");
  }

  if (status === "Published" && updatedCourse?.instructor) {
    await createNotification({
      recipient: updatedCourse.instructor._id || updatedCourse.instructor,
      type: "course_approved",
      title: "Course approved",
      message: `Your course "${updatedCourse.courseName}" has been approved by an admin and is now public.`,
      link: `/course/${updatedCourse._id}`,
      relatedCourse: updatedCourse._id,
    });
  }

  try {
    const instructorEmail = updatedCourse.instructor.email;
    const instructorName = updatedCourse.instructor.firstName;
    const courseName = updatedCourse.courseName;

    const emailTitle =
      status === "Published"
        ? `Congratulations! Your course "${courseName}" is now live`
        : `Update: Your course "${courseName}" has been reverted to draft`;

    await mailSender(
      instructorEmail,
      emailTitle,
      courseStatusTemplate(courseName, instructorName, status)
    );
  } catch (mailError) {
    console.error("Mail sending failed but DB was updated:", mailError.message);
  }

  return {
    message: `Course status updated to ${status} successfully`,
  };
};

const getInstructorRequests = async () =>
  User.find({ instructorRequestStatus: "pending" })
    .populate("additionalDetails")
    .select("-password -token -resetPasswordToken -resetPasswordExpires")
    .sort({ createdAt: -1 });

const reviewInstructorRequest = async ({ userId, decision }) => {
  if (!["approved", "rejected"].includes(decision)) {
    throw createError(400, "Invalid request decision");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createError(404, "User not found");
  }

  if (decision === "approved") {
    user.accountType = "Instructor";
    user.instructorRequestStatus = "approved";
    await user.save();

    await ensureInstructorProfile(user, user.instructorRequestDetails);

    await mailSender(
      user.email,
      "Instructor request approved",
      `Congratulations ${user.firstName}! Your request to become an instructor has been approved.`
    );
  } else {
    user.instructorRequestStatus = "rejected";
    await user.save();

    await mailSender(
      user.email,
      "Instructor request rejected",
      `Hello ${user.firstName}, your request to become an instructor was not approved.`
    );
  }

  return {
    message: decision === "approved" ? "Request approved" : "Request rejected",
  };
};

const getInstructors = async () => User.find({ accountType: "Instructor" }).populate("courses");

const getAdminStats = async () => {
  const totalStudents = await User.countDocuments({ accountType: "Student" });
  const totalInstructors = await User.countDocuments({ accountType: "Instructor" });

  const courses = await Course.find({});
  let totalRevenue = 0;
  courses.forEach((course) => {
    totalRevenue += course.price * course.studentsEnrolled.length;
  });

  return {
    totalStudents,
    totalInstructors,
    totalCourses: courses.length,
    totalRevenue,
  };
};

const getTotalRevenue = async () => {
  const revenue = await Orders.aggregate([
    { $match: { status: "PAID" } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  return { totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0 };
};

const getRevenue30Days = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenue = await Orders.aggregate([
    {
      $match: {
        status: "PAID",
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Asia/Ho_Chi_Minh",
          },
        },
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return revenue.map((item) => ({
    date: item._id,
    revenue: item.revenue,
  }));
};

const getAverageOrderValue = async () => {
  const result = await Orders.aggregate([
    { $match: { status: "PAID" } },
    { $group: { _id: null, avgOrder: { $avg: "$amount" } } },
  ]);

  return { data: Math.round(result[0]?.avgOrder || 0) };
};

const getTopCourses = async () => {
  const courses = await Orders.aggregate([
    { $match: { status: "PAID" } },
    { $unwind: "$coursesId" },
    { $group: { _id: "$coursesId", sales: { $sum: 1 } } },
    { $sort: { sales: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: { path: "$course", preserveNullAndEmptyArrays: false } },
    { $match: { course: { $exists: true } } },
  ]);

  return courses.map((item) => ({ course: item.course.courseName, sales: item.sales }));
};

const getInstructorEarnings = async () => {
  const earnings = await Orders.aggregate([
    { $match: { status: "PAID" } },
    { $unwind: "$coursesId" },
    {
      $lookup: {
        from: "courses",
        localField: "coursesId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: { path: "$course", preserveNullAndEmptyArrays: false } },
    {
      $lookup: {
        from: "users",
        localField: "course.instructor",
        foreignField: "_id",
        as: "instructor",
      },
    },
    { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: "$instructor._id",
        instructor: {
          $first: { $concat: ["$instructor.firstName", " ", "$instructor.lastName"] },
        },
        earnings: { $sum: "$course.price" },
      },
    },
    { $sort: { earnings: -1 } },
    { $limit: 5 },
  ]);

  return earnings;
};

const getEnrollmentGrowth = async () => {
  const growth = await Orders.aggregate([
    { $match: { status: "PAID" } },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$createdAt",
            timezone: "Asia/Ho_Chi_Minh",
          },
        },
        students: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return growth.map((item) => ({
    date: item._id,
    students: item.students,
  }));
};

module.exports = {
  getAllUsers,
  updateInstructorStatus,
  deleteUser,
  promoteUserToInstructor,
  getAllCourses,
  approveCourse,
  getInstructorRequests,
  reviewInstructorRequest,
  getInstructors,
  getAdminStats,
  getTotalRevenue,
  getRevenue30Days,
  getAverageOrderValue,
  getTopCourses,
  getInstructorEarnings,
  getEnrollmentGrowth,
};
