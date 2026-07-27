const express = require("express");
const router = express.Router();

const {
  createPayment,
  payosWebhook,
  enrollFreeCourse,
  checkPaymentStatus,
} = require("../controllers/course/payments");
const { auth, isStudent } = require("../middleware/auth");

router.post("/create-payment", auth, isStudent, createPayment);
router.post("/payos/webhook", payosWebhook);
router.post("/enroll-free", auth, enrollFreeCourse);
router.get("/check-status/:orderCode", auth, checkPaymentStatus);

module.exports = router;
