import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { resetCourseState, setStep } from "../../../../slices/courseSlice"
import { apiConnector } from "../../../../services/apiConnector"
import { toast } from "react-hot-toast"
import { MdOutlineSendAndArchive, MdArrowBack } from "react-icons/md"

export default function SubmitForReview() {
  const { register, handleSubmit, setValue, watch } = useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(false)
  const isSubmitForReview = watch("readyForReview")

  useEffect(() => {
    // Nếu trạng thái khóa học đã ở dạng Pending hoặc Published
    if (course?.status === "Pending" || course?.status === "Published") {
      setValue("readyForReview", true)
    } else {
      setValue("readyForReview", false)
    }
  }, [course, setValue])

  const goBack = () => dispatch(setStep(2))

  const goToMyCourses = () => {
    dispatch(resetCourseState())
    navigate("/dashboard/my-courses")
  }

  const handleCourseSubmit = async () => {
    const formData = new FormData()
    formData.append("courseId", course._id)
    formData.append("status", isSubmitForReview ? "Pending" : "Draft")

    setLoading(true)
    try {
      await apiConnector("POST", "/course/editCourse", formData, {
        Authorization: `Bearer ${token}`,
      })

      toast.success(
        isSubmitForReview
          ? "Course submitted for admin review successfully"
          : "Saved as Draft"
      )
      goToMyCourses()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update course status")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto rounded-xl border border-richblack-700 bg-richblack-800 p-6 shadow-lg">
      {/* Header */}
      <div className="mb-6 border-b border-richblack-700 pb-4">
        <h2 className="text-xl font-bold text-richblack-5">
          Submit Course for Review
        </h2>
        <p className="text-xs text-richblack-300 mt-1">
          Your course will be sent to administrators for approval before going live.
        </p>
      </div>

      {/* Status Card */}
      <div className="rounded-lg bg-richblack-900 border border-richblack-700 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-richblack-100 font-medium">
            Submission Status
          </p>

          <span
            className={`px-3 py-0.5 text-[11px] font-semibold rounded-full ${
              isSubmitForReview
                ? "bg-yellow-500/20 text-yellow-100 border border-yellow-500/30"
                : "bg-richblack-700 text-richblack-300"
            }`}
          >
            {isSubmitForReview ? "Ready for Review" : "Draft"}
          </span>
        </div>

        {/* Toggle Switch */}
        <label className="flex items-center justify-between cursor-pointer py-2">
          <span className="text-xs text-richblack-200">
            I confirm this course is complete and ready for Admin verification.
          </span>

          <div className="relative ml-4 shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              {...register("readyForReview")}
            />
            <div
              className={`w-10 h-5 rounded-full transition-all duration-300 ${
                isSubmitForReview ? "bg-yellow-50" : "bg-richblack-600"
              }`}
            ></div>
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-richblack-900 transition-all duration-300 ${
                isSubmitForReview ? "translate-x-5" : ""
              }`}
            ></div>
          </div>
        </label>

        <p className="text-[11px] text-richblack-400 mt-2">
          Note: You wont be able to make changes while the course is under review.
        </p>
      </div>

      {/* Action Buttons */}
      <form onSubmit={handleSubmit(handleCourseSubmit)}>
        <div className="flex items-center justify-between">
          <button
            type="button"
            disabled={loading}
            onClick={goBack}
            className="flex items-center gap-x-1 px-4 py-1.5 rounded-md bg-richblack-700 text-xs font-semibold text-richblack-100 hover:bg-richblack-600 transition"
          >
            <MdArrowBack className="text-sm" /> Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={goToMyCourses}
              className="px-4 py-1.5 rounded-md border border-richblack-600 text-xs font-semibold text-richblack-200 hover:bg-richblack-700 transition"
            >
              Save as Draft & Exit
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-x-1 px-5 py-1.5 rounded-md bg-yellow-50 text-xs font-bold text-richblack-900 hover:scale-95 transition-all disabled:opacity-60"
            >
              <MdOutlineSendAndArchive className="text-sm" />
              {loading ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}