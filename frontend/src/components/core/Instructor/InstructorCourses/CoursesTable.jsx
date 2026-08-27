/* eslint-disable react/prop-types */
import { useSelector } from "react-redux"
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'
import { useState } from "react"
import { FaCheck } from "react-icons/fa"
import { FiEdit2 } from "react-icons/fi"
import { HiClock } from "react-icons/hi"
import { RiDeleteBin6Line } from "react-icons/ri"
import { useNavigate } from "react-router-dom"

import { formatDate } from "../../../../services/formatDate"
import { deleteCourse, fetchInstructorCourses } from "../../../../services/operations/courseDetailsAPI"
import { COURSE_STATUS } from "../../../../utils/constants"
import ConfirmationModal from "../../../common/ConfirmationModal"
import Img from './../../../common/Img';
import toast from 'react-hot-toast'

export default function CoursesTable({ courses, setCourses }) {
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const [confirmationModal, setConfirmationModal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  
  const TRUNCATE_LENGTH = 25

  const handleCourseDelete = async (courseId) => {
    setLoading(true)
    setDeletingId(courseId) 
    try {
      const success = await deleteCourse({ courseId }, token)
      if (success) {
        const result = await fetchInstructorCourses(token)
        if (result) {
          setCourses(result)
        }  
        toast.success("Course deleted successfully")
      }
    } catch (error) {
      toast.error("Failed to delete course")
    } finally {
      setConfirmationModal(null)
      setLoading(false)
      setDeletingId(null)
    }
  }

  return (
    <>
      <Table className="rounded-2xl border border-richblack-800">
        <Thead>
          <Tr className="flex gap-x-10 border-b border-b-richblack-800 px-6 py-4">
            <Th className="flex-1 text-left text-sm font-medium uppercase text-richblack-100">
              Courses
            </Th>
            <Th className="text-left text-sm font-medium uppercase text-richblack-100 min-w-[100px]">
              Actions
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {courses?.length === 0 ? (
            <Tr>
              <Td className="py-10 text-center text-2xl font-medium text-richblack-100">
                No courses found
              </Td>
            </Tr>
          ) : (
            courses?.map((course) => (
              <Tr
                key={course._id}
                className={`flex gap-x-10 border-b border-richblack-800 px-6 py-8 transition-all duration-200 ${
                  deletingId === course._id ? 'opacity-50' : ''
                }`}
              >
                <Td className="flex flex-1 gap-x-4">
                  {/* Thumbnail */}
                  <Img
                    src={course?.thumbnail}
                    alt={course?.courseName}
                    className="h-[148px] min-w-[270px] max-w-[270px] rounded-lg object-cover shadow-lg"
                  />

                  {/* Course Details */}
                  <div className="flex flex-col">
                    <p 
                      className="text-lg font-semibold text-richblack-5 capitalize cursor-pointer hover:text-yellow-50 transition-all"
                      onClick={() => navigate(`/dashboard/course/${course._id}`)}
                    >
                      {course.courseName}
                    </p>
                    <p className="text-sm text-richblack-300 mt-1">
                      {course.courseDescription.split(" ").length > TRUNCATE_LENGTH
                        ? course.courseDescription.split(" ").slice(0, TRUNCATE_LENGTH).join(" ") + "..."
                        : course.courseDescription}
                    </p>

                    <div className="mt-4 space-y-1">
                        <p className="text-[12px] text-richblack-100">
                          Created: {formatDate(course?.createdAt)}
                        </p>
                       
                    </div>

                    {course.status === COURSE_STATUS.DRAFT ? (
                      <p className="mt-3 flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-3 py-[2px] text-[12px] font-medium text-pink-100 border border-pink-700">
                        <HiClock size={14} />
                        Drafted
                      </p>
                    ) : (
                      <div className="mt-3 flex w-fit flex-row items-center gap-2 rounded-full bg-richblack-700 px-3 py-[2px] text-[12px] font-medium text-yellow-100 border border-yellow-700">
                        <FaCheck size={10} />
                        {course.status}
                      </div>
                    )}
                  </div>
                </Td>

                {/* Actions Section */}
                <Td className="text-sm font-medium text-richblack-100 flex items-start gap-x-3 min-w-[100px]">
                  <button
                    disabled={loading}
                    onClick={() => navigate(`/dashboard/edit-course/${course._id}`)}
                    title="Edit Course"
                    className="p-2 transition-all duration-200 hover:scale-125 hover:text-caribbeangreen-300 disabled:opacity-50"
                  >
                    <FiEdit2 size={20} />
                  </button>

                  <button
                    disabled={loading}
                    onClick={() => {
                      setConfirmationModal({
                        text1: "Do you want to delete this course?",
                        text2: "All data related to this course will be permanently removed.",
                        btn1Text: "Delete",
                        btn2Text: "Cancel",
                        btn1Handler: () => handleCourseDelete(course._id),
                        btn2Handler: () => setConfirmationModal(null),
                      })
                    }}
                    title="Delete Course"
                    className="p-2 transition-all duration-200 hover:scale-125 hover:text-pink-200 disabled:opacity-50"
                  >
                    <RiDeleteBin6Line size={20} />
                  </button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}