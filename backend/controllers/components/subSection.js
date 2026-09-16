const Section = require("../../models/section");
const Course = require("../../models/course");
const subSectionService = require("../../services/subSection.service");
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

const { ensureDirectoryExists, saveUploadedFiles } = require("../../utils/uploadHelper");

// const isContentLocked = async (subSectionId) => {
//   return CourseProgress.exists({
//     completedSubSections: subSectionId,
//   });
// };
exports.createSubSection = async (req, res) => {
  try {
    const result =
      await subSectionService.createSubSection({
        ...req.body,
        files: req.files,
      });

    return res.status(200).json({
      success: true,
      message: "SubSection created successfully",
      data: result.course,
    });
  } catch (error) {
    console.error(
      "CREATE_SUBSECTION_ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


exports.updateSubSection = async (req, res) => {
  try {
    const result =
      await subSectionService.updateSubSection({
        ...req.body,
        files: req.files,
      });

    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      data: result.course,
    });
  } catch (error) {
    console.error(
      "UPDATE_SUBSECTION_ERROR:",
      error
    );

    const status =
      error.message === "SubSection not found"
        ? 404
        : 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


exports.deleteSubSection = async (req, res) => {
  try {
    const result =
      await subSectionService.deleteSubSection(
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
      data: result.course,
    });
  } catch (error) {
    console.error(
      "DELETE_SUBSECTION_ERROR:",
      error
    );

    const status =
      error.message === "SubSection not found"
        ? 404
        : 500;

    return res.status(status).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
