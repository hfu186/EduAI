/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { MdDelete, MdAddCircleOutline } from "react-icons/md";

const EMPTY_QUESTION = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
};

export default function QuizBuilder({
  loading = false,
  onSave,
  view = false,
  initialData = null,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (initialData) {
        setTitle(initialData.title ?? "");
        setDescription(initialData.description ?? "");

        let loadedQuestions = [];
        if (Array.isArray(initialData.questions)) {
            loadedQuestions = initialData.questions;
        } else if (typeof initialData.questions === "string") {
            try {
                const parsed = JSON.parse(initialData.questions);
                loadedQuestions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
            } catch { loadedQuestions = []; }
        }

        setQuestions(loadedQuestions.length > 0 ? [...loadedQuestions] : [{ ...EMPTY_QUESTION }]);
    } else {
        setQuestions([{ ...EMPTY_QUESTION }]);
    }
}, []);
  const handleAddQuestion = () => {
    if (view) return;
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }]);
  };

  const handleRemoveQuestion = (index) => {
    if (view || questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], question: value };
      return updated;
    });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const updatedOptions = [...updated[qIndex].options];
      updatedOptions[oIndex] = value;

      updated[qIndex] = {
        ...updated[qIndex],
        options: updatedOptions,
      };

      return updated;
    });
  };

  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        correctAnswer: oIndex,
      };
      return updated;
    });
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      alert("Please enter a quiz title.");
      return false;
    }

    const isValid = questions.every(
      (q) =>
        q.question.trim() !== "" &&
        q.options.every((opt) => opt.trim() !== "")
    );

    if (!isValid) {
      alert("Please complete all questions and options.");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (view) return;
    if (!validateQuiz()) return;

    onSave?.({
      title: title.trim(),
      description: description.trim(),
      type: "quiz",
      quiz: questions,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex flex-col gap-2">
        <label className="text-sm text-richblack-5 font-medium">
          Quiz Title
        </label>
        <input
          className="form-style w-full bg-richblack-700 p-3 rounded-lg border border-richblack-600 outline-none"
          placeholder="e.g. Final Examination"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={view || loading}
        />
      </div>

      <div className="space-y-8 mt-2">
        {questions.map((q, i) => (
          <div
            key={i}
            className="bg-richblack-800 p-5 rounded-xl border border-richblack-600 relative group transition-all"
          >
            <div className="flex justify-between items-center mb-4 border-b border-richblack-700 pb-2">
              <p className="text-yellow-50 font-bold tracking-widest text-xs">
                QUESTION {i + 1}
              </p>
              {!view && questions.length > 1 && (
                <button
                  onClick={() => handleRemoveQuestion(i)}
                  className="text-pink-200 hover:text-pink-50 transition-colors"
                >
                  <MdDelete size={20} />
                </button>
              )}
            </div>

            <input
              placeholder="Enter your question"
              className="form-style w-full bg-richblack-700 p-3 rounded-lg mb-4 border border-richblack-600"
              value={q.question}
              onChange={(e) => handleQuestionChange(i, e.target.value)}
              disabled={view || loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options.map((opt, j) => (
                <div
                  key={j}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                    q.correctAnswer === j
                      ? "border-caribbeangreen-300 bg-caribbeangreen-900/20"
                      : "border-richblack-600 bg-richblack-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`correct-answer-group-${i}`}
                    checked={q.correctAnswer === j}
                    onChange={() => handleCorrectAnswerChange(i, j)}
                    disabled={view || loading}
                    className="w-4 h-4 cursor-pointer accent-caribbeangreen-200"
                  />
                  <input
                    className="bg-transparent outline-none text-richblack-5 w-full text-sm"
                    placeholder={`Option ${j + 1}`}
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(i, j, e.target.value)
                    }
                    disabled={view || loading}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!view && (
        <div className="flex flex-col gap-4 mt-2 pt-4 border-t border-richblack-700">
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 text-yellow-50 font-semibold hover:text-yellow-25 transition-all w-fit"
          >
            <MdAddCircleOutline size={20} />
            Add New Question
          </button>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-yellow-50 text-black px-10 py-2.5 rounded-lg font-bold hover:scale-95 transition-all shadow-md disabled:bg-richblack-500"
            >
              {loading ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}