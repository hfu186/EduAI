/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCompletedLectures } from "@/slices/viewCourseSlice";
import { apiConnector } from "@/services/apiConnector";
import { courseEndpoints } from "@/services/apis";
import { generateAIQuiz } from "@/services/operations/courseDetailsAPI";
import { toast } from "react-hot-toast";
import { MdAutoAwesome, MdClose, MdFlag, MdSend } from "react-icons/md";
import PDFViewer from "./pdfViewer";

const BASE_URL = "http://localhost:5000";

const SlideTab = ({ slides = [], courseId, subSectionId }) => {
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const { completedLectures } = useSelector((state) => state.viewCourse);

  const [isMarking, setIsMarking] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiQuiz, setAiQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState(null);
  const [reportIssueType, setReportIssueType] = useState("incorrect_answer");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportedQuestions, setReportedQuestions] = useState([]);

  const isAlreadyCompleted = completedLectures.some(
    (id) => String(id) === String(subSectionId)
  );

  const markAsCompleted = async () => {
    if (!subSectionId || isAlreadyCompleted || isMarking) return;
    try {
      setIsMarking(true);
      const response = await apiConnector(
        "POST",
        courseEndpoints.UPDATE_COURSE_PROGRESS,
        { courseId, subsectionId: subSectionId },
        { Authorization: `Bearer ${token}` }
      );
      if (response?.data?.success) {
        dispatch(updateCompletedLectures(subSectionId));
      }
    } catch (error) {
      console.error("Progress update failed:", error);
    } finally {
      setIsMarking(false);
    }
  };

  const handleScroll = (event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      markAsCompleted();
    }
  };

  const handleGenerateAIQuiz = async () => {
    setIsGenerating(true);
    setAiQuiz(null);
    setQuizAnswers({});
    setQuizResult(null);
    setReportingQuestion(null);
    setReportedQuestions([]);

    try {
      const questions = await generateAIQuiz(subSectionId, 10, token);
      if (questions?.length > 0) {
        setAiQuiz(questions);
        setShowQuiz(true);
        setTimeout(() => {
          document.getElementById("ai-quiz-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        toast.error("No lecture content found to generate the quiz.");
      }
    } catch (err) {
      toast.error("Failed to generate quiz. Please try again.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptionChange = (qIndex, optIndex) => {
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(quizAnswers).length < aiQuiz.length) {
      toast.error("Please answer all questions first.");
      return;
    }

    let correct = 0;
    aiQuiz.forEach((q, i) => {
      if (quizAnswers[i] === q.correctAnswer) correct++;
    });

    setQuizResult({
      score: Math.round((correct / aiQuiz.length) * 100),
      correct,
      total: aiQuiz.length,
    });
  };

  const handleRetryQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleReportIssue = async (question, questionIndex) => {
    setIsReporting(true);
    try {
      const response = await apiConnector(
        "POST",
        courseEndpoints.REPORT_AI_QUIZ_ISSUE_API,
        {
          subSectionId,
          questionIndex,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          issueType: reportIssueType,
          details: reportDetails,
        },
        
      );

      if (response?.data?.success) {
        setReportedQuestions((previous) => [...previous, questionIndex]);
        setReportingQuestion(null);
        setReportDetails("");
        toast.success("Thanks for helping us improve this AI quiz.");
      } else {
        toast.error(response?.data?.message || "Failed to submit your report.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit your report. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
    setAiQuiz(null);
    setQuizAnswers({});
    setQuizResult(null);
    setReportingQuestion(null);
    setReportedQuestions([]);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex flex-col gap-y-8 pdf-isolate overflow-y-auto max-h-[80vh] custom-scrollbar"
      style={{ scrollBehavior: "smooth" }}
    >
      {slides.map((section) =>
        section.slides?.map((slideFile, index) => {
          if (!slideFile?.fileUrl) return null;

          const fullFileUrl = slideFile.fileUrl.startsWith("http")
            ? slideFile.fileUrl
            : `${BASE_URL}${encodeURI(
              slideFile.fileUrl.startsWith("/")
                ? slideFile.fileUrl
                : `/${slideFile.fileUrl}`
            )}`;

          return (
            <div key={slideFile._id || index} className="w-full">
              <div className="flex justify-between items-center  ">
                <p className="text-white font-bold text-xl flex items-center gap-2">
                  <span className="text-yellow-50">📄 Slide:</span>
                  {slideFile.fileName}
                </p>
                {isAlreadyCompleted && (
                  <span className="text-caribbeangreen-200 text-sm font-medium animate-bounce">
                    ✓ Reading completed
                  </span>
                )}
              </div>

              <div className="bg-richblack-800 rounded-lg border border-richblack-700 shadow-2xl">
                <PDFViewer
                  pdfUrl={fullFileUrl}
                  subSectionId={subSectionId}
                  token={token}
                />              
                </div>

              {/* ── Footer ── */}
              <div className="mt-6 p-6 bg-richblack-800 rounded-2xl border border-richblack-700">
                <p className="text-richblack-300 text-sm mb-4 italic text-center">
                  Please read the entire document to mark it as completed.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={fullFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-yellow-50 text-black px-6 py-2 rounded-md font-extrabold hover:scale-105 transition-all inline-block shadow-[0_4px_14px_0_rgba(255,214,10,0.39)]"
                  >
                    Download PDF
                  </a>

                  <button
                    onClick={handleGenerateAIQuiz}
                    disabled={isGenerating}
                    className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-caribbeangreen-600 text-white px-6 py-2 rounded-md font-bold hover:scale-105 transition-all disabled:opacity-50 shadow-lg"
                  >
                    <MdAutoAwesome
                      size={18}
                      className={isGenerating ? "animate-spin" : "group-hover:rotate-12 transition-transform"}
                    />
                    {isGenerating ? "AI is generating..." : "Practice with AI Quiz"}
                  </button>
                </div>
              </div>

              {showQuiz && aiQuiz && (
                <div id="ai-quiz-section" className="mt-6 rounded-2xl border border-blue-500/30 bg-richblack-800 overflow-hidden">

                  <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600/20 to-caribbeangreen-600/20 border-b border-richblack-700">
                    <div className="flex items-center gap-2">
                      <MdAutoAwesome className="text-yellow-200 animate-pulse" size={20} />
                      <span className="text-white font-bold text-lg">AI Practice Quiz</span>
                      <span className="text-richblack-400 text-sm italic">— based on this lecture</span>
                    </div>
                    <button
                      onClick={handleCloseQuiz}
                      className="text-richblack-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-richblack-700"
                    >
                      <MdClose size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Result screen */}
                    {quizResult ? (
                      <div className="flex flex-col items-center py-8 space-y-4">
                        <div className={`text-6xl font-bold ${quizResult.score >= 80 ? "text-caribbeangreen-200" : "text-pink-200"}`}>
                          {quizResult.score}/100
                        </div>
                        <p className="text-richblack-300">
                          You got <span className="text-white font-semibold">{quizResult.correct}</span> out of{" "}
                          <span className="text-white font-semibold">{quizResult.total}</span> correct.
                        </p>
                        {quizResult.score >= 80 ? (
                          <p className="text-caribbeangreen-200 font-semibold">🎉 Great job!</p>
                        ) : (
                          <p className="text-pink-300 font-semibold">Keep reviewing the lecture!</p>
                        )}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={handleRetryQuiz}
                            className="bg-yellow-50 text-black px-6 py-2 rounded-full font-bold hover:scale-105 transition-all"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={handleGenerateAIQuiz}
                            disabled={isGenerating}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-all disabled:opacity-50"
                          >
                            <MdAutoAwesome size={16} className={isGenerating ? "animate-spin" : ""} />
                            New Quiz
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Questions */
                      <>
                        {aiQuiz.map((question, qIndex) => (
                          <div
                            key={qIndex}
                            className="bg-richblack-900/60 p-5 rounded-xl border border-richblack-700/50"
                          >
                            <p className="text-white font-medium mb-4">
                              <span className="text-yellow-400 font-bold mr-2">{qIndex + 1}.</span>
                              {question.question}
                            </p>
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => (
                                <label
                                  key={optIndex}
                                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer border transition-all ${quizAnswers[qIndex] === optIndex
                                      ? "bg-yellow-500/10 border-yellow-400"
                                      : "border-transparent hover:bg-richblack-700"
                                    }`}
                                >
                                  <input
                                    type="radio"
                                    className="hidden"
                                    onChange={() => handleOptionChange(qIndex, optIndex)}
                                    checked={quizAnswers[qIndex] === optIndex}
                                  />
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${quizAnswers[qIndex] === optIndex ? "border-yellow-400" : "border-richblack-500"
                                    }`}>
                                    {quizAnswers[qIndex] === optIndex && (
                                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                    )}
                                  </div>
                                  <span className={`text-sm ${quizAnswers[qIndex] === optIndex ? "text-white font-medium" : "text-richblack-200"}`}>
                                    {option}
                                  </span>
                                </label>
                              ))}
                            </div>
                            <div className="mt-4 flex justify-end">
                              {reportedQuestions.includes(qIndex) ? (
                                <span className="text-sm text-caribbeangreen-200">
                                  Issue reported
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReportingQuestion(qIndex);
                                    setReportIssueType("incorrect_answer");
                                    setReportDetails("");
                                  }}
                                  className="inline-flex items-center gap-2 text-sm text-richblack-300 hover:text-yellow-50"
                                >
                                  <MdFlag size={16} />
                                  Report an issue
                                </button>
                              )}
                            </div>
                            {reportingQuestion === qIndex && (
                              <div className="mt-4 space-y-3 rounded-lg border border-richblack-600 bg-richblack-800 p-4">
                                <label className="block text-sm text-richblack-200">
                                  What is wrong with this question?
                                  <select
                                    value={reportIssueType}
                                    onChange={(event) => setReportIssueType(event.target.value)}
                                    className="mt-2 w-full rounded-md border border-richblack-600 bg-richblack-900 px-3 py-2 text-white"
                                  >
                                    <option value="incorrect_answer">The marked answer is incorrect</option>
                                    <option value="unclear_question">The question is unclear</option>
                                    <option value="incorrect_options">The answer options are incorrect</option>
                                    <option value="other">Other issue</option>
                                  </select>
                                </label>
                                <label className="block text-sm text-richblack-200">
                                  Additional details (optional)
                                  <textarea
                                    value={reportDetails}
                                    onChange={(event) => setReportDetails(event.target.value)}
                                    maxLength={1000}
                                    rows={3}
                                    className="mt-2 w-full resize-y rounded-md border border-richblack-600 bg-richblack-900 px-3 py-2 text-white"
                                    placeholder="Tell us what should be corrected..."
                                  />
                                </label>
                                <div className="flex justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setReportingQuestion(null)}
                                    disabled={isReporting}
                                    className="rounded-md px-3 py-2 text-sm text-richblack-200 hover:text-white disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReportIssue(question, qIndex)}
                                    disabled={isReporting}
                                    className="inline-flex items-center gap-2 rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                                  >
                                    <MdSend size={16} />
                                    {isReporting ? "Sending..." : "Submit report"}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex justify-center pt-2">
                          <button
                            onClick={handleSubmitQuiz}
                            className="px-12 py-2.5 rounded-full font-bold bg-yellow-400 text-black hover:scale-105 transition-all"
                          >
                            Submit Quiz
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })
      )}
    </div>
  );
};

export default SlideTab;