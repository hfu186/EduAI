/* eslint-disable react/prop-types */
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

function Template({ formType }) {
  return (
    <div className="flex w-full items-center justify-center bg-[#000814] px-4">
      {formType === "signup" ? <SignupForm /> : <LoginForm />}
    </div>
  )
}

export default Template