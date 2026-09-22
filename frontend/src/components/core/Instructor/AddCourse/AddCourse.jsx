import { useEffect } from "react"
import RenderSteps from "./RenderSteps"

export default function AddCourse() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="flex w-full items-start gap-x-6">
      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header - đồng bộ style với các form */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-richblack-5 tracking-tight lg:text-3xl">
            Add Course
          </h1>
          <p className="mt-1 text-sm text-richblack-400">
            Create and publish a new course in a few steps.
          </p>
        </div>

        <div className="flex-1">
          <RenderSteps />
        </div>
      </div>

      {/* Tips sidebar */}
      <div className="sticky top-6 hidden max-w-[300px] flex-shrink-0 rounded-xl border border-richblack-700 bg-richblack-800 p-5 lg:block">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
          <p className="text-sm font-semibold text-richblack-5">
            Course Upload Tips
          </p>
        </div>

        <ul className="space-y-3 text-xs leading-relaxed text-richblack-300">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-richblack-500" />
            <span>Set the Course Price option or make it free.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-richblack-500" />
            <span>Standard size for the course thumbnail is 1024×576.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-richblack-500" />
            <span>Course Builder is where you create & organize a course.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-richblack-500" />
            <span>
              Add Topics in the Course Builder to create lessons, quizzes, and
              assignments.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-richblack-500" />
            <span>
              Information from the Additional Data section shows up on the
              course single page.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-richblack-500" />
            <span>
              Make Announcements to notify enrolled students of important
              updates.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-richblack-500" />
            <span>Notes to all enrolled students at once.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}