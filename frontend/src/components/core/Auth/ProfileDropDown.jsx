import { useRef, useState } from "react"
import { AiOutlineCaretDown } from "react-icons/ai"
import { VscDashboard, VscSignOut } from "react-icons/vsc"
import { FiUserCheck } from "react-icons/fi"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { apiConnector } from "../../../services/apiConnector"
import { profileEndpoints } from "../../../services/apis"
import { toast } from "react-hot-toast"

import useOnClickOutside from "../../../hooks/useOnClickOutside"
import { logout } from "../../../services/operations/authAPI"
import Img from './../../common/Img';


export default function ProfileDropdown() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [requestSent, setRequestSent] = useState(user?.instructorRequestStatus === 'pending')
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false))

  if (!user) return null

  const handleRequestInstructor = async () => {
    try {
      const response = await apiConnector("POST", profileEndpoints.REQUEST_INSTRUCTOR_API, null, {
        Authorization: `Bearer ${token}`,
      })

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Không thể gửi yêu cầu")
      }

      toast.success("Yêu cầu trở thành giảng viên đã được gửi")
      setRequestSent(true)
      setOpen(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (

    <button className="relative hidden sm:flex" onClick={() => setOpen(true)}>
      <div className="flex items-center gap-x-1">
        <Img
          src={user?.image}
          alt={`profile-${user?.firstName}`}
          className={'aspect-square w-[30px] rounded-full object-cover'}
        />
        <AiOutlineCaretDown className="text-sm text-richblack-100" />
      </div>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-[118%] right-0 z-[1000] divide-y-[1px] divide-richblack-700 overflow-hidden rounded-md border-[1px] border-richblack-700 bg-richblack-800"
          ref={ref}
        >
          <Link to="/dashboard/my-profile" onClick={() => setOpen(false)}>
            <div className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25">
              <VscDashboard className="text-lg" />
              Dashboard
            </div>
          </Link>

          {user?.accountType !== "Instructor" && (
            <button
              onClick={handleRequestInstructor}
              className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25"
            >
              <FiUserCheck className="text-lg" />
              {requestSent ? "Request sent" : "Ask for instructor"}
            </button>
          )}

          <div
            onClick={() => {
              dispatch(logout(navigate))
              setOpen(false)
            }}
            className="flex w-full items-center gap-x-1 py-[10px] px-[12px] text-sm text-richblack-100 hover:bg-richblack-700 hover:text-richblack-25"
          >
            <VscSignOut className="text-lg" />
            Logout
          </div>
        </div>
      )}
    </button>
  )
}