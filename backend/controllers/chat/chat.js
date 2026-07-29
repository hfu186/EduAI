const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const Course = require("../../models/course");

exports.createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { instructorId, courseId } = req.body;

    if (!instructorId) {
      return res.status(400).json({ success: false, message: "Thiếu instructorId" });
    }

    // Xác định ai là student, ai là instructor dựa trên accountType người gọi
    let studentId, actualInstructorId;
    if (req.user.accountType === "Instructor") {
      studentId = req.body.studentId;
      actualInstructorId = userId;
      if (!studentId) {
        return res.status(400).json({ success: false, message: "Thiếu studentId" });
      }
    } else {
      studentId = userId;
      actualInstructorId = instructorId;
    }

    let chat = await Chat.findOne({ student: studentId, instructor: actualInstructorId });

    if (!chat) {
      chat = await Chat.create({
        student: studentId,
        instructor: actualInstructorId,
        course: courseId || undefined,
      });
    }

    return res.status(200).json({ success: true, data: chat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to create chat" });
  }
};

exports.getMyChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      $or: [{ student: userId }, { instructor: userId }],
    })
      .populate("student", "firstName lastName image")
      .populate("instructor", "firstName lastName image")
      .populate("course", "courseName thumbnail")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: chats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch chats" });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId)
      .populate("student", "firstName lastName image")
      .populate("instructor", "firstName lastName image")
      .populate("course", "courseName");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const isParticipant =
      String(chat.student._id) === userId || String(chat.instructor._id) === userId;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not permitted to access" });
    }

    return res.status(200).json({ success: true, data: chat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch chat" });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const isParticipant =
      String(chat.student) === userId || String(chat.instructor) === userId;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not permitted to access" });
    }

    await Message.deleteMany({ chat: chatId });
    await chat.deleteOne();

    return res.status(200).json({ success: true, message: "Deleted succesfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete chat" });
  }
};