import { useState } from "react"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../../../services/operations/authAPI"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { FaUserCircle, FaLock, FaEnvelope } from "react-icons/fa"
import { HiSparkles } from "react-icons/hi2"
import { useTranslation } from "react-i18next"

function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { email, password } = formData
  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    dispatch(login(email, password, navigate)).finally(() => {
      setIsLoading(false)
    })
  }

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-10 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#1FA2FF]/25 to-[#12D8FA]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-[#A6FFCB]/20 to-[#12D8FA]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#1FA2FF]/8 via-transparent to-[#A6FFCB]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* ========== LEFT: FORM ========== */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-richblack-900/70 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/40">
            {/* subtle top shine */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1FA2FF] to-[#12D8FA] shadow-lg shadow-[#1FA2FF]/30">
                  <FaUserCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold gradient_color tracking-tight">
                    {t("auth.login.welcome")}
                  </h2>
                  <p className="mt-1.5 text-richblack-300 text-sm">
                    {t("auth.login.subtitle")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleOnSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-richblack-200">
                    <FaEnvelope className="w-3.5 h-3.5 text-richblack-400" />
                    {t("auth.label.email")}
                    <span className="text-pink-400">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleOnChange}
                    placeholder={t("auth.placeholder.email")}
                    className="w-full rounded-xl border border-richblack-600 bg-richblack-800/60 px-4 py-3 text-sm text-richblack-5 placeholder:text-richblack-400
                               focus:border-[#12D8FA]/60 focus:ring-2 focus:ring-[#12D8FA]/25 outline-none transition-all duration-200"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-sm font-medium text-richblack-200">
                    <FaLock className="w-3.5 h-3.5 text-richblack-400" />
                    {t("auth.label.password")}
                    <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={handleOnChange}
                      placeholder={t("auth.placeholder.password")}
                      className="w-full rounded-xl border border-richblack-600 bg-richblack-800/60 px-4 py-3 pr-11 text-sm text-richblack-5 placeholder:text-richblack-400
                                 focus:border-[#12D8FA]/60 focus:ring-2 focus:ring-[#12D8FA]/25 outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-[#12D8FA] transition-colors"
                    >
                      {showPassword ? (
                        <AiOutlineEye className="w-5 h-5" />
                      ) : (
                        <AiOutlineEyeInvisible className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="flex justify-end -mt-1">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-caribbeangreen-200 hover:text-caribbeangreen-100 hover:underline underline-offset-2 transition-colors"
                  >
                    {t("auth.forgot_password")}
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] py-3.5 text-sm font-bold text-richblack-900
                             shadow-lg shadow-[#12D8FA]/25 hover:shadow-[#12D8FA]/40
                             transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300
                             disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 text-richblack-900"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {t("auth.button.logging_in")}
                      </>
                    ) : (
                      t("auth.button.login")
                    )}
                  </span>
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </button>

                {/* Divider */}
                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-richblack-600" />
                  <span className="mx-4 text-[11px] uppercase tracking-widest text-richblack-400">
                    {t("auth.divider.or")}
                  </span>
                  <div className="flex-grow border-t border-richblack-600" />
                </div>

                {/* Sign up link */}
                <p className="text-center text-sm text-richblack-300">
                  {t("auth.signup.prompt")}{" "}
                  <Link
                    to="/signup"
                    className="font-semibold gradient_color hover:underline underline-offset-2 transition-all"
                  >
                    {t("auth.signup.link")}
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* ========== RIGHT: DECORATION ========== */}
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-richblack-900/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/30">
            {/* Decorative orbs */}
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-gradient-to-br from-[#1FA2FF]/30 to-[#A6FFCB]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-16 w-48 h-48 bg-gradient-to-tr from-[#12D8FA]/20 to-transparent rounded-full blur-3xl" />

            <div className="relative space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#12D8FA]/30 bg-gradient-to-r from-[#1FA2FF]/15 to-[#12D8FA]/10 px-3.5 py-1.5">
                <HiSparkles className="w-4 h-4 text-[#12D8FA]" />
                <span className="text-xs font-semibold text-[#12D8FA]">
                  {t("auth.right.badge")}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold leading-tight tracking-tight text-richblack-5">
                {t("auth.right.title_part1")}{" "}
                <span className="gradient_color">{t("auth.right.title_part2")}</span>
              </h3>

              {/* Description */}
              <div className="space-y-1">
                <p className="text-sm text-richblack-200 leading-relaxed">
                  {t("auth.right.desc1")}
                </p>
                <p className="text-sm font-semibold gradient_color">
                  {t("auth.right.desc2")}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-2">
                {[0, 1, 2].map((idx) => {
                  const gradients = [
                    "from-[#1FA2FF] to-[#12D8FA]",
                    "from-[#12D8FA] to-[#A6FFCB]",
                    "from-[#A6FFCB] to-[#1FA2FF]",
                  ]
                  const title = t(`auth.features.${idx}.title`)
                  const desc = t(`auth.features.${idx}.desc`)

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3.5 rounded-xl p-3 hover:bg-white/5 transition-colors duration-300 group"
                    >
                      <div
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r ${gradients[idx]} group-hover:scale-125 transition-transform duration-300`}
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-richblack-5">
                          {title}
                        </h4>
                        <p className="mt-0.5 text-xs leading-relaxed text-richblack-400">
                          {desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm