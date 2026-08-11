import { FaStar } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import ReactStars from "react-rating-stars-component";
import { useDispatch, useSelector } from "react-redux";
import GetAvgRating from "../../../../utils/avgRating";
import { removeFromCart } from "../../../../slices/cartSlice";
import Img from "./../../../common/Img";
import { formatVND } from "../../../../utils/formatVND";
import { useTranslation } from "react-i18next";

export default function RenderCartCourses() {
  const { cart } = useSelector((state) => state.cart);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-richblack-300">
        <p className="text-lg">{t("cart.empty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {cart.map((course, indx) => {
        const avgRating = GetAvgRating(course?.ratingAndReviews) || 0;

        return (
          <div
            key={course._id}
            className={`group relative flex w-full flex-col gap-5 rounded-xl border border-richblack-700 bg-richblack-800/40 p-4 transition-all duration-200 hover:border-richblack-600 hover:bg-richblack-800/70 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5 ${
              indx !== cart.length - 1
                ? "border-b border-b-richblack-700"
                : ""
            }`}
          >
            {/* Left: Thumbnail + Info */}
            <div className="flex flex-1 gap-4 sm:gap-5">
              {/* Thumbnail */}
              <div className="shrink-0 overflow-hidden rounded-lg">
                <Img
                  src={course?.thumbnail}
                  alt={course?.courseName}
                  className="h-[120px] w-[180px] rounded-lg object-cover transition-transform duration-300 group-hover:scale-105 sm:h-[140px] sm:w-[210px]"
                />
              </div>

              {/* Course Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5">
                <div className="space-y-1.5">
                  <h3 className="line-clamp-2 text-base font-semibold text-richblack-5 sm:text-lg">
                    {course?.courseName}
                  </h3>

                  <p className="text-sm text-yellow-100">
                    <span className="font-semibold">
                      {t("pages.course_details.instructor")}:
                    </span>{" "}
                    {course?.instructor?.firstName}{" "}
                    {course?.instructor?.lastName}
                  </p>

                  <p className="text-sm text-richblack-300">
                    {course?.courseDescription?.substring(0, 50)}...
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-yellow-100">
                    {avgRating.toFixed(1)}
                  </span>

                  <ReactStars
                    count={5}
                    value={avgRating}
                    size={18}
                    edit={false}
                    activeColor="#ffd700"
                    emptyIcon={<FaStar />}
                    fullIcon={<FaStar />}
                  />

                  <span className="text-xs text-richblack-400">
                    {t("cart.reviews_count", {
                      count: course?.ratingAndReviews?.length || 0,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-row items-end gap-4 border-t border-richblack-700 pt-4 sm:flex-col sm:items-end sm:justify-start sm:gap-3 sm:border-t-0 sm:pt-0">
              <p className="text-xl font-bold text-yellow-100 sm:text-xl">
                {course?.price === 0 || course?.price === "0"
                  ? t("cart.free")
                  : formatVND(course.price)}
              </p>
            </div>

            {/* Remove */}
            <div className="absolute bottom-4 right-4 flex flex-col items-end gap-3">
              <button
                onClick={() => dispatch(removeFromCart(course._id))}
                className="flex items-center gap-x-1.5 rounded-lg border border-richblack-600 bg-richblack-700 px-3.5 py-2.5 text-sm font-medium text-pink-200 transition-all duration-200 hover:border-pink-700 hover:bg-pink-900/30 hover:text-pink-100 active:scale-95"
              >
                <RiDeleteBin6Line size={16} />
                <span>{t("cart.remove")}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
