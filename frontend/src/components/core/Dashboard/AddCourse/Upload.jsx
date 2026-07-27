/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import { FiUploadCloud } from "react-icons/fi"

export default function Upload({
  name,
  label,
  setValue,
  errors,
  viewData = null,
  editData = null,
  accept = "image/*",
}) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(viewData || editData || "")
  
  const inputRef = useRef(null)
  const isInitialized = useRef(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      previewFile(file)
      setValue(name, file)
    }
  }

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  useEffect(() => {
    if (!isInitialized.current && (viewData || editData)) {
      setPreviewSource(viewData || editData)
      isInitialized.current = true
    }
  }, [viewData, editData])

  const isPDF = (source) => {
    if (selectedFile && selectedFile.type === "application/pdf") return true
    if (typeof source === "string" && source.toLowerCase().endsWith(".pdf")) return true
    if (typeof source === "string" && source.startsWith("data:application/pdf")) return true
    return false
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5">
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </label>

      <div 
        className={`${
          previewSource ? "bg-richblack-800" : "bg-richblack-700"
        } flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500`}
      >
        {previewSource ? (
          <div className="flex w-full flex-col p-6">
            { !isPDF(previewSource) ? (
              <div className="flex flex-col items-center justify-center gap-3 w-full h-[300px] bg-richblack-900 rounded-md border border-richblack-600">
                  <iframe 
                    src={`${previewSource}#toolbar=0`}
                    className="w-full h-full rounded-md"
                    title="PDF Preview"
                  />
              </div>
            ) : (
              <img
                src={previewSource}
                alt="Preview"
                className="h-full w-full rounded-md object-cover max-h-[400px]"
              />
            )}

            {!viewData && (
              <button
                type="button"
                onClick={() => {
                  setPreviewSource("")
                  setSelectedFile(null)
                  setValue(name, null)
                  if (inputRef.current) {
                    inputRef.current.value = ""
                  }
                }}
                className="mt-3 text-richblack-400 underline hover:text-yellow-50 transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div
            className="flex w-full flex-col items-center p-6"
            onClick={() => inputRef.current?.click()}
          >
            <div className="grid aspect-square w-14 place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-2xl text-yellow-50" />
            </div>
            <p className="mt-2 max-w-[200px] text-center text-sm text-richblack-200">
              <span className="font-semibold text-yellow-50">Browse</span>
            </p>
        
          </div>
        )}

        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={accept}
        />
      </div>

      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}