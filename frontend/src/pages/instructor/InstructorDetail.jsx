/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getInstructorProfile } from "../../services/operations/profileAPI"
import Footer from "../../components/common/Layout/Footer"
import Img from "../../components/common/Img"
import { Link } from "react-router-dom"
import { formatVND } from "../../utils/formatVND"
import { FaUserGraduate, FaStar, FaPlayCircle } from "react-icons/fa"
import { BiWorld } from "react-icons/bi"
import { MdOutlineRateReview } from "react-icons/md"
import { HiOutlineUsers } from "react-icons/hi2"

const InstructorDetails = () => {
    const { instructorId } = useParams()
    const [instructor, setInstructor] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const res = await getInstructorProfile(instructorId)
            if (res) setInstructor(res)
            setLoading(false)
        }
        fetchData()
    }, [instructorId])

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-richblack-900 text-richblack-200">
                Loading...
            </div>
        )
    }

    if (!instructor) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-richblack-900 text-richblack-200">
                Instructor not found
            </div>
        )
    }

    return (
        <div className="bg-richblack-900 min-h-screen flex flex-col font-inter text-white">
            {/* ========== HEADER ========== */}
            <section className="relative bg-richblack-800 border-b border-richblack-700">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative w-11/12 max-w-maxContent mx-auto py-12 md:py-16">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                        <div className="relative shrink-0">
                            <div className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-[3px] border-yellow-50/80 shadow-[0_0_0_6px_rgba(255,214,10,0.08)]">
                                <Img
                                    src={instructor.image}
                                    alt={`${instructor.firstName} ${instructor.lastName}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight capitalize">
                                {instructor.firstName} {instructor.lastName}
                            </h1>

                            <p className="text-richblack-300 text-base md:text-lg max-w-2xl leading-relaxed">
                                {instructor.additionalDetails?.about ||
                                    "Instructor at EduSpace"}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-start pt-2">
                                <div className="flex items-center gap-2 text-sm text-richblack-100">
                                    <FaUserGraduate className="text-yellow-50 text-base" />
                                    <span className="font-medium">
                                        {instructor.stats?.totalStudents || 0}
                                    </span>
                                    <span className="text-richblack-400">Students</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-richblack-100">
                                    <FaPlayCircle className="text-yellow-50 text-base" />
                                    <span className="font-medium">
                                        {instructor.stats?.totalCourses || 0}
                                    </span>
                                    <span className="text-richblack-400">Courses</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-richblack-100">
                                    <MdOutlineRateReview className="text-yellow-50 text-base" />
                                    <span className="font-medium">
                                        {instructor.stats?.totalReviews || 0}
                                    </span>
                                    <span className="text-richblack-400">Reviews</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-richblack-100">
                                    <FaStar className="text-yellow-50 text-base" />
                                    <span className="font-medium">
                                        {instructor.stats?.averageRating || 0}
                                    </span>
                                    <span className="text-richblack-400">Rating</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-richblack-400 text-sm justify-center md:justify-start pt-1">
                                <BiWorld className="text-base" />
                                <span>English · Vietnamese</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== MAIN CONTENT ========== */}
            <section className="w-11/12 max-w-maxContent mx-auto py-12 md:py-16 flex-1">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
                    {/* Left sidebar */}
                    <aside className="w-full lg:w-[280px] shrink-0 space-y-5">
                        <div className="bg-richblack-800/80 rounded-2xl border border-richblack-700 p-5">
                            <h3 className="text-base font-semibold mb-3 text-richblack-25">
                                About Me
                            </h3>
                            <p className="text-richblack-300 text-sm leading-relaxed">
                                Hi, I'm {instructor.firstName}. I am passionate about teaching
                                and helping students achieve their goals. My courses are
                                designed to be practical and easy to understand.
                            </p>
                        </div>

                        <div className="bg-richblack-800/80 rounded-2xl border border-richblack-700 p-5">
                            <h3 className="text-base font-semibold mb-3 text-richblack-25">
                                Contact
                            </h3>
                            <p className="text-richblack-300 text-sm break-all">
                                {instructor.email}
                            </p>
                        </div>
                    </aside>

                    {/* Courses */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                                <span className="w-1 h-6 bg-yellow-50 rounded-full" />
                                Courses by {instructor.firstName}
                            </h2>
                            {instructor.courses?.length > 0 && (
                                <span className="text-sm text-richblack-400">
                                    {instructor.courses.length} course
                                    {instructor.courses.length > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        {instructor.courses?.length === 0 ? (
                            <div className="bg-richblack-800/50 border border-richblack-700 rounded-2xl py-16 text-center">
                                <p className="text-richblack-300">
                                    This instructor hasn't published any courses yet.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {instructor.courses.map((course) => (
                                    <Link
                                        key={course._id}
                                        to={`/course/${course._id}`}
                                        className="group flex gap-4 bg-richblack-800 rounded-xl border border-richblack-700 p-3 hover:border-richblack-600 transition-all"
                                    >
                                        {/* Thumbnail nhỏ */}
                                        <div className="w-36 h-24 shrink-0 rounded-lg overflow-hidden bg-richblack-700">
                                            <Img
                                                src={course.thumbnail}
                                                alt={course.courseName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <h3 className="text-sm font-semibold text-richblack-5 line-clamp-2 group-hover:text-yellow-50 transition-colors">
                                                {course.courseName}
                                            </h3>

                                            <div className="flex items-center justify-between text-xs text-richblack-400 mt-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <HiOutlineUsers className="text-sm" />
                                                        {course.studentsEnrolled?.length || 0}
                                                    </span>
                                                    {course.ratingAndReviews?.length > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <FaStar className="text-yellow-50 text-[11px]" />
                                                            {(
                                                                course.ratingAndReviews.reduce((a, r) => a + r.rating, 0) /
                                                                course.ratingAndReviews.length
                                                            ).toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-semibold text-yellow-50 text-sm">
                                                    {formatVND(course.price) === 0 ? "Free" : `${formatVND(course.price)}`}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default InstructorDetails