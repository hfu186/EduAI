import { apiConnector } from "../apiConnector";
import { notificationEndpoints } from "../apis";

const { GET_NOTIFICATIONS_API, MARK_NOTIFICATION_READ_API, MARK_ALL_NOTIFICATIONS_READ_API } = notificationEndpoints;

export const getNotifications = async (token) => {
  const response = await apiConnector("GET", GET_NOTIFICATIONS_API, null, {
    Authorization: `Bearer ${token}`,
  });

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || "Could not fetch notifications");
  }

  return response?.data?.data || [];
};

export const markNotificationAsRead = async (token, notificationId) => {
  const response = await apiConnector("PATCH", `${MARK_NOTIFICATION_READ_API}/${notificationId}`, null, {
    Authorization: `Bearer ${token}`,
  });

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || "Could not mark notification as read");
  }

  return response?.data?.data;
};

export const markAllNotificationsAsRead = async (token) => {
  const response = await apiConnector("PATCH", MARK_ALL_NOTIFICATIONS_READ_API, null, {
    Authorization: `Bearer ${token}`,
  });

  if (!response?.data?.success) {
    throw new Error(response?.data?.message || "Could not mark notifications as read");
  }

  return response?.data;
};
