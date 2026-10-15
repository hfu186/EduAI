import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  fixReportedQuizQuestion,
  getInstructorQuizReports,
  updateQuizReportStatus,
} from "../../services/operations/quizReportAPI";

const badgeClass = {
  pending: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  reviewed: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  resolved: "bg-green-500/10 text-green-300 border-green-500/30",
  dismissed: "bg-red-500/10 text-red-300 border-red-500/30",
};

const issueTypeLabel = {
  incorrect_answer: "Incorrect answer",
  unclear_question: "Unclear question",
  incorrect_options: "Incorrect options",
  other: "Other",
};

export default function QuizReportsPage() {
  const { token } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReportId, setEditingReportId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [savingReportId, setSavingReportId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      const result = await getInstructorQuizReports(token);
      setReports(result);
      setLoading(false);
    };

    if (token) fetchReports();
  }, [token]);

  const stats = useMemo(() => {
    return {
      total: reports.length,
      pending: reports.filter((report) => report.status === "pending").length,
      reviewed: reports.filter((report) => report.status === "reviewed").length,
      resolved: reports.filter((report) => report.status === "resolved").length,
    };
  }, [reports]);

  const handleStatusChange = async (reportId, nextStatus) => {
    if (!token || !reportId || !nextStatus) return;

    const updated = await updateQuizReportStatus(token, reportId, nextStatus);
    if (!updated) return;

    setReports((prev) =>
      prev.map((report) => (report._id === reportId ? { ...report, status: updated.status } : report))
    );
  };

  const startEditingQuestion = (report) => {
    setEditingReportId(report._id);
    setEditDraft({
      question: report.question || "",
      options: report.options?.length ? [...report.options] : ["", ""],
      correctAnswer: report.correctAnswer ?? 0,
    });
  };

  const handleQuestionFix = async (reportId) => {
    if (!token || !editDraft) return;

    setSavingReportId(reportId);
    const updated = await fixReportedQuizQuestion(token, reportId, editDraft);
    setSavingReportId(null);
    if (!updated) return;

    setReports((prev) =>
      prev.map((report) =>
        report._id === reportId
          ? { ...report, status: updated.status, quizVersion: updated.quizVersion }
          : report
      )
    );
    setEditingReportId(null);
    setEditDraft(null);
  };

  const handleEditToggle = (report) => {
    if (editingReportId === report._id) {
      setEditingReportId(null);
      setEditDraft(null);
      return;
    }
    startEditingQuestion(report);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-richblack-900 px-6 py-10 text-richblack-100">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-8 w-56 animate-pulse rounded bg-richblack-700" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-richblack-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-richblack-900 px-6 py-10 text-richblack-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-50/70">Instructor</p>
            <h1 className="mt-2 text-3xl font-bold text-richblack-5">Quiz reports</h1>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Total", value: stats.total },
            { label: "Pending", value: stats.pending },
            { label: "Reviewed", value: stats.reviewed },
            { label: "Resolved", value: stats.resolved },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-richblack-700 bg-richblack-800 p-5">
              <p className="text-sm text-richblack-300">{card.label}</p>
              <p className="mt-3 text-3xl font-bold text-richblack-5">{card.value}</p>
            </div>
          ))}
        </div>

        {reports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-richblack-700 bg-richblack-800 p-10 text-center">
            <p className="text-lg font-semibold text-richblack-5">No quiz reports yet</p>
            <p className="mt-2 text-richblack-300">Reports submitted by students will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report._id} className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-lg font-semibold text-richblack-5">
                        {report.course?.courseName || "Course"}
                      </span>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass[report.status] || badgeClass.pending}`}>
                        {report.status || "pending"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-richblack-300">
                      Student: <span className="text-richblack-100">{report.student ? `${report.student.firstName || ""} ${report.student.lastName || ""}`.trim() || report.student.email : "Unknown"}</span>
                    </div>
                    <div className="text-sm text-richblack-300">
                      Lesson: <span className="text-richblack-100">{report.subSection?.title || "Unknown lesson"}</span>
                    </div>
                  </div>

                  <div className="text-sm text-richblack-400">
                    {new Date(report.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-richblack-900 p-4">
                    <p className="text-xs uppercase tracking-wider text-richblack-400">Issue type</p>
                    <p className="mt-2 font-medium text-richblack-5">{issueTypeLabel[report.issueType] || report.issueType}</p>
                  </div>

                  <div className="rounded-xl bg-richblack-900 p-4">
                    <p className="text-xs uppercase tracking-wider text-richblack-400">Question index</p>
                    <p className="mt-2 font-medium text-richblack-5">{report.questionIndex}</p>
                  </div>

                  <div className="rounded-xl bg-richblack-900 p-4">
                    <p className="text-xs uppercase tracking-wider text-richblack-400">Reported quiz version</p>
                    <p className="mt-2 font-medium text-richblack-5">{report.quizVersion || 1}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-richblack-900 p-4">
                  <p className="text-xs uppercase tracking-wider text-richblack-400">Question</p>
                  <p className="mt-2 text-richblack-5">{report.question}</p>
                </div>

                <div className="mt-5 rounded-xl bg-richblack-900 p-4">
                  <p className="text-xs uppercase tracking-wider text-richblack-400">Options</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-richblack-300">
                    {report.options?.map((option, index) => (
                      <li key={`${report._id}-${index}`} className={index === report.correctAnswer ? "text-caribbeangreen-100" : ""}>
                        {option}{index === report.correctAnswer ? " — reported correct answer" : ""}
                      </li>
                    )) || <li>No options provided.</li>}
                  </ul>
                </div>

                {report.details && (
                  <div className="mt-5 rounded-xl bg-richblack-900 p-4">
                    <p className="text-xs uppercase tracking-wider text-richblack-400">Details</p>
                    <p className="mt-2 text-richblack-300">{report.details}</p>
                  </div>
                )}

                {editingReportId === report._id && editDraft && (
                  <div className="mt-5 rounded-xl border border-yellow-500/30 bg-richblack-900 p-5">
                    <h3 className="font-semibold text-richblack-5">Correct the reported question</h3>
                    <p className="mt-1 text-sm text-richblack-300">
                      Saving updates the quiz, keeps the previous version, and resolves this report.
                    </p>
                    <label className="mt-4 block text-sm text-richblack-200" htmlFor={`question-${report._id}`}>
                      Question
                    </label>
                    <textarea
                      id={`question-${report._id}`}
                      value={editDraft.question}
                      maxLength={2000}
                      onChange={(event) =>
                        setEditDraft((draft) => ({ ...draft, question: event.target.value }))
                      }
                      className="mt-2 w-full rounded-lg border border-richblack-600 bg-richblack-800 p-3 text-richblack-5 outline-none focus:border-yellow-200"
                      rows={3}
                    />

                    <div className="mt-4 space-y-3">
                      {editDraft.options.map((option, index) => (
                        <div key={`${report._id}-edit-option-${index}`} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-answer-${report._id}`}
                            checked={editDraft.correctAnswer === index}
                            onChange={() =>
                              setEditDraft((draft) => ({ ...draft, correctAnswer: index }))
                            }
                            aria-label={`Set option ${index + 1} as the correct answer`}
                          />
                          <input
                            value={option}
                            maxLength={500}
                            onChange={(event) =>
                              setEditDraft((draft) => ({
                                ...draft,
                                options: draft.options.map((item, itemIndex) =>
                                  itemIndex === index ? event.target.value : item
                                ),
                              }))
                            }
                            aria-label={`Option ${index + 1}`}
                            className="w-full rounded-lg border border-richblack-600 bg-richblack-800 p-3 text-richblack-5 outline-none focus:border-yellow-200"
                          />
                          {editDraft.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditDraft((draft) => {
                                  const options = draft.options.filter((_, itemIndex) => itemIndex !== index);
                                  const correctAnswer =
                                    draft.correctAnswer === index
                                      ? 0
                                      : draft.correctAnswer > index
                                        ? draft.correctAnswer - 1
                                        : draft.correctAnswer;
                                  return { ...draft, options, correctAnswer };
                                })
                              }
                              className="text-sm text-pink-200 hover:text-pink-100"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {editDraft.options.length < 10 && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditDraft((draft) => ({ ...draft, options: [...draft.options, ""] }))
                        }
                        className="mt-3 text-sm font-medium text-yellow-100 hover:text-yellow-50"
                      >
                        + Add option
                      </button>
                    )}

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReportId(null);
                          setEditDraft(null);
                        }}
                        className="rounded-lg border border-richblack-600 px-4 py-2 text-sm text-richblack-100 hover:bg-richblack-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuestionFix(report._id)}
                        disabled={savingReportId === report._id}
                        className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 hover:bg-yellow-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingReportId === report._id ? "Saving correction..." : "Save correction & resolve"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleEditToggle(report)}
                    className="rounded-lg bg-yellow-50 px-4 py-2 text-sm font-semibold text-richblack-900 hover:bg-yellow-100"
                  >
                    {editingReportId === report._id ? "Close editor" : "Edit reported question"}
                  </button>
                  <span className="text-xs text-richblack-400">
                    Fixing the quiz creates a new version and resolves the report.
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { value: "pending", label: "Pending" },
                    { value: "reviewed", label: "Reviewed" },
                    { value: "dismissed", label: "Dismissed" },
                  ].map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => handleStatusChange(report._id, status.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        report.status === status.value
                          ? "border-yellow-500 bg-yellow-500/20 text-yellow-100"
                          : "border-richblack-600 bg-richblack-700 text-richblack-200 hover:border-richblack-500 hover:text-white"
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
