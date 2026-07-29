const Message = require("../../models/Message");
const Chat = require("../../models/Chat");
const cloudinary = require("cloudinary").v2; 
const fs = require("fs");

exports.uploadChatFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.body;
    const file = req.files?.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "Không có file được gửi" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chat" });
    }

    const isParticipant = String(chat.student) === userId || String(chat.instructor) === userId;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({ success: false, message: "File tối đa 10MB" });
    }

    const isImage = file.mimetype.startsWith("image/");

    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "chat-attachments",
      resource_type: isImage ? "image" : "raw", // raw cho pdf/doc/file khác
    });

    if (file.tempFilePath) {
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.error("Temp file delete error:", err);
      });
    }

    const message = await Message.create({
      chat: chatId,
      sender: userId,
      content: "",
      messageType: isImage ? "image" : "file",
      fileUrl: uploadResult.secure_url,
      fileName: file.name,
    });

    chat.lastMessage = message._id;
    await chat.save();

    const populated = await message.populate("sender", "firstName lastName image");

    const io = req.app.get("io");
    if (io) io.to(chatId).emit("newMessage", populated);

    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error("Upload chat file error:", err);
    return res.status(500).json({ success: false, message: "Upload thất bại", error: err.message });
  }
};
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId, content } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chat" });
    }

    const isParticipant = String(chat.student) === userId || String(chat.instructor) === userId;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Không có quyền gửi tin nhắn" });
    }

    const message = await Message.create({ chat: chatId, sender: userId, content });
    chat.lastMessage = message._id;
    await chat.save();

    const populated = await message.populate("sender", "firstName lastName image");

    const io = req.app.get("io");
    if (io) io.to(chatId).emit("newMessage", populated);

    return res.status(200).json({ success: true, data: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Không tìm thấy chat" });
    }

    const isParticipant = String(chat.student) === userId || String(chat.instructor) === userId;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "firstName lastName image")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({ success: true, data: messages.reverse() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin nhắn" });
    }

    if (String(message.sender) === userId) {
      return res.status(200).json({ success: true, data: message });
    }

    message.isRead = true;
    await message.save();

    const io = req.app.get("io");
    if (io) io.to(String(message.chat)).emit("messageRead", { messageId, readBy: userId });

    return res.status(200).json({ success: true, data: message });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
};