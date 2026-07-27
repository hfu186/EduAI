/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import { MdCloudUpload, MdCheckCircle } from "react-icons/md"

export default function SlideForm({
  onSave,
  onCancel,
  edit = false,
  view = false,
  initialData = null,
  loading = false
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [slideFile, setSlideFile] = useState(null)
  const [existingFileName, setExistingFileName] = useState("")

  useEffect(() => {
    if (!initialData) return

    setTitle(initialData.title || "")
    setDescription(initialData.description || "")

    if (initialData.fileUrl) {
      setExistingFileName(initialData.fileUrl.split("/").pop())
    }
  }, [initialData])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file for slides.")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("Slide file must be under 20MB.")
      return
    }

    setSlideFile(file)
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Slide title is required.")
      return
    }

    if (!edit && !slideFile) {
      alert("Please upload a slide file.")
      return
    }

    onSave({
      lectureTitle: title,
      lectureDesc: description,
      lectureFile: slideFile, 
      type: "slide"
    })
  }

  return (
    <div className="flex flex-col gap-8 px-1">
      
      {/* ================= UPLOAD SECTION ================= */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-richblack-200">
          Slide Document (PDF) <span className="text-pink-200">*</span>
        </label>

        <label className={`flex flex-col items-center justify-center 
                          h-52 w-full rounded-xl 
                          border-2 border-dashed border-richblack-600 
                          bg-richblack-800 transition-all overflow-hidden
                          ${view ? "cursor-default" : "hover:bg-richblack-700 cursor-pointer"}`}>
          
          {slideFile || existingFileName ? (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <MdCheckCircle className="text-5xl text-caribbeangreen-200" />
              <p className="text-caribbeangreen-200 text-sm font-medium w-full break-words">
                {slideFile ? slideFile.name : `Existing: ${existingFileName}`}
              </p>
              {!view && <span className="text-xs text-richblack-400 mt-2">Click to replace file</span>}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-4 bg-richblack-900 rounded-full text-yellow-50">
                <MdCloudUpload size={40} />
              </div>
              <p className="text-sm font-semibold text-yellow-50 mt-2">
                Click to upload PDF
              </p>
              <span className="text-xs text-richblack-400">
                Max file size: 20MB
              </span>
            </div>
          )}

          {!view && (
            <input
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileChange}
            />
          )}
        </label>
      </div>

      {/* ================= DETAILS SECTION ================= */}
      <div className="space-y-6 border-t border-richblack-700 pt-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-richblack-200">
            Slide Title <span className="text-pink-200">*</span>
          </label>
          <input
            disabled={view}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to React"
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
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-[2px_2px_0px_rgba(255,255,255,0.18)]"
          >
            {loading 
              ? "Saving..." 
              : edit 
                ? "Update Slide" 
                : "Save Slide"}
          </button>
        </div>
      )}
    </div>
  )
}