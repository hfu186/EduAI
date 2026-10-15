  const SubSection = require("../../models/subSection");
  const Course = require("../../models/course");
  const CourseProgress = require("../../models/courseProgress");
  const Section = require("../../models/section");
  const QuizReport = require("../../models/quizReport");
  const mailSender = require("../../utils/mailSender");
  const { createNotification } = require("../../utils/notification");
  const { hasSubSectionCourseAccess } = require("../../utils/courseAccess");
  const mongoose = require("mongoose");
  const {
    TOP_K_RESULTS,
    retrieveContext,
    generateQuizJSON,
    answerWithRAG,
  } = require("../../services/ai.service");

  const PASS_THRESHOLD = 80;


  exports.submitQuiz = async (req, res) => {
    try {
      const { courseId, subSectionId, answers } = req.body;
      const userId = req.user.id;

      if (!courseId || !subSectionId || !Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: courseId, subSectionId, answers.",
        });
      }

      if (
        !(await hasSubSectionCourseAccess({
          userId,
          accountType: req.user.accountType,
          courseId,
          subSectionId,
        }))
      ) {
        return res.status(403).json({
          success: false,
          message: "Enroll in this course to take the quiz.",
        });
      }

      const subSection = await SubSection.findById(subSectionId);
      if (!subSection || subSection.type !== "quiz") {
        return res.status(404).json({ success: false, message: "Quiz not found." });
      }

      const quizData = subSection.quiz.questions;
      if (!quizData?.length) {
        return res.status(400).json({ success: false, message: "Quiz has no questions." });
      }

      let correctCount = 0;
      answers.forEach((ans) => {
        const question = quizData[ans.questionIndex];
        if (question && Number(ans.optionIndex) === Number(question.correctAnswer)) {
          correctCount++;
        }
      });

      const totalQuestions = quizData.length;
      const score = Math.round((correctCount / totalQuestions) * 100);
      const isPassed = score >= PASS_THRESHOLD;

      let courseProgress = await CourseProgress.findOneAndUpdate(
        { courseId: courseId, userId },
        { $setOnInsert: { completedSubSections: [], quizResults: [] } },
        { upsert: true, new: true }
      );

      courseProgress.quizResults.push({
        subSection: subSectionId,
        score,
        total: totalQuestions,
        submittedAt: new Date(),
      });

      if (isPassed && !courseProgress.completedSubSections.includes(subSectionId)) {
        courseProgress.completedSubSections.push(subSectionId);
      }

      await courseProgress.save();

      return res.status(200).json({
        success: true,
        message: isPassed ? "Congratulations! You passed." : "Score is too low to pass.",
        data: {
          score,
          correctCount,
          totalQuestions,
          pass: isPassed,
          completedSubSections: courseProgress.completedSubSections,
        },
      });
    } catch (error) {
      console.error("SUBMIT_QUIZ_ERROR:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to submit quiz.",
      });
    }
  };

  exports.reportAIQuizIssue = async (req, res) => {
    try {
      const {
        subSectionId,
        questionIndex,
        question,
        options = [],
        correctAnswer,
        issueType,
        details = "",
      } = req.body;
      const validIssueTypes = [
        "incorrect_answer",
        "unclear_question",
        "incorrect_options",
        "other",
      ];

      if (
        !subSectionId ||
        !mongoose.isValidObjectId(subSectionId) ||
        !Number.isInteger(questionIndex) ||
        questionIndex < 0 ||
        typeof question !== "string" ||
        !question.trim() ||
        question.length > 2000 ||
        !Array.isArray(options) ||
        options.length < 2 ||
        options.length > 10 ||
        options.some((option) => typeof option !== "string" || !option.trim() || option.length > 500) ||
        !Number.isInteger(correctAnswer) ||
        correctAnswer < 0 ||
        correctAnswer >= options.length ||
        !validIssueTypes.includes(issueType) ||
        typeof details !== "string" ||
        details.length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid quiz issue report.",
        });
      }

      if (
        !(await hasSubSectionCourseAccess({
          userId: req.user.id,
          accountType: req.user.accountType,
          subSectionId,
        }))
      ) {
        return res.status(403).json({
          success: false,
          message: "Enroll in this course before reporting a quiz issue.",
        });
      }

      const subSection = await SubSection.findById(subSectionId).select("type quiz.version");
      if (!subSection || !["slide", "quiz"].includes(subSection.type)) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found.",
        });
      }

      const section = await Section.findOne({ subSection: subSectionId }).select("course");
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "Lesson course not found.",
        });
      }

      const course = await Course.findById(section.course).populate("instructor", "firstName lastName email");
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found.",
        });
      }

      const report = await QuizReport.create({
        student: req.user.id,
        course: section.course,
        subSection: subSectionId,
        questionIndex,
        question: question.trim(),
        options,
        correctAnswer,
        issueType,
        details: details.trim(),
        generatedByAI: true,
        quizVersion: (subSection?.quiz?.version ?? 1),
      });

      const instructor = course.instructor;
      const instructorEmail = instructor?.email;
      const instructorName = instructor ? `${instructor.firstName || "Instructor"} ${instructor.lastName || ""}`.trim() : "Instructor";

      if (instructor && instructorEmail) {
        await createNotification({
          recipient: instructor._id,
          type: "quiz_reported",
          title: "New quiz report submitted",
          message: `${req.user.firstName || "A student"} reported an issue in course "${course.courseName}" for lesson "${subSectionId}".`,
          link: "/dashboard/quiz-reports",
          relatedCourse: course._id,
        });

        await mailSender(
          instructorEmail,
          `New Quiz Issue Report for ${course.courseName}`,
          `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #4f46e5;">New Quiz Issue Report</h2>
              <p>Hello ${instructorName},</p>
              <p>A student has reported a quiz issue in the course <strong>${course.courseName}</strong>.</p>
              <p><strong>Student:</strong> ${req.user.firstName || "Student"} ${req.user.lastName || ""}</p>
              <p><strong>Question Index:</strong> ${questionIndex}</p>
              <p><strong>Issue Type:</strong> ${issueType}</p>
              <p><strong>Question:</strong> ${question.trim()}</p>
              <p><strong>Details:</strong> ${details.trim() || "No additional details provided."}</p>
              <p>Please review the quiz content and update it if needed.</p>
              <p>Best regards,<br><strong>EduSpace Team</strong></p>
            </div>
          `
        );
      }

      return res.status(201).json({
        success: true,
        message: "Thank you. Your quiz issue report has been submitted.",
        data: { reportId: report._id },
      });
    } catch (error) {
      console.error("REPORT_AI_QUIZ_ISSUE_ERROR:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to submit quiz issue report.",
      });
    }
  };


  exports.getInstructorQuizReports = async (req, res) => {
    try {
      const instructorId = req.user.id;
      const instructorCourses = await Course.find({ instructor: instructorId }).select("_id courseName");

      if (!instructorCourses.length) {
        return res.status(200).json({ success: true, data: [] });
      }

      const courseIds = instructorCourses.map((course) => course._id);
      const reports = await QuizReport.find({ course: { $in: courseIds } })
        .populate("student", "firstName lastName email")
        .populate("course", "courseName")
        .populate("subSection", "title type")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (error) {
      console.error("GET_INSTRUCTOR_QUIZ_REPORTS_ERROR:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch quiz reports.",
      });
    }
  };

  exports.updateQuizReportStatus = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { status } = req.body;
      const validStatuses = ["pending", "reviewed", "resolved", "dismissed"];

      if (!mongoose.isValidObjectId(reportId) || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid report or status.",
        });
      }

      const report = await QuizReport.findById(reportId).populate("course", "_id instructor");
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Quiz report not found.",
        });
      }

      if (!report.course || String(report.course.instructor) !== String(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update this report.",
        });
      }

      report.status = status;
      await report.save();

      return res.status(200).json({
        success: true,
        message: "Quiz report status updated.",
        data: report,
      });
    } catch (error) {
      console.error("UPDATE_QUIZ_REPORT_STATUS_ERROR:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to update quiz report status.",
      });
    }
  };

  exports.fixReportedQuizQuestion = async (req, res) => {
    try {
      const { reportId } = req.params;
      const { question, options, correctAnswer } = req.body;

      if (
        !mongoose.isValidObjectId(reportId) ||
        typeof question !== "string" ||
        !question.trim() ||
        question.trim().length > 2000 ||
        !Array.isArray(options) ||
        options.length < 2 ||
        options.length > 10 ||
        options.some((option) => typeof option !== "string" || !option.trim() || option.trim().length > 500) ||
        !Number.isInteger(correctAnswer) ||
        correctAnswer < 0 ||
        correctAnswer >= options.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid replacement question, options, and correct answer.",
        });
      }

      const report = await QuizReport.findById(reportId);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Quiz report not found.",
        });
      }

      const course = await Course.findOne({
        _id: report.course,
        instructor: req.user.id,
      }).select("_id");
      if (!course) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to edit this quiz.",
        });
      }

      const subSection = await SubSection.findById(report.subSection).select("type quiz");
      const currentQuestions = subSection?.quiz?.questions || [];
      if (!subSection || !currentQuestions.length) {
        return res.status(409).json({
          success: false,
          message: "This lesson has no saved quiz questions to edit. Regenerate and save the quiz before applying a correction.",
        });
      }

      const currentVersion = subSection.quiz.version || 1;
      const normalizeQuestionText = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
      const sameReportedQuestion = (candidate) =>
        normalizeQuestionText(candidate.question) === normalizeQuestionText(report.question) &&
        candidate.options?.length === report.options?.length &&
        candidate.options?.every(
          (option, index) =>
            normalizeQuestionText(option) === normalizeQuestionText(report.options[index])
        );

      let questionIndex = currentQuestions[report.questionIndex] && sameReportedQuestion(
        currentQuestions[report.questionIndex]
      )
        ? report.questionIndex
        : currentQuestions.findIndex(sameReportedQuestion);

      if (questionIndex < 0) {
        return res.status(409).json({
          success: false,
          message: "The reported question is not in the current quiz version. Review the current quiz or dismiss the outdated report.",
        });
      }

      const previousQuestions = subSection.quiz.questions.map((item) => ({
        question: item.question,
        options: [...item.options],
        correctAnswer: item.correctAnswer,
      }));
      const updatedQuestions = previousQuestions.map((item, index) =>
        index === questionIndex
          ? {
              question: question.trim(),
              options: options.map((option) => option.trim()),
              correctAnswer,
            }
          : item
      );
      const nextVersion = currentVersion + 1;
      const versionMatch = {
        $or: [
          { "quiz.version": currentVersion },
          { "quiz.version": { $exists: false } },
        ],
      };
      const updatedSubSection = await SubSection.findOneAndUpdate(
        { _id: subSection._id, ...versionMatch },
        {
          $set: {
            "quiz.questions": updatedQuestions,
            "quiz.version": nextVersion,
            "quiz.generatedAt": new Date(),
          },
          $push: {
            "quiz.previousVersions": {
              version: currentVersion,
              questions: previousQuestions,
              generatedAt: subSection.quiz.generatedAt || new Date(),
            },
          },
        },
        { new: true }
      );

      if (!updatedSubSection) {
        return res.status(409).json({
          success: false,
          message: "This quiz was updated by someone else. Refresh the report and try again.",
        });
      }

      report.status = "resolved";
      await report.save();

      return res.status(200).json({
        success: true,
        message: "The quiz question was fixed and the report was resolved.",
        data: {
          reportId: report._id,
          status: report.status,
          quizVersion: nextVersion,
        },
      });
    } catch (error) {
      console.error("FIX_REPORTED_QUIZ_QUESTION_ERROR:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fix the reported quiz question.",
      });
    }
  };

  exports.generateAIQuiz = async (req, res) => {
    try {
      const { subSectionId, numberOfQuestions = 10 } = req.body;

      if (!subSectionId) {
        return res.status(400).json({ success: false, message: "Missing subSectionId." });
      }

      if (
        !(await hasSubSectionCourseAccess({
          userId: req.user.id,
          accountType: req.user.accountType,
          subSectionId,
        }))
      ) {
        return res.status(403).json({
          success: false,
          message: "Enroll in this course to generate an AI quiz.",
        });
      }

      const clampedCount = Math.min(Math.max(Number(numberOfQuestions) || 10, 1), 10);

      const { context } = await retrieveContext({
        namespace: subSectionId,
        query: "Core concepts, definitions, key knowledge, important points",
        topK: TOP_K_RESULTS,
      });

      if (!context) {
        return res.status(404).json({
          success: false,
          message: "Lesson content not found. Please ensure the slides have been processed.",
        });
      }

      console.log(`Context length for quiz generation: ${context.length}`);

      let questions;
      try {
        questions = await generateQuizJSON(context, clampedCount);
      } catch (groqErr) {
        console.error("Quiz generation error:", groqErr.message);
        return res.status(500).json({
          success: false,
          message: "Unable to generate quiz. Please try again.",
        });
      }

      const normalizedQuestions = Array.isArray(questions)
        ? questions.map((q) => ({
            question: String(q?.question || "").trim(),
            options: Array.isArray(q?.options) ? q.options.map((opt) => String(opt || "").trim()).filter(Boolean) : [],
            correctAnswer: Number(q?.correctAnswer ?? 0),
          }))
        : [];

      const existingSubSection = await SubSection.findById(subSectionId).select("type quiz");
      if (!existingSubSection) {
        return res.status(404).json({
          success: false,
          message: "Lesson not found.",
        });
      }

      const currentVersion = existingSubSection.quiz?.version || 0;
      const previousQuestions = (existingSubSection.quiz?.questions || []).map((item) => ({
        question: item.question,
        options: [...item.options],
        correctAnswer: item.correctAnswer,
      }));
      const nextVersion = currentVersion + 1;
      const quizUpdate = {
        $set: {
          type: "quiz",
          "quiz.source": "ai",
          "quiz.status": "draft",
          "quiz.version": nextVersion,
          "quiz.questions": normalizedQuestions,
          "quiz.generatedByAI": true,
          "quiz.generatedAt": new Date(),
        },
      };

      if (previousQuestions.length) {
        quizUpdate.$push = {
          "quiz.previousVersions": {
            version: currentVersion,
            questions: previousQuestions,
            generatedAt: existingSubSection.quiz.generatedAt || new Date(),
          },
        };
      }

      const versionMatch = {
        $or: [
          { "quiz.version": currentVersion },
          { "quiz.version": { $exists: false } },
        ],
      };
      const savedSubSection = await SubSection.findOneAndUpdate(
        { _id: subSectionId, ...versionMatch },
        quizUpdate,
        { new: true }
      );
      if (!savedSubSection) {
        return res.status(409).json({
          success: false,
          message: "The quiz changed while it was being generated. Please generate it again.",
        });
      }

      return res.status(200).json({
        success: true,
        data: normalizedQuestions,
        meta: { total: normalizedQuestions.length, subSectionId },
      });
    } catch (error) {
      console.error("AI_GENERATE_QUIZ_ERROR:", error.message);
      return res.status(500).json({
        success: false,
        message: "An error occurred while generating the quiz.",
      });
    }
  };

  exports.askAIChatbot = async (req, res) => {
    try {
      const { subSectionId, question, history = [] } = req.body;

      if (!subSectionId || !question) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: subSectionId, question.",
        });
      }

      const { answer, matches } = await answerWithRAG({
        namespace: subSectionId,
        question,
        history,
        fast: true, // chatbot is called often -> use the cheaper/faster 20B model on free tier
      });

      return res.status(200).json({
        success: true,
        data: {
          answer,
          sources: matches.map((m, i) => ({
            index: i,
            preview: (m.pageContent || "").slice(0, 160),
          })),
        },
      });
    } catch (error) {
      console.error("ASK_AI_CHATBOT_ERROR:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to answer the question.",
      });
    }
  };

  /**
   * POST /api/chat/ask-stream
   * Body: { subSectionId, question, history? }
   * Streams the answer back over SSE for a live "typing" chatbot UI.
   */
  exports.askAIChatbotStream = async (req, res) => {
    try {
      const { subSectionId, question, history = [] } = req.body;

      if (!subSectionId || !question) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: subSectionId, question.",
        });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders?.();

      const { stream } = await answerWithRAG({
        namespace: subSectionId,
        question,
        history,
        stream: true,
        fast: true, // chatbot is called often -> use the cheaper/faster 20B model on free tier
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("ASK_AI_CHATBOT_STREAM_ERROR:", error.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Failed to answer the question." });
      } else {
        res.write(`data: ${JSON.stringify({ error: "stream_failed" })}\n\n`);
        res.end();
      }
    }
  };