/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

export default function Upload({
  name,
  label,
  setValue,
  errors,
  viewData = null,
  editData = null,
  accept = "image/*",
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSource, setPreviewSource] = useState(
    viewData || editData || "",
  );

  const inputRef = useRef(null);
  const isInitialized = useRef(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      previewFile(file);
      setValue(name, file);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewSource(reader.result);
    };
  };

  useEffect(() => {
    if (!isInitialized.current && (viewData || editData)) {
      setPreviewSource(viewData || editData);
      isInitialized.current = true;
    }
  }, [viewData, editData]);

  const isPDF = (source) => {
    if (selectedFile && selectedFile.type === "application/pdf") return true;
    if (typeof source === "string" && source.toLowerCase().endsWith(".pdf"))
      return true;
    if (typeof source === "string" && source.startsWith("data:application/pdf"))
      return true;
    return false;
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-[13px] font-medium text-richblack-5">
        {label} {!viewData && <sup className="text-pink-200">*</sup>}
      </label>

      {/* Box Upload */}
      <div
        className={`${
          previewSource
            ? "border border-solid border-richblack-600 bg-richblack-800 p-2"
            : "min-h-[150px] border-2 border-dotted border-richblack-500 bg-richblack-700 p-4"
        } flex w-full cursor-pointer items-center justify-center rounded-md transition-all`}
        onClick={() => inputRef.current?.click()}
      >
        {previewSource ? (
          <div className="flex w-full flex-col items-center">
            {isPDF(previewSource) ? (
              <div className="w-full rounded-md border border-richblack-600 bg-richblack-900">
                <iframe
                  src={`${previewSource}#toolbar=0`}
                  className="h-[10px] w-full rounded-md"
                  title="PDF Preview"
                />
              </div>
            ) : (
              <img
                src={previewSource}
                alt="Preview"
                className="max-h-[140px] w-full rounded-md object-contain"
              />
            )}

            {!viewData && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewSource("");
                  setSelectedFile(null);
                  setValue(name, null);
                  if (inputRef.current) {
                    inputRef.current.value = "";
                  }
                }}
                className="mt-3 rounded-md border border-richblack-600 bg-richblack-700 px-4 py-1.5 text-[12px] font-semibold text-richblack-200 transition-all hover:bg-richblack-900 hover:text-white"
              >
                Cancel / Remove
              </button>
            )}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            <div className="grid w-10 aspect-square place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-xl text-yellow-50" />
            </div>
            <p className="mt-1.5 text-center text-[12px] text-richblack-200">
              <span className="font-semibold text-yellow-50">Browse</span> files to upload
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
        <span className="ml-1 text-[11px] tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  );
}