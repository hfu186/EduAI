/* eslint-disable react/prop-types */
import  { useEffect, useState } from "react"
import {  useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import { getFullCourseDetails } from "../../../../services/operations/courseDetailsAPI"
import { formatDate } from "../../../../services/formatDate"
import { VscEdit } from "react-icons/vsc";
import { BiTask } from "react-icons/bi";
import { formatVND } from "../../../../utils/formatVND";
import { BiDetail } from "react-icons/bi"
import { HiOutlineUsers } from "react-icons/hi"
import {  MdKeyboardArrowDown, MdKeyboardArrowUp, MdEdit } from "react-icons/md"
import { VscPlay } from "react-icons/vsc";
import IconBtn from "../../../common/IconBtn" 

export default function CourseContent() {
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [courseData, setCourseData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const result = await getFullCourseDetails(courseId, token)
        console.log("DEBUG COURSE CONTENT:", result);

       if (result?.data?.courseDetails) {
          setCourseData(result.data.courseDetails) 
        }
        else if (result?.courseDetails) {
           setCourseData(result.courseDetails)
        }
      } catch (error) {
        console.log("Could not fetch course details")
      }
      setLoading(false)
    }
    fetchCourseDetails()
  }, [courseId, token])

  if (loading) {
    return <div className="grid place-items-center h-[50vh] text-white">Loading...</div>
  }

  if (!courseData) {
    return <div className="grid place-items-center h-[50vh] text-white">Course not found</div>
  }

  return (
    <div className="text-white">
      {/*HEADER: Course Info & Stats */}
      <div className="flex flex-col-reverse gap-y-10 md:flex-row md:justify-between md:items-start bg-richblack-800 p-8 rounded-t-lg border-b border-richblack-700">
        
        {/* Left: Thumbnail & Basic Info */}
        <div className="flex gap-x-6 flex-1">
          <img 
            src={courseData?.thumbnail} 
            alt="Thumbnail"
            className="h-[180px] w-[300px] object-cover rounded-xl shadow-lg border border-richblack-600"
          />
          <div className="flex flex-col gap-y-3">
            <h1 className="text-3xl font-bold text-richblack-5">{courseData?.courseName}</h1>
            <p className="text-richblack-300 text-sm max-w-[500px]">{courseData?.courseDescription}</p>
            
            <div className="flex gap-x-4 text-richblack-200 text-sm font-medium mt-2">
                <span className="flex items-center gap-1 bg-richblack-700 px-3 py-1 rounded-full">
                    Created: {formatDate(courseData?.createdAt)}
                </span>
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${courseData?.status === "Published" ? "bg-caribbeangreen-900 text-caribbeangreen-50" : "bg-pink-900 text-pink-50"}`}>
                    {courseData?.status}
                </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Actions */}
        <div className="flex flex-col items-end gap-y-6 ">
            <IconBtn 
                text="Edit Course"
                onclick={() => navigate(`/dashboard/edit-course/${courseId}`)}
            >
                <MdEdit />
            </IconBtn>
            
            <div className="flex gap-4 bg-richblack-700 p-4 rounded-xl border border-richblack-600">
                <div className="text-center px-4 border-r border-richblack-600">
                    <p className="text-2xl font-bold text-yellow-50 flex items-center justify-center gap-1">
                        <HiOutlineUsers /> {courseData?.studentsEnrolled?.length || 0}
                    </p>
                    <p className="text-xs text-richblack-300 uppercase">Students</p>
                </div>
                <div className="text-center px-4 border-r border-richblack-600">
                    <p className="text-2xl font-bold text-caribbeangreen-50 flex items-center justify-center gap-1">
                         {courseData?.price === 0 ? "Free" : `${formatVND(courseData?.price)}`}
                    </p>
                    <p className="text-xs text-richblack-300 uppercase">Price</p>
                </div>
                <div className="text-center px-4">
                    <p className="text-2xl font-bold text-richblack-5 flex items-center justify-center gap-1">
                        <BiDetail /> {courseData?.courseContent?.length}
                    </p>
                    <p className="text-xs text-richblack-300 uppercase">Sections</p>
                </div>
            </div>
        </div>
      </div>

      {/* BODY: Content Outline */}
      <div className="bg-richblack-900 p-8 border-x border-b border-richblack-700 rounded-b-lg">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Course Content 
            <span className="text-sm font-normal text-richblack-400 bg-richblack-800 px-2 py-1 rounded-md">
                Detailed View
            </span>
        </h2>
        
        <div className="space-y-4">
            {courseData?.courseContent?.length === 0 ? (
                <div className="p-6 text-center text-richblack-300 border border-dashed border-richblack-600 rounded-lg">
                    No content added yet.
                </div>
            ) : (
                courseData?.courseContent?.map((section) => (
                    <CourseSectionAccordion key={section._id} section={section} courseId={courseId}/>
                ))
            )}
        </div>
      </div>
    </div>
  )
}
function CourseSectionAccordion({ section, courseId }) {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleItemClick = (sub) => {
        if (sub.type === 'assignment') {
            navigate(`/dashboard/course/${courseId}/assignment/${sub._id}`);
        } 
    }

    const handleEditSection = (e) => {
        e.stopPropagation(); // Prevent toggling the accordion.
        navigate(`/dashboard/edit-course/${courseId}`); // Go back to the edit page.
    }

    return (
        <div className="border border-richblack-700 rounded-lg overflow-hidden bg-richblack-800">
            {/* Section Header */}
            <div 
                className="flex justify-between items-center p-4 bg-richblack-700 cursor-pointer hover:bg-richblack-600 transition-all group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-x-3">
                    {isOpen ? <MdKeyboardArrowUp className="text-xl" /> : <MdKeyboardArrowDown className="text-xl" />}
                    <span className="font-semibold text-richblack-5 text-lg">{section.sectionName}</span>
                </div>

                <div className="flex items-center gap-x-4">
                    {/* Edit section button shown on hover */}
                    <button 
                        onClick={handleEditSection}
                        className="text-richblack-300 hover:text-yellow-50 opacity-0 group-hover:opacity-100 transition-all"
                        title="Edit Section Content"
                    >
                        <VscEdit size={20} />
                    </button>
                    
                    <div className="text-sm text-richblack-300">
                        {section.subSection?.length} Items
                    </div>
                </div>
            </div>

            {/* SubSections List */}
            {isOpen && (
                <div className="p-4 flex flex-col gap-y-3 bg-richblack-900/50">
                    {section.subSection?.length === 0 ? (
                        <p className="text-richblack-400 text-sm italic pl-6">This section is empty.</p>
                    ) : (
                        section.subSection.map((sub) => (
                            <div 
                                key={sub._id} 
                                className="flex items-center justify-between p-3 rounded-md bg-richblack-800 border border-richblack-700 hover:border-richblack-500 transition-colors group"
                            >
                                {/* Left: Icon & Title */}
                                <div className="flex items-center gap-x-4">
                                    <div className={`p-2 rounded-full text-richblack-5 
                                        ${sub.type === 'assignment' ? 'bg-caribbeangreen-900' : 'bg-richblack-700'}`}
                                    >
                                        <VscPlay type={sub.type || "video"} />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-richblack-5 font-medium">{sub.title}</p>
                                        <p className="text-xs text-richblack-400 capitalize flex items-center gap-1">
                                            {sub.type || "video"} 
                                            {sub.duration && <span>• {sub.duration}</span>}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Right: Action Buttons */}
                                <div className="flex items-center gap-x-3">
                                    {sub.type === 'assignment' && (
                                        <button
                                            onClick={() => handleItemClick(sub)}
                                            className="flex items-center gap-x-1 px-3 py-1 rounded-md bg-yellow-50 text-black font-bold text-xs hover:scale-105 transition-transform"
                                        >
                                            <BiTask /> Grade
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => navigate(`/dashboard/edit-course/${courseId}`)}
                                        className="text-richblack-300 hover:text-white p-1"
                                        title="Edit this item"
                                    >
                                        <VscEdit size={18}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
