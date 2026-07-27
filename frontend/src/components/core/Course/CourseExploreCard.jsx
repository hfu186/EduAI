/* eslint-disable react/prop-types */
import { HiUsers } from "react-icons/hi";
import { ImTree } from "react-icons/im";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ cardData, currentCard, setCurrentCard }) => {
  const navigate = useNavigate();

  const heading =
    cardData?.courseName || cardData?.heading || "Untitled Course";

  const lessons =
    cardData?.courseContent?.length || cardData?.lessonNumber || 0;

  const level = cardData?.level || "Intermediate";

  const isActive = currentCard === heading;

  const handleClick = () => {
    setCurrentCard?.(heading);
    navigate(`/course/${cardData?._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        cursor-pointer rounded-2xl p-6 flex flex-col justify-between
        transition-all duration-300
        ${
          isActive
            ? "bg-richblack-800 border border-caribbeangreen-300/60 shadow-[0_0_25px_rgba(5,251,195,0.08)]"
            : "bg-richblack-800 border border-richblack-600/40 hover:border-richblack-500"
        }
        hover:shadow-lg hover:-translate-y-1
        min-h-[260px]
      `}
    >
      {/* TOP SECTION */}
      <div className="space-y-4">
        {/* Badge + Active */}
        <div className="flex items-center justify-between">
          <span
            className={`
              text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full
              ${
                isActive
                  ? "bg-caribbeangreen-300/10 text-caribbeangreen-300 border border-caribbeangreen-300/30"
                  : "bg-richblack-700 text-richblack-400"
              }
            `}
          >
            {level}
          </span>

          {isActive && (
            <span className="flex items-center gap-1 text-xs text-caribbeangreen-300">
              <FaStar size={10} />
              Active
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`
            text-xl font-semibold leading-snug
            ${isActive ? "text-caribbeangreen-50" : "text-richblack-5"}
          `}
        >
          {heading}
        </h3>
      </div>

      {/* Divider */}
      <div
        className={`h-px my-6 ${
          isActive ? "bg-caribbeangreen-300/20" : "bg-richblack-700"
        }`}
      />

      {/* FOOTER */}
      <div className="flex items-center justify-between">
        <div className="flex gap-5 text-sm">
          <span
            className={`flex items-center gap-1 ${
              isActive ? "text-caribbeangreen-300" : "text-richblack-400"
            }`}
          >
            <HiUsers size={14} />
            {level}
          </span>

          <span
            className={`flex items-center gap-1 ${
              isActive ? "text-caribbeangreen-300" : "text-richblack-400"
            }`}
          >
            <ImTree size={13} />
            {lessons} Sections
          </span>
        </div>

        <div
          className={`
            w-9 h-9 rounded-full flex items-center justify-center
            transition-all duration-200
            ${
              isActive
                ? "bg-caribbeangreen-300 text-richblack-900"
                : "bg-richblack-700 text-richblack-300 group-hover:bg-richblack-600"
            }
          `}
        >
          <FaArrowRight size={12} />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;