/* eslint-disable react/prop-types */
export default function AlertDialog({
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}) {
  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <div
        aria-describedby="alert-dialog-description"
        aria-labelledby="alert-dialog-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-richblack-600 bg-richblack-800 p-6 shadow-2xl"
        role="alertdialog"
      >
        <h2 id="alert-dialog-title" className="text-xl font-semibold text-richblack-5">
          {title}
        </h2>
        {description && (
          <p id="alert-dialog-description" className="mb-6 mt-3 leading-6 text-richblack-200">
            {description}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            autoFocus
            className="rounded-md bg-richblack-700 px-4 py-2 font-semibold text-richblack-100 transition-colors hover:bg-richblack-600"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className={`rounded-md px-4 py-2 font-semibold transition-colors ${
              isDestructive
                ? "bg-pink-700 text-white hover:bg-pink-600"
                : "bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
            }`}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
