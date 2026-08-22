/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import GetAvgRating from "../../../utils/avgRating"
import RatingStars from "../../common/RatingStars"
import Img from "./../../common/Img"
import { formatVND } from "../../../utils/formatVND"

function Course_Card({ course, Height }) {
  const [avgReviewCount, setAvgReviewCount] = useState(0)

  useEffect(() => {
    const count = GetAvgRating(course?.ratingAndReviews)
    setAvgReviewCount(count)
  }, [course])

  const instructorInitial = course?.instructor?.firstName?.[0]?.toUpperCase() || "?"
  const isFree = course?.price === 0

  return (
    <Link to={`/course/${course?._id}`} className="group block h-full">
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800 shadow-[0_1px_0_rgba(255,255,255,0.03)] transition-all duration-500 hover:-translate-y-2 hover:border-yellow-50/40 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
        
        {/* Thumbnail + toàn bộ overlay nằm trong khung ảnh */}
        <div className={`relative ${Height || "aspect-video"} overflow-hidden bg-richblack-900`}>
          <Img
            src={course?.thumbnail}
            alt={course?.courseName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Gradient nền để chữ luôn dễ đọc */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-richblack-900 via-richblack-900/30 to-transparent" />

          {/* Viền sáng mỏng chạy quanh mép khi hover */}
          <div className="pointer-events-none absolute inset-0 rounded-t-2xl ring-1 ring-inset ring-white/0 transition-all duration-500 group-hover:ring-white/10" />

          {/* Badge giá nổi góc trên phải */}
          <div className="absolute right-3 top-3 z-20">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold shadow-lg backdrop-blur-md ${
                isFree
                  ? "bg-caribbeangreen-100/90 text-richblack-900"
                  : "bg-richblack-900/70 text-yellow-50 ring-1 ring-yellow-50/30"
              }`}
            >
              {isFree ? "Free" : formatVND(course?.price)}
            </span>
          </div>

          {/* Tên khoá học - trượt nhẹ lên khi hover để nhường chỗ cho overlay */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3 pt-8 transition-transform duration-300 ease-out group-hover:-translate-y-[52px]">
            <span className="mb-1.5 block h-[2px] w-8 rounded-full bg-yellow-50 transition-all duration-500 group-hover:w-14" />
            <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-tight text-white drop-shadow-sm">
              {course?.courseName}
            </h3>
          </div>

          {/* Overlay thông tin - nổi đè lên đáy ảnh, bật lên khi hover */}
          <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex flex-col gap-2.5 border-t border-white/10 bg-richblack-900/80 p-3 backdrop-blur-md">
              
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-50 to-yellow-400 text-xs font-bold text-richblack-900">
                  {instructorInitial}
                </div>
                <p className="truncate text-sm text-richblack-100">
                  {course?.instructor?.firstName} {course?.instructor?.lastName}
                </p>
              </div>

              <div className="flex items-center gap-2 border-t border-white/10 pt-2">
                <span className="text-sm font-semibold text-yellow-50">
                  {avgReviewCount?.toFixed?.(1) || avgReviewCount || 0}
                </span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={14} />
                <span className="text-xs text-richblack-300">
                  ({course?.ratingAndReviews?.length || 0} đánh giá)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default Course_Card