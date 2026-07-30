/* eslint-disable react/prop-types */
import copy from "copy-to-clipboard"
import { toast } from "react-hot-toast"
import { BsFillCaretRightFill } from "react-icons/bs"
import { FaShareSquare } from "react-icons/fa"
import Img from "../../common/Img";
import { formatVND } from "../../../utils/formatVND" ;
function CourseDetailsCard({ course, handleBuyCourse, handleAddToCart }) {
  if (!course) return null
  const { thumbnail, price, courseName, instructions = [] } = course
  const handleShare = () => {
    copy(window.location.href)
    toast.success("Link copied")
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-richblack-700 p-4 text-richblack-5">
      <Img
        src={thumbnail}
        alt={courseName}
        className="h-[200px] w-full rounded-xl object-cover"
      />

      <p className="text-3xl font-semibold text-yellow-100">
        {formatVND(price)}
      </p>

      <button className="yellowButton w-full" onClick={handleBuyCourse}>
        {formatVND(price) === 0 ? "Enroll Free" : "Buy Now"}
      </button>
      <button className="blackButton w-full" onClick={handleAddToCart}>
        Add to Cart
      </button>

      {instructions.length > 0 && (
        <div className="mt-4">
          <p className="text-lg font-semibold mb-2">Course Requirements</p>
          {instructions.map((item, i) => (
            <p key={i} className="flex gap-2 text-sm text-caribbeangreen-100">
              <BsFillCaretRightFill />
              {item}
            </p>
          ))}
        </div>
      )}

      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-2 pt-4 text-yellow-100"
      >
        <FaShareSquare /> Share
      </button>
    </div>
  )
}

export default CourseDetailsCard
