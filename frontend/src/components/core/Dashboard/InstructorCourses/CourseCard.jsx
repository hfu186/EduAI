/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom"

export default function CourseCard({ course }) {
  const navigate = useNavigate()

  return (
    <div className="bg-richblack-800 rounded-xl p-4 flex gap-4">
      <img
        src={course.thumbnail}
        alt={course.courseName}
        className="w-28 h-20 rounded-lg object-cover"
      />

      <div className="flex flex-col flex-1 gap-2">
        <h2 className="text-lg font-semibold text-richblack-5">
          {course.courseName}
        </h2>

        <p className="text-sm text-richblack-300 line-clamp-2">
          {course.courseDescription}
        </p>

        <div className="flex justify-between items-center">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              course.status === "Published"
                ? "bg-caribbeangreen-400 text-black"
                : "bg-yellow-100 text-black"
            }`}
          >
            {course.status}
          </span>

          <button
            onClick={() =>
              navigate(`/dashboard/edit-course/${course._id}`)
            }
            className="text-yellow-50 text-sm"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  )
}
