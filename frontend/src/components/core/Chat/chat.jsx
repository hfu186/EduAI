import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getSocket, initSocket } from "../../services/socket";
import { getChatMessages } from "../../services/operations/chatAPI"; 

// eslint-disable-next-line react/prop-types
const ChatWindow = ({ chatId }) => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = getSocket() || initSocket(token);
    socket.emit("joinChat", chatId);

    (async () => {
      const res = await getChatMessages(chatId, token);
      if (res) setMessages(res.messages);
    })();

    socket.on("newMessage", (msg) => {
      if (msg.chat === chatId) setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leaveChat", chatId);
      socket.off("newMessage");
    };
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const socket = getSocket();
    socket.emit("sendMessage", { chatId, content: text }, (res) => {
      if (!res.success) console.error(res.error);
    });
    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-richblack-800 rounded-xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`max-w-[70%] px-4 py-2 rounded-xl ${
              m.sender._id === user._id
                ? "bg-yellow-50 text-richblack-900 ml-auto"
                : "bg-richblack-700 text-white"
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-richblack-700 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 bg-richblack-700 text-white px-4 py-2 rounded-lg"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="bg-yellow-50 px-4 py-2 rounded-lg">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
