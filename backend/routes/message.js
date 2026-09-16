const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");

const {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
    uploadChatFile,

} = require("../controllers/chat/message");

router.post("/", auth, sendMessage);
router.post("/upload", auth, uploadChatFile); 
router.delete("/:messageId", auth, deleteMessage);
router.get("/:chatId", auth, getMessages);

router.patch("/:messageId/read", auth, markAsRead);

module.exports = router;