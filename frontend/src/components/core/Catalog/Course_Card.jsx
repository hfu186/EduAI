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
    <div className='hover:scale-[1.03] transition-all duration-200 z-50'>
      <Link to={`/course/${course?._id}`}>
        <div className="w-full">
          <div className="rounded-l overflow-hidden aspect-video">
            <Img
              src={course?.thumbnail}
              alt="course thumnail"
              className={`${Height} w-full object-cover`}
            />
          </div>

          <div className="flex flex-col gap-2 px-1 py-3 min-h-[130px]">
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

            <p className="text-xl text-richblack-5 font-bold">
              {formatPrice(course?.price)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Course_Card