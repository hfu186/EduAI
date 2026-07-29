/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import GetAvgRating from "../../../utils/avgRating"
import RatingStars from "../../common/RatingStars"
import Img from './../../common/Img';

function Course_Card({ course, Height }) {

  const [avgReviewCount, setAvgReviewCount] = useState(0)

  useEffect(() => {
    const count = GetAvgRating(course?.ratingAndReviews)
    setAvgReviewCount(count)
  }, [course])

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  return (
    <div className='z-50 transition-all duration-200 hover:-translate-y-1'>
      <Link to={`/course/${course?._id}`}>
        <div className="w-full overflow-hidden rounded-lg border border-richblack-700 bg-richblack-800 shadow-xl transition-colors hover:border-richblack-500">
          <div className="overflow-hidden aspect-video bg-richblack-900">
            <Img
              src={course?.thumbnail}
              alt="course thumbnail"
              className={`${Height} w-full object-cover`}
            />
          </div>

          <div className="flex min-h-[150px] flex-col gap-2 px-4 py-4">
            <p className="text-xl text-richblack-5 font-bold line-clamp-2 min-h-[3.5rem]">
              {course?.courseName}
            </p>

            <p className="text-sm text-richblack-50 truncate">
              {course?.instructor?.firstName} {course?.instructor?.lastName}
            </p>

            <div className="flex items-center gap-2">
              <span className="text-yellow-5">{avgReviewCount || 0}</span>
              <RatingStars Review_Count={avgReviewCount} Star_Size={14} />
              <span className="text-richblack-400 text-sm whitespace-nowrap">
                {course?.ratingAndReviews?.length} Ratings
              </span>
            </div>

            <p className="mt-auto text-xl text-richblack-5 font-bold">
              {formatPrice(course?.price)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Course_Card
