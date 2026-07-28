import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { resetCourseState, setStep } from "../../../../slices/courseSlice"
import { apiConnector } from "../../../../services/apiConnector"
import { toast } from "react-hot-toast"

export default function PublishCourse() {
  const { register, handleSubmit, setValue, getValues, watch } = useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(false)

  const isPublic = watch("public")

  useEffect(() => {
    if (course?.status === "Published") {
      setValue("public", true)
    } else {
      setValue("public", false)
    }
  }, [course, setValue])

  const goBack = () => dispatch(setStep(2))

  const goToMyCourses = () => {
    dispatch(resetCourseState())
    navigate("/dashboard/my-courses")
  }

  const handleCoursePublish = async () => {
    const formData = new FormData()
    formData.append("courseId", course._id)
    formData.append("status", isPublic ? "Published" : "Draft")

    setLoading(true)
    try {
      await apiConnector("POST", "/course/editCourse", formData, {
        Authorization: `Bearer ${token}`,
      })

      toast.success("Course status updated successfully")
      goToMyCourses()
    } catch (error) {
      console.error(error)
      toast.error("Failed to update course status")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto rounded-xl border border-richblack-700 bg-richblack-800 p-8 shadow-lg">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-richblack-5">
          Publish Settings
        </h2>
        <p className="text-sm text-richblack-300 mt-1">
          Control course visibility before making it live.
        </p>
      </div>

      {/* Status Card */}
      <div className="rounded-lg bg-richblack-900 border border-richblack-700 p-6 mb-8">

        <div className="flex items-center justify-between mb-4">
          <p className="text-richblack-100 font-medium">
            Course Visibility
          </p>

          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              isPublic
                ? "bg-caribbeangreen-700 text-caribbeangreen-50"
                : "bg-richblack-600 text-richblack-200"
            }`}
          >
            {isPublic ? "Published" : "Draft"}
          </span>
        </div>

        {/* Toggle Switch */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-richblack-300">
            Make this course public
          </span>

          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              {...register("public")}
            />
            <div
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                isPublic ? "bg-yellow-50" : "bg-richblack-600"
              }`}
            ></div>
            <div
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-richblack-900 transition-all duration-300 ${
                isPublic ? "translate-x-6" : ""
              }`}
            ></div>
          </div>
        </label>

        <p className="text-xs text-richblack-400 mt-3">
          Draft courses are not visible to students.
        </p>
      </div>

      {/* Buttons */}
      <form onSubmit={handleSubmit(handleCoursePublish)}>
        <div className="flex justify-between">

          <button
            type="button"
            disabled={loading}
            onClick={goBack}
            className="px-5 py-2 rounded-md bg-richblack-700 text-richblack-5 font-medium hover:bg-richblack-600 transition"
          >
            Back
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              disabled={loading}
              onClick={goToMyCourses}
              className="px-5 py-2 rounded-md border border-richblack-600 text-richblack-200 hover:bg-richblack-700 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-md bg-yellow-50 text-richblack-900 font-semibold hover:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}