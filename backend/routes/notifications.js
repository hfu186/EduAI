const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notifications");

router.get("/", auth, getNotifications);
router.patch("/mark-all-read", auth, markAllNotificationsAsRead);
router.patch("/:id", auth, markNotificationAsRead);
router.delete("/:id", auth, deleteNotification);
module.exports = router;
