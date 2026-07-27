const express = require("express");
const router = express.Router();
const { chatWithSlide } = require("../controllers/ai/chatbot");
const { auth } = require("../middleware/auth"); 

router.post("/chat", auth, chatWithSlide);

module.exports = router;