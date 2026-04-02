import signupImg from "../assets/Images/signup.png"
import Template from "../components/core/Auth/Template"

function Signup() {
  return (
    <Template
      title="Create your Account to access the Portal"
      description1="Manage your university modules, lab assignments, and professional certifications."
      description2="Start building your academic profile and professional portfolio today."
      image={signupImg}
      formType="signup"
    />
  )
}

export default Signup