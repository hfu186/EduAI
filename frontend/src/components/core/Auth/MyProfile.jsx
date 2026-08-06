import { useEffect } from "react"
import { RiEditBoxLine } from "react-icons/ri"
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


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

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

      <div className="my-10 flex flex-col gap-y-10 rounded-2xl border-[1px] border-richblack-700 bg-richblack-800 p-8 px-7 sm:px-12">
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
    </>
  )
}