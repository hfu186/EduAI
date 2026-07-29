import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { IoSend, IoArrowBack } from "react-icons/io5";
import { BsPaperclip } from "react-icons/bs";
import { getSocket, initSocket } from "../../services/socket";
import {
  getChatById,
  getMessages,
  uploadChatFile,
} from "../../services/operations/chatAPI";

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState(false);
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // ====================== LOAD DATA + SOCKET ======================
  useEffect(() => {
    if (!chatId || !token) return;

    const socket = getSocket() || initSocket(token);

    const loadData = async () => {
      setLoading(true);
      try {
        const [chatData, messageData] = await Promise.all([
          getChatById(chatId, token),
          getMessages(chatId, token),
        ]);
        setChat(chatData);
        setMessages(messageData || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu chat:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    socket.emit("joinChat", chatId);

    const handleNewMessage = (msg) => {
      if (String(msg.chat) === String(chatId)) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ userId, isTyping }) => {
      if (String(userId) !== String(user?._id)) {
        setTypingUser(isTyping);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleTyping);

    return () => {
      socket.emit("leaveChat", chatId);
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleTyping);
    };
  }, [chatId, token, user?._id]);

  // Tự cuộn xuống cuối
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const otherPerson =
    chat && user
      ? String(chat.student?._id) === String(user._id)
        ? chat.instructor
        : chat.student
      : null;

  // ====================== GỬI TIN NHẮN ======================
  const handleSend = () => {
    if (!text.trim()) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("sendMessage", { chatId, content: text.trim() }, (res) => {
      if (!res?.success) console.error("Gửi tin nhắn thất bại:", res?.error);
    });

    setText("");
    socket.emit("typing", { chatId, isTyping: false });
    inputRef.current?.focus();
  };

  const handleChange = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing", { chatId, isTyping: true });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { chatId, isTyping: false });
    }, 1500);
  };

  // ====================== UPLOAD FILE ======================
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadChatFile(chatId, file, token);
      if (!result) {
        console.error("Upload thất bại");
      }
      // Socket "newMessage" sẽ tự cập nhật tin nhắn
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ====================== LOADING ======================
  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-3.5rem)] bg-richblack-900 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-richblack-700">
          <div className="w-6 h-6 bg-richblack-700 rounded animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-richblack-700 animate-pulse" />
          <div className="h-4 w-32 bg-richblack-700 rounded animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center text-richblack-400">
          Đang tải cuộc trò chuyện...
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="w-full h-[calc(100vh-3.5rem)] bg-richblack-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-richblack-300 text-lg mb-4">
            Không tìm thấy cuộc trò chuyện
          </p>
          <button
            onClick={() => navigate("/chat")}
            className="px-4 py-2 bg-yellow-50 text-richblack-900 rounded-lg font-medium hover:bg-yellow-100 transition"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] bg-richblack-900 flex flex-col overflow-hidden pt-5">
      {/* ===== HEADER ===== */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-richblack-700 bg-richblack-900">
        <button
          onClick={() => navigate("/chat")}
          className="p-2 -ml-2 rounded-full hover:bg-richblack-800 transition-colors"
        >
          <IoArrowBack className="text-white text-xl" />
        </button>

        <img
          src={
            otherPerson?.image ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${otherPerson?.firstName}%20${otherPerson?.lastName}&backgroundColor=7c3aed`
          }
          alt={otherPerson?.firstName}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-richblack-700"
        />

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">
            {otherPerson?.firstName} {otherPerson?.lastName}
          </p>
          {typingUser ? (
            <p className="text-xs text-yellow-50 animate-pulse">Đang nhập...</p>
          ) : (
            <p className="text-xs text-richblack-400">Đang hoạt động</p>
          )}
        </div>
      </div>

      {/* ===== MESSAGES ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-richblack-800 flex items-center justify-center mb-4">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-richblack-300 font-medium">Chưa có tin nhắn nào</p>
            <p className="text-sm text-richblack-500 mt-1">
              Hãy gửi lời chào để bắt đầu cuộc trò chuyện!
            </p>
          </div>
        ) : (
          messages.map((m, index) => {
            const isMine =
              String(m.sender?._id || m.sender) === String(user._id);

            const showAvatar =
              !isMine &&
              (index === 0 ||
                String(
                  messages[index - 1]?.sender?._id || messages[index - 1]?.sender
                ) !== String(m.sender?._id || m.sender));

            return (
              <div
                key={m._id}
                className={`flex items-end gap-2 ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                {!isMine && (
                  <div className="w-8 flex-shrink-0">
                    {showAvatar ? (
                      <img
                        src={
                          otherPerson?.image ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${otherPerson?.firstName}&backgroundColor=7c3aed`
                        }
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 text-sm leading-relaxed shadow-sm
                    ${
                      isMine
                        ? "bg-yellow-50 text-richblack-900 rounded-2xl rounded-br-md"
                        : "bg-richblack-700 text-richblack-5 rounded-2xl rounded-bl-md"
                    }`}
                >
                  {/* Nội dung tin nhắn */}
                  {m.messageType === "image" ? (
                    <img
                      src={m.fileUrl}
                      alt={m.fileName || "image"}
                      className="max-w-[220px] rounded-lg cursor-pointer"
                      onClick={() => window.open(m.fileUrl, "_blank")}
                    />
                  ) : m.messageType === "file" ? (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 underline text-sm break-all"
                    >
                      📎 {m.fileName || "Tệp đính kèm"}
                    </a>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  )}

                  <p
                    className={`text-[10px] mt-1.5 ${
                      isMine
                        ? "text-richblack-600 text-right"
                        : "text-richblack-400"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-end gap-2">
            <img
              src={
                otherPerson?.image ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${otherPerson?.firstName}&backgroundColor=7c3aed`
              }
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-richblack-700 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-richblack-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-richblack-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-richblack-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ===== INPUT ===== */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-richblack-700 bg-richblack-900">
        <div className="flex items-center gap-2">
          {/* Nút đính kèm file */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.zip,.rar"
          />
          <button
            onClick={() => !uploading && fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2.5 rounded-full hover:bg-richblack-800 transition-colors disabled:opacity-50"
          >
            <BsPaperclip
              className={`text-xl ${
                uploading ? "text-richblack-500" : "text-richblack-300"
              }`}
            />
          </button>

          <input
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={uploading ? "Đang tải file..." : "Nhập tin nhắn..."}
            disabled={uploading}
            className="flex-1 bg-richblack-800 text-richblack-5 px-5 py-3 rounded-full
                       outline-none placeholder:text-richblack-500
                       border border-richblack-700 focus:border-yellow-50/40
                       transition-colors disabled:opacity-60"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || uploading}
            className="w-12 h-12 flex items-center justify-center rounded-full
                       bg-yellow-50 text-richblack-900
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-yellow-100 active:scale-95 transition-all"
          >
            <IoSend className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;