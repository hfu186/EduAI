import crypto from "crypto";
import mongoose from "mongoose";
import { payos } from "../../utils/payos.js"; 
import Order from "../../models/order.js"
import User from "../../models/user.js";
import Course from "../../models/course.js";
import CourseProgress from "../../models/courseProgress.js";
import Enrollment from "../../models/enrollment.js";
import enrollmentService from "../../services/enrollment.service.js";
import mailSender from "../../utils/mailSender.js";
import { courseEnrollmentEmail } from "../../mail/templates/courseEnrollmentEmail.js";

export const createPayment = async (req, res) => {
  try {
    const { coursesId } = req.body;
    const userId = req.user.id;

    if (!coursesId || coursesId.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide course ids",
      });
    }

    let totalAmount = 0;

    for (const courseId of coursesId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      if (await Enrollment.exists({ userId, courseId })) {
        return res.status(400).json({
          success: false,
          message: `Student already enrolled in ${course.courseName}`,
        });
      }

      totalAmount += Number(course.price);
    }

    totalAmount = Math.round(totalAmount);
    const orderCode = Number(
      Date.now().toString().slice(-9)
    );

    await Order.create({
      orderCode: orderCode,
      userId: userId,
      coursesId: coursesId,
      amount: totalAmount,
      status: "PENDING"
    });

    const paymentLink = await payos.paymentRequests.create({
      orderCode: orderCode,
      amount: totalAmount,
      description: `Payment ${coursesId.length} course(s)`,
      returnUrl: `${process.env.CLIENT_URL}/course/${coursesId[0]}`,
      cancelUrl: `${process.env.CLIENT_URL}/payment-cancel`,
    });


    return res.status(200).json({
      success: true,
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
      orderCode,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not create payment",
    });
  }
};
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;

    if (!orderCode) {
      return res.status(400).json({ success: false, message: "Missing orderCode" });
    }

    const order = await Order.findOne({ orderCode: Number(orderCode) });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.status(200).json({
      success: true,
      status: order.status, 
    });

  } catch (error) {
    console.error("Check Payment Status Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error checking payment status",
      status: "ERROR"
    });
  }
};
export const payosWebhook = async (req, res) => {

  const { signature, ...payload } = req.body
  const data = payload.data

  const sortedKeys = Object.keys(data).sort()
  const signData = sortedKeys
    .map(key => `${key}=${data[key] ?? ""}`)
    .join("&")

  const expectedSignature = crypto
    .createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY)
    .update(signData)
    .digest("hex")

  if (signature !== expectedSignature) {
    return res.status(200).json({ success: false })
  }


  if (payload.code !== "00") {
    return res.status(200).json({ success: true })
  }

  try {
    const order = await Order.findOne({ orderCode: data.orderCode })

    if (!order) {
      return res.status(200).json({ success: true })
    }

    if (order.status === "PAID") {
      return res.status(200).json({ success: true })
    }

    // ===== ENROLL =====
    await enrollStudents(order.coursesId, order.userId)

    order.status = "PAID"
    await order.save()

    return res.status(200).json({ success: true })

  } catch (err) {
    console.error("Webhook processing error:", err)
    return res.status(200).json({ success: false })
  }
}
/* =========================================================
   3. ENROLL STUDENTS (INTERNAL)
   ========================================================= */
const enrollStudents = async (courses, userId) => {
  const student = await User.findById(userId);
  if (!student) throw new Error("User not found");

  for (const courseId of courses) {
    const enrolledCourse = await Course.findById(courseId);

    if (!enrolledCourse) throw new Error("Course not found");

    const [createdEnrollment] = await Promise.all([
      enrollmentService.createEnrollmentIfMissing(userId, courseId),
      CourseProgress.updateOne(
        { userId, courseId },
        { $setOnInsert: { userId, courseId, completedSubSections: [] } },
        { upsert: true }
      ),
    ]);

    if (createdEnrollment) {
      await mailSender(
        student.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(enrolledCourse.courseName, student.firstName)
      );
    }
  }
};


export const enrollFreeCourse = async (req, res) => {
  try {
    const { courseId } = req.body
    const userId = req.user.id

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid courseId" })
    }

    const course = await Course.findById(courseId).select(
      "courseName price status instructor"
    )
    if (!course || course.status !== "Published") {
      return res.status(404).json({ success: false, message: "Course not found" })
    }
    if (course.price > 0) {
      return res.status(400).json({
        success: false,
        message: "Paid course cannot be enrolled for free",
      })
    }
    if (String(course.instructor) === String(userId)) {
      return res.status(400).json({
        success: false,
        message: "Cannot enroll in your own course",
      })
    }

    
    const [createdEnrollment] = await Promise.all([
      enrollmentService.createEnrollmentIfMissing(userId, courseId),
      CourseProgress.updateOne(
        { userId, courseId },
        { $setOnInsert: { userId, courseId, completedSubSections: [] } },
        { upsert: true }
      ),
    ])

    if (createdEnrollment) {
      try {
        const student = await User.findById(userId).select("email firstName")
        await mailSender(
          student.email,
          `Successfully Enrolled into ${course.courseName}`,
          courseEnrollmentEmail(course.courseName, student.firstName)
        )
      } catch (mailError) {
        console.error("Enrollment email failed:", mailError)
      }
    }

    return res.status(200).json({ success: true, message: "Enrolled Successfully" })
  } catch (error) {
    console.error("Enroll Free Course Error:", error)
    return res.status(500).json({ success: false, message: "Failed to enroll" })
  }
}