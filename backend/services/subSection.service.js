const SubSection = require("../models/subSection");
const Section = require("../models/section");
const Course = require("../models/course");
const CourseProgress = require("../models/courseProgress");
const path = require("path");

const { processSlideForAI } = require("./chatbot.service");
const {
  ensureDirectoryExists,
  saveUploadedFiles,
} = require("../utils/uploadHelper");

const parseJsonSafe = (data) => {
  if (typeof data !== "string") return data;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

const getUpdatedCourse = async (courseId) => {
  return Course.findById(courseId).populate({
    path: "courseContent",
    populate: {
      path: "subSection",
    },
  });
};

const createSubSection = async ({
  sectionId,
  courseId,
  title,
  type,
  description,
  quiz,
  assignment,
  files,
}) => {
  if (!title || !type || !courseId) {
    throw new Error(
      "Title, type, and courseId are required"
    );
  }

  const subSectionData = {
    title,
    type,
    description: description || "",
  };

  if (type === "slide") {
    if (!files?.slides) {
      throw new Error("Slide files are required");
    }

    const slideDir = path.join(
      __dirname,
      "../uploads/slides"
    );

    ensureDirectoryExists(slideDir);

    subSectionData.slides =
      await saveUploadedFiles(
        files.slides,
        slideDir,
        "/uploads/slides"
      );
  }

  if (type === "quiz") {
    const parsedQuiz = parseJsonSafe(quiz);

    const questions = Array.isArray(parsedQuiz)
      ? parsedQuiz
      : parsedQuiz?.questions || [];

    subSectionData.quiz = {
      source: "manual",
      status: "approved",
      version: 1,
      questions,
      generatedByAI: false,
      generatedAt: new Date(),
      previousVersions: [],
    };
  }

  if (type === "assignment") {
    const parsedAssignment =
      parseJsonSafe(assignment);

    subSectionData.assignment = {
      description:
        parsedAssignment?.description || "",
      deadline: parsedAssignment?.deadline
        ? new Date(parsedAssignment.deadline)
        : null,
      fileUrl: "",
      answerKeyUrl: "",
    };

    const assignDir = path.join(
      __dirname,
      "../uploads/assignments"
    );

    ensureDirectoryExists(assignDir);

    if (files?.assignment) {
      const [file] =
        await saveUploadedFiles(
          files.assignment,
          assignDir,
          "/uploads/assignments"
        );

      subSectionData.assignment.fileUrl =
        file.fileUrl;
    }

    if (files?.answerKey) {
      const [answerFile] =
        await saveUploadedFiles(
          files.answerKey,
          assignDir,
          "/uploads/assignments"
        );

      subSectionData.assignment.answerKeyUrl =
        answerFile.fileUrl;
    }
  }

  const newSubSection =
    await SubSection.create(
      subSectionData
    );

  if (sectionId) {
    await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: newSubSection._id,
        },
      }
    );
  }

  if (
    type === "slide" &&
    newSubSection.slides?.[0]?.fileUrl
  ) {
    processSlideForAI(
      newSubSection._id,
      newSubSection.slides[0].fileUrl
    )
      .then(() =>
        console.log("AI Task finished.")
      )
      .catch((err) =>
        console.error(
          "AI Task failed:",
          err
        )
      );
  }

  const updatedCourse =
    await getUpdatedCourse(courseId);

  return {
    subSection: newSubSection,
    course: updatedCourse,
  };
};

