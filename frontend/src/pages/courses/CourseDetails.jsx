import { useEffect, useState } from "react"
import { BiInfoCircle, BiChevronRight } from "react-icons/bi"
import { HiOutlineGlobeAlt, HiShare } from "react-icons/hi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams, Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { formatVND } from "../../utils/formatVND"
import { enrollFreeCourse, createRating, fetchCourseDetails } from "../../services/operations/courseDetailsAPI"
import { formatDate } from "../../services/formatDate"
import GetAvgRating from "../../utils/avgRating"
import { ACCOUNT_TYPE } from '../../utils/constants'
import { addToCart } from "../../slices/cartSlice"

import ConfirmationModal from "../../components/common/ConfirmationModal"
import Footer from "../../components/common/Layout/Footer"
import RatingStars from "../../components/common/RatingStars"
import CourseAccordionBar from "../../components/core/Course/CourseAccordionBar"
import Img from "../../components/common/Img"

import { MdOutlineVerified, MdLanguage, MdAccessTime, MdRateReview } from 'react-icons/md'
import { FaCheckCircle, FaUsers, FaPlayCircle, FaStar } from 'react-icons/fa'

function CourseDetails() {
    const { user } = useSelector((state) => state.profile)
    const { token } = useSelector((state) => state.auth)
    const { loading } = useSelector((state) => state.profile)
    const { paymentLoading } = useSelector((state) => state.course)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { courseId } = useParams()
    const [response, setResponse] = useState(null)
    const [confirmationModal, setConfirmationModal] = useState(null)
    const [avgReviewCount, setAvgReviewCount] = useState(0)
    const [isActive, setIsActive] = useState(Array(0))
    const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
    const [isEnrolled, setIsEnrolled] = useState(false)

    const [userRating, setUserRating] = useState(0)
    const [userReview, setUserReview] = useState("")
    const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)

    const fectchCourseDetailsData = async () => {
        try {
            const res = await fetchCourseDetails(courseId)
            setResponse(res)
        } catch (error) {
            console.log("Could not fetch Course Details")
        }
    }

    useEffect(() => {
        fectchCourseDetailsData()
    }, [courseId])

    let courseData = null;
    if (response) {
        if (response?.data?.courseDetails) {
            courseData = response.data.courseDetails;
        } else {
            courseData = response?.data || response;
        }
    }

    useEffect(() => {
        if (courseData && user) {
            if (courseData?.studentsEnrolled?.includes(user?._id)) {
                setIsEnrolled(true)
            }
        }
    }, [courseData, user])

    useEffect(() => {
        if (courseData?.ratingAndReviews?.length > 0) {
            const count = GetAvgRating(courseData.ratingAndReviews)
            setAvgReviewCount(count)
        } else {
            setAvgReviewCount(0)
        }
    }, [response, courseData])

    useEffect(() => {
        let lectures = 0
        courseData?.courseContent?.forEach((sec) => {
            if (typeof sec === 'object' && sec?.subSection) {
                lectures += sec.subSection.length || 0
            }
        })
        setTotalNoOfLectures(lectures)
    }, [response, courseData])

    const handleReviewSubmit = async () => {
        if (userRating === 0) {
            toast.error("Please select a star rating!");
            return;
        }
        if (userReview.trim() === "") {
            toast.error("Please write a review!");
            return;
        }

        setIsReviewSubmitting(true);
        try {
            const res = await createRating({
                courseId: courseId,
                rating: userRating,
                review: userReview
            }, token);

            if (res) {
                toast.success("Review added successfully!")
                setUserRating(0);
                setUserReview("");
                await fectchCourseDetailsData();
            }
        } catch (error) {
            console.error("Review Error:", error);
        }
        setIsReviewSubmitting(false);
    }

    const handleCourseAction = async () => {
        if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
            toast.error("Instructors cannot buy courses")
            return
        }
        if (!token) {
            setConfirmationModal({
                text1: "You are not logged in!",
                text2: "Please login to purchase or access the course.",
                btn1Text: "Login",
                btn2Text: "Cancel",
                btn1Handler: () => navigate("/login"),
                btn2Handler: () => setConfirmationModal(null),
            })
            return
        }
        if (isEnrolled) {
            navigate(`/course-workspace/${courseId}`);
            return
        }
        if (formatVND(price) === formatVND(0)) {
            try {
                const res = await enrollFreeCourse(courseId, token)
                if (res?.success) {
                    toast.success("Enrolled Successfully 🎉")
                    fectchCourseDetailsData();
                } else {
                    toast.error(res?.message || "Enroll failed")
                }
            } catch (err) {
                toast.error("System Error")
            }
            return;
        }
        handleBuyCourse();
    }

    const handleBuyCourse = async () => {
        dispatch(addToCart({
            _id: courseData._id,
            courseName: courseData.courseName,
            price: formatVND(courseData.price),
            thumbnail: courseData.thumbnail,
        }))
        navigate("/payment")
    }

    const handleAddToCart = () => {
        if (user && user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) {
            toast.error("Instructors cannot buy courses.")
            return
        }
        if (token) {
            dispatch(addToCart(courseData))
            return
        }
        setConfirmationModal({
            text1: "You are not logged in!",
            text2: "Please login to add to cart.",
            btn1Text: "Login",
            btn2Text: "Cancel",
            btn1Handler: () => navigate("/login"),
            btn2Handler: () => setConfirmationModal(null),
        })
    }

    const handleActive = (id) => {
        setIsActive(!isActive.includes(id) ? isActive.concat([id]) : isActive.filter((e) => e != id))
    }

    if (paymentLoading || loading || !response) {
        return (
            <div className="min-h-screen bg-richblack-900 pt-24 pb-10">
                <div className="mx-auto max-w-7xl px-4 animate-pulse">
                    <div className="h-8 w-1/4 bg-richblack-800 rounded mb-6"></div>
                    <div className="h-[400px] w-full bg-richblack-800 rounded-2xl mb-8"></div>
                </div>
            </div>
        )
    }

    const {
        courseName = "Course Name",
        courseDescription = "Description not available",
        thumbnail,
        price,
        whatYouWillLearn,
        courseContent = [],
        ratingAndReviews = [],
        instructor,
        studentsEnrolled = [],
        createdAt,
    } = courseData || {};

    const instructorName = (instructor?.firstName && instructor?.lastName)
        ? `${instructor.firstName} ${instructor.lastName}`
        : (instructor?.email || "Admin");

    const instructorImage = instructor?.image;

    const formattedDate = createdAt ? formatDate(createdAt) : formatDate(new Date().toISOString());

    return (
        <div className="bg-richblack-900 min-h-screen">
            <div className="bg-richblack-800 border-b border-richblack-700">
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex items-center gap-2 text-richblack-300 text-sm mt-5">
                        <Link to="/" className="hover:text-yellow-50 transition-colors">Home</Link>
                        <BiChevronRight />
                        <Link to="/all-courses" className="hover:text-yellow-50 transition-colors">Courses</Link>
                        <BiChevronRight />
                        <span className="text-yellow-50 font-medium truncate">{courseName}</span>
                    </div>
                </div>
            </div>

            <div className="relative w-full bg-richblack-900">
                <div className="relative z-10 mx-auto max-w-7xl px-4 py-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-8 space-y-3">
                            <h1 className="text-4xl md:text-4xl font-extrabold text-richblack-5 tracking-tight leading-tight">
                                {courseName}
                            </h1>
                            <p className="text-lg text-richblack-200 leading-relaxed max-w-3xl">
                                {courseDescription}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                <div className="flex items-center gap-2 bg-yellow-25/10 px-3 py-1.5 rounded-full border border-yellow-25/20 text-yellow-50">
                                    <span className="font-bold text-yellow-50">{avgReviewCount || 0}</span>
                                    <RatingStars Review_Count={avgReviewCount} Star_Size={14} />
                                    <span className="text-richblack-200 ml-1">({ratingAndReviews?.length || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 bg-blue-100/10 px-3 py-1.5 rounded-full border border-blue-100/20 text-blue-100">
                                    <FaUsers />
                                    <span>{studentsEnrolled?.length || 0} students</span>
                                </div>
                                <div className="flex items-center gap-2 text-richblack-300">
                                    <MdLanguage className="text-lg" />
                                    <span>English</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 pt-2 text-richblack-300 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-richblack-400">Created by</span>
                                    <Link to={`/instructor/${instructor?._id}`} className="text-richblack-5 hover:underline cursor-pointer font-medium hover:text-caribbeangreen-200 transition-colors flex items-center gap-1">
                                        {instructorName}
                                        <MdOutlineVerified className="text-caribbeangreen-200 text-xs" />
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BiInfoCircle />
                                    <span>Last updated: {formattedDate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block lg:col-span-4"></div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-20 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    <div className="lg:col-span-8 space-y-10">
                        <div className="border border-richblack-700 bg-richblack-800/40 p-6 rounded-2xl shadow-xl backdrop-blur-md">
                            <h2 className="text-2xl font-bold text-richblack-5 mb-3">What youll learn</h2>
                            <div>
                                {whatYouWillLearn && whatYouWillLearn.split('\n').map((line, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <FaCheckCircle className="text-caribbeangreen-200 mt-1.5 text-sm flex-shrink-0" />
                                        <p className="text-richblack-200 text-sm font-medium leading-6">{line}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-richblack-5">Course Content</h2>
                            <div className="flex flex-wrap justify-between items-center text-sm text-richblack-300 mb-4 bg-richblack-800/30 p-4 rounded-xl border border-richblack-700/50">
                                <div className="flex gap-4 flex-wrap">
                                    <span>{courseContent?.length} sections</span>
                                    <span>•</span>
                                    <span>{totalNoOfLectures} lectures</span>
                                    <span>•</span>
                                    <span>{courseData?.totalDuration} total length</span>
                                </div>
                                <button onClick={() => setIsActive([])} className="text-caribbeangreen-200 font-medium hover:text-caribbeangreen-300 transition-colors">
                                    Collapse all
                                </button>
                            </div>
                            <div className="border border-richblack-700 rounded-xl overflow-hidden bg-richblack-900 shadow-md">
                                {courseContent?.length > 0 ? (
                                    courseContent.map((course, index) => (
                                        <CourseAccordionBar
                                            course={course}
                                            key={index}
                                            isActive={isActive}
                                            handleActive={handleActive}
                                        />
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-richblack-400">No content available.</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-richblack-5 mb-6">Instructor</h2>
                            <Link
                                to={`/instructor/${instructor?._id}`}
                                className="flex items-start gap-5 p-6 border border-richblack-700 rounded-2xl bg-richblack-800/30 hover:bg-richblack-800/50 transition-all cursor-pointer group"
                            >
                                <Img
                                    src={instructorImage}
                                    alt="Instructor"
                                    className="h-20 w-20 rounded-full object-cover border-2 border-richblack-600 group-hover:scale-105 group-hover:border-caribbeangreen-200 transition-all duration-300"
                                />
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-richblack-5 flex items-center gap-2 group-hover:text-caribbeangreen-200 transition-colors">
                                        {instructorName}
                                        <MdOutlineVerified className="text-caribbeangreen-200" />
                                    </h3>
                                    <p className="text-richblack-300 text-sm mt-1 mb-3 font-medium line-clamp-2">
                                        {instructor?.additionalDetails?.about || "Experienced Instructor ready to help you learn."}
                                    </p>
                                    <div className="text-sm text-richblack-400 group-hover:underline">View Profile</div>
                                </div>
                            </Link>
                        </div>

                        <div className="pt-4" id="reviews">
                            <h2 className="text-2xl font-bold text-richblack-5 mb-6 flex items-center gap-2">
                                <MdRateReview className="text-yellow-50" />
                                Reviews
                            </h2>

                            {isEnrolled && (
                                <div className="bg-richblack-800/60 p-6 rounded-2xl border border-richblack-700 mb-8 shadow-lg backdrop-blur-sm">
                                    <h3 className="text-lg font-bold text-richblack-5 mb-4">Add a Review</h3>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-2 items-center mb-2">
                                            <span className="text-richblack-300 text-sm">Rate this course:</span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setUserRating(star)}
                                                        className={`text-2xl transition-all duration-200 hover:scale-110 ${star <= userRating ? "text-yellow-50" : "text-richblack-600"}`}
                                                    >
                                                        <FaStar />
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="text-yellow-50 font-bold ml-2 text-sm">{userRating > 0 ? `${userRating}/5 Stars` : ""}</span>
                                        </div>
                                        <textarea
                                            value={userReview}
                                            onChange={(e) => setUserReview(e.target.value)}
                                            placeholder="Share your thoughts about this course..."
                                            className="w-full min-h-[120px] bg-richblack-900 text-richblack-5 p-4 rounded-xl border border-richblack-700 focus:outline-none focus:border-yellow-50 transition-all resize-none shadow-inner"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleReviewSubmit}
                                                disabled={isReviewSubmitting}
                                                className="bg-yellow-50 text-richblack-900 font-bold px-6 py-2 rounded-lg hover:bg-yellow-100 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                            >
                                                {isReviewSubmitting ? "Submitting..." : "Submit Review"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-4">
                                {ratingAndReviews && ratingAndReviews.length > 0 ? (
                                    ratingAndReviews.map((review, index) => {
                                        const reviewerName = review?.user ? `${review.user.firstName} ${review.user.lastName}` : "Anonymous User";
                                        const reviewerImage = review?.user?.image
                                            ? review.user.image
                                            : `https://api.dicebear.com/5.x/initials/svg?seed=${reviewerName}`;

                                        return (
                                            <div key={index} className="flex gap-4 p-5 border border-richblack-700 bg-richblack-800/30 rounded-2xl hover:bg-richblack-800/50 transition-colors">
                                                <Img
                                                    src={reviewerImage}
                                                    alt="User"
                                                    className="h-12 w-12 rounded-full object-cover border border-richblack-600"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-bold text-richblack-5 text-sm">
                                                            {reviewerName}
                                                        </p>
                                                        <span className="text-richblack-500 text-xs">• {formatDate(review?.createdAt || new Date())}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-yellow-50 text-xs mb-3">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} className={i < review?.rating ? "text-yellow-50" : "text-richblack-700"} />
                                                        ))}
                                                    </div>
                                                    <p className="text-richblack-200 text-sm leading-relaxed">{review?.review}</p>
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 border border-dashed border-richblack-700 rounded-xl bg-richblack-800/20">
                                        <MdRateReview className="text-4xl text-richblack-600 mb-2" />
                                        <p className="text-richblack-300">No reviews yet. Be the first to review!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-[100px] z-20">
                            <div className="bg-richblack-800 border border-richblack-700 rounded-2xl overflow-hidden shadow-2xl p-1">
                                <div className="relative rounded-xl overflow-hidden group">
                                    <Img src={thumbnail} alt="course thumbnail" className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
                                        <FaPlayCircle className="text-6xl text-white drop-shadow-lg transform scale-90 group-hover:scale-110 transition-transform duration-300" />
                                    </div>
                                </div>
                                <div className="p-6 space-y-2">
                                    <div className="text-3xl font-bold text-richblack-5">
                                        {isEnrolled ? (
                                            <span className="text-caribbeangreen-200 flex items-center gap-2">
                                                <FaCheckCircle /> Purchased
                                            </span>
                                        ) : (
                                            formatVND(price) === 0 ? "Free" : `${formatVND(price)} `
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleCourseAction}
                                            className={`w-full py-3 px-6 rounded-xl font-bold text-richblack-900 transition-all duration-200 shadow-lg transform hover:-translate-y-1 
                                        ${isEnrolled
                                                    ? "bg-gradient-to-r from-caribbeangreen-200 to-caribbeangreen-300 hover:from-caribbeangreen-300 hover:to-caribbeangreen-400"
                                                    : "bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200"}`}
                                        >
                                            {isEnrolled ? "Go to Course" : (formatVND(price) === formatVND(0) ? "Enroll Now" : "Buy Now")}
                                        </button>
                                        {!isEnrolled && formatVND(price) > 0 && (
                                            <button onClick={handleAddToCart} className="w-full py-3 px-6 rounded-xl font-bold text-richblack-5 bg-richblack-700 hover:bg-richblack-600 border border-richblack-600 transition-all">
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-center text-xs text-richblack-300">30-Day Money-Back Guarantee</p>
                                    <div className="space-y-3 pt-4 border-t border-richblack-700">
                                        <p className="text-richblack-5 font-semibold text-sm">This course includes:</p>
                                        <div className="space-y-2 text-sm text-caribbeangreen-100">
                                            <div className="flex items-center gap-2"><MdAccessTime /><span>Lifetime access</span></div>
                                            <div className="flex items-center gap-2"><HiOutlineGlobeAlt /><span>Access on Mobile and TV</span></div>
                                            <div className="flex items-center gap-2"><BiInfoCircle /><span>Certificate of completion</span></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-richblack-200 cursor-pointer hover:text-caribbeangreen-200 transition-colors pt-2">
                                        <HiShare /> <span className="text-sm font-medium">Share</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-richblack-800 p-4 border-t border-richblack-700 z-50 flex items-center justify-between gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
                <div className="font-bold text-white text-lg">
                    {isEnrolled ? "Purchased" : (formatVND(price) === formatVND(0) ? "Free" : `${formatVND(price)} VND`)}
                </div>
                <button
                    onClick={handleCourseAction}
                    className={`py-2 px-6 rounded-lg font-bold text-richblack-900 shadow-md 
                ${isEnrolled ? "bg-caribbeangreen-200" : "bg-yellow-50"}`}
                >
                    {isEnrolled ? "Go to Course" : "Buy Now"}
                </button>
            </div>

            <Footer />
            {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
        </div>
    )
}

export default CourseDetails