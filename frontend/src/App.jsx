import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Navbar from "./components/common/Layout/Navbar";
import { HiArrowNarrowUp } from "react-icons/hi";
import AppRoutes from "./routes/AppRoutes";
import { getSocket, initSocket } from "./services/socket";
import { incrementUnread, clearChatUnread } from "./slices/messageSlice";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket() || initSocket(token);

    const handleNewMessage = (msg) => {
      const isMine = String(msg.sender?._id || msg.sender) === String(user?._id);
      if (isMine) return;

      const chatId = String(msg.chat);
      const currentPath = window.location.pathname;
      const isChatOpen = currentPath.includes(`/chat/${chatId}`) || currentPath === "/chat";

      dispatch(incrementUnread({ chatId }));

      if (!isChatOpen) {
        toast.success(`You received a new message${msg?.sender?.firstName ? ` from ${msg.sender.firstName}` : ""}`);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [dispatch, token, user?._id]);

  useEffect(() => {
    if (!token) return;

    getSocket() || initSocket(token);
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path.startsWith("/chat/")) {
        const chatId = path.split("/chat/")[1];
        if (chatId) {
          dispatch(clearChatUnread(chatId));
        }
      } else if (path === "/chat") {
        dispatch(clearChatUnread("all"));
      }
    };

    handleRouteChange();
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [dispatch, token, location.pathname]);

  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const handleArrow = () => {
      setShowArrow(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleArrow);
    return () => window.removeEventListener("scroll", handleArrow);
  }, []);

  return (
    <div className="w-full min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />

      <main className="flex-1 w-full pt-10">
        <AppRoutes />
      </main>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`bg-yellow-25 hover:bg-yellow-50 hover:scale-110 p-3 text-lg text-black rounded-2xl fixed right-3 z-10 duration-500 ease-in-out ${
          showArrow ? "bottom-6" : "-bottom-24"
        }`}
      >
        <HiArrowNarrowUp />
      </button>
    </div>
  );
}

export default App;