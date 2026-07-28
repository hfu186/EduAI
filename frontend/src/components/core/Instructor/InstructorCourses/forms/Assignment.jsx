/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import { MdCloudUpload, MdCheckCircle } from "react-icons/md"

export default function AssignmentForm({
  onSave,
  onCancel,
  edit = false,
  view = false,
  initialData = null,
  loading = false
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [assignmentFile, setAssignmentFile] = useState(null)
  const [answerKeyFile, setAnswerKeyFile] = useState(null)

  const [existingAssignmentName, setExistingAssignmentName] = useState("")
  const [existingAnswerKeyName, setExistingAnswerKeyName] = useState("")

  useEffect(() => {
    if (!initialData) return

    setTitle(initialData.title || "")
    setDescription(initialData.description || "")

    if (initialData.deadline) {
      setDeadline(new Date(initialData.deadline).toISOString().slice(0, 16))
    }

    if (initialData.fileUrl) {
      setExistingAssignmentName(initialData.fileUrl.split("/").pop())
    }

    if (initialData.answerKeyUrl) {
      setExistingAnswerKeyName(initialData.answerKeyUrl.split("/").pop())
    }
  }, [initialData])

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert("File must be under 10MB.")
      return
    }

    setFile(file)
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Title is required.")
      return
    }

    if (!deadline) {
      alert("Deadline is required.")
      return
    }

    onSave({
      title,
      description,
      deadline,
      assignmentFile,
      answerKey: answerKeyFile
    })
  }

  return (
    <div className="flex flex-col gap-8 px-1">

      {/* ================= FILE SECTION ================= */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-richblack-5">
          Assignment Materials
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Question Upload */}
          <div className="space-y-2 min-w-0">
            <label className="text-sm font-medium text-richblack-200">
              Assignment File (Question)
            </label>

            <label className="flex flex-col items-center justify-center
                              h-44 w-full rounded-xl
                              border-2 border-dashed border-richblack-600
                              bg-richblack-800 hover:bg-richblack-700
                              transition-all overflow-hidden cursor-pointer">

              {assignmentFile || existingAssignmentName ? (
                <div className="flex flex-col items-center gap-2 text-center px-4">
                  <MdCheckCircle className="text-4xl text-caribbeangreen-200" />
                  <p className="text-caribbeangreen-200 text-sm font-medium w-full break-words">
                    {assignmentFile
                      ? assignmentFile.name
                      : `Existing: ${existingAssignmentName}`}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <MdCloudUpload className="text-4xl text-yellow-50" />
                  <p className="text-sm font-semibold text-yellow-50">
                    Click to upload
                  </p>
                  <span className="text-xs text-richblack-400">
                    PDF, DOCX, ZIP (Max 10MB)
                  </span>
                </div>
              )}

              {!view && (
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={(e) => handleFileChange(e, setAssignmentFile)}
                />
              )}
            </label>
          </div>

          {/* Answer Key Upload */}
          <div className="space-y-2 min-w-0">
            <label className="text-sm font-medium text-richblack-200">
              Answer Key (Unlocked after deadline)
            </label>

            <label className="flex flex-col items-center justify-center
                              h-44 w-full rounded-xl
                              border-2 border-dashed border-richblack-600
                              bg-richblack-800 hover:bg-richblack-700
                              transition-all overflow-hidden cursor-pointer">

              {answerKeyFile || existingAnswerKeyName ? (
                <div className="flex flex-col items-center gap-2 text-center px-4">
                  <MdCheckCircle className="text-4xl text-blue-200" />
                  <p className="text-blue-200 text-sm font-medium w-full break-words">
                    {answerKeyFile
                      ? answerKeyFile.name
                      : `Existing: ${existingAnswerKeyName}`}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <MdCloudUpload className="text-4xl text-richblack-300" />
                  <p className="text-sm font-semibold text-richblack-200">
                    Upload Answer Key
                  </p>
                  <span className="text-xs text-richblack-400">
                    Optional
                  </span>
                </div>
              )}

              {!view && (
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={(e) => handleFileChange(e, setAnswerKeyFile)}
                />
              )}
            </label>
          </div>

        </div>
      </div>

      {/* ================= DETAILS SECTION ================= */}
      <div className="space-y-6 border-t border-richblack-700 pt-6">

        <div className="space-y-2">
          <label className="text-sm font-medium text-richblack-200">
            Title <span className="text-pink-200">*</span>
          </label>
          <input
            disabled={view}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter assignment title"
            className="w-full bg-richblack-800 p-3 rounded-lg border
                       border-richblack-700 text-richblack-5
                       focus:border-yellow-50 outline-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-richblack-200">
            Instructions
          </label>
          <textarea
            disabled={view}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide detailed instructions for students"
            className="w-full bg-richblack-800 p-3 rounded-lg border
                       border-richblack-700 text-richblack-5
                       focus:border-yellow-50 outline-none
                       min-h-[120px] resize-none transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-richblack-200">
            Deadline <span className="text-pink-200">*</span>
          </label>
          <input
            disabled={view}
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-richblack-800 p-3 rounded-lg border
                       border-richblack-700 text-richblack-5
                       focus:border-yellow-50 outline-none transition"
          />
        </div>

      </div>

      {/* ================= ACTIONS ================= */}
      {!view && (
        <div className="flex justify-end gap-4 border-t border-richblack-700 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-richblack-700 text-richblack-5 px-6 py-2
                       rounded-md font-semibold hover:bg-richblack-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-yellow-50 text-richblack-900 font-bold px-8 py-2
                       rounded-lg hover:scale-[1.02] transition-all
                       disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : edit
              ? "Update Assignment"
              : "Save Assignment"}
          </button>
        </div>
      )}
    </div>
  )
}