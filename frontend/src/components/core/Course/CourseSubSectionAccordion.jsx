/* eslint-disable react/prop-types */

import { Link } from "react-router-dom"
import {

  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineLink,
} from "react-icons/hi"

const ICON_BY_TYPE = {
  slide: HiOutlineDocumentText,
  pdf: HiOutlineDocumentText,
  document: HiOutlineDocumentText,
  quiz: HiOutlineClipboardList,
  link: HiOutlineLink,
}

function CourseSubSectionAccordion({ subSec, courseId}) {
  const Icon = ICON_BY_TYPE[subSec?.type?.toLowerCase()] || HiOutlineDocumentText
  const isSlidePreview = subSec?.type === "slide"

  return (
    <div className="py-2">
      {isSlidePreview ? (
        <Link
          to={`/course-workspace/${courseId}?previewSubSectionId=${subSec._id}`}
          className="flex items-center justify-between gap-3 text-yellow-25 hover:text-yellow-50"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon />
            <span className="truncate">{subSec?.title}</span>
          </span>
          <span className="shrink-0 rounded-full border border-yellow-50/30 px-2 py-0.5 text-[10px] font-semibold">
            Preview: 3 pages
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-2 text-richblack-400">
          <Icon />
          <p>{subSec?.title}</p>
          <span className="ml-auto text-[10px]">Enroll to access</span>
        </div>
      )}
    </div>
  )
}

export default CourseSubSectionAccordion