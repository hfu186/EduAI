import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { MdNavigateNext } from "react-icons/md"

import {
  addCourseDetails,
  editCourseDetails,
  fetchCourseCategories,
} from "../../../../../services/operations/courseDetailsAPI"
import { setCourse, setStep } from "../../../../../slices/courseSlice"
import IconBtn from "../../../../common/IconBtn"
import Upload from "../Upload" //

export default function CourseInformationForm() {
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
      setValue("courseCategory", course.category._id || course.category) 
      setValue("courseTags", course.tag) 
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
      currentValues.courseBenefits !== course.whatYouWillLearn ||
      currentValues.courseCategory !== course.category._id ||
      currentValues.courseImage !== course.thumbnail
      // Thêm so sánh cho Tags và Requirements nếu cần
    )
      return true
    else return false
  }

  const onSubmit = async (data) => {
  setLoading(true)

  if (editCourse) {
    if (isFormUpdated()) {
      const formData = new FormData()
      formData.append("courseId", course._id)

      if (data.courseTitle !== course.courseName) formData.append("courseName", data.courseTitle)
      if (data.courseShortDesc !== course.courseDescription) formData.append("courseDescription", data.courseShortDesc)
      if (data.coursePrice !== course.price) formData.append("price", data.coursePrice)
      if (data.courseBenefits !== course.whatYouWillLearn) formData.append("whatYouWillLearn", data.courseBenefits)
      if (data.courseCategory !== course.category._id) formData.append("category", data.courseCategory)
      
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
      toast.error("No changes made to the form")
    }
    setLoading(false)
    return
  }

  const formData = new FormData()
  formData.append("courseName", data.courseTitle)
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
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-md border-richblack-700 bg-richblack-800 p-6 space-y-8">
      {/* Title */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseTitle">Course Title <sup className="text-pink-200">*</sup></label>
        <input id="courseTitle" placeholder="Enter Course Title" {...register("courseTitle", { required: true })} className="w-full form-style" />
        {errors.courseTitle && <span className="ml-2 text-xs tracking-wide text-pink-200">Required</span>}
      </div>

     

      {/* Price */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="coursePrice">Price <sup className="text-pink-200">*</sup></label>
        <input id="coursePrice" placeholder="Enter Price" {...register("coursePrice", { required: true, valueAsNumber: true })} className="form-style w-full" />
        {errors.coursePrice && <span className="ml-2 text-xs tracking-wide text-pink-200">Required</span>}
      </div>

      {/* Category */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseCategory">Category <sup className="text-pink-200">*</sup></label>
        <select {...register("courseCategory", { required: true })} id="courseCategory" className="form-style w-full">
          <option value="" disabled>Choose a Category</option>
          {!loading && courseCategories.map((category, index) => (
            <option key={index} value={category?._id}>{category?.name}</option>
          ))}
        </select>
        {errors.courseCategory && <span className="ml-2 text-xs tracking-wide text-pink-200">Required</span>}
      </div>

       <Upload
        name="courseImage xl"
        label="Course Thumbnail"
        register={register}
        setValue={setValue}
        errors={errors}
        editData={editCourse ? course?.thumbnail : null} 
      />

      {/* Benefits */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-richblack-5" htmlFor="courseBenefits">Benefits of the course <sup className="text-pink-200">*</sup></label>
        <textarea id="courseBenefits" placeholder="Enter benefits" {...register("courseBenefits", { required: true })} className="form-style resize-x-none min-h-[130px] w-full" />
        {errors.courseBenefits && <span className="ml-2 text-xs tracking-wide text-pink-200">Required</span>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-x-2">
        {editCourse && (
          <button onClick={() => dispatch(setStep(2))} disabled={loading} className="flex cursor-pointer items-center gap-x-2 rounded-md bg-richblack-300 py-[8px] px-[20px] font-semibold text-richblack-900">
            Continue Without Saving
          </button>
        )}
        <IconBtn disabled={loading} text={!editCourse ? "Next" : "Save Changes"}>
          <MdNavigateNext />
        </IconBtn>
      </div>
    </form>
  )
}