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

function SignupForm() {
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
      toast.error("Passwords Do Not Match");
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

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* LEFT SIDE: FORM */}
        <div className="glass-bg rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden group">
          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="space-y-6 relative">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1FA2FF] to-[#12D8FA] shadow-lg shadow-[#1FA2FF]/25 mb-1">
                <FaUserGraduate className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold gradient_color tracking-tight">
                Create Account
              </h2>
              <p className="text-richblack-300 text-sm sm:text-base">
                Join thousands of learners worldwide
              </p>
            </div>

            <form onSubmit={handleOnSubmit} className="space-y-5 mt-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="lable-style flex items-center gap-2">
                    <FaUser className="w-3.5 h-3.5 text-richblack-400" />
                    First Name <span className="text-pink-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={handleOnChange}
                    placeholder="John"
                    className="form-style w-full text-base !py-3.5 !px-4 rounded-xl border border-richblack-600 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20 transition-all duration-300 bg-richblack-800/50"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="lable-style flex items-center gap-2">
                    <FaUser className="w-3.5 h-3.5 text-richblack-400" />
                    Last Name <span className="text-pink-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={handleOnChange}
                    placeholder="Doe"
                    className="form-style w-full text-base !py-3.5 !px-4 rounded-xl border border-richblack-600 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20 transition-all duration-300 bg-richblack-800/50"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="lable-style flex items-center gap-2">
                  <FaEnvelope className="w-3.5 h-3.5 text-richblack-400" />
                  Email Address <span className="text-pink-400">*</span>
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleOnChange}
                  placeholder="you@example.com"
                  className="form-style w-full text-base !py-3.5 !px-4 rounded-xl border border-richblack-600 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20 transition-all duration-300 bg-richblack-800/50"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-2">
                  <label className="lable-style flex items-center gap-2">
                    <FaLock className="w-3.5 h-3.5 text-richblack-400" />
                    Password <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={handleOnChange}
                      placeholder="••••••••"
                      className="form-style w-full text-base !py-3.5 !pl-4 !pr-12 rounded-xl border border-richblack-600 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20 transition-all duration-300 bg-richblack-800/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-[#12D8FA] transition-colors duration-200 p-1"
                    >
                      {showPassword ? (
                        <AiOutlineEye className="w-5 h-5" />
                      ) : (
                        <AiOutlineEyeInvisible className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="lable-style flex items-center gap-2">
                    <FaLock className="w-3.5 h-3.5 text-richblack-400" />
                    Confirm <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleOnChange}
                      placeholder="••••••••"
                      className="form-style w-full text-base !py-3.5 !pl-4 !pr-12 rounded-xl border border-richblack-600 focus:border-[#12D8FA]/50 focus:ring-2 focus:ring-[#12D8FA]/20 transition-all duration-300 bg-richblack-800/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-[#12D8FA] transition-colors duration-200 p-1"
                    >
                      {showConfirmPassword ? (
                        <AiOutlineEye className="w-5 h-5" />
                      ) : (
                        <AiOutlineEyeInvisible className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full overflow-hidden bg-gradient-to-r from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-richblack-900 font-bold py-4 rounded-xl shadow-lg shadow-[#12D8FA]/25 hover:shadow-[#12D8FA]/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 group/btn mt-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-richblack-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </span>
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-richblack-600"></div>
                <span className="flex-shrink mx-4 text-richblack-400 text-xs uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-richblack-600"></div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-richblack-300">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold gradient_color hover:underline underline-offset-2 transition-all"
                  >
                    Login Here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT SIDE: DECORATION */}
        <div className="hidden lg:block">
          <div className="glass-bg rounded-3xl p-10 xl:p-12 shadow-2xl border border-white/5 backdrop-blur-xl relative overflow-hidden">
            {/* Decorative gradient orb */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-[#1FA2FF]/30 to-[#A6FFCB]/20 rounded-full blur-3xl" />
            
            <div className="space-y-8 relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#1FA2FF]/15 to-[#12D8FA]/15 border border-[#12D8FA]/20">
                <HiSparkles className="w-4 h-4 text-[#12D8FA]" />
                <span className="text-sm font-medium text-[#12D8FA]">Start Learning Today</span>
              </div>
              
              {/* Title */}
              <h3 className="text-4xl xl:text-5xl font-bold text-richblack-5 leading-tight tracking-tight">
                Join the{" "}
                <span className="gradient_color">Future</span>
              </h3>
              
              {/* Description */}
              <div className="space-y-2">
                <p className="text-lg text-richblack-200 leading-relaxed">
                  Build skills for today, tomorrow, and beyond.
                </p>
                <p className="text-base gradient_color font-semibold">
                  Education to future-proof your career.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-richblack-800/60 backdrop-blur-sm rounded-2xl p-5 border border-richblack-700/50 hover:border-[#12D8FA]/30 transition-colors duration-300 group/stat">
                  <div className="text-3xl xl:text-4xl font-bold gradient_color group-hover/stat:scale-105 transition-transform duration-300 origin-left">
                    50K+
                  </div>
                  <div className="text-sm text-richblack-400 mt-1.5">Active Students</div>
                </div>
                <div className="bg-richblack-800/60 backdrop-blur-sm rounded-2xl p-5 border border-richblack-700/50 hover:border-[#A6FFCB]/30 transition-colors duration-300 group/stat">
                  <div className="text-3xl xl:text-4xl font-bold gradient_color group-hover/stat:scale-105 transition-transform duration-300 origin-left">
                    1000+
                  </div>
                  <div className="text-sm text-richblack-400 mt-1.5">Premium Courses</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-2">
                {[
                  { title: "Lifetime Access", desc: "Learn at your own pace forever" },
                  { title: "Certificate of Completion", desc: "Showcase your new skills" },
                  { title: "Community Support", desc: "Connect with fellow learners" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 group/feat">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#1FA2FF] to-[#A6FFCB] mt-1.5 shrink-0 group-hover/feat:scale-125 transition-transform" />
                    <div>
                      <h4 className="text-richblack-5 font-semibold text-sm">{item.title}</h4>
                      <p className="text-xs text-richblack-400 mt-0.5">{item.desc}</p>
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