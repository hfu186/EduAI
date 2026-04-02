export default function CourseStepper({ step }) {
  const steps = ["Course Info", "Curriculum", "Publish"]

  return (
    <div className="flex gap-6 mb-8">
      {steps.map((item, index) => (
        <div key={item} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full
            ${step === index + 1
              ? "bg-yellow-50 text-black"
              : "bg-richblack-700 text-richblack-300"}`}
          >
            {index + 1}
          </div>
          <span className="text-richblack-200">{item}</span>
        </div>
      ))}
    </div>
  )
}
