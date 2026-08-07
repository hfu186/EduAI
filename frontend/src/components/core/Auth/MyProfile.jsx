import { useEffect, useState } from "react"
import { RiEditBoxLine } from "react-icons/ri"
import { HiOutlineDocumentText } from "react-icons/hi"
import { IoClose } from "react-icons/io5"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { formattedDate } from "../../../utils/dateFormatter"
import IconBtn from "../../common/IconBtn"
import Img from './../../common/Img';

export default function MyProfile() {
  const { t } = useTranslation()
  const { user } = useSelector((state) => state.profile)
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null)


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const certificates = user?.additionalDetails?.certificates || []

  return (
    <>
      <h1 className="mb-14 text-3xl font-bold text-richblack-5  text-center sm:text-left mt-10 ">{t('profile.title')}</h1>

      <div className="flex items-center justify-between rounded-2xl border-[1px] border-richblack-700 bg-richblack-800 p-8 px-3 sm:px-12">
        <div className="flex items-center gap-x-4">
          <Img
            src={user?.image}
            alt={`profile-${user?.firstName}`}
            className="aspect-square w-[78px] rounded-full object-cover"
          />
          <div className="space-y-1">
            <p className="text-lg font-semibold text-richblack-5 capitalize">
              {user?.firstName + " " + user?.lastName}
            </p>
            <p className="text-sm text-richblack-300">{user?.email}</p>
          </div>
        </div>

        <IconBtn
          text={t('common.edit')}
          onclick={() => {
            navigate("/dashboard/settings")
          }}
        >
          <RiEditBoxLine />
        </IconBtn>
      </div>

      <div className="my-5 flex flex-col rounded-2xl border-[1px] border-richblack-700 bg-richblack-800 p-8 px-7 sm:px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-richblack-5">{t('profile.about.title')}</p>
          <IconBtn
            text={t('common.edit')}
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>

        <p
          className={`${user?.additionalDetails?.about
            ? "text-richblack-5"
            : "text-richblack-400"
            } text-sm font-medium`}
        >
          {user?.additionalDetails?.about ?? t('profile.about.empty')}
        </p>
      </div>

      <div className="my-10 flex flex-col gap-y-10 rounded-2xl border-[1px] border-richblack-700 bg-richblack-800 p-8 px-7 sm:px-12">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold text-richblack-5">
            {t('profile.personal.title')}
          </p>
          <IconBtn
            text={t('common.edit')}
            onclick={() => {
              navigate("/dashboard/settings")
            }}
          >
            <RiEditBoxLine />
          </IconBtn>
        </div>

        <div className="flex max-w-[500px] justify-between ">
          <div className="flex flex-col gap-y-5">

            <div>
              <p className="mb-2 text-sm text-richblack-600">{t('profile.personal.first_name')}</p>
              <p className="text-sm font-semibold text-richblack-5 capitalize">
                {user?.firstName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">{t('profile.personal.account_type')}</p>
              <p className="text-sm font-semibold text-richblack-5 capitalize">
                {user?.accountType}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">{t('profile.personal.email')}</p>
              <p className="text-sm font-semibold text-richblack-5">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">{t('profile.personal.gender')}</p>
              <p className="text-sm font-semibold text-richblack-5">
                {user?.additionalDetails?.gender ?? t('profile.personal.add_gender')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-y-5">
            <div>
              <p className="mb-2 text-sm text-richblack-600">{t('profile.personal.last_name')}</p>
              <p className="text-sm font-semibold text-richblack-5 capitalize">
                {user?.lastName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">{t('profile.personal.phone')}</p>
              <p className="text-sm font-semibold text-richblack-5">
                {user?.additionalDetails?.contactNumber ?? t('profile.personal.add_phone')}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-richblack-600">{t('profile.personal.dob')}</p>
              <p className="text-sm font-semibold text-richblack-5">
                {formattedDate(user?.additionalDetails?.dateOfBirth) ?? t('profile.personal.add_dob')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Qualifications & Experience — chỉ hiện với Instructor */}
      {user?.accountType === "Instructor" && (
        <div className="my-10 flex flex-col gap-y-8 rounded-2xl border-[1px] border-richblack-700 bg-richblack-800 p-8 px-7 sm:px-12">
          <div className="flex w-full items-center justify-between">
            <p className="text-lg font-semibold text-richblack-5">
              Qualifications & Experience
            </p>
            <IconBtn
              text={t('common.edit')}
              onclick={() => {
                navigate("/dashboard/settings")
              }}
            >
              <RiEditBoxLine />
            </IconBtn>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="mb-2 text-sm text-richblack-600">
                Qualifications & certifications
              </p>
              <p
                className={`whitespace-pre-line text-sm font-medium leading-relaxed ${
                  user?.additionalDetails?.qualifications
                    ? "text-richblack-5"
                    : "text-richblack-400"
                }`}
              >
                {user?.additionalDetails?.qualifications || "No qualifications added yet"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm text-richblack-600">
                Teaching experience
              </p>
              <p
                className={`whitespace-pre-line text-sm font-medium leading-relaxed ${
                  user?.additionalDetails?.experience
                    ? "text-richblack-5"
                    : "text-richblack-400"
                }`}
              >
                {user?.additionalDetails?.experience || "No experience added yet"}
              </p>
            </div>
          </div>

          {/* Certificate photos */}
          <div className="pt-6 border-t border-richblack-700">
            <p className="mb-4 text-sm text-richblack-600">
              Certificate photos
            </p>

            {certificates.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {certificates.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPreviewImage(url)}
                    className="group relative h-28 w-28 overflow-hidden rounded-lg border border-richblack-600 hover:border-yellow-50 transition-colors"
                  >
                    <img
                      src={url}
                      alt={`Certificate ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-richblack-400">
                <HiOutlineDocumentText className="text-base flex-shrink-0" />
                No certificate photos added yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-richblack-800 text-white hover:bg-richblack-700 transition-colors"
          >
            <IoClose size={20} />
          </button>
          <img
            src={previewImage}
            alt="Certificate preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  )
}