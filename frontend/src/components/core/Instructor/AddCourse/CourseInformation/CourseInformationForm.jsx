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
    formState: { errors },
  } = useForm()

  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { course, editCourse } = useSelector((state) => state.course)
  const [loading, setLoading] = useState(false)
  const [courseCategories, setCourseCategories] = useState([])

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      const categories = await fetchCourseCategories()
      if (categories.length > 0) {
        setCourseCategories(categories)
      }
      setLoading(false)
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
  }, [editCourse, course, setValue])

  const isFormUpdated = () => {
    const currentValues = getValues()
    if (
      currentValues.courseTitle !== course.courseName ||
      currentValues.courseShortDesc !== course.courseDescription ||
      currentValues.coursePrice !== course.price ||
      currentValues.courseLevel !== course.level ||
      currentValues.courseBenefits !== course.whatYouWillLearn ||
      currentValues.courseCategory !== (course.category?._id || course.category) ||
      currentValues.courseImage !== course.thumbnail
    )
      return true
    return false
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
        const result = await editCourseDetails(formData, token)
        if (result) {
          dispatch(setStep(2))
          dispatch(setCourse(result))
        }
      } else {
        toast.error(t("courseForm.no_changes"))
      }
      setLoading(false)
      return
    }

    // Create new course
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

    const result = await addCourseDetails(formData, token)
    if (result) {
      dispatch(setStep(2))
      dispatch(setCourse(result))
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-md border border-richblack-700 bg-richblack-800 p-6 space-y-8"
    >
      {/* Title */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseTitle">
          {t(`courseForm.title`)} <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="courseTitle"
          placeholder={t("courseForm.title_placeholder")}
          {...register("courseTitle", { required: true })}
          className="w-full form-style"
        />
        {errors.courseTitle && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            {t("courseForm.required")}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseShortDesc">
          {t("courseForm.description")} <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseShortDesc"
          placeholder={t("courseForm.description_placeholder")}
          {...register("courseShortDesc", { required: true })}
          className="form-style min-h-[120px] w-full"
        />
        {errors.courseShortDesc && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            {t("courseForm.required")}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="coursePrice">
          {t("courseForm.price")} <sup className="text-pink-200">*</sup>
        </label>
        <input
          id="coursePrice"
          placeholder={t("courseForm.price_placeholder")}
          {...register("coursePrice", { required: true, valueAsNumber: true })}
          className="form-style w-full"
        />
        {errors.coursePrice && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            {t("courseForm.required")}
          </span>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseCategory">
          {t("courseForm.category")} <sup className="text-pink-200">*</sup>
        </label>
        <select
          {...register("courseCategory", { required: true })}
          id="courseCategory"
          className="form-style w-full"
          defaultValue=""
        >
          <option value="" disabled>
            {t("courseForm.category_placeholder")}
          </option>
          {!loading &&
            courseCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
        </select>
        {errors.courseCategory && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            {t("courseForm.required")}
          </span>
        )}
      </div>

      {/* Level */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseLevel">
          {t("courseForm.level")} <sup className="text-pink-200">*</sup>
        </label>
        <select
          {...register("courseLevel", { required: true })}
          id="courseLevel"
          className="form-style w-full"
          defaultValue=""
        >
          <option value="" disabled>
            {t("courseForm.level_placeholder")}
          </option>
          <option value="Beginner">{t("courseForm.level_beginner")}</option>
          <option value="Intermediate">{t("courseForm.level_intermediate")}</option>
          <option value="Advanced">{t("courseForm.level_advanced")}</option>
        </select>
        {errors.courseLevel && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            {t("courseForm.required")}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <Upload
        name="courseImage"
        label={t("courseForm.thumbnail")}
        register={register}
        setValue={setValue}
        errors={errors}
        editData={editCourse ? course?.thumbnail : null}
      />

      {/* Benefits */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseBenefits">
          {t("courseForm.benefits")} <sup className="text-pink-200">*</sup>
        </label>
        <textarea
          id="courseBenefits"
          placeholder={t("courseForm.benefits_placeholder")}
          {...register("courseBenefits", { required: true })}
          className="form-style resize-x-none min-h-[130px] w-full"
        />
        {errors.courseBenefits && (
          <span className="ml-2 text-xs tracking-wide text-pink-200">
            {t("courseForm.required")}
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-x-2">
        {editCourse && (
          <button
            type="button"
            onClick={() => dispatch(setStep(2))}
            disabled={loading}
            className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900"
          >
            {t("courseForm.continue_without_saving")}
          </button>
        )}
        <IconBtn
          disabled={loading}
          text={!editCourse ? t("courseForm.next") : t("courseForm.save_changes")}
        >
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  )
}