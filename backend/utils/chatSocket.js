const Message = require("../models/Message");
const Chat = require("../models/Chat");

module.exports = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.user.id;

    socket.on("joinChat", async (chatId) => {
      const chat = await Chat.findById(chatId);
      if (!chat) return;
      const isParticipant = String(chat.student) === userId || String(chat.instructor) === userId;
      if (!isParticipant) return socket.emit("errorMsg", "You do not have permission to access this chat");
      socket.join(chatId);
    });

    socket.on("leaveChat", (chatId) => socket.leave(chatId));

    socket.on("sendMessage", async ({ chatId, content }, callback) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;
        const isParticipant = String(chat.student) === userId || String(chat.instructor) === userId;
        if (!isParticipant) return;

        const message = await Message.create({ chat: chatId, sender: userId, content });
        chat.lastMessage = message._id;
        await chat.save();

        const populated = await message.populate("sender", "firstName lastName image");
        io.to(chatId).emit("newMessage", populated);

        if (callback) callback({ success: true, message: populated });
      } catch (err) {
        console.error(err);
        if (callback) callback({ success: false, error: "Failed to send message" });
      }
    });

    socket.on("markRead", async ({ messageId, chatId }) => {
      await Message.findByIdAndUpdate(messageId, { isRead: true });
      socket.to(chatId).emit("messageRead", { messageId, readBy: userId });
    });

    socket.on("typing", ({ chatId, isTyping }) => {
      socket.to(chatId).emit("userTyping", { userId, isTyping });
    });

    socket.on("disconnect", () => {});
  });
};
