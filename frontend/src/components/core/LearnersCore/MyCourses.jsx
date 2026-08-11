import { useEffect, useState } from "react"
import { VscAdd } from "react-icons/vsc"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { fetchInstructorCourses } from "@/services/operations/courseDetailsAPI"
import IconBtn from "../../common/IconBtn"
import CoursesTable from "@/components/core/Instructor/InstructorCourses/CoursesTable"

export default function MyCourses() {
  const { t } = useTranslation()
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      const result = await fetchInstructorCourses(token)
      if (result) {
        setCourses(result)
      }
      setLoading(false)
    }

    if (token) {
      fetchCourses()
    } else {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full border-t-yellow-50 border-richblack-700"></div>

          <p className="text-richblack-100 mt-4">
            {t("myCourses.loading")}
          </p>
        </div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        <p className="text-richblack-300">
          {t("myCourses.loginRequired")}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-14 flex justify-between items-center mt-10">
        <h1 className="text-3xl font-bold text-richblack-5 text-center lg:text-left">
          {t("myCourses.title")}
        </h1>

        <IconBtn
          text={t("myCourses.addCourse")}
          onclick={() => navigate("/dashboard/add-course")}
        >
          <VscAdd />
        </IconBtn>
      </div>

      {/* Empty state */}
      {courses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-richblack-600 rounded-md bg-richblack-800">
          <p className="text-richblack-300 text-lg mb-4">
            {t("myCourses.noCourses")}
          </p>

          <button
            onClick={() => navigate("/dashboard/add-course")}
            className="bg-yellow-50 text-richblack-900 px-6 py-3 rounded-md font-semibold hover:bg-yellow-100 transition-all"
          >
            {t("myCourses.createFirst")}
          </button>
        </div>
      ) : (
        <CoursesTable
          courses={courses}
          setCourses={setCourses}
        />
      )}
    </div>
  )
}
