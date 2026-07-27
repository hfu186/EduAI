/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { IoChatbubbleEllipses, IoClose, IoSend } from "react-icons/io5";
import { chatWithAI } from "../../../../services/operations/courseDetailsAPI";

function AIChatbot({ token, subSectionId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm the AI assistant for this lesson. Do you have any questions?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        role: "ai",
        text: "Hello! I'm the AI assistant for this lesson. Do you have any questions?",
      },
    ]);
  }, [subSectionId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuestion = input;
    setInput("");
    setLoading(true);

    const aiAnswer = await chatWithAI(currentQuestion, subSectionId, token);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text:
          aiAnswer ||
          "I'm experiencing a connection issue. Please try again!",
      },
    ]);

    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-yellow-50 p-4 rounded-full shadow-lg text-richblack-900 hover:scale-110 transition-all duration-200"
        >
          <IoChatbubbleEllipses size={28} />
        </button>
      )}

      {isOpen && (
        <div className="bg-richblack-800 border border-richblack-700 w-[350px] h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="bg-richblack-700 p-4 flex justify-between items-center border-b border-richblack-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-caribbeangreen-200 rounded-full animate-pulse"></div>
              <span className="font-semibold text-yellow-50 font-inter">
                AI Assistant
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-richblack-200 hover:text-white transition-colors"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-richblack-900">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-yellow-50 text-richblack-900 rounded-tr-none shadow-sm"
                      : "bg-richblack-700 text-richblack-5 rounded-tl-none border border-richblack-600"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-richblack-700 p-3 rounded-2xl rounded-tl-none border border-richblack-600">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-richblack-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-richblack-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-richblack-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-richblack-700 bg-richblack-800 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this lesson..."
              disabled={loading}
              className="flex-1 bg-richblack-900 border border-richblack-600 rounded-xl px-4 py-2 text-sm text-richblack-5 focus:outline-none focus:border-yellow-50 transition-all placeholder:text-richblack-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="text-yellow-50 disabled:text-richblack-600 hover:scale-110 transition-all"
            >
              <IoSend size={22} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AIChatbot;