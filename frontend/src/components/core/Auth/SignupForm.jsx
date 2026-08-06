import { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserGraduate,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { sendOtp } from "../../../services/operations/authAPI";
import { setSignupData } from "../../../slices/authSlice";
import { useTranslation } from 'react-i18next';

function SignupForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { firstName, lastName, email, password, confirmPassword } = formData;

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t('auth.signup.errors.password_mismatch'));
      return;
    }

    setIsLoading(true);

    const signupData = {
      ...formData,
    };

    dispatch(setSignupData(signupData));
    dispatch(sendOtp(formData.email, navigate)).finally(() => {
      setIsLoading(false);
    });

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#1FA2FF]/20 to-[#12D8FA]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tr from-[#A6FFCB]/15 to-[#12D8FA]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#1FA2FF]/5 via-transparent to-[#A6FFCB]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
  
  {/* LEFT SIDE: FORM */}
  <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-richblack-900/50 p-7 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-9">
    {/* Subtle shine effect */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

    <div className="relative space-y-4">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="mx-auto mb-1 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1FA2FF] to-[#12D8FA] shadow-lg shadow-[#1FA2FF]/25">
          <FaUserGraduate className="h-7 w-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight gradient_color sm:text-4xl">
          {t("auth.signup.title")}
        </h2>
        <p className="text-sm text-richblack-300 sm:text-base">
          {t("auth.signup.subtitle")}
        </p>
      </div>

      <form onSubmit={handleOnSubmit} className="mt-2 space-y-4">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="lable-style flex items-center gap-2">
              <FaUser className="h-3.5 w-3.5 text-richblack-400" />
              {t("auth.label.first_name")}{" "}
              <span className="text-pink-400">*</span>
            </label>
            <input
              required
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleOnChange}
              placeholder={t("auth.placeholder.first_name")}
              className="form-style w-full rounded-xl border border-richblack-600 bg-richblack-800/50 !px-4 !py-3 text-base transition-all duration-300 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="lable-style flex items-center gap-2">
              <FaUser className="h-3.5 w-3.5 text-richblack-400" />
              {t("auth.label.last_name")}{" "}
              <span className="text-pink-400">*</span>
            </label>
            <input
              required
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleOnChange}
              placeholder={t("auth.placeholder.last_name")}
              className="form-style w-full rounded-xl border border-richblack-600 bg-richblack-800/50 !px-4 !py-3 text-base transition-all duration-300 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="lable-style flex items-center gap-2">
            <FaEnvelope className="h-3.5 w-3.5 text-richblack-400" />
            {t("auth.label.email")} <span className="text-pink-400">*</span>
          </label>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={handleOnChange}
            placeholder={t("auth.placeholder.email")}
            className="form-style w-full rounded-xl border border-richblack-600 bg-richblack-800/50 !px-4 !py-3 text-base transition-all duration-300 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20"
          />
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="lable-style flex items-center gap-2">
              <FaLock className="h-3.5 w-3.5 text-richblack-400" />
              {t("auth.label.password")}{" "}
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
                className="form-style w-full rounded-xl border border-richblack-600 bg-richblack-800/50 !py-3 !pl-4 !pr-12 text-base transition-all duration-300 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-richblack-400 transition-colors duration-200 hover:text-[#12D8FA]"
              >
                {showPassword ? (
                  <AiOutlineEye className="h-5 w-5" />
                ) : (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="lable-style flex items-center gap-2">
              <FaLock className="h-3.5 w-3.5 text-richblack-400" />
              {t("auth.label.confirm_password")}{" "}
              <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleOnChange}
                placeholder={t("auth.placeholder.password")}
                className="form-style w-full rounded-xl border border-richblack-600 bg-richblack-800/50 !py-3 !pl-4 !pr-12 text-base transition-all duration-300 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-richblack-400 transition-colors duration-200 hover:text-[#12D8FA]"
              >
                {showConfirmPassword ? (
                  <AiOutlineEye className="h-5 w-5" />
                ) : (
                  <AiOutlineEyeInvisible className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group/btn relative mt-1 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] py-3.5 font-bold text-richblack-900 shadow-lg shadow-[#12D8FA]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-[#12D8FA]/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin text-richblack-900"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("auth.signup.button.creating")}
              </>
            ) : (
              t("auth.signup.button.create")
            )}
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
        </button>

        {/* Divider */}
        <div className="relative flex items-center py-0.5">
          <div className="flex-grow border-t border-richblack-600"></div>
          <span className="mx-4 flex-shrink text-xs uppercase tracking-wider text-richblack-400">
            {t("auth.divider.or")}
          </span>
          <div className="flex-grow border-t border-richblack-600"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-richblack-300">
            {t("auth.signup.already_have")}{" "}
            <Link
              to="/login"
              className="font-semibold gradient_color underline-offset-2 transition-all hover:underline"
            >
              {t("auth.signup.login_link")}
            </Link>
          </p>
        </div>
      </form>
    </div>
  </div>

  {/* RIGHT SIDE: DECORATION */}
  <div className="hidden lg:block">
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-richblack-900/60 p-8 shadow-2xl backdrop-blur-xl xl:p-9">
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-[#1FA2FF]/25 to-[#A6FFCB]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-[#12D8FA]/15 to-transparent blur-3xl" />

      <div className="relative space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#12D8FA]/25 bg-gradient-to-r from-[#1FA2FF]/10 to-[#12D8FA]/10 px-3.5 py-1.5">
          <HiSparkles className="h-4 w-4 text-[#12D8FA]" />
          <span className="text-sm font-medium text-[#12D8FA]">
            Start Learning Today
          </span>
        </div>

        <h3 className="text-4xl font-bold leading-tight tracking-tight text-richblack-5 xl:text-[2.75rem]">
          Join the <span className="gradient_color">Future</span>
        </h3>

        <div className="space-y-1">
          <p className="text-base leading-relaxed text-richblack-200">
            Build skills for today, tomorrow, and beyond.
          </p>
          <p className="text-sm font-semibold gradient_color">
            Education to future-proof your career.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="group/stat rounded-2xl border border-richblack-700/60 bg-richblack-800/50 p-4 transition-all duration-300 hover:border-[#12D8FA]/40 hover:bg-richblack-800/80">
            <div className="origin-left text-3xl font-bold gradient_color transition-transform duration-300 group-hover/stat:scale-105">
              50K+
            </div>
            <div className="mt-1 text-sm text-richblack-400">
              Active Students
            </div>
          </div>

          <div className="group/stat rounded-2xl border border-richblack-700/60 bg-richblack-800/50 p-4 transition-all duration-300 hover:border-[#A6FFCB]/40 hover:bg-richblack-800/80">
            <div className="origin-left text-3xl font-bold gradient_color transition-transform duration-300 group-hover/stat:scale-105">
              1000+
            </div>
            <div className="mt-1 text-sm text-richblack-400">
              Premium Courses
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              title: "Lifetime Access",
              desc: "Learn at your own pace forever",
            },
            {
              title: "Certificate of Completion",
              desc: "Showcase your new skills",
            },
            {
              title: "Community Support",
              desc: "Connect with fellow learners",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="group/feat flex items-start gap-3 transition-all duration-200"
            >
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-[#1FA2FF] to-[#A6FFCB] transition-transform duration-200 group-hover/feat:scale-125" />
              <div>
                <h4 className="text-sm font-semibold text-richblack-5">
                  {item.title}
                </h4>
                <p className="mt-0.5 text-xs text-richblack-400">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  );
}

export default SignupForm;