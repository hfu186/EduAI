import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams } from "react-router-dom"
import { getFullCourseDetails } from "../../../../services/operations/courseDetailsAPI"
import { setCourse, setEditCourse } from "../../../../slices/courseSlice"
import RenderSteps from "../AddCourse/RenderSteps"

export default function EditCourse() {
  const dispatch = useDispatch()
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)
  
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const populateCourseDetails = async () => {
      setLoading(true)
      try {
        const result = await getFullCourseDetails(courseId, token)
        
        console.log("DEBUG API RESULT IN EDIT COURSE:", result);

       if (result?.data?.courseDetails) {
                dispatch(setEditCourse(true))
                dispatch(setCourse(result.data.courseDetails))
            } 
            else if (result?.courseDetails) {
                dispatch(setEditCourse(true))
                dispatch(setCourse(result.courseDetails))
            }
      } catch (error) {
        console.error("Course Fetch Error:", error)
      }
      setLoading(false)
    }
    
    populateCourseDetails()
    
  }, [courseId, dispatch, token])

  if (loading) {
    return (
      <div className="grid flex-1 place-items-center mt-10">
        <div className="spinner">Loading...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-11/12 max-w-[800px] py-10">
       <h1 className="text-3xl p-4 text-richblack-5  font-bold text-center lg:text-left ">
          Edit Course
        </h1>
    
      <div className="flex-1 max-w-[120vh] gap-30px">
        {course ? (
          <RenderSteps />
        ) : (
          <p className="mt-14 text-center text-3xl font-semibold text-richblack-100">
            Course not found
          </p>
        )}
      </div>
    </div>
  )
}