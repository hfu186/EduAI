const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notifications");

router.get("/", auth, getNotifications);
router.patch("/:id/read", auth, markNotificationAsRead);
router.patch("/mark-all-read", auth, markAllNotificationsAsRead);

module.exports = router;
