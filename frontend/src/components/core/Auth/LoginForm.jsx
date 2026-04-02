import { useState } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../../services/operations/authAPI"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { FaUserCircle } from "react-icons/fa"

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    dispatch(login(email, password, navigate))
  }

  return (
    <div className="w-full flex items-center justify-center py-12 px-4 mt-6">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-10 items-center">
        
        {/* LEFT SIDE: FORM */}
        <div className="glass-bg rounded-2xl p-10 lg:p-12 shadow-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-4xl font-bold gradient_color mb-2">
                Welcome Back
              </h2>
              <p className="text-richblack-200 text-sm">Login to continue your learning journey</p>
            </div>

            <form onSubmit={handleOnSubmit} className="space-y-6 mt-8">
              {/* Email */}
              <div>
                <label className="lable-style">
                  Email Address <span className="text-pink-400">*</span>
                </label>
                <div className="relative mt-2">
                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleOnChange}
                    placeholder="Enter email address"
                    className="form-style w-full text-base"
                    style={{ paddingTop: '14px', paddingBottom: '14px', paddingLeft: '16px', paddingRight: '16px' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="lable-style">
                  Password <span className="text-pink-400">*</span>
                </label>
                <div className="relative mt-2">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handleOnChange}
                    placeholder="Enter password"
                    className="form-style w-full text-base"
                    style={{ paddingTop: '14px', paddingBottom: '14px', paddingLeft: '16px', paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-richblack-200 transition-colors"
                  >
                    {showPassword ? (
                      <AiOutlineEye className="w-5 h-5" />
                    ) : (
                      <AiOutlineEyeInvisible className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-caribbeangreen-200 hover:text-caribbeangreen-100 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-richblack-900 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Login
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-richblack-200">
                  Don't have an account?{" "}
                  <Link 
                    to="/signup" 
                    className="font-semibold gradient_color hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: DECORATION */}
        <div className="hidden lg:block">
          <div className="glass-bg rounded-2xl p-10 shadow-2xl">
            <div className="space-y-6">
              {/* Icon */}
              <div className="inline-block">
                <div className="bg-gradient-to-r from-[#1FA2FF] to-[#12D8FA] p-4 rounded-2xl shadow-lg">
                  <FaUserCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-5xl font-bold text-richblack-5 leading-tight">
                Continue Your <span className="gradient_color">Journey</span>
              </h3>
              
              {/* Description */}
              <p className="text-lg text-richblack-200 leading-relaxed">
                Access thousands of courses and enhance your skills.
              </p>
              <p className="text-lg gradient_color font-semibold">
                Your learning dashboard awaits!
              </p>

              {/* Features List */}
              <div className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#1FA2FF] to-[#12D8FA] mt-2"></div>
                  <div>
                    <h4 className="text-richblack-5 font-semibold">Track Your Progress</h4>
                    <p className="text-sm text-richblack-300">Monitor your learning journey and achievements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#12D8FA] to-[#A6FFCB] mt-2"></div>
                  <div>
                    <h4 className="text-richblack-5 font-semibold">Access Anywhere</h4>
                    <p className="text-sm text-richblack-300">Learn on any device, anytime, anywhere</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#A6FFCB] to-[#1FA2FF] mt-2"></div>
                  <div>
                    <h4 className="text-richblack-5 font-semibold">Expert Instructors</h4>
                    <p className="text-sm text-richblack-300">Learn from industry professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LoginForm