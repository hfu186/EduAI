import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { MdNavigateNext } from "react-icons/md"
import { useTranslation } from "react-i18next"
import {
  addCourseDetails,
  editCourseDetails,
  fetchCourseCategories,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse, setStep } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload"

export default function CourseInformationForm() {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { course, editCourse } = useSelector((state) => state.course)

  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [courseCategories, setCourseCategories] = useState([])

  const courseShortDesc = watch("courseShortDesc", "")
  const courseBenefits = watch("courseBenefits", "")

  useEffect(() => {
    const getCategories = async () => {
      setCategoriesLoading(true)
      try {
        const categories = await fetchCourseCategories()
        if (categories.length > 0) setCourseCategories(categories)
      } catch (err) {
        console.error("Category fetch error:", err)
        toast.error(t("courseForm.category_fetch_error", "Failed to load categories"))
      } finally {
        setCategoriesLoading(false)
      }
    }

    if (editCourse && course) {
      setValue("courseTitle", course.courseName)
      setValue("courseShortDesc", course.courseDescription)
      setValue("coursePrice", course.price)
      setValue("courseBenefits", course.whatYouWillLearn)
      setValue("courseCategory", course.category?._id || course.category)
      setValue("courseTags", course.tag)
      setValue("courseLevel", course.level)
      setValue("courseRequirements", course.instructions)
      setValue("courseImage", course.thumbnail)
    }

    getCategories()
  }, [editCourse, course, setValue, t])

  const isFormUpdated = () => {
    const currentValues = getValues()
    return (
      currentValues.courseTitle !== course.courseName ||
      currentValues.courseShortDesc !== course.courseDescription ||
      currentValues.coursePrice !== course.price ||
      currentValues.courseLevel !== course.level ||
      currentValues.courseBenefits !== course.whatYouWillLearn ||
      currentValues.courseCategory !== (course.category?._id || course.category) ||
      currentValues.courseImage !== course.thumbnail
    )
  }

  const onSubmit = async (data) => {
    setLoading(true)

    if (editCourse) {
      if (isFormUpdated()) {
        const formData = new FormData()
        formData.append("courseId", course._id)

        if (data.courseTitle !== course.courseName)
          formData.append("courseName", data.courseTitle)
        if (data.courseShortDesc !== course.courseDescription)
          formData.append("courseDescription", data.courseShortDesc)
        if (data.coursePrice !== course.price)
          formData.append("price", data.coursePrice)
        if (data.courseBenefits !== course.whatYouWillLearn)
          formData.append("whatYouWillLearn", data.courseBenefits)
        if (data.courseCategory !== (course.category?._id || course.category))
          formData.append("category", data.courseCategory)
        if (data.courseLevel !== course.level)
          formData.append("level", data.courseLevel)
        formData.append("tag", JSON.stringify(data.courseTags || []))
        formData.append("instructions", JSON.stringify(data.courseRequirements || []))
        if (data.courseImage !== course.thumbnail) {
          formData.append("thumbnailImage", data.courseImage)
        }

        try {
          const result = await editCourseDetails(formData, token)
          if (result) {
            dispatch(setStep(2))
            dispatch(setCourse(result))
          }
        } catch (err) {
          console.error("Edit course error:", err)
          toast.error(t("courseForm.update_error", "Failed to update course"))
        }
      } else {
        toast.error(t("courseForm.no_changes"))
      }
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("courseName", data.courseTitle)
    formData.append("level", data.courseLevel)
    formData.append("courseDescription", data.courseShortDesc)
    formData.append("price", data.coursePrice)
    formData.append("whatYouWillLearn", data.courseBenefits)
    formData.append("category", data.courseCategory)
    formData.append("status", "Draft")
    formData.append("tag", JSON.stringify(data.courseTags || []))
    formData.append("instructions", JSON.stringify(data.courseRequirements || []))

    if (data.courseImage) {
      formData.append("thumbnailImage", data.courseImage)
    }

    try {
      const result = await addCourseDetails(formData, token)
      if (result) {
        dispatch(setStep(2))
        dispatch(setCourse(result))
      }
    } catch (err) {
      console.error("Add course error:", err)
      toast.error(t("courseForm.create_error", "Failed to create course"))
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-richblack-700 bg-richblack-800 p-5 shadow-sm flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        
        <div className="flex flex-col gap-4 lg:col-span-9">
          {/* Title */}
          <div className="flex flex-col space-y-1">
            <label className="text-[13px] font-medium text-richblack-5" htmlFor="courseTitle">
              {t("courseForm.title")} <sup className="text-pink-200">*</sup>
            </label>
            <input
              id="courseTitle"
              placeholder={t("courseForm.title_placeholder")}
              {...register("courseTitle", { required: true })}
              className={`form-style w-full transition-colors ${
                errors.courseTitle ? "border-pink-300 focus:border-pink-300" : ""
              }`}
            />
            {errors.courseTitle && (
              <span className="ml-1 text-[11px] tracking-wide text-pink-200">{t("courseForm.required")}</span>
            )}
          </div>

          {/* Category & Level */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="flex flex-col space-y-1">
              <label className="text-[13px] font-medium text-richblack-5" htmlFor="courseCategory">
                {t("courseForm.category")} <sup className="text-pink-200">*</sup>
              </label>
              {categoriesLoading ? (
                <div className="h-[40px] w-full animate-pulse rounded-lg bg-richblack-700" />
              ) : (
                <select
                  {...register("courseCategory", { required: true })}
                  id="courseCategory"
                  className={`form-style w-full transition-colors ${
                    errors.courseCategory ? "border-pink-300 focus:border-pink-300" : ""
                  }`}
                  defaultValue=""
                >
                  <option value="" disabled>{t("courseForm.category_placeholder")}</option>
                  {courseCategories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              )}
              {errors.courseCategory && (
                <span className="ml-1 text-[11px] tracking-wide text-pink-200">{t("courseForm.required")}</span>
              )}
            </div>

            {/* Level */}
            <div className="flex flex-col space-y-1">
              <label className="text-[13px] font-medium text-richblack-5" htmlFor="courseLevel">
                {t("courseForm.level")} <sup className="text-pink-200">*</sup>
              </label>
              <select
                {...register("courseLevel", { required: true })}
                id="courseLevel"
                className={`form-style w-full transition-colors ${
                  errors.courseLevel ? "border-pink-300 focus:border-pink-300" : ""
                }`}
                defaultValue=""
              >
                <option value="" disabled>{t("courseForm.level_placeholder")}</option>
                <option value="Beginner">{t("courseForm.level_beginner")}</option>
                <option value="Intermediate">{t("courseForm.level_intermediate")}</option>
                <option value="Advanced">{t("courseForm.level_advanced")}</option>
              </select>
              {errors.courseLevel && (
                <span className="ml-1 text-[11px] tracking-wide text-pink-200">{t("courseForm.required")}</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-richblack-5" htmlFor="courseShortDesc">
                {t("courseForm.description")} <sup className="text-pink-200">*</sup>
              </label>
              <span className="text-[11px] text-richblack-400">{courseShortDesc?.length || 0} chars</span>
            </div>
            <textarea
              id="courseShortDesc"
              placeholder={t("courseForm.description_placeholder")}
              {...register("courseShortDesc", { required: true })}
              className={`form-style h-[100px] w-full resize-none transition-colors ${
                errors.courseShortDesc ? "border-pink-300 focus:border-pink-300" : ""
              }`}
            />
            {errors.courseShortDesc && (
              <span className="ml-1 text-[11px] tracking-wide text-pink-200">{t("courseForm.required")}</span>
            )}
          </div>

          {/* Benefits */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-richblack-5" htmlFor="courseBenefits">
                {t("courseForm.benefits")} <sup className="text-pink-200">*</sup>
              </label>
              <span className="text-[11px] text-richblack-400">{courseBenefits?.length || 0} chars</span>
            </div>
            <textarea
              id="courseBenefits"
              placeholder={t("courseForm.benefits_placeholder")}
              {...register("courseBenefits", { required: true })}
              className={`form-style h-[100px] w-full resize-none transition-colors ${
                errors.courseBenefits ? "border-pink-300 focus:border-pink-300" : ""
              }`}
            />
            {errors.courseBenefits && (
              <span className="ml-1 text-[11px] tracking-wide text-pink-200">{t("courseForm.required")}</span>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (5/12): Thiết lập Giá & Upload Thumbnail */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {/* Price */}
          <div className="flex flex-col space-y-1">
            <label className="text-[13px] font-medium text-richblack-5" htmlFor="coursePrice">
              {t("courseForm.price")} (VND) <sup className="text-pink-200">*</sup>
            </label>
            <input
              id="coursePrice"
              type="number"
              min="0"
              step="0.01"
              placeholder={t("courseForm.price_placeholder")}
              {...register("coursePrice", { required: true, valueAsNumber: true, min: 0 })}
              className={`form-style w-full transition-colors ${
                errors.coursePrice ? "border-pink-300 focus:border-pink-300" : ""
              }`}
            />
            {errors.coursePrice && (
              <span className="ml-1 text-[11px] tracking-wide text-pink-200">{t("courseForm.required")}</span>
            )}
          </div>

          {/* Thumbnail Box - Nằm trọn vẹn ở cột bên phải */}
          <div className="w-full">
            <Upload
              name="courseImage"
              label={t("courseForm.thumbnail")}
              register={register}
              setValue={setValue}
              errors={errors}
              editData={editCourse ? course?.thumbnail : null}
            />
          </div>
        </div>

      </div>

      {/* Action Buttons Footer */}
      <div className="mt-2 flex flex-col-reverse gap-3 border-t border-richblack-700 pt-4 sm:flex-row sm:justify-end sm:gap-x-3">
        {editCourse && (
          <button
            type="button"
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            className="flex cursor-pointer items-center justify-center gap-x-2 rounded-md bg-richblack-300 py-1.5 px-4 text-[13px] font-semibold text-richblack-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("courseForm.continue_without_saving")}
          </button>
        )}
        <IconBtn
          disabled={loading || categoriesLoading}
          text={
            loading
              ? t("courseForm.saving", "Saving...")
              : !editCourse
              ? t("courseForm.next")
              : t("courseForm.save_changes")
          }
        >
          <MdNavigateNext className="text-lg" />
        </IconBtn>
      </div>
    </form>
  )
}