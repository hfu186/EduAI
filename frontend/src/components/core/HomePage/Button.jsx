/* eslint-disable react/prop-types */

import {Link} from "react-router-dom"

const Button = ({children, active, linkto}) => {
  return (
    <Link to={linkto} className="inline-flex">
        <div className={`inline-flex min-h-[48px] items-center justify-center rounded-lg px-6 py-3 text-center text-sm font-bold shadow-lg transition-all duration-200 hover:-translate-y-0.5
        ${active ? "bg-yellow-50 text-richblack-900 shadow-yellow-50/10 hover:bg-yellow-25":"border border-richblack-600 bg-richblack-800 text-richblack-50 hover:border-richblack-400 hover:bg-richblack-700"}
        `}>
          {children}
        </div>
    </Link>
  )
}

export default Button