const updateSubSection = async ({
  subSectionId,
  courseId,
  title,
  description,
  type,
  quiz,
  assignment,
  files,
}) => {
  const subSection =
    await SubSection.findById(
      subSectionId
    );

  if (!subSection) {
    throw new Error(
      "SubSection not found"
    );
  }

  if (title) {
    subSection.title = title;
  }

  if (description !== undefined) {
    subSection.description =
      description;
  }

  if (type === "quiz" && quiz) {
    const parsedQuiz =
      parseJsonSafe(quiz);

    const questionsArray =
      Array.isArray(parsedQuiz)
        ? parsedQuiz
        : parsedQuiz?.questions || [];

    const oldQuestions =
      JSON.parse(
        JSON.stringify(
          subSection.quiz?.questions || []
        )
      );

    const oldVersion =
      subSection.quiz?.version || 1;

    const cleanedQuestions =
      questionsArray.map(
        ({ _id, ...rest }) => rest
      );

    if (!subSection.quiz) {
      subSection.quiz = {};
    }

    if (
      !subSection.quiz.previousVersions
    ) {
      subSection.quiz.previousVersions =
        [];
    }

    subSection.quiz.previousVersions.push({
      version: oldVersion,
      questions: oldQuestions,
      generatedAt:
        subSection.quiz?.generatedAt ||
        new Date(),
    });

    subSection.quiz.questions =
      cleanedQuestions;

    subSection.quiz.version =
      oldVersion + 1;

    subSection.quiz.generatedAt =
      new Date();

    subSection.markModified("quiz");
  }

  if (
    type === "assignment" &&
    assignment
  ) {
    const parsedAssignment =
      parseJsonSafe(assignment);

    subSection.assignment = {
      ...subSection.assignment,
      ...parsedAssignment,
    };

    const assignDir = path.join(
      __dirname,
      "../uploads/assignments"
    );

    ensureDirectoryExists(assignDir);

    if (files?.assignment) {
      const [file] =
        await saveUploadedFiles(
          files.assignment,
          assignDir,
          "/uploads/assignments"
        );

      subSection.assignment.fileUrl =
        file.fileUrl;
    }

    if (files?.answerKey) {
      const [answerFile] =
        await saveUploadedFiles(
          files.answerKey,
          assignDir,
          "/uploads/assignments"
        );

      subSection.assignment.answerKeyUrl =
        answerFile.fileUrl;
    }

    subSection.markModified(
      "assignment"
    );
  }

  if (
    type === "slide" &&
    files?.slides
  ) {
    const slideDir = path.join(
      __dirname,
      "../uploads/slides"
    );

    ensureDirectoryExists(slideDir);

    subSection.slides =
      await saveUploadedFiles(
        files.slides,
        slideDir,
        "/uploads/slides"
      );

    subSection.markModified("slides");
  }

  await subSection.save();

  if (!courseId) {
    throw new Error(
      "courseId is required to refresh course data"
    );
  }

  const updatedCourse =
    await getUpdatedCourse(courseId);

  if (!updatedCourse) {
    throw new Error(
      "Course updated but unable to fetch refreshed data"
    );
  }

  return {
    subSection,
    course: updatedCourse,
  };
};

const deleteSubSection = async ({
  subSectionId,
  sectionId,
  courseId,
}) => {
  if (
    !subSectionId ||
    !sectionId ||
    !courseId
  ) {
    throw new Error(
      "subSectionId, sectionId and courseId are required"
    );
  }

  await Section.findByIdAndUpdate(
    sectionId,
    {
      $pull: {
        subSection: subSectionId,
      },
    }
  );

  await CourseProgress.updateMany(
    {
      courseID: courseId,
      completedSubSections:
        subSectionId,
    },
    {
      $pull: {
        completedSubSections:
          subSectionId,
      },
    }
  );

  const deletedSubSection =
    await SubSection.findByIdAndDelete(
      subSectionId
    );

  if (!deletedSubSection) {
    throw new Error(
      "SubSection not found"
    );
  }

  const updatedCourse =
    await getUpdatedCourse(courseId);

  if (!updatedCourse) {
    throw new Error(
      "Course not found"
    );
  }

  return {
    deletedSubSection,
    course: updatedCourse,
  };
};

module.exports = {
  createSubSection,
  updateSubSection,
  deleteSubSection,
  getUpdatedCourse,
};
