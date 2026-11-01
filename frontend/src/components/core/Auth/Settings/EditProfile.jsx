/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { RiDeleteBinLine } from "react-icons/ri"
import { FiUploadCloud } from "react-icons/fi"

import { updateProfile } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/IconBtn"
import useAlertDialog from "@/hooks/useAlertDialog"

const genders = ["Male", "Female", "Non-Binary", "Prefer not to say", "Other"]

function Card({ className = "", children }) {
  return (
    <section
      className={`rounded-2xl border border-richblack-700 bg-richblack-800 ${className}`}
    >
      {children}
    </section>
  )
}

function CardHeader({ title }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-richblack-700 px-6 py-4 sm:px-8">
      <h2 className="text-base font-semibold text-richblack-5">{title}</h2>
    </div>
  )
}

function FormField({ label, htmlFor, error, className = "", children }) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <label htmlFor={htmlFor} className="lable-style">
        {label}
      </label>
      {children}
      {error && (
        <span role="alert" className="-mt-1 text-[12px] text-yellow-100">
          {error}
        </span>
      )}
    </div>
  )
}

function CertificateTile({ src, alt, isNew, onRemove }) {
  return (
    <div
      className={`group relative aspect-[4/3] overflow-hidden rounded-xl border ${
        isNew ? "border-yellow-50" : "border-richblack-600"
      }`}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      {isNew && (
        <span className="absolute bottom-2 left-2 rounded-md bg-richblack-900/80 px-2 py-0.5 text-[11px] font-medium text-yellow-50">
          New
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${alt}`}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-richblack-900/80 text-pink-200 transition-colors hover:bg-pink-200 hover:text-richblack-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-50"
      >
        <RiDeleteBinLine size={14} />
      </button>
    </div>
  )
}

/* ---------- Page ---------- */

export default function EditProfile() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const confirm = useAlertDialog()

  const details = user?.additionalDetails
  const isInstructor = user?.accountType === "Instructor"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
      dateOfBirth: details?.dateOfBirth
        ? String(details.dateOfBirth).slice(0, 10)
        : "",
      gender: details?.gender ?? "",
      about: details?.about ?? "",
      qualifications: details?.qualifications ?? "",
      experience: details?.experience ?? "",
    },
  })


  const [existingCertificates, setExistingCertificates] = useState(
    details?.certificates || []
  )
  const [newCertificateFiles, setNewCertificateFiles] = useState([])
  const [newCertificatePreviews, setNewCertificatePreviews] = useState([])

  const previewsRef = useRef([])
  previewsRef.current = newCertificatePreviews
  useEffect(() => {
    return () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url))
  }, [])

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
    const confirmed = await confirm({
      title: "Save profile changes?",
      description: "Update your profile with the information you entered?",
      confirmText: "Save changes",
    })
    if (!confirmed) return

    try {
      const formData = new FormData()
      formData.append("firstName", data.firstName)
      formData.append("lastName", data.lastName)
      formData.append("dateOfBirth", data.dateOfBirth)
      formData.append("gender", data.gender)
      formData.append("about", data.about || "")
      formData.append("email", data.email)
      if (isInstructor) {
        formData.append("qualifications", data.qualifications || "")
        formData.append("experience", data.experience || "")
        formData.append(
          "existingCertificates",
          JSON.stringify(existingCertificates)
        )
        newCertificateFiles.forEach((file) => {
          formData.append("certificateImages", file)
        })
      }
    await dispatch(updateProfile(token, formData))
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitProfileForm)} className="my-10">
  
      <div className="my-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="About" />
          <div className="px-6 py-6 sm:px-8">
            <FormField label="Introduce yourself" htmlFor="about">
              <textarea
                id="about"
                placeholder="Write a short introduction about yourself..."
                className="form-style min-h-[200px] resize-none"
                {...register("about")}
              />
            </FormField>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Personal details" />
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-6 py-6 sm:grid-cols-2 sm:px-8">
            <FormField
              label="First name"
              htmlFor="firstName"
              error={errors.firstName && "Please enter your first name."}
            >
              <input
                type="text"
                id="firstName"
                placeholder="Enter first name"
                className="form-style"
                {...register("firstName", { required: true })}
              />
            </FormField>

            <FormField
              label="Last name"
              htmlFor="lastName"
              error={errors.lastName && "Please enter your last name."}
            >
              <input
                type="text"
                id="lastName"
                placeholder="Enter last name"
                className="form-style"
                {...register("lastName", { required: true })}
              />
            </FormField>

            <FormField
              label="Email address"
              htmlFor="email"
              error={errors.email && "Please enter a valid email address."}
            >
              <input
                type="email"
                id="email"
                placeholder="Enter email address"
                className="form-style"
                {...register("email", {
                  required: true,
                  pattern: /^\S+@\S+\.\S+$/,
                })}
              />
            </FormField>

            <FormField label="Account type" htmlFor="accountType">
              <input
                type="text"
                id="accountType"
                value={user?.accountType ?? ""}
                disabled
                readOnly
                className="form-style cursor-not-allowed capitalize opacity-60"
              />
            </FormField>

            <FormField
              label="Gender"
              htmlFor="gender"
              error={errors.gender && "Please select your gender."}
            >
              <select
                id="gender"
                className="form-style"
                {...register("gender", { required: true })}
              >
                <option value="" disabled>
                  Select gender
                </option>
                {genders.map((ele) => (
                  <option key={ele} value={ele}>
                    {ele}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Date of birth"
              htmlFor="dateOfBirth"
              error={errors.dateOfBirth?.message}
            >
              <input
                type="date"
                id="dateOfBirth"
                className="form-style"
                {...register("dateOfBirth", {
                  max: {
                    value: new Date().toISOString().split("T")[0],
                    message: "Date of birth cannot be in the future.",
                  },
                })}
              />
            </FormField>
          </div>
        </Card>
      </div>

      {/* ===== Instructor only ===== */}
      {isInstructor && (
        <Card className="mb-6">
          <CardHeader title="Qualifications & Experience" />

          <div className="grid gap-8 px-6 py-6 sm:grid-cols-2 sm:px-8">
            <FormField
              label="Qualifications & certifications"
              htmlFor="qualifications"
            >
              <textarea
                id="qualifications"
                placeholder="e.g. B.Sc in Computer Science, AWS Certified Solutions Architect..."
                className="form-style min-h-[120px] resize-none"
                {...register("qualifications")}
              />
            </FormField>

            <FormField label="Teaching experience" htmlFor="experience">
              <textarea
                id="experience"
                placeholder="e.g. 5 years teaching web development at XYZ Academy..."
                className="form-style min-h-[120px] resize-none"
                {...register("experience")}
              />
            </FormField>
          </div>

          <div className="border-t border-richblack-700 px-6 py-6 sm:px-8">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-sm text-richblack-400">Certificate photos</h3>
              <span className="text-xs text-richblack-500">
                {existingCertificates.length + newCertificatePreviews.length}{" "}
                uploaded
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {existingCertificates.map((url, index) => (
                <CertificateTile
                  key={`existing-${index}`}
                  src={url}
                  alt={`Certificate ${index + 1}`}
                  onRemove={() => removeExistingCertificate(index)}
                />
              ))}

              {newCertificatePreviews.map((preview, index) => (
                <CertificateTile
                  key={`new-${index}`}
                  src={preview}
                  alt={`New certificate ${index + 1}`}
                  isNew
                  onRemove={() => removeNewCertificate(index)}
                />
              ))}

              <label
                htmlFor="certificateUpload"
                className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-richblack-600 text-richblack-400 transition-colors hover:border-yellow-50 hover:text-yellow-50 focus-within:border-yellow-50"
              >
                <FiUploadCloud size={22} />
                <span className="text-xs">Add photo</span>
                <input
                  type="file"
                  id="certificateUpload"
                  accept="image/*"
                  multiple
                  onChange={handleCertificateSelect}
                  className="sr-only"
                />
              </label>
            </div>

            <p className="mt-3 text-xs text-richblack-400">
              Upload clear photos of your diplomas or certifications. JPG or
              PNG.
            </p>
          </div>
        </Card>
      )}

      {/* ===== Actions ===== */}
      <div className="sticky bottom-0 z-10 flex justify-end gap-3 rounded-2xl border border-richblack-700 bg-richblack-800/90 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate("/dashboard/my-profile")}
          className="cursor-pointer rounded-lg bg-richblack-700 px-5 py-2 font-semibold text-richblack-50 transition-colors hover:bg-richblack-600"
        >
          Cancel
        </button>
        <IconBtn type="submit" text="Save changes" />
      </div>
    </form>
  )
}