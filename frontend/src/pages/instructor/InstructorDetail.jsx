/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getInstructorProfile } from "../../services/operations/profileAPI"
import Footer from "../../components/common/Footer"
import Course_Card from "../../components/core/Catalog/Course_Card" 
import Img from "../../components/common/Img"

import { FaUserGraduate, FaStar, FaPlayCircle } from "react-icons/fa"
import { BiWorld } from "react-icons/bi"
import { MdOutlineRateReview } from "react-icons/md"

const InstructorDetails = () => {
  const { instructorId } = useParams()
  const [instructor, setInstructor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const res = await getInstructorProfile(instructorId)
      if (res) {
        setInstructor(res)
      }
      setLoading(false)
    }
    fetchData()
  }, [instructorId])

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center text-white">Loading...</div>
  }

  if (!instructor) {
    return <div className="min-h-screen flex justify-center items-center text-white">Instructor not found</div>
  }

  return (
    <div className="bg-richblack-900 min-h-screen flex flex-col font-inter text-white">
      
      {/* --- SECTION 1: HEADER / PROFILE BANNER --- */}
      <div className="bg-richblack-800 py-14 border-b border-richblack-700">
        <div className="w-11/12 max-w-maxContent mx-auto flex flex-col md:flex-row gap-10 items-center md:items-start">
            
            {/* Avatar */}
            <div className="w-[180px] h-[180px] rounded-full overflow-hidden border-4 border-yellow-50 shadow-xl shrink-0">
               <Img 
                  src={instructor.image} 
                  alt={instructor.firstName}
                  className="w-full h-full object-cover"
               />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2 text-center md:text-left">
                <h1 className="text-4xl font-bold capitalize">
                    {instructor.firstName} {instructor.lastName}
                </h1>
                <p className="text-richblack-300 text-lg font-medium">
                    {instructor.additionalDetails?.about || "Instructor at EduSpace"}
                </p>
                
                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 mt-4 justify-center md:justify-start">
                    <div className="flex items-center gap-2 text-richblack-50">
                        <FaUserGraduate className="text-yellow-50"/>
                        <span>{instructor.stats?.totalStudents || 0} Students</span>
                    </div>
                    <div className="flex items-center gap-2 text-richblack-50">
                        <FaPlayCircle className="text-yellow-50"/>
                        <span>{instructor.stats?.totalCourses || 0} Courses</span>
                    </div>
                    <div className="flex items-center gap-2 text-richblack-50">
                        <MdOutlineRateReview className="text-yellow-50"/>
                        <span>{instructor.stats?.totalReviews || 0} Reviews</span>
                    </div>
                    <div className="flex items-center gap-2 text-richblack-50">
                        <FaStar className="text-yellow-50"/>
                        <span>{instructor.stats?.averageRating || 0} Rating</span>
                    </div>
                </div>

                {/* Additional Info */}
                 <div className="flex items-center gap-2 text-richblack-300 mt-2 justify-center md:justify-start">
                    <BiWorld />
                    <span className="text-sm">English, Vietnamese</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- SECTION 2: BIOGRAPHY & COURSES --- */}
      <div className="w-11/12 max-w-maxContent mx-auto py-12 flex flex-col lg:flex-row gap-12">
          
          <div className="w-full lg:w-[30%] flex flex-col gap-6">
              <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
                  <h3 className="text-xl font-bold mb-4">About Me</h3>
                  <p className="text-richblack-200 text-sm leading-relaxed">
                     Hi, I'm {instructor.firstName}. I am passionate about teaching and helping students achieve their goals. 
                     My courses are designed to be practical and easy to understand.
                  </p>
              </div>

              <div className="bg-richblack-800 p-6 rounded-xl border border-richblack-700">
                  <h3 className="text-xl font-bold mb-4">Contact</h3>
                  <p className="text-richblack-200 text-sm mb-2">Email: {instructor.email}</p>
              </div>
          </div>

          {/* Right Column: Courses List */}
          <div className="w-full lg:w-[70%]">
              <h2 className="text-2xl font-bold mb-6 border-l-4 border-yellow-50 pl-4">
                  Courses by {instructor.firstName}
              </h2>

              {instructor.courses?.length === 0 ? (
                  <p className="text-richblack-200">This instructor hasn't published any courses yet.</p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {instructor.courses.map((course) => (
                          <Course_Card key={course._id} course={course} Height={"h-[200px]"} />
                      ))}
                  </div>
              )}
          </div>
      </div>

      <Footer />
    </div>
  )
}

export default InstructorDetails