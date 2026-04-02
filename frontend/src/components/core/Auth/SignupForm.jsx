import { useState } from "react";
import { toast } from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserGraduate,
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../../../services/operations/authAPI";
import { setSignupData } from "../../../slices/authSlice";
import { Link } from "react-router-dom";
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

    const signupData = {
      ...formData,
    };

    dispatch(setSignupData(signupData));
    dispatch(sendOtp(formData.email, navigate));

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="w-full flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-10 items-center">
        {/* LEFT SIDE: FORM */}
        <div className="glass-bg rounded-2xl p-10 lg:p-12 shadow-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-4xl font-bold gradient_color mb-2">
                Create Account
              </h2>
              <p className="text-richblack-200 text-sm">
                Join thousands of learners worldwide
              </p>
            </div>

            <form onSubmit={handleOnSubmit} className="space-y-6">
              

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="lable-style">
                    First Name <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative mt-2">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 w-5 h-5" />
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={firstName}
                      onChange={handleOnChange}
                      placeholder="Enter first name"
                      className="form-style w-full text-base"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "45px",
                        paddingRight: "16px",
                      }}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="lable-style">
                    Last Name <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative mt-2">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 w-5 h-5" />
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={lastName}
                      onChange={handleOnChange}
                      placeholder="Enter last name"
                      className="form-style w-full text-base"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "45px",
                        paddingRight: "16px",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="lable-style">
                  Email Address <span className="text-pink-400">*</span>
                </label>
                <div className="relative mt-2">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 w-5 h-5" />

                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleOnChange}
                    placeholder="Enter email address"
                    className="form-style w-full text-base"
                    style={{
                      paddingTop: "14px",
                      paddingBottom: "14px",
                      paddingLeft: "45px",
                      paddingRight: "16px",
                    }}
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="lable-style">
                    Password <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative mt-2">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 w-5 h-5" />

                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={handleOnChange}
                      placeholder="Enter password"
                      className="form-style w-full text-base"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "45px",
                        paddingRight: "45px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-richblack-200"
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
                <div>
                  <label className="lable-style">
                    Confirm Password <span className="text-pink-400">*</span>
                  </label>
                  <div className="relative mt-2">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 w-5 h-5" />

                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleOnChange}
                      placeholder="Confirm password"
                      className="form-style w-full text-base"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "45px",
                        paddingRight: "45px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 hover:text-richblack-200"
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
                className="w-full bg-gradient-to-r from-[#1FA2FF] via-[#12D8FA] to-[#A6FFCB] text-richblack-900 font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Create Account
              </button>
              <div className="text-center pt-4">
                <p className="text-sm text-richblack-200">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="font-semibold gradient_color hover:underline"
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
          <div className="glass-bg rounded-2xl p-10 shadow-2xl">
            <div className="space-y-6">
              <div className="inline-block">
                <div className="bg-gradient-to-r from-[#1FA2FF] to-[#12D8FA] p-4 rounded-2xl shadow-lg">
                  <FaUserGraduate className="w-12 h-12 text-white" />
                </div>
              </div>

              <h3 className="text-5xl font-bold text-richblack-5 leading-tight">
                Join the <span className="gradient_color">Future</span>
              </h3>

              <p className="text-lg text-richblack-200 leading-relaxed">
                Build skills for today, tomorrow, and beyond.
              </p>
              <p className="text-lg gradient_color font-semibold">
                Education to future-proof your career.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="bg-richblack-800/50 backdrop-blur-sm rounded-xl p-6 border border-richblack-700">
                  <div className="text-4xl font-bold gradient_color">50K+</div>
                  <div className="text-sm text-richblack-300 mt-2">
                    Students
                  </div>
                </div>
                <div className="bg-richblack-800/50 backdrop-blur-sm rounded-xl p-6 border border-richblack-700">
                  <div className="text-4xl font-bold gradient_color">1000+</div>
                  <div className="text-sm text-richblack-300 mt-2">Courses</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
