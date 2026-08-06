import { useEffect, useState } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI"
import Img from './../../common/Img';



export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [enrolledCourses, setEnrolledCourses] = useState(null)
  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);
      setEnrolledCourses(Array.isArray(res) ? res : []);
    } catch (error) {
      console.log("Could not fetch enrolled courses.", error);
    }
  };
  useEffect(() => {
    getEnrolledCourses();
  }, [token])

  const sklItem = () => {
    return (
      <div className="flex border border-richblack-700 px-5 py-3 w-full">
        <div className="flex flex-1 gap-x-4 ">
          <div className='h-14 w-14 rounded-lg skeleton '></div>

          <div className="flex flex-col w-[40%] ">
            <p className="h-2 w-[50%] rounded-xl  skeleton"></p>
            <p className="h-2 w-[70%] rounded-xl mt-3 skeleton"></p>
          </div>
        </div>
        <div className="flex flex-[0.4] flex-col ">
          <p className="h-2 w-[20%] rounded-xl skeleton mt-2"></p>
          <p className="h-2 w-[40%] rounded-xl skeleton mt-3"></p>
        </div>
      </div>
    )
  }
  if (enrolledCourses?.length == 0) {
    return (
      <div className="flex min-h-[calc(100vh-2.5rem-5rem)] flex-1 items-center justify-center">
        <p className="text-center text-xl text-richblack-5">
          You have not enrolled in any course yet.
        </p>
      </div>)
  }
  return (
    <div className="min-h-[calc(100vh-2.5rem-5rem)] items-center justify-center">
      <div className="text-3xl font-bold text-richblack-5  text-center sm:text-left mt-10 ">Enrolled Courses</div>
      {
        <div className="my-5 text-richblack-5 ">
          <div className="grid grid-cols-[7fr_3fr] rounded-t-2xl bg-richblack-800">
            <p className="px-5 py-3 font-medium">Course Name</p>
            <p className="py-3  font-medium">Progress</p>
          </div>
          {!enrolledCourses && <div >
            {sklItem()}
            {sklItem()}
            {sklItem()}
            {sklItem()}
            {sklItem()}
          </div>}
          {
            enrolledCourses?.map((course, i, arr) => (
              <div
                className={`flex flex-col sm:flex-row sm:items-center border border-richblack-700 ${i === arr.length - 1 ? "rounded-b-2xl" : "rounded-none"}`}
                key={i}
              >
                <div
                  className="flex sm:w-[70%] cursor-pointer items-center gap-4 px-5 py-3"
                  onClick={() => {
                    navigate(`/course-workspace/${course?._id}`)
                  }}>
                  <Img
                    src={course.thumbnail}
                    alt="course_img"
                    className="h-20 w-20  rounded-lg object-cover"
                  />
                  <div className="flexflex-col gap-2">
                    <p className="font-semibold text-base">{course.courseName}</p>
                    <p className="text-sm text-richblack-300 max-w-[400px] truncate">
                      {course.courseDescription}
                    </p>
                  </div>
                </div>
                <div className='sm:hidden'>
                  <div className=" px-2 py-3">{course?.totalDuration}</div>
                  <div className="flex sm:w-2/5 flex-col gap-2 px-2 py-3">
                    <p>Progress: {course.progressPercentage || 0}%</p>
                    <ProgressBar
                      completed={course.progressPercentage || 0}
                      height="8px"
                      isLabelVisible={false}
                    />
                  </div>
                </div>
                <div className="hidden">{course?.totalDuration}</div>
                <div className="hidden sm:flex w-1/5 flex-col gap-2 px-2 py-3">
                  <p>Progress: {course.progressPercentage || 0}%</p>
                  <ProgressBar
                    completed={course.progressPercentage || 0}
                    height="8px"
                    isLabelVisible={false}
                  />
                </div>
              </div>
            ))
          }
        </div>
      }
    </div>
  )
}