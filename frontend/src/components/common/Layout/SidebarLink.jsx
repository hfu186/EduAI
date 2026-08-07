/* eslint-disable react/prop-types */
import * as Icons from "react-icons/vsc"
import { useDispatch, useSelector } from "react-redux"
import { NavLink, matchPath, useLocation } from "react-router-dom"

import { resetCourseState } from "../../../slices/courseSlice"
import { setOpenSideMenu } from "../../../slices/sidebarSlice"
import { clearChatUnread } from "../../../slices/messageSlice"

export default function SidebarLink({ link, iconName }) {
  const Icon = Icons[iconName]
  const location = useLocation()
  const dispatch = useDispatch()

  const { openSideMenu, screenSize } = useSelector(state => state.sidebar)
  const { unreadCount } = useSelector((state) => state.messages)

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  const handleClick = () => {
    dispatch(resetCourseState())
    if (link.path === "/chat") {
      dispatch(clearChatUnread("all"))
    }
    if (openSideMenu && screenSize <= 640) dispatch(setOpenSideMenu(false))
  }

  return (
    <NavLink
      to={link.path}
      onClick={handleClick}
      className={`relative px-8 py-2 text-sm font-medium ${matchRoute(link.path)
        ? "bg-yellow-800 text-yellow-50"
        : "text-richblack-300 hover:bg-richblack-700 duration-200"
        } transition-all `}
    >
      <span
        className={`absolute left-0 top-0 h-full w-[0.15rem] bg-yellow-50 ${matchRoute(link.path) ? "opacity-100" : "opacity-0"
          }`}
      >
      </span>

      <div className="flex items-center gap-x-2">
        <Icon className="text-lg" />
        <span>{link.name}</span>
        {link.path === "/chat" && unreadCount > 0 && (
          <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-center text-[11px] font-bold text-white shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

    </NavLink>
  )
}