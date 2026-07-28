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
    <div>
       <h1 className="mb-14 text-3xl font-medium text-richblack-5  text-center lg:text-left ">
          Edit Course
        </h1>
    
      <div className="flex-1">
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