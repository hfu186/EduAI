/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { apiConnector } from "../../../../services/apiConnector";
import { MdCheckCircle } from "react-icons/md";
import { courseEndpoints } from "../../../../services/apis";
import { toast } from "react-hot-toast";
import { updateCompletedLectures } from "../../../../slices/viewCourseSlice";

export default function QuizTab({ quizData, courseId, subSectionId }) {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { completedLectures } = useSelector((state) => state.viewCourse);

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const parsedQuestions = useMemo(() => {
    if (!quizData) return [];

    if (typeof quizData === "object" && !Array.isArray(quizData)) {
      return quizData.questions || [];
    }

    if (typeof quizData === "string") {
      try {
        const parsed = JSON.parse(quizData);
        return parsed.questions || (Array.isArray(parsed) ? parsed : []);
      } catch {
        return [];
      }
    }

    return Array.isArray(quizData) ? quizData : [];
  }, [quizData]);

  const isAlreadyCompleted = useMemo(
    () =>
      completedLectures.some(
        (id) => String(id) === String(subSectionId)
      ),
    [completedLectures, subSectionId]
  );

  const handleOptionChange = (questionIndex, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < parsedQuestions.length) {
      toast.error("Please answer all questions.");
      return;
    }

    setLoading(true);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([qIdx, optIdx]) => ({
          questionIndex: Number(qIdx),
          optionIndex: optIdx,
        })
      );

      const response = await apiConnector(
        "POST",
        courseEndpoints.SUBMIT_QUIZ_API,
        { courseId, subSectionId, answers: formattedAnswers },
        { Authorization: `Bearer ${token}` }
      );

      if (response?.data?.success) {
        const quizResult = response.data.data;
        setResult(quizResult);

        if (quizResult.pass && !isAlreadyCompleted) {
          dispatch(updateCompletedLectures(subSectionId));
          toast.success(
            "Congratulations! You have completed this quiz."
          );
        }
      }
    } catch {
      toast.error("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
  };

  if (quizData?.status === "draft") {
    return (
      <div className="text-center py-20 bg-richblack-800 rounded-lg border border-dashed border-richblack-600">
        <p className="text-yellow-100 text-lg">
          ⚠️ This quiz is currently in draft mode.
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-richblack-800 rounded-2xl border border-richblack-700 shadow-2xl animate-fadeIn">
        <h2 className="text-3xl font-bold text-white mb-6">
          Quiz Result
        </h2>

        <div
          className={`text-7xl font-bold mb-4 ${
            result.pass
              ? "text-caribbeangreen-200"
              : "text-pink-200"
          }`}
        >
          {result.score}/100
        </div>

        <p className="text-richblack-300 text-center text-lg mb-8">
          You answered{" "}
          <span className="text-white font-bold">
            {result.correctCount}
          </span>{" "}
          out of {result.totalQuestions} questions correctly.
        </p>

        <div
          className={`px-8 py-3 rounded-full font-bold text-xl ${
            result.pass
              ? "bg-caribbeangreen-900 text-caribbeangreen-50"
              : "bg-pink-900 text-pink-50"
          }`}
        >
          {result.pass
            ? "🎉 Congratulations! You passed."
            : "Not passed – Please try again."}
        </div>

        <button
          onClick={handleRetry}
          className="mt-10 text-richblack-300 underline hover:text-yellow-50 transition-all"
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
  <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">

    {isAlreadyCompleted && (
      <div className="bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 px-5 py-3 rounded-xl text-sm text-center flex items-center justify-center gap-2">
        <MdCheckCircle size={18} />
        You’ve completed this lesson. You may retake the quiz anytime.
      </div>
    )}

    <div className="space-y-2 text-center">
      <h2 className="text-3xl font-bold text-white tracking-tight">
        Quiz Assessment
      </h2>
      <p className="text-richblack-400 text-sm">
        Choose the most accurate answer for each question.
      </p>
      <p className="text-richblack-500 text-xs">
        {parsedQuestions.length} Questions
      </p>
    </div>

    <div className="space-y-8">
      {parsedQuestions.map((question, qIndex) => (
        <div
          key={qIndex}
          className="bg-richblack-800/70 backdrop-blur-sm p-6 rounded-2xl shadow-md border border-richblack-700/50"
        >
          <p className="text-lg text-white font-medium mb-6 leading-relaxed">
            <span className="text-yellow-400 font-semibold mr-2">
              {qIndex + 1}.
            </span>
            {question.question}
          </p>

          <div className="space-y-3">
            {question.options.map((option, optIndex) => {
              const isSelected = answers[qIndex] === optIndex;

              return (
                <label
                  key={optIndex}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-yellow-500/10 border border-yellow-400"
                      : "bg-richblack-900/60 border border-transparent hover:bg-richblack-700/60"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    checked={isSelected}
                    onChange={() =>
                      handleOptionChange(qIndex, optIndex)
                    }
                    className="hidden"
                  />

                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                      isSelected
                        ? "border-yellow-400"
                        : "border-richblack-500"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    )}
                  </div>

                  <span
                    className={`text-sm ${
                      isSelected
                        ? "text-white font-medium"
                        : "text-richblack-200"
                    }`}
                  >
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>

    <div className="flex justify-center pt-6">
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="px-14 py-3 rounded-full font-semibold text-base transition-all duration-200
        bg-yellow-400 text-black hover:scale-105 hover:shadow-lg
        disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  </div>
);
}