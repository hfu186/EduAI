import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiBell, FiCheck, FiTrash2, FiX } from "react-icons/fi";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../../services/operations/notificationAPI";

const ACCENT = "#faee12";

const isRead = (notification) =>
  Boolean(notification?.read ?? notification?.isRead ?? false);

const timeAgo = (date, locale) => {
  if (!date) return "";

  const diff = (new Date(date).getTime() - Date.now()) / 1000;

  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
  });

  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds) {
      return rtf.format(Math.round(diff / seconds), unit);
    }
  }

  return rtf.format(0, "second");
};

const NotificationDropdown = () => {
  const { token } = useSelector((state) => state.auth);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const rootRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("all");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !isRead(notification)).length,
    [notifications],
  );

  const readCount = notifications.length - unreadCount;

  const visibleNotifications = useMemo(() => {
    if (tab === "unread") {
      return notifications.filter((notification) => !isRead(notification));
    }

    return notifications;
  }, [notifications, tab]);

  const loadNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const data = await getNotifications(token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();

    if (!token) return;

    const intervalId = window.setInterval(loadNotifications, 10000);

    window.addEventListener("focus", loadNotifications);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadNotifications);
    };
  }, [token, loadNotifications]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const markRead = async (notification) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item._id === notification._id
          ? { ...item, read: true, isRead: true }
          : item,
      ),
    );

    try {
      await markNotificationAsRead(token, notification._id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!isRead(notification)) {
      await markRead(notification);
    }

    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  const handleMarkAll = async () => {
    if (!unreadCount) return;

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
        isRead: true,
      })),
    );

    try {
      await markAllNotificationsAsRead(token);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      loadNotifications();
    }
  };

  const handleDelete = async (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification._id !== id),
    );

    try {
      await deleteNotification(token, id);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      loadNotifications();
    }
  };

  const handleClearRead = async () => {
    const readIds = notifications
      .filter((notification) => isRead(notification))
      .map((notification) => notification._id);

    if (!readIds.length) return;

    setNotifications((prev) =>
      prev.filter((notification) => !isRead(notification)),
    );

    try {
      await Promise.all(
        readIds.map((id) => deleteNotification(token, id)),
      );
    } catch (error) {
      console.error("Failed to clear read notifications:", error);
      loadNotifications();
    }
  };



  return (
  <div ref={rootRef} className="relative">
    {/* Notification Button */}
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className={`group relative flex h-10 w-10 items-center justify-center
        rounded-xl border transition-all duration-200
        ${
          open
            ? "border-[#faee12]/40 bg-[#faee12]/10 text-[#faee12]"
            : "border-transparent text-richblack-100 hover:border-richblack-700 hover:bg-richblack-800 hover:text-[#faee12]"
        }
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-[#faee12]/40`}
      aria-label={t(
        "navbar.notifications.title",
        "Notifications"
      )}
      aria-expanded={open}
    >
      <FiBell
        size={19}
        className="transition-transform duration-200 group-hover:scale-105"
      />

      {unreadCount > 0 && (
        <span
          className="absolute -right-1 -top-1 flex min-w-[17px] items-center
            justify-center rounded-full border-2 border-richblack-900
            bg-[#faee12] px-1 text-[9px] font-extrabold
            leading-[15px] text-richblack-900 shadow-[0_0_10px_rgba(250,238,18,0.25)]"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>

    {/* Dropdown */}
    {open && (
      <div
        className="absolute right-0 top-full z-50 mt-3 w-[400px]
       
          overflow-hidden rounded-2xl border border-richblack-700
          bg-richblack-900 shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
      >
        {/* Header */}
        <div className="border-b border-richblack-800 bg-richblack-900">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center
                  rounded-xl bg-[#faee12]/10 text-[#faee12]"
              >
                <FiBell size={18} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-richblack-5">
                  {t(
                    "navbar.notifications.title",
                    "Notifications"
                  )}
                </h3>

                <p className="mt-0.5 text-[11px] text-richblack-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="flex items-center gap-1.5 rounded-lg
                  px-2.5 py-2 text-[11px] font-semibold
                  text-[#faee12] transition-all duration-200
                  hover:bg-[#faee12]/10"
              >
                <FiCheck size={13} />

                {t(
                  "navbar.notifications.mark_all",
                  "Mark all as read"
                )}
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="px-4 pb-3">
            <div className="flex rounded-xl bg-richblack-800 p-1 ">
              <button
                type="button"
                onClick={() => setTab("all")}
                className={`flex flex-1 items-center justify-center gap-2 
                  rounded-lg px-3 py-2 text-xs font-medium
                  transition-all duration-200 ${
                    tab === "all"
                      ? "bg-yellow-50/5 text-[#faee12]"
                      : "text-richblack-500 hover:text-richblack-200"
                     
                  }`}
              >
                {t("navbar.notifications.all", "All")}

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px]
                    ${
                      tab === "all" 
                        ? "bg-yellow-50/5 text-[#faee12]"
                        : "bg-richblack-700 text-richblack-500"
                    }`}
                >
                  {notifications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab("unread")}
                className={`flex flex-1 items-center justify-center gap-2
                  rounded-lg px-3 py-2 text-xs font-medium
                  transition-all duration-200 ${
                    tab === "unread"
                      ? "bg-yellow-50/5 text-[#faee12]"
                      : "text-richblack-500 hover:text-richblack-200"
                  }`}
              >
                {t("navbar.notifications.unread", "Unread")}

                {unreadCount > 0 && (
                  <span
                    className="rounded-full bg-[#faee12]/10
                      px-1.5 py-0.5 text-[10px] font-semibold
                      text-[#faee12]"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notification List */}
        <ul className="max-h-[390px] overflow-y-auto">
          {visibleNotifications.length > 0 ? (
            visibleNotifications.map((notification) => {
              const read = isRead(notification);

              return (
                <li
                  key={notification._id}
                  className={`group relative border-b
                    border-richblack-800/80 transition-all duration-200
                    last:border-b-0 ${
                      read
                        ? "bg-richblack-900"
                        : "bg-[#faee12]/[0.025]"
                    }`}
                >
                  {/* Unread indicator */}
                  {!read && (
                    <span
                      className="absolute bottom-0 left-0 top-0 w-[3px]"
                      style={{ backgroundColor: ACCENT }}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    className="flex w-full items-start gap-3
                      px-4 py-3.5 pr-12 text-left
                      transition-all duration-200
                      hover:bg-richblack-800/80
                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-inset
                      focus-visible:ring-[#faee12]/40"
                  >
                    {/* Icon */}
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0
                        items-center justify-center rounded-xl
                        ${
                          read
                            ? "bg-richblack-800 text-richblack-500"
                            : "bg-[#faee12]/10 text-[#faee12]"
                        }`}
                    >
                      <FiBell size={15} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!read && (
                          <span
                            className="h-1.5 w-1.5 shrink-0
                              rounded-full bg-[#faee12]"
                          />
                        )}

                        <p
                          className={`truncate text-sm ${
                            read
                              ? "font-medium text-richblack-300"
                              : "font-semibold text-richblack-5"
                          }`}
                        >
                          {notification.title}
                        </p>
                      </div>

                      <p
                        className={`mt-1.5 line-clamp-2 text-xs
                          leading-5 ${
                            read
                              ? "text-richblack-500"
                              : "text-richblack-300"
                          }`}
                      >
                        {notification.message}
                      </p>

                      {notification.createdAt && (
                        <p
                          className={`mt-2 text-[10px] font-medium ${
                            read
                              ? "text-richblack-600"
                              : "text-[#faee12]/80"
                          }`}
                        >
                          {timeAgo(
                            notification.createdAt,
                            i18n.language
                          )}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(notification._id)
                    }
                    className="absolute right-3 top-3 flex h-7 w-7
                      items-center justify-center rounded-lg
                      text-richblack-600 opacity-0
                      transition-all duration-200
                      hover:bg-red-500/10 hover:text-red-400
                      focus-visible:opacity-100
                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-red-400/40
                      group-hover:opacity-100"
                    aria-label={t(
                      "navbar.notifications.delete",
                      "Delete notification"
                    )}
                    title={t(
                      "navbar.notifications.delete",
                      "Delete notification"
                    )}
                  >
                    <FiX size={14} />
                  </button>
                </li>
              );
            })
          ) : (
            /* Empty State */
            <li className="flex flex-col items-center justify-center
              px-6 py-14 text-center"
            >
              <div
                className="flex h-16 w-16 items-center justify-center
                  rounded-2xl border border-richblack-700
                  bg-richblack-800 text-richblack-600"
              >
                <FiBell size={25} />
              </div>

              <p className="mt-4 text-sm font-semibold text-richblack-300">
                {tab === "unread"
                  ? t(
                      "navbar.notifications.empty_unread",
                      "You're all caught up"
                    )
                  : t(
                      "navbar.notifications.empty",
                      "No notifications yet"
                    )}
              </p>

              <p className="mt-1.5 max-w-[230px] text-xs
                leading-5 text-richblack-600"
              >
                {t(
                  "navbar.notifications.empty_description",
                  "New notifications will appear here."
                )}
              </p>
            </li>
          )}
        </ul>

        {/* Footer */}
        {readCount > 0 && (
          <div
            className="flex items-center justify-between
              border-t border-richblack-800
              bg-richblack-900 px-4 py-2.5"
          >
            <span className="text-[10px] text-richblack-600">
              {readCount} read
            </span>

            <button
              type="button"
              onClick={handleClearRead}
              className="flex items-center gap-1.5 rounded-lg
                px-2.5 py-1.5 text-[11px] font-medium
                text-richblack-500 transition-all duration-200
                hover:bg-red-500/10 hover:text-red-400"
            >
              <FiTrash2 size={12} />

              {t(
                "navbar.notifications.clear_read",
                "Clear read notifications"
              )}
            </button>
          </div>
        )}
      </div>
    )}
  </div>

  );
};

export default NotificationDropdown;
