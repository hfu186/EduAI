import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { fetchInstructorCourses } from "../../../services/operations/courseDetailsAPI"
import { getInstructorData } from "../../../services/operations/profileAPI"
import InstructorChart from "./InstructorDashboard/InstructorChart"
import Img from "./../../common/Img"
import { formatVND } from "../../../utils/formatVND"

// --- tiny inline icons so we don't need a new dependency ---
const IconBook = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
)
const IconUsers = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconWallet = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1" />
    <path d="M21 12a2 2 0 0 0-2-2h-3a2 2 0 0 0 0 4h3a2 2 0 0 0 2-2Z" />
  </svg>
)
const IconArrowRight = (props) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </svg>
)
const IconPlus = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export default function Instructor() {
  const { t } = useTranslation()

  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)

  const [loading, setLoading] = useState(false)
  const [instructorData, setInstructorData] = useState(null)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    (async () => {
      setLoading(true)

      const instructorApiData = await getInstructorData(token)
      const result = await fetchInstructorCourses(token)

      if (instructorApiData.length) {
        setInstructorData(instructorApiData)
      }

      if (result) {
        setCourses(result)
      }

      setLoading(false)
    })()
  }, [token])

  const totalAmount =
    instructorData?.reduce(
      (acc, curr) => acc + curr.totalAmountGenerated,
      0
    ) || 0

  const totalStudents =
    instructorData?.reduce(
      (acc, curr) => acc + curr.totalStudentsEnrolled,
      0
    ) || 0

  const statCards = [
    { key: "totalCourses", icon: IconBook, value: courses.length, accent: "#818cf8" },
    { key: "totalStudents", icon: IconUsers, value: totalStudents.toLocaleString(), accent: "#2dd4bf" },
    { key: "totalIncome", icon: IconWallet, value: formatVND(totalAmount), accent: "#f59e0b" },
  ]

  // Skeleton loading
  const skItem = () => {
    return (
      <div className="mt-6 w-full flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 h-[340px] rounded-2xl skeleton"></div>
          <div className="lg:w-[280px] flex flex-col gap-4">
            <div className="h-[104px] rounded-2xl skeleton"></div>
            <div className="h-[104px] rounded-2xl skeleton"></div>
            <div className="h-[104px] rounded-2xl skeleton"></div>
          </div>
        </div>

        <div className="flex flex-col gap-y-5">
          <div className="flex justify-between">
            <p className="w-[140px] h-5 rounded-lg skeleton"></p>
            <p className="w-[70px] h-5 rounded-lg skeleton"></p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <p className="h-[201px] w-full rounded-2xl skeleton"></p>
            <p className="h-[201px] w-full rounded-2xl skeleton"></p>
            <p className="h-[201px] w-full rounded-2xl skeleton"></p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-2 mt-10">
        <h1 className="text-2xl font-bold text-richblack-5 text-center sm:text-left">
          {t("instructor.greeting", {
            name: user?.firstName || "",
          })}{" "}
          👋
        </h1>

        <p className="font-medium text-richblack-200 text-center sm:text-left">
          {t("instructor.subtitle")}
        </p>
      </div>

      {loading ? (
        skItem()
      ) : courses.length > 0 ? (
        <div>
          <div className="my-6 flex flex-col lg:flex-row gap-4 items-stretch">
            {/* Chart / Graph */}
            <div className="flex-1 min-w-0">
              {totalAmount > 0 || totalStudents > 0 ? (
                <InstructorChart courses={instructorData} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-richblack-700 bg-richblack-800 p-6 text-center">
                  <IconBook className="text-richblack-500" />
                  <div>
                    <p className="text-lg font-bold text-richblack-5">
                      {t("instructor.visualize")}
                    </p>
                    <p className="mt-1 text-sm text-richblack-300">
                      {t("instructor.notEnoughData")}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="flex lg:w-[280px] shrink-0 flex-col gap-4">
              {statCards.map(({ key, icon: Icon, value, accent }) => (
                <div
                  key={key}
                  className="group flex items-center gap-4 rounded-2xl border border-richblack-700 bg-richblack-800 p-5 transition-colors hover:border-richblack-600"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${accent}1a`, color: accent }}
                  >
                    <Icon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-richblack-300">
                      {t(`instructor.${key}`)}
                    </p>
                    <p className="truncate text-xl font-semibold text-richblack-5">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Courses */}
          <div className="rounded-2xl border border-richblack-700 bg-richblack-800 p-6">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-richblack-5">
                {t("instructor.yourCourses")}
              </p>

              <Link
                to="/dashboard/my-courses"
                className="flex items-center gap-1 text-xs font-semibold text-yellow-50 transition-colors hover:text-yellow-25"
              >
                {t("common.viewAll")}
                <IconArrowRight />
              </Link>
            </div>

            <div className="my-5 flex flex-col sm:flex-row sm:space-x-6 space-y-6 sm:space-y-0">
              {courses.slice(0, 3).map((course) => (
                <Link
                  to="/dashboard/my-courses"
                  key={course._id}
                  className="group sm:w-1/3 flex flex-col overflow-hidden rounded-2xl border border-transparent transition-all hover:border-richblack-600"
                >
                  <div className="relative overflow-hidden rounded-2xl">
                    <Img
                      src={course.thumbnail}
                      alt={course.courseName}
                      className="h-[201px] w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-3 right-3 rounded-full bg-richblack-900/80 px-3 py-1 text-xs font-semibold text-caribbeangreen-100 backdrop-blur-sm">
                      {formatVND(course.price)}
                    </span>
                  </div>

                  <div className="mt-3 w-full">
                    <p className="truncate text-sm font-medium text-richblack-50">
                      {course.courseName}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-xs font-medium text-richblack-300">
                      <IconUsers width="12" height="12" />
                      <span>
                        {t("instructor.students", {
                          count: course.studentsEnrolled.length,
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-richblack-700 bg-richblack-800 p-6 py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-richblack-700 text-richblack-300">
            <IconBook />
          </div>
          <p className="text-2xl font-bold text-richblack-5">
            {t("instructor.noCourses")}
          </p>

          <Link
            to="/dashboard/add-course"
            className="mt-1 flex items-center gap-2 rounded-lg bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-richblack-900 transition-transform hover:scale-95"
          >
            <IconPlus />
            {t("instructor.createCourse")}
          </Link>
        </div>
      )}
    </div>
  )
}