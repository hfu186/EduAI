import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { IoAddCircleOutline } from "react-icons/io5"
import { MdNavigateNext, MdOutlineArrowBack } from "react-icons/md"
import { useDispatch, useSelector } from "react-redux"

import {
  createSection,
  updateSection,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse, setEditCourse, setStep } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import NestedView from "../../InstructorCourses/NestedView"

export default function CourseBuilderForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  const { course } = useSelector((state) => state.course)
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [editSectionName, setEditSectionName] = useState(null)

  const dispatch = useDispatch()

  const onSubmit = async (data) => {
    setLoading(true)
    let result

    if (editSectionName) {
      result = await updateSection(
        {
          sectionName: data.sectionName,
          sectionId: editSectionName,
          courseId: course._id,
        },
        token
      )
    } else {
      result = await createSection(
        {
          sectionName: data.sectionName,
          courseId: course._id,
        },
        token
      )
    }

    if (result) {
      dispatch(setCourse(result))
      setEditSectionName(null)
      setValue("sectionName", "")
    }
    setLoading(false)
  }

  const cancelEdit = () => {
    setEditSectionName(null)
    setValue("sectionName", "")
  }

  const handleChangeEditSectionName = (sectionId, sectionName) => {
    if (editSectionName === sectionId) {
      cancelEdit()
      return
    }
    setEditSectionName(sectionId)
    setValue("sectionName", sectionName)
  }

  const goBack = () => {
    dispatch(setStep(1))
    dispatch(setEditCourse(true))
  }

  const goToNext = () => {
    if (course.courseContent.length === 0) {
      toast.error("Please add at least one section")
      return
    }
    if (course.courseContent.some((section) => section.subSection.length === 0)) {
      toast.error("Please add at least one lecture in each section")
      return
    }
    dispatch(setStep(3))
  }

  return (
    <div className="space-y-5 rounded-xl border border-richblack-700 bg-richblack-800 p-5 md:p-6">
      {/* Header - gọn hơn */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-50/90">
              Step 2 of 3
            </span>
          </div>
          <h2 className="text-xl font-semibold text-richblack-5">Course Builder</h2>
          <p className="mt-0.5 text-sm text-richblack-400">
            Add sections and lectures to structure your course.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-richblack-600 bg-richblack-900/50 p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:gap-3">
            <div className="flex-1">
              <label
                className="mb-1.5 block text-sm text-richblack-5"
                htmlFor="sectionName"
              >
                {editSectionName ? "Edit Section Name" : "Section Name"}{" "}
                <sup className="text-pink-200">*</sup>
              </label>
              <input
                id="sectionName"
                disabled={loading}
                placeholder="e.g. Introduction to React Hooks"
                {...register("sectionName", { required: true })}
                className="form-style w-full !py-2.5"
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <IconBtn
                type="submit"
                disabled={loading}
                text={editSectionName ? "Save" : "Create Section"}
                outline={true}
                customClasses="!py-2.5"
              >
                <IoAddCircleOutline size={18} className="text-yellow-50" />
              </IconBtn>

              {editSectionName && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-md px-3 py-2 text-sm text-richblack-300 hover:bg-richblack-700 hover:text-richblack-5"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {errors.sectionName && (
            <span className="text-xs text-pink-200">Section name is required</span>
          )}
        </form>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-richblack-5">Course Content</h3>
          {course?.courseContent?.length > 0 && (
            <span className="rounded-full bg-richblack-700 px-2.5 py-0.5 text-xs text-richblack-300">
              {course.courseContent.length} section
              {course.courseContent.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {course?.courseContent?.length > 0 ? (
          <div className="rounded-lg border border-richblack-700 bg-richblack-900/30 overflow-hidden">
            <NestedView handleChangeEditSectionName={handleChangeEditSectionName} />
          </div>
        ) : (
          <div className="flex items-center  rounded-lg border border-dashed border-richblack-600 bg-richblack-900/20 px-4 py-3">
            <div className="flex shrink-0 items-center justify-center rounded-full bg-richblack-700">
              <IoAddCircleOutline size={18} className="text-richblack-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-richblack-5">No sections yet</p>
              <p className="text-xs text-richblack-400">
                Create a section above to start building content.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          type="button"
          className="flex items-center gap-2 rounded-lg bg-richblack-700 px-4 py-2 text-sm font-bold text-richblack-5 transition-colors hover:bg-richblack-600"
        >
          <MdOutlineArrowBack size={16} />
          Back
        </button>

        <IconBtn disabled={loading} text="Next" onclick={goToNext}           className="flex items-center gap-2 rounded-lg bg-richblack-700 px-4 py-2 text-sm font-bold text-richblack-5 transition-colors hover:bg-richblack-600"
>
          <MdNavigateNext size={18} />
        </IconBtn>
      </div>
    </div>
  )
}