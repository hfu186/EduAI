import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { fetchInstructorCourses } from "../../../../services/operations/courseAPI"
import CourseCard from "./CourseCard"

export default function InstructorCourses() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { instructorCourses, loading } = useSelector(
    (state) => state.course
  )

  useEffect(() => {
    dispatch(fetchInstructorCourses())
  }, [dispatch])

  if (loading) {
    return (
      <p className="text-richblack-200">
        {t("instructorCourses.loading")}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-richblack-5">
          {t("instructorCourses.title")}
        </h1>

        <button
          className="bg-yellow-50 text-black px-4 py-2 rounded-md"
          onClick={() => navigate("/dashboard/add-course")}
        >
          + {t("instructorCourses.addCourse")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {instructorCourses.map((course) => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  )
}