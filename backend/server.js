const express = require("express");
const app = express();
require("dotenv").config();
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { connectDB } = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");
const { globalLimiter, aiServiceLimiter, authLimiter } = require("./middleware/rateLimit.js");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const paymentRoutes = require("./routes/payments");
const quizRoutes = require("./routes/quiz");
const courseRoutes =require( "./routes/course.js");
const sectionRoutes = require("./routes/section");
const subSectionRoutes = require("./routes/subSection");
const submissionRoutes = require("./routes/submission");
const chatbotRoutes = require("./routes/chatbot");
const adminRoutes = require("./routes/Admin/admin.route");
const path = require("path");
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  },
  express.static("uploads")
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(cookieParser());

app.use(
  cors()
);
app.use("/api", globalLimiter);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

app.use("/api/v1/auth", authLimiter, userRoutes);
app.use("/api/v1/profile", authLimiter, profileRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/submission", submissionRoutes); 
app.use("/api/v1/section", sectionRoutes);
app.use("/api/v1/subsection", subSectionRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/chatbot", aiServiceLimiter,chatbotRoutes);
app.use("/api/v1/admin", adminRoutes);
app.get("/", (req, res) => {
  res.send("LMS Backend is running");
});

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  cloudinaryConnect();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
