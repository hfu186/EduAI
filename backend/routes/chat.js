const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/auth");

const {
  createChat,
  getMyChats,
  getChatById,
  deleteChat
} = require("../controllers/chat/chat");

router.post("/", auth, createChat);
router.get("/", auth, getMyChats);
router.get("/:chatId", auth, getChatById);
router.delete("/:chatId", auth, deleteChat);
module.exports = router;