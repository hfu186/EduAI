  const SubSection = require("../../models/subSection");
  const CourseProgress = require("../../models/courseProgress");
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
        { courseID: courseId, userId },
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


  exports.generateAIQuiz = async (req, res) => {
    try {
      const { subSectionId, numberOfQuestions = 10 } = req.body;

      if (!subSectionId) {
        return res.status(400).json({ success: false, message: "Missing subSectionId." });
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

      return res.status(200).json({
        success: true,
        data: questions,
        meta: { total: questions.length, subSectionId },
      });
    } catch (error) {
      console.error("AI_GENERATE_QUIZ_ERROR:", error.message);
      return res.status(500).json({
        success: false,
        message: "An error occurred while generating the quiz.",
      });
    }
  };

  /**
   * POST /api/chat/ask
   * Body: { subSectionId, question, history? }
   * Non-streaming RAG chatbot — good for simple request/response clients.
   */
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
      // Headers may already be sent once streaming started, so guard.
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Failed to answer the question." });
      } else {
        res.write(`data: ${JSON.stringify({ error: "stream_failed" })}\n\n`);
        res.end();
      }
    }
  };