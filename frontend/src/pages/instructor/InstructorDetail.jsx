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
import { HiOutlineUsers, HiMiniChatBubbleLeftEllipsis } from "react-icons/hi2"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import { createOrGetChat } from "../../services/operations/chatAPI"

const InstructorDetails = () => {
    const { instructorId } = useParams()
    const [instructor, setInstructor] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { token } = useSelector((state) => state.auth)
    const [chatLoading, setChatLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const res = await getInstructorProfile(instructorId)
            if (res) setInstructor(res)
            setLoading(false)
        }
        fetchData()
    }, [instructorId])

    const handleMessageClick = async () => {
        if (chatLoading) return
        setChatLoading(true)
        const chat = await createOrGetChat(instructor._id, token)
        setChatLoading(false)

        if (chat?._id) {
            navigate(`/chat/${chat._id}`)
        } else {
            toast.error("Could not open conversation")
        }
    }

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
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-richblack-700 border-t-yellow-50" />
                    <p className="text-sm text-richblack-400">Loading instructor profile...</p>
                </div>
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

    const qualifications =
        instructor.qualifications ||
        instructor.instructorRequestDetails?.qualifications ||
        instructor.additionalDetails?.qualifications

    const experience =
        instructor.experience ||
        instructor.instructorRequestDetails?.experience ||
        instructor.additionalDetails?.experience

    const statItems = [
        { icon: FaUserGraduate, value: instructor.stats?.totalStudents || 0, label: "Students" },
        { icon: FaPlayCircle, value: instructor.stats?.totalCourses || 0, label: "Courses" },
        { icon: MdOutlineRateReview, value: instructor.stats?.totalReviews || 0, label: "Reviews" },
        { icon: FaStar, value: instructor.stats?.averageRating || 0, label: "Rating" },
    ]


    return (
        <div className="bg-richblack-900 min-h-screen flex flex-col font-inter text-white">
            {/* ========== HERO ========== */}
            <section className="relative overflow-hidden border-b border-richblack-800">
                {/* Layered background accents */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/[0.07] via-transparent to-caribbeangreen-100/[0.05] pointer-events-none" />
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-yellow-50/[0.06] blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-16 h-70 w-72 rounded-full bg-caribbeangreen-100/[0.05] blur-3xl pointer-events-none" />

                <div className="relative w-10/12 max-w-maxContent mx-auto py-10">
                    <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center md:items-start">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 rounded-full bg-yellow-50/20 blur-xl scale-110" />
                            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-[3px] border-yellow-50/80 shadow-[0_0_0_6px_rgba(255,214,10,0.08)]">
                                <Img
                                    src={instructor.image}
                                    alt={`${instructor.firstName} ${instructor.lastName}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-4 w-full">
                            <div className="space-y-2">
                                <span className="inline-block rounded-full border border-yellow-50/30 bg-yellow-50/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-50">
                                    Instructor
                                </span>
                                <div className="flex items-center justify-center md:justify-start gap-4">
                                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight capitalize">
                                        {instructor.firstName} {instructor.lastName}
                                    </h1>
                                    <button
                                        onClick={handleMessageClick}
                                        disabled={chatLoading}
                                        className="flex items-center gap-2 text-sm text-richblack-400 hover:text-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        <HiMiniChatBubbleLeftEllipsis className="text-lg" />
                                        {chatLoading ? "Opening..." : "Message"}
                                    </button>
                                </div>
                            </div>

                            <p className="text-richblack-300 text-base md:text-lg max-w-2xl leading-relaxed">
                                {instructor.additionalDetails?.about ||
                                    "Instructor at EduSpace"}
                            </p>

                            {/* Stat pills */}
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                                {statItems.map(({ icon: Icon, value, label }) => (
                                    <div
                                        key={label}
                                        className="flex items-center gap-2.5 rounded-xl border border-richblack-700 bg-richblack-800/80 px-4 py-2.5 backdrop-blur-sm transition-colors hover:border-yellow-50/30"
                                    >
                                        <Icon className="text-yellow-50 text-base shrink-0" />
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="font-bold text-richblack-5">{value}</span>
                                            <span className="text-xs text-richblack-400">{label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 text-richblack-400 text-sm justify-center md:justify-start pt-1">
                                <BiWorld className="text-base" />
                                <span>English &middot; Vietnamese</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== MAIN CONTENT ========== */}
            <section className="w-11/12 max-w-maxContent mx-auto py-12 md:py-16 flex-1">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
                    {/* Left sidebar */}
                    <aside className="w-full lg:w-[380px] shrink-0 space-y-5">
                        <div className="rounded-2xl border border-richblack-700 bg-richblack-800/80 p-5 transition-colors hover:border-richblack-600">
                            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-richblack-25">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
                                About me
                            </h3>
                            <p className="text-richblack-300 text-sm leading-relaxed">
                                Hi, I'm {instructor.firstName}. I am passionate about teaching
                                and helping students achieve their goals. My courses are
                                designed to be practical and easy to understand.
                            </p>
                        </div>

                        {qualifications && (
                            <div className="rounded-2xl border border-richblack-700 bg-richblack-800/80 p-5 transition-colors hover:border-richblack-600">
                                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-richblack-25">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
                                    Qualifications & certifications
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-richblack-300">
                                    {qualifications}
                                </p>
                            </div>
                        )}

                        {experience && (
                            <div className="rounded-2xl border border-richblack-700 bg-richblack-800/80 p-5 transition-colors hover:border-richblack-600">
                                <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-richblack-25">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
                                    Teaching experience
                                </h3>
                                <p className="whitespace-pre-line text-sm leading-relaxed text-richblack-300">
                                    {experience}
                                </p>
                            </div>
                        )}

                        <div className="rounded-2xl border border-richblack-700 bg-richblack-800/80 p-5 transition-colors hover:border-richblack-600">
                            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-richblack-25">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
                                Contact
                            </h3>
                            <p className="break-all text-sm text-richblack-300">
                                {instructor.email}
                            </p>
                        </div>
                    </aside>

                    {/* Courses */}
                    <div className="flex-1 min-w-0">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="flex items-center gap-3 text-xl md:text-2xl font-bold">
                                <span className="h-6 w-1 rounded-full bg-yellow-50" />
                                Courses by {instructor.firstName}
                            </h2>
                            {instructor.courses?.length > 0 && (
                                <span className="rounded-full border border-richblack-700 bg-richblack-800 px-3 py-1 text-xs text-richblack-300">
                                    {instructor.courses.length} course
                                    {instructor.courses.length > 1 ? "s" : ""}
                                </span>
                            )}
                        </div>

                        {instructor.courses?.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-richblack-700 bg-richblack-800/40 py-16 text-center">
                                <FaPlayCircle className="text-3xl text-richblack-600" />
                                <p className="text-richblack-300">
                                    This instructor hasn't published any courses yet.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {instructor.courses.map((course) => (
                                    <Link
                                        key={course._id}
                                        to={`/course/${course._id}`}
                                        className="group flex gap-4 rounded-2xl border border-richblack-700 bg-richblack-800 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-yellow-50/40 hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.4)]"
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-richblack-700">
                                            <Img
                                                src={course.thumbnail}
                                                alt={course.courseName}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-richblack-900/50 via-transparent to-transparent" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                                            <div>
                                                <h3 className="line-clamp-2 text-xl font-semibold text-richblack-5 transition-colors group-hover:text-yellow-50">
                                                    {course.courseName}
                                                </h3>
                                                <p className="mt-1 line-clamp-2 text-sm text-richblack-300">
                                                    {course.courseDescription.substring(0, 100)}...
                                                </p>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between text-md font-semibold text-richblack-400">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <HiOutlineUsers className="text-sm" />
                                                        {course.studentsEnrolled?.length || 0}
                                                    </span>
                                                    {course.ratingAndReviews?.length > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <FaStar className="text-[11px] text-yellow-50" />
                                                            {(
                                                                course.ratingAndReviews.reduce((a, r) => a + r.rating, 0) /
                                                                course.ratingAndReviews.length
                                                            ).toFixed(1)}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="rounded-full bg-richblack-900 px-2.5 py-1 text-sm font-semibold text-yellow-50">
                                                    {course.price === 0 ? "Free" : formatVND(course.price)}
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