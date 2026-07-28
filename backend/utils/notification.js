const Notification = require("../models/notification");

exports.createNotification = async ({
  recipient,
  type,
  title,
  message,
  link = "",
  relatedCourse = null,
  relatedSubmission = null,
}) => {
  if (!recipient) return null;

  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    link,
    relatedCourse,
    relatedSubmission,
  });

  return notification;
};
