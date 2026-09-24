const Notification = require("../models/notification");

exports.getNotifications = async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });

};

exports.markNotificationAsRead = async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, data: notification });
  
};

exports.markAllNotificationsAsRead = async (req, res) => {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    return res.status(200).json({ success: true, message: "All notifications marked as read" });
};

exports.deleteNotification = async  (req, res) => {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });
    return res.status(200).json({ success: true, message: "Notification deleted successfully" });
};