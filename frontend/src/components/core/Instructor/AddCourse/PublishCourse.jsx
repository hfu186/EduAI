import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { resetCourseState, setStep } from "../../../../slices/courseSlice"
import { apiConnector } from "../../../../services/apiConnector"
import { toast } from "react-hot-toast"
import { MdOutlineSendAndArchive, MdOutlineArrowBack } from "react-icons/md"

const ALREADY_REVIEWED_STATUSES = ["Approved", "Published"]

export default function SubmitForReview() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(false)
  const [readyForReview, setReadyForReview] = useState(false)

  const isAlreadyApproved = ALREADY_REVIEWED_STATUSES.includes(course?.status)

  useEffect(() => {
    if (isAlreadyApproved) {
      setReadyForReview(true)
    } else {
      setReadyForReview(course?.status === "Pending")
    }
  }, [course, isAlreadyApproved])

  const goBack = () => dispatch(setStep(2))

  const goToMyCourses = () => {
    dispatch(resetCourseState())
    navigate("/dashboard/my-courses")
  }

  const saveCourseContent = async () => {
    const formData = new FormData()
    formData.append("courseId", course._id)

    await apiConnector("POST", "/course/editCourse", formData, {
      Authorization: `Bearer ${token}`,
    })
  }

  const submitForAdminReview = async () => {
    await apiConnector(
      "PATCH",
      `/course/publish/${course._id}`,
      {},
      { Authorization: `Bearer ${token}` }
    )
  }

  const handleCourseSubmit = async () => {
    setLoading(true)
    try {
      await saveCourseContent()

      if (isAlreadyApproved) {
        toast.success("Course updated successfully")
      } else if (readyForReview) {
        await submitForAdminReview()
        toast.success("Course submitted for admin review successfully")
      } else {
        toast.success("Saved as Draft")
      }

      goToMyCourses()
    } catch (error) {
      console.error("SUBMIT ERROR:", error)
      console.error("SERVER RESPONSE:", error?.response?.data)
      console.error("STATUS CODE:", error?.response?.status)
      toast.error(error?.response?.data?.message || "Failed to update course")
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5 rounded-xl border border-richblack-700 bg-richblack-800 p-5 md:p-6">
      {/* Header - đồng bộ với Step 1 & 2 */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-50/90">
            Step 3 of 3
          </span>
        </div>
        <h2 className="text-xl font-semibold text-richblack-5">
          {isAlreadyApproved ? "Update Course" : "Submit Course for Review"}
        </h2>
        <p className="mt-0.5 text-sm text-richblack-400">
          {isAlreadyApproved
            ? "This course is already live. Changes are saved immediately without needing admin re-approval."
            : "Your course will be sent to administrators for approval before going live."}
        </p>
      </div>

      {/* Status Card */}
      <div className="rounded-lg border border-richblack-600 bg-richblack-900/50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-richblack-5">Submission Status</p>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              isAlreadyApproved
                ? "border border-green-500/30 bg-green-500/15 text-green-300"
                : readyForReview
                ? "border border-yellow-500/30 bg-yellow-500/15 text-yellow-200"
                : "border border-richblack-600 bg-richblack-700 text-richblack-300"
            }`}
          >
            {isAlreadyApproved
              ? "Published"
              : readyForReview
              ? "Ready for Review"
              : "Draft"}
          </span>
        </div>

        {/* Toggle chỉ hiện khi chưa duyệt */}
        {!isAlreadyApproved && (
          <div className="space-y-2.5">
            <label className="flex cursor-pointer items-center justify-between gap-4 py-1">
              <span className="text-sm text-richblack-300">
                I confirm this course is complete and ready for Admin verification.
              </span>

              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={readyForReview}
                  onChange={(e) => setReadyForReview(e.target.checked)}
                />
                <div
                  className={`h-5 w-10 rounded-full transition-colors duration-200 ${
                    readyForReview ? "bg-yellow-50" : "bg-richblack-600"
                  }`}
                />
                <div
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-richblack-900 shadow transition-transform duration-200 ${
                    readyForReview ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>

            <p className="text-xs text-richblack-500">
              Note: You won’t be able to make changes while the course is under review.
            </p>
          </div>
        )}

        {isAlreadyApproved && (
          <p className="text-xs text-richblack-500">
            No approval needed — updates to a published course go live immediately.
          </p>
        )}
      </div>

      {/* Course summary (optional quick glance) */}
      {course && (
        <div className="rounded-lg border border-richblack-700 bg-richblack-900/30 px-4 py-3">
          <p className="text-xs text-richblack-400 mb-1">Course</p>
          <p className="text-sm font-medium text-richblack-5 truncate">
            {course.courseName || "Untitled Course"}
          </p>
        </div>
      )}

      {/* Footer actions - đồng bộ */}
      <div className="flex flex-col-reverse gap-3 border-t border-richblack-700 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          disabled={loading}
          onClick={goBack}
          className="flex items-center justify-center gap-2 rounded-lg bg-richblack-700 px-4 py-2 text-sm font-semibold text-richblack-5 transition-colors hover:bg-richblack-600 disabled:opacity-50"
        >
          <MdOutlineArrowBack size={16} />
          Back
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={goToMyCourses}
            className="rounded-lg border border-richblack-600 px-4 py-2 text-sm font-semibold text-richblack-300 transition-colors hover:bg-richblack-700 hover:text-richblack-5 disabled:opacity-50"
          >
            {isAlreadyApproved ? "Exit Without Saving" : "Save as Draft & Exit"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleCourseSubmit}
            className="flex items-center justify-center gap-2 rounded-lg bg-yellow-50 px-5 py-2 text-sm font-bold text-richblack-900 transition-all hover:scale-[0.98] disabled:opacity-60"
          >
            <MdOutlineSendAndArchive size={16} />
            {loading
              ? "Saving..."
              : isAlreadyApproved
              ? "Save Changes"
              : "Submit for Review"}
          </button>
        </div>
      </div>
    </div>
  )
}