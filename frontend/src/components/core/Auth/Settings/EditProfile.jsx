import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { RiDeleteBinLine } from "react-icons/ri"
import { FiUploadCloud } from "react-icons/fi"

import { updateProfile } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/IconBtn"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { register, handleSubmit, formState: { errors } } = useForm()

  const [existingCertificates, setExistingCertificates] = useState(
    user?.additionalDetails?.certificates || []
  )
  const [newCertificateFiles, setNewCertificateFiles] = useState([])
  const [newCertificatePreviews, setNewCertificatePreviews] = useState([])

  const isInstructor = user?.accountType === "Instructor"

  const handleCertificateSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setNewCertificateFiles((prev) => [...prev, ...files])

    const previews = files.map((file) => URL.createObjectURL(file))
    setNewCertificatePreviews((prev) => [...prev, ...previews])

    e.target.value = ""
  }

  const removeExistingCertificate = (index) => {
    setExistingCertificates((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewCertificate = (index) => {
    setNewCertificateFiles((prev) => prev.filter((_, i) => i !== index))
    setNewCertificatePreviews((prev) => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const submitProfileForm = async (data) => {
    try {
      const formData = new FormData()
      formData.append("firstName", data.firstName)
      formData.append("lastName", data.lastName)
      formData.append("dateOfBirth", data.dateOfBirth)
      formData.append("gender", data.gender)
      formData.append("contactNumber", data.contactNumber)
      formData.append("about", data.about)

      if (isInstructor) {
        formData.append("qualifications", data.qualifications || "")
        formData.append("experience", data.experience || "")
        formData.append("existingCertificates", JSON.stringify(existingCertificates))
        newCertificateFiles.forEach((file) => {
          formData.append("certificateImages", file)
        })
      }

      dispatch(updateProfile(token, formData))
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(submitProfileForm)}>
        {/* Profile Information */}
        <div className="my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-6 sm:px-12">
          <h2 className="text-lg font-semibold text-richblack-5">
            Profile Information
          </h2>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="firstName" className="lable-style">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Enter first name"
                className="form-style"
                {...register("firstName", { required: true })}
                defaultValue={user?.firstName}
              />
              {errors.firstName && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  Please enter your first name.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="lastName" className="lable-style">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Enter first name"
                className="form-style"
                {...register("lastName", { required: true })}
                defaultValue={user?.lastName}
              />
              {errors.lastName && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  Please enter your last name.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="dateOfBirth" className="lable-style">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                className="form-style"
                {...register("dateOfBirth", {
                  required: {
                    value: true,
                    message: "Please enter your Date of Birth.",
                  },
                  max: {
                    value: new Date().toISOString().split("T")[0],
                    message: "Date of Birth cannot be in the future.",
                  },
                })}
                defaultValue={user?.additionalDetails?.dateOfBirth}
              />
              {errors.dateOfBirth && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  {errors.dateOfBirth.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="gender" className="lable-style">
                Gender
              </label>
              <select
                type="text"
                name="gender"
                id="gender"
                className="form-style"
                {...register("gender", { required: true })}
                defaultValue={user?.additionalDetails?.gender}
              >
                {genders.map((ele, i) => {
                  return (
                    <option key={i} value={ele}>
                      {ele}
                    </option>
                  )
                })}
              </select>
              {errors.gender && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  Please enter your Date of Birth.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="contactNumber" className="lable-style">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                id="contactNumber"
                placeholder="Enter Contact Number"
                className="form-style"
                {...register("contactNumber", {
                  required: {
                    value: true,
                    message: "Please enter your Contact Number.",
                  },
                  maxLength: { value: 12, message: "Invalid Contact Number" },
                  minLength: { value: 10, message: "Invalid Contact Number" },
                })}
                defaultValue={user?.additionalDetails?.contactNumber}
              />
              {errors.contactNumber && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  {errors.contactNumber.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 lg:w-[48%]">
              <label htmlFor="about" className="lable-style">
                About
              </label>
              <input
                type="text"
                name="about"
                id="about"
                placeholder="Enter Bio Details"
                className="form-style"
                {...register("about", { required: true })}
                defaultValue={user?.additionalDetails?.about}
              />
              {errors.about && (
                <span className="-mt-1 text-[12px] text-yellow-100">
                  Please enter your About.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Qualifications & Experience — chỉ hiện với Instructor */}
        {isInstructor && (
          <div className="my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-6 sm:px-12">
            <h2 className="text-lg font-semibold text-richblack-5">
              Qualifications & Experience
            </h2>

            <div className="flex flex-col gap-2">
              <label htmlFor="qualifications" className="lable-style">
                Qualifications & certifications
              </label>
              <textarea
                id="qualifications"
                placeholder="e.g. B.Sc in Computer Science, AWS Certified Solutions Architect..."
                className="form-style min-h-[100px] resize-none"
                {...register("qualifications")}
                defaultValue={user?.additionalDetails?.qualifications}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="experience" className="lable-style">
                Teaching experience
              </label>
              <textarea
                id="experience"
                placeholder="e.g. 5 years teaching web development at XYZ Academy..."
                className="form-style min-h-[100px] resize-none"
                {...register("experience")}
                defaultValue={user?.additionalDetails?.experience}
              />
            </div>

            {/* Certificate images */}
            <div className="flex flex-col gap-3">
              <label className="lable-style">
                Certificate photos <span className="text-richblack-400 font-normal">(builds trust with students)</span>
              </label>

              <div className="flex flex-wrap gap-4">
                {existingCertificates.map((url, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={url}
                      alt={`Certificate ${index + 1}`}
                      className="h-28 w-28 rounded-lg object-cover border border-richblack-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingCertificate(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-pink-200 text-richblack-900 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RiDeleteBinLine size={12} />
                    </button>
                  </div>
                ))}

                {newCertificatePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={preview}
                      alt={`New certificate ${index + 1}`}
                      className="h-28 w-28 rounded-lg object-cover border-2 border-yellow-50"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-richblack-900/80 px-1.5 py-0.5 text-[10px] text-yellow-50">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewCertificate(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full bg-pink-200 text-richblack-900 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RiDeleteBinLine size={12} />
                    </button>
                  </div>
                ))}

                {/* Nút thêm ảnh */}
                <label
                  htmlFor="certificateUpload"
                  className="h-28 w-28 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-richblack-600 text-richblack-400 cursor-pointer hover:border-yellow-50 hover:text-yellow-50 transition-colors"
                >
                  <FiUploadCloud size={20} />
                  <span className="text-xs">Add photo</span>
                  <input
                    type="file"
                    id="certificateUpload"
                    accept="image/*"
                    multiple
                    onChange={handleCertificateSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-richblack-400">
                Upload clear photos of your diplomas or certifications. JPG or PNG.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => { navigate("/dashboard/my-profile") }}
            className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50"
          >
            Cancel
          </button>
          <IconBtn type="submit" text="Save" />
        </div>

      </form>
    </>
  )
}