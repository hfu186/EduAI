import { useEffect, useState } from "react";
import {
  getAllCourses,
  approveCourse,
} from "@/services/operations/adminAPI";
import {
  FaTimes,
  FaEye,
  FaFilePowerpoint,
  FaQuestionCircle,
  FaTasks,
  FaChevronRight,
  FaExternalLinkAlt,
  FaUser,
  FaTag,
  FaUsers,
  FaStar,
  FaCalendarAlt,
  FaBookOpen,
  FaMoneyBillWave,
  FaLayerGroup,
  FaClock,
} from "react-icons/fa";
import { MdErrorOutline, MdInfoOutline } from "react-icons/md";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

export default function CourseApproval() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { token } = useSelector((state) => state.auth);

  const fetchCourses = async () => {
    setLoading(true);
    const result = await getAllCourses(token);
    if (result) setCourses(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (price === 0 || price === "0") return "Free";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderSubSectionLink = (sub) => {
    const baseUrl = "http://localhost:5000";

    return (
      <div className="mt-3 space-y-2 border-t border-richblack-700/50 pt-3">
        {sub.type === "slide" && sub.slides?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sub.slides.map((slide, i) => (
              <a
                key={i}
                href={`${baseUrl}${slide.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-richblack-900 border border-blue-500/30 rounded-lg text-[11px] text-blue-200 hover:bg-blue-900/40 transition-all"
              >
                <FaFilePowerpoint /> {slide.fileName || "View Presentation"}
                <FaExternalLinkAlt className="ml-1 size-2.5" />
              </a>
            ))}
          </div>
        )}

        {sub.type === "quiz" && sub.quiz?.questions?.length > 0 && (
          <div className="bg-richblack-900/80 p-3 rounded-xl border border-yellow-500/20">
            <p className="text-[11px] text-yellow-100 font-bold mb-2 uppercase tracking-wide">
              Questions ({sub.quiz.questions.length})
            </p>
            <div className="max-h-36 overflow-y-auto pr-2 custom-scrollbar space-y-1">
              {sub.quiz.questions.map((q, i) => (
                <div
                  key={i}
                  className="text-[11px] text-richblack-300 py-1.5 border-b border-richblack-800 last:border-0"
                >
                  <span className="text-yellow-50 font-semibold">{i + 1}.</span>{" "}
                  {q.question}
                </div>
              ))}
            </div>
          </div>
        )}

        {sub.type === "assignment" && sub.assignment && (
          <div className="bg-richblack-900/80 p-3 rounded-xl border border-pink-500/20">
            <p className="text-[11px] text-pink-200 font-bold mb-1.5">
              Assignment Instructions
            </p>
            <p className="text-[11px] text-richblack-300 mb-2.5 leading-relaxed">
              {sub.assignment.description}
            </p>
            {sub.assignment.fileUrl && (
              <a
                href={`${baseUrl}${sub.assignment.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-900/20 border border-pink-500/30 rounded-lg text-[11px] text-pink-200 hover:bg-pink-900/40 transition-all"
              >
                <FaTasks /> View Attachment{" "}
                <FaExternalLinkAlt className="ml-1 size-2.5" />
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleStatus = async (courseId, status) => {
    const toastId = toast.loading("Updating course status...");
    const success = await approveCourse(courseId, status, token);
    if (success) {
      fetchCourses();
      if (selectedCourse) setSelectedCourse(null);
      toast.success("Status Updated");
    }
    toast.dismiss(toastId);
  };

  const getSubSectionIcon = (type) => {
    switch (type) {
      case "slide":
        return <FaFilePowerpoint className="text-blue-400" />;
      case "quiz":
        return <FaQuestionCircle className="text-yellow-100" />;
      case "assignment":
        return <FaTasks className="text-pink-400" />;
      default:
        return <MdInfoOutline className="text-richblack-400" />;
    }
  };

  // Count total lectures
  const getTotalLectures = (course) => {
    if (!course.courseContent || typeof course.courseContent[0] !== "object")
      return 0;
    return course.courseContent.reduce(
      (acc, section) => acc + (section.subSection?.length || 0),
      0
    );
  };

  if (loading)
    return (
      <div className="grid place-items-center h-[60vh]">
        <div className="spinner"></div>
      </div>
    );

  const pendingCount = courses.filter((c) => c.status === "Draft").length;

  return (
    <div className="space-y-8 animate-fadeIn px-4 md:px-8 lg:px-12 py-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-richblack-5">
            Moderation Portal
          </h2>
          <p className="text-sm text-richblack-400 mt-1">
            {pendingCount} course{pendingCount !== 1 ? "s" : ""} pending
            approval · Total {courses.length} courses
          </p>
        </div>
        <button
          onClick={fetchCourses}
          className="self-start text-sm bg-richblack-700 hover:bg-richblack-600 px-5 py-2.5 rounded-xl transition-all font-medium"
        >
          Refresh List
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="group bg-richblack-800 border border-richblack-700 rounded-2xl overflow-hidden hover:border-yellow-50/60 transition-all duration-300 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row p-4 gap-4">
              {/* Thumbnail */}
              <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden flex-shrink-0 border border-richblack-700">
                <img
                  src={course.thumbnail}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={course.courseName}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="bg-yellow-50 p-2.5 rounded-full text-black hover:scale-110 transition-transform shadow-lg"
                  >
                    <FaEye size={16} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-richblack-5 line-clamp-2 text-[15px] leading-snug">
                      {course.courseName}
                    </h3>
                    <span
                      className={`shrink-0 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        course.status === "Published"
                          ? "bg-caribbeangreen-900 text-caribbeangreen-200"
                          : "bg-pink-900 text-pink-200"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>

                  <p className="text-xs text-richblack-400 mt-1.5 flex items-center gap-1.5">
                    <FaUser className="text-richblack-500" size={10} />
                    {course.instructor?.firstName} {course.instructor?.lastName}
                  </p>

                  {/* Extra meta on card */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[11px] text-richblack-400">
                    {course.price !== undefined && (
                      <span className="flex items-center gap-1">
                        <FaMoneyBillWave size={10} className="text-caribbeangreen-300" />
                        {formatPrice(course.price)}
                      </span>
                    )}
                    {course.category?.name && (
                      <span className="flex items-center gap-1">
                        <FaTag size={10} className="text-blue-300" />
                        {course.category.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FaBookOpen size={10} className="text-yellow-100" />
                      {getTotalLectures(course)} lectures
                    </span>
                    {course.studentsEnrolled?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <FaUsers size={10} className="text-pink-300" />
                        {course.studentsEnrolled.length} students
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-richblack-700 pt-3">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="text-[11px] font-bold text-yellow-50 flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    VIEW DETAILS <FaChevronRight size={10} />
                  </button>
                  <button
                    onClick={() =>
                      handleStatus(
                        course._id,
                        course.status === "Draft" ? "Published" : "Draft"
                      )
                    }
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      course.status === "Draft"
                        ? "bg-caribbeangreen-200 text-black shadow-md hover:bg-caribbeangreen-100"
                        : "bg-pink-700 text-white hover:bg-pink-600"
                    }`}
                  >
                    {course.status === "Draft" ? "Approve" : "Revoke"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== FULL PREVIEW MODAL ===================== */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-4xl rounded-3xl border border-richblack-700 bg-richblack-800 shadow-2xl overflow-hidden animate-slideUp max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-richblack-700 bg-richblack-900/60 shrink-0">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-richblack-5 tracking-wide">
                  Course Inspection
                </h2>
                <p className="text-xs text-richblack-400 mt-0.5 font-mono">
                  ID: {selectedCourse._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2.5 hover:bg-richblack-700 rounded-full transition-colors text-richblack-200"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-5 md:p-7 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              {/* Top section: Thumbnail + Main info */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-2">
                  <img
                    src={selectedCourse.thumbnail}
                    className="w-full aspect-video object-cover rounded-2xl border border-richblack-700 shadow-xl"
                    alt={selectedCourse.courseName}
                  />
                </div>

                <div className="md:col-span-3 space-y-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          selectedCourse.status === "Published"
                            ? "bg-caribbeangreen-900 text-caribbeangreen-200"
                            : "bg-pink-900 text-pink-200"
                        }`}
                      >
                        {selectedCourse.status}
                      </span>
                      {selectedCourse.category?.name && (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-900/50 text-blue-200 font-medium">
                          {selectedCourse.category.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-yellow-50 leading-tight">
                      {selectedCourse.courseName}
                    </h3>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center gap-3">
                    {selectedCourse.instructor?.image ? (
                      <img
                        src={selectedCourse.instructor.image}
                        alt="instructor"
                        className="w-10 h-10 rounded-full object-cover border border-richblack-600"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-richblack-700 flex items-center justify-center">
                        <FaUser className="text-richblack-400" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-richblack-5">
                        {selectedCourse.instructor?.firstName}{" "}
                        {selectedCourse.instructor?.lastName}
                      </p>
                      <p className="text-xs text-richblack-400">
                        {selectedCourse.instructor?.email || "Instructor"}
                      </p>
                    </div>
                  </div>

                  {/* Key stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-richblack-900/60 rounded-xl p-3 border border-richblack-700">
                      <p className="text-[10px] text-richblack-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FaMoneyBillWave size={10} /> Price
                      </p>
                      <p className="text-sm font-bold text-caribbeangreen-200">
                        {formatPrice(selectedCourse.price)}
                      </p>
                    </div>
                    <div className="bg-richblack-900/60 rounded-xl p-3 border border-richblack-700">
                      <p className="text-[10px] text-richblack-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FaBookOpen size={10} /> Lectures
                      </p>
                      <p className="text-sm font-bold text-richblack-5">
                        {getTotalLectures(selectedCourse)}
                      </p>
                    </div>
                    <div className="bg-richblack-900/60 rounded-xl p-3 border border-richblack-700">
                      <p className="text-[10px] text-richblack-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FaUsers size={10} /> Students
                      </p>
                      <p className="text-sm font-bold text-richblack-5">
                        {selectedCourse.studentsEnrolled?.length || 0}
                      </p>
                    </div>
                    {selectedCourse.ratingAndReviews?.length > 0 && (
                      <div className="bg-richblack-900/60 rounded-xl p-3 border border-richblack-700">
                        <p className="text-[10px] text-richblack-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <FaStar size={10} /> Reviews
                        </p>
                        <p className="text-sm font-bold text-yellow-100">
                          {selectedCourse.ratingAndReviews.length}
                        </p>
                      </div>
                    )}
                    <div className="bg-richblack-900/60 rounded-xl p-3 border border-richblack-700">
                      <p className="text-[10px] text-richblack-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FaCalendarAlt size={10} /> Created
                      </p>
                      <p className="text-sm font-bold text-richblack-5">
                        {formatDate(selectedCourse.createdAt)}
                      </p>
                    </div>
                    {selectedCourse.updatedAt && (
                      <div className="bg-richblack-900/60 rounded-xl p-3 border border-richblack-700">
                        <p className="text-[10px] text-richblack-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <FaClock size={10} /> Updated
                        </p>
                        <p className="text-sm font-bold text-richblack-5">
                          {formatDate(selectedCourse.updatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedCourse.courseDescription && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-richblack-400 flex items-center gap-2">
                    <FaLayerGroup size={11} /> Description
                  </h4>
                  <p className="text-sm text-richblack-200 leading-relaxed bg-richblack-900/40 p-4 rounded-xl border border-richblack-700">
                    {selectedCourse.courseDescription}
                  </p>
                </div>
              )}

              {/* What you will learn */}
              {selectedCourse.whatYouWillLearn && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-richblack-400">
                    What students will learn
                  </h4>
                  <div className="text-sm text-richblack-200 leading-relaxed bg-richblack-900/40 p-4 rounded-xl border border-richblack-700 whitespace-pre-line">
                    {selectedCourse.whatYouWillLearn}
                  </div>
                </div>
              )}

              {/* Instructions / Requirements */}
              {selectedCourse.instructions?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-richblack-400">
                    Requirements / Instructions
                  </h4>
                  <ul className="space-y-1.5 bg-richblack-900/40 p-4 rounded-xl border border-richblack-700">
                    {selectedCourse.instructions.map((item, i) => (
                      <li
                        key={i}
                        className="text-sm text-richblack-200 flex items-start gap-2"
                      >
                        <span className="text-yellow-50 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {selectedCourse.tag?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-richblack-400 flex items-center gap-2">
                    <FaTag size={11} /> Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.tag.map((t, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-3 py-1 rounded-full bg-richblack-700 text-richblack-200 border border-richblack-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-richblack-5 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <FaChevronRight className="text-yellow-50" size={10} />
                  Curriculum Inspection
                </h4>

                {selectedCourse.courseContent &&
                typeof selectedCourse.courseContent[0] === "object" ? (
                  <div className="space-y-4">
                    {selectedCourse.courseContent.map((section, idx) => (
                      <div
                        key={idx}
                        className="bg-richblack-900/50 rounded-2xl p-5 border border-richblack-700"
                      >
                        <h5 className="text-yellow-50 font-bold text-sm mb-4 border-b border-richblack-800 pb-2.5 flex items-center gap-2">
                          <span className="bg-yellow-50/10 text-yellow-50 text-[10px] px-2 py-0.5 rounded">
                            Section {idx + 1}
                          </span>
                          {section.sectionName}
                        </h5>

                        <div className="space-y-3">
                          {section.subSection?.length > 0 ? (
                            section.subSection.map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex flex-col bg-richblack-800/50 p-4 rounded-xl border border-richblack-700/60 hover:bg-richblack-800/80 transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="shrink-0 w-8 h-8 rounded-lg bg-richblack-900 flex items-center justify-center">
                                    {getSubSectionIcon(sub.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-richblack-5 truncate">
                                      {sub.title}
                                    </p>
                                    <p className="text-[10px] font-medium text-richblack-400 uppercase tracking-wider mt-0.5">
                                      {sub.type}
                                    </p>
                                  </div>
                                </div>
                                {renderSubSectionLink(sub)}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-pink-400 italic py-2">
                              No lessons found in this section.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-richblack-900 rounded-2xl border border-dashed border-richblack-700">
                    <MdErrorOutline
                      size={36}
                      className="text-pink-300 mx-auto mb-3"
                    />
                    <p className="text-sm text-richblack-300 font-bold uppercase">
                      Data Population Error
                    </p>
                    <p className="text-xs text-richblack-500 mt-1">
                      Backend is sending ID strings instead of populated
                      objects.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-5 md:p-6 bg-richblack-900/80 border-t border-richblack-700 flex flex-wrap justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-6 py-2.5 rounded-xl bg-richblack-700 text-richblack-50 font-bold hover:bg-richblack-600 transition-all text-xs uppercase tracking-widest"
              >
                Close
              </button>
              <button
                onClick={() =>
                  handleStatus(
                    selectedCourse._id,
                    selectedCourse.status === "Draft" ? "Published" : "Draft"
                  )
                }
                className={`px-7 py-2.5 rounded-xl font-black transition-all hover:scale-[1.03] text-xs uppercase tracking-widest shadow-lg ${
                  selectedCourse.status === "Draft"
                    ? "bg-yellow-50 text-black shadow-yellow-100/20"
                    : "bg-pink-700 text-white hover:bg-pink-600"
                }`}
              >
                {selectedCourse.status === "Draft"
                  ? "Confirm & Publish"
                  : "Revoke Publication"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}