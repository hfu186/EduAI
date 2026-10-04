const Chat = require("../../models/chat");
const Message = require("../../models/Message");
const Course = require("../../models/course");

exports.createChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { instructorId, courseId } = req.body;

    if (!instructorId) {
      return res.status(400).json({ success: false, message: "Missing instructorId" });
    }

    let studentId, actualInstructorId;
    if (req.user.accountType === "Instructor") {
      studentId = req.body.studentId;
      actualInstructorId = userId;
      if (!studentId) {
        return res.status(400).json({ success: false, message: "Missing studentId" });
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

    const chat = await Chat.findOne({
      _id: chatId,
      $or: [{ student: userId }, { instructor: userId }],
    }).populate("student", "firstName lastName image")
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
    const userId = String(req.user.id);

    if (!mongoose.isValidObjectId(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, $or: [{ student: userId }, { instructor: userId }] },
      { $addToSet: { deletedBy: userId } },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const deleted = new Set(chat.deletedBy.map(String));
    if (deleted.has(String(chat.student)) && deleted.has(String(chat.instructor))) {
      await Message.deleteMany({ chat: chatId });
      await chat.deleteOne();
    }

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to delete chat" });
  }
};