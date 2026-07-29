const User = require("../../models/user");
const Course = require("../../models/course");
const mailSender = require("../../utils/mailSender");
const { courseStatusTemplate } = require("../../mail/templates/reviewCourse");
const Orders = require("../../models/order");
const { createNotification } = require("../../utils/notification");
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({})
            .populate("additionalDetails")
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.promoteUserToInstructor = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.accountType === "Admin") {
            return res.status(400).json({
                success: false,
                message: "Admin account cannot be converted",
            });
        }

        if (user.accountType === "Instructor") {
            return res.status(400).json({
                success: false,
                message: "User is already an instructor",
            });
        }

        user.accountType = "Instructor";
        user.instructorRequestStatus = "approved";
        await user.save();

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

        return res.status(200).json({
            success: true,
            message: "User promoted to instructor successfully",
            data: updatedUser,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find({}).populate("instructor").populate("category").populate({
            path: "courseContent",
            populate: { path: "subSection" },
        })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

exports.approveCourse = async (req, res) => {
    const { courseId, status } = req.body;
    try {
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { status: status },
            { new: true }
        ).populate("instructor");

        if (!updatedCourse) {
            return res.status(404).json({ success: false, message: "Course not found" });
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

        res.status(200).json({
            success: true,
            message: `Course status updated to ${status} successfully`
        });

        try {
            const instructorEmail = updatedCourse.instructor.email;
            const instructorName = updatedCourse.instructor.firstName;
            const courseName = updatedCourse.courseName;

            const emailTitle = status === "Published"
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

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstructorRequests = async (req, res) => {
    try {
        const requests = await User.find({ instructorRequestStatus: "pending" })
            .populate("additionalDetails")
            .select("-password -token -resetPasswordToken -resetPasswordExpires")
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: requests });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.reviewInstructorRequest = async (req, res) => {
    try {
        const { userId } = req.params;
        const { decision } = req.body;

        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({ success: false, message: 'Invalid request decision' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (decision === 'approved') {
            user.accountType = 'Instructor';
            user.instructorRequestStatus = 'approved';
            await user.save();

            await mailSender(
                user.email,
                'Instructor request approved',
                `Congratulations ${user.firstName}! Your request to become an instructor has been approved.`
            );
        } else {
            user.instructorRequestStatus = 'rejected';
            await user.save();

            await mailSender(
                user.email,
                'Instructor request rejected',
                `Hello ${user.firstName}, your request to become an instructor was not approved.`
            );
        }

        return res.status(200).json({ success: true, message: decision === 'approved' ? 'Request approved' : 'Request rejected' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ accountType: "Instructor" }).populate("courses");
        res.status(200).json({ success: true, data: instructors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ accountType: "Student" });
        const totalInstructors = await User.countDocuments({ accountType: "Instructor" });


        const courses = await Course.find({});
        let totalRevenue = 0;
        courses.forEach(course => {
            totalRevenue += (course.price * course.studentsEnrolled.length);
        });

        res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalInstructors,
                totalCourses: courses.length,
                totalRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getTotalRevenue = async (req, res) => {
    try {

        const revenue = await Orders.aggregate([
            {
                $match: { status: "PAID" }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" }
                }
            }
        ]);

        const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;

        res.status(200).json({
            success: true,
            totalRevenue
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getRevenue30Days = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const revenue = await Orders.aggregate([
            {
                $match: {
                    status: "PAID",
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formatted = revenue.map((item) => ({
            date: item._id,
            revenue: item.revenue
        }));

        res.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAverageOrderValue = async (req, res) => {
    try {
        const result = await Orders.aggregate([
            {
                $match: { status: "PAID" }
            },
            {
                $group: {
                    _id: null,
                    avgOrder: { $avg: "$amount" }
                }
            }
        ]);

        res.json({
            success: true,
            data: Math.round(result[0]?.avgOrder || 0)
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getTopCourses = async (req, res) => {
    try {
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
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: false } },
            { $match: { "course": { $exists: true } } }
        ]);

        res.json({
            success: true,
            data: courses.map((i) => ({ course: i.course.courseName, sales: i.sales }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInstructorEarnings = async (req, res) => {
    try {
        const earnings = await Orders.aggregate([
            { $match: { status: "PAID" } },
            { $unwind: "$coursesId" },
            {
                $lookup: {
                    from: "courses",
                    localField: "coursesId",
                    foreignField: "_id",
                    as: "course"
                }
            },
            { $unwind: { path: "$course", preserveNullAndEmptyArrays: false } },
            {
                $lookup: {
                    from: "users",
                    localField: "course.instructor",
                    foreignField: "_id",
                    as: "instructor"
                }
            },
            { $unwind: { path: "$instructor", preserveNullAndEmptyArrays: false } },
            {
                $group: {
                    _id: "$instructor._id",
                    instructor: {
                        $first: { $concat: ["$instructor.firstName", " ", "$instructor.lastName"] }
                    },
                    earnings: { $sum: "$course.price" },
                }
            },
            { $sort: { earnings: -1 } },
            { $limit: 5 }
        ]);

        res.json({ success: true, data: earnings });
    } catch (error) {
        console.error("getInstructorEarnings error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEnrollmentGrowth = async (req, res) => {
    try {
        const growth = await Orders.aggregate([
            {
                $match: { status: "PAID" }
            },

            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Ho_Chi_Minh"
                        }
                    },
                    students: { $sum: 1 }
                }
            },

            { $sort: { _id: 1 } }
        ]);

        const formatted = growth.map((item) => ({
            date: item._id,
            students: item.students
        }));

        res.json({
            success: true,
            data: formatted
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
