import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMyChats } from "../../services/operations/chatAPI";
import { BsChatDots, BsSearch } from "react-icons/bs";
import { clearChatUnread } from "../../slices/messageSlice";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { unreadChats = {} } = useSelector((state) => state.messages);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!token) return;

    const fetchChats = async () => {
      setLoading(true);
      try {
        const res = await getMyChats(token);
        setChats(res || []);
      } catch (error) {
        console.error(error);
        setChats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [token]);

  const getOtherPerson = (chat) => {
    if (!user?._id) return null;
    return String(chat.student?._id) === String(user._id)
      ? chat.instructor
      : chat.student;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return t("pages.chat.just_now");
    if (diff < 3600) return `${Math.floor(diff / 60)} ${t("pages.chat.minutes")}`;
    if (diff < 86400)
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (diff < 604800)
      return date.toLocaleDateString("vi-VN", { weekday: "short" });
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const filteredChats = chats.filter((chat) => {
    const other = getOtherPerson(chat);
    if (!other) return false;
    const name = `${other.firstName} ${other.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-40 bg-richblack-700 rounded-lg mb-8 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl bg-richblack-800/60 animate-pulse"
            >
              <div className="w-14 h-14 rounded-full bg-richblack-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-richblack-700 rounded w-1/3" />
                <div className="h-3 bg-richblack-700 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-2.5rem-5rem)] p-2 items-center justify-center">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-richblack-5 tracking-tight">
          {t("pages.chat.messages")}
        </h1>
        {chats.length > 0 && (
          <span className="text-sm text-richblack-400 bg-richblack-800 px-3 py-1 rounded-full">
            {t("pages.chat.conversations", { count: chats.length })}
          </span>
        )}
      </div>

      <div className="relative mb-6">
        <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-richblack-400 text-lg" />
        <input
          type="text"
          placeholder={t("pages.chat.search_placeholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-richblack-800 border border-richblack-700 rounded-2xl py-3.5 pl-12 pr-4 text-richblack-5 placeholder:text-richblack-500 focus:outline-none focus:ring-2 focus:ring-yellow-50/30 focus:border-yellow-50/50 transition-all duration-200"
        />
      </div>

      {filteredChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-richblack-800 to-richblack-900 flex items-center justify-center mb-6 shadow-lg">
            <BsChatDots className="text-5xl text-richblack-500" />
          </div>
          <h3 className="text-xl font-semibold text-richblack-100 mb-2">
            {searchTerm ? t("pages.chat.no_results") : t("pages.chat.no_conversations")}
          </h3>
          <p className="text-richblack-400 max-w-xs">
            {searchTerm ? t("pages.chat.try_search") : t("pages.chat.start_conversation")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredChats.map((chat) => {
            const other = getOtherPerson(chat);
            if (!other) return null;

            const hasMessage = !!chat.lastMessage?.content;
            const unreadCount = unreadChats?.[chat._id] || 0;

            return (
              <div
                key={chat._id}
                onClick={() => {
                  dispatch(clearChatUnread(chat._id));
                  navigate(`/chat/${chat._id}`);
                }}
                className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all duration-200 ${
                  unreadCount > 0
                    ? "bg-blue-950/50 border-red-500/40 shadow-lg shadow-black/20"
                    : "bg-richblack-800/40 border-transparent hover:bg-richblack-800 hover:border-richblack-600 hover:shadow-lg hover:shadow-black/20"
                } active:scale-[0.99]`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      other.image ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${other.firstName}%20${other.lastName}&backgroundColor=7c3aed`
                    }
                    alt={`${other.firstName} ${other.lastName}`}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-richblack-700 group-hover:ring-yellow-50/40 transition-all duration-200"
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-lg">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className={`truncate font-semibold transition-colors ${
                      unreadCount > 0 ? "text-white" : "text-richblack-5 group-hover:text-yellow-50"
                    }`}>
                      {other.firstName} {other.lastName}
                    </h3>
                    {chat.lastMessage?.createdAt && (
                      <span className="text-xs text-richblack-500 whitespace-nowrap">
                        {formatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <p
                    className={`truncate text-sm ${
                      unreadCount > 0
                        ? "font-semibold text-white"
                        : hasMessage
                        ? "text-richblack-300"
                        : "text-richblack-500 italic"
                    }`}
                  >
                    {hasMessage ? chat.lastMessage.content : t("pages.chat.start_conversation")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
