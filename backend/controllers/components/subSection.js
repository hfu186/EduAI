const SubSection = require("../../models/subSection");
const Section = require("../../models/section");
const Course = require("../../models/course");
const CourseProgress = require("../../models/courseProgress");
const fs = require("fs");
const path = require("path");
const { processSlideForAI } = require("../../services/chatbot.service");
const { createNotification } = require("../../utils/notification");
const parseJsonSafe = (data) => {
  if (typeof data !== "string") return data;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const saveUploadedFiles = async (files, uploadDir, publicPath) => {
  const fileArray = Array.isArray(files) ? files : [files];

  return Promise.all(
    fileArray.map(async (file) => {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      await file.mv(path.join(uploadDir, fileName));

      return {
        fileName: file.name,
        fileUrl: `${publicPath}/${fileName}`,
      };
    })
  );
};

const isContentLocked = async (subSectionId) => {
  return CourseProgress.exists({
    completedSubSections: subSectionId,
  });
};

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, courseId, title, type, description, quiz, assignment } = req.body;

    if (!title || !type || !courseId) {
      return res.status(400).json({ success: false, message: "Title, type, and courseId are required" });
    }

    const subSectionData = {
      title,
      type,
      description: description || "",
    };

    if (type === "slide") {
      if (!req.files?.slides) {
        return res.status(400).json({ success: false, message: "Slide files are required" });
      }
      const slideDir = path.join(__dirname, "..", "uploads", "slides");
      ensureDirectory(slideDir);
      subSectionData.slides = await saveUploadedFiles(req.files.slides, slideDir, "/uploads/slides");
    }

    if (type === "quiz") {
      const parsedQuiz = parseJsonSafe(quiz);
      const questions = Array.isArray(parsedQuiz) ? parsedQuiz : parsedQuiz?.questions || [];
      subSectionData.quiz = {
        source: "manual",
        status: "approved",
        version: 1,
        questions,
        generatedByAI: false,
        generatedAt: new Date(),
      };
    }

    if (type === "assignment") {
      const parsedAssignment = parseJsonSafe(assignment);
      subSectionData.assignment = {
        description: parsedAssignment?.description || "",
        deadline: parsedAssignment?.deadline ? new Date(parsedAssignment.deadline) : null,
        fileUrl: "",
        answerKeyUrl: ""
      };

      const assignDir = path.join(__dirname, "..", "uploads", "assignments");
      ensureDirectory(assignDir);

      if (req.files?.assignment) {
        const [file] = await saveUploadedFiles(req.files.assignment, assignDir, "/uploads/assignments");
        subSectionData.assignment.fileUrl = file.fileUrl;
      }
      if (req.files?.answerKey) {
        const [answerFile] = await saveUploadedFiles(req.files.answerKey, assignDir, "/uploads/assignments");
        subSectionData.assignment.answerKeyUrl = answerFile.fileUrl; 
      }
    }

    const newSubSection = await SubSection.create(subSectionData);

    if (type === "slide" && newSubSection.slides?.[0]?.fileUrl) {
    processSlideForAI(newSubSection._id, newSubSection.slides[0].fileUrl)
        .then(() => console.log("AI Task finished."))
        .catch(err => console.error("AI Task failed:", err));
}
    if (sectionId) {
      await Section.findByIdAndUpdate(sectionId, { $push: { subSection: newSubSection._id } });
    }

    const updatedCourse = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    });

    return res.status(200).json({
      success: true,
      message: "SubSection created successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("CREATE_SUBSECTION_ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error while creating subSection" });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const {
      subSectionId,
      courseId,
      title,
      description,
      type,
      quiz,
      assignment,
    } = req.body;

    const subSection = await SubSection.findById(subSectionId);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    if (type === "quiz" || type === "assignment") {
      const locked = await isContentLocked(subSectionId);
      if (locked) {
        return res.status(403).json({
          success: false,
          message:
            "This content has already been attempted by students and cannot be modified directly.",
          isLocked: true,
        });
      }
    }

    if (title) subSection.title = title;
    if (description !== undefined) subSection.description = description;

    if (type === "quiz" && quiz) {
      const parsedQuiz = parseJsonSafe(quiz);
      const questionsArray = Array.isArray(parsedQuiz)
        ? parsedQuiz
        : parsedQuiz?.questions || [];

      const oldQuestions = JSON.parse(
        JSON.stringify(subSection.quiz?.questions || [])
      );

      const oldVersion = subSection.quiz?.version || 1;

      const cleanedQuestions = questionsArray.map(
        ({ _id, ...rest }) => rest
      );

      subSection.quiz.previousVersions.push({
        version: oldVersion,
        questions: oldQuestions,
        generatedAt: subSection.quiz?.generatedAt || new Date(),
      });

      subSection.quiz.questions = cleanedQuestions;
      subSection.quiz.version = oldVersion + 1;
      subSection.quiz.generatedAt = new Date();

      subSection.markModified("quiz");
    }

    if (type === "assignment" && assignment) {
      const parsedAssignment = parseJsonSafe(assignment);
      
      subSection.assignment = {
        ...subSection.assignment,
        ...parsedAssignment,
      };

      const assignDir = path.join(__dirname, "..", "uploads", "assignments");
      ensureDirectory(assignDir);

      if (req.files?.assignment) {
        const [file] = await saveUploadedFiles(req.files.assignment, assignDir, "/uploads/assignments");
        subSection.assignment.fileUrl = file.fileUrl;
      }

      if (req.files?.answerKey) {
        const [answerFile] = await saveUploadedFiles(req.files.answerKey, assignDir, "/uploads/assignments");
        subSection.assignment.answerKeyUrl = answerFile.fileUrl;
      }

      subSection.markModified("assignment");
    }

    if (type === "slide" && req.files?.slides) {
      const slideDir = path.join(__dirname, "..", "uploads", "slides");
      ensureDirectory(slideDir);

      subSection.slides = await saveUploadedFiles(
        req.files.slides,
        slideDir,
        "/uploads/slides"
      );

      subSection.markModified("slides");
    }

    await subSection.save();

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required to refresh course data",
      });
    }

    const updatedCourse = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    });

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: "Course updated but unable to fetch refreshed data",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("UPDATE_SUBSECTION_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating subSection",
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId, courseId } = req.body;

    await Section.findByIdAndUpdate(sectionId, {
      $pull: { subSection: subSectionId },
    });

    await SubSection.findByIdAndDelete(subSectionId);

    const updatedCourse = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    });

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error while deleting subSection",
    });
  }
};