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

  const renderSubSectionLink = (sub) => {
    const baseUrl = "http://localhost:5000";

    return (
      <div className="mt-2 space-y-2 border-t border-richblack-700/50 pt-2">
        {sub.type === "slide" && sub.slides?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sub.slides.map((slide, i) => (
              <a
                key={i}
                href={`${baseUrl}${slide.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-richblack-900 border border-blue-500/30 rounded-md text-[10px] text-blue-200 hover:bg-blue-900/40 transition-all shadow-sm"
              >
                <FaFilePowerpoint /> {slide.fileName || "View Presentation"}
                <FaExternalLinkAlt className="ml-1 size-2" />
              </a>
            ))}
          </div>
        )}

        {sub.type === "quiz" && sub.quiz?.questions?.length > 0 && (
          <div className="bg-richblack-900/80 p-3 rounded-lg border border-yellow-500/10">
            <p className="text-[10px] text-yellow-100 font-bold mb-1 uppercase tracking-tight">
              Question List ({sub.quiz.questions.length}):
            </p>
            <div className="max-h-32 overflow-y-auto pr-2 custom-scrollbar">
              {sub.quiz.questions.map((q, i) => (
                <div
                  key={i}
                  className="text-[10px] text-richblack-300 py-1 border-b border-richblack-800 last:border-0 italic"
                >
                  <span className="text-yellow-50">{i + 1}.</span> {q.question}
                </div>
              ))}
            </div>
          </div>
        )}

        {sub.type === "assignment" && sub.assignment && (
          <div className="bg-richblack-900/80 p-3 rounded-lg border border-pink-500/10">
            <p className="text-[10px] text-pink-200 font-bold mb-1 italic">
              Task Instructions:
            </p>
            <p className="text-[10px] text-richblack-300 mb-2 leading-relaxed">
              {sub.assignment.description}
            </p>
            {sub.assignment.fileUrl && (
              <a
                href={`${baseUrl}${sub.assignment.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1 bg-pink-900/20 border border-pink-500/30 rounded-md text-[10px] text-pink-200 hover:bg-pink-900/40 transition-all"
              >
                <FaTasks /> View Attachment{" "}
                <FaExternalLinkAlt className="ml-1 size-2" />
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

  if (loading)
    return (
      <div className="grid place-items-center min-h-[50vh]">
        <div className="spinner"></div>
      </div>
    );

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-richblack-800 p-6 rounded-2xl border border-richblack-700">
        <div>
          <h2 className="text-xl font-bold text-richblack-5">
            Moderation Portal
          </h2>
          <p className="text-sm text-richblack-400">
            Total {courses.filter((c) => c.status === "Draft").length} courses
            pending approval.
          </p>
        </div>
        <button
          onClick={fetchCourses}
          className="text-sm bg-richblack-700 px-4 py-2 rounded-lg hover:bg-richblack-600 transition-all"
        >
          Refresh List
        </button>
      </div>

      {/* Grid danh sách */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="group bg-richblack-800 border border-richblack-700 rounded-2xl overflow-hidden hover:border-yellow-50 transition-all duration-300 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row p-4 gap-4">
              <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-richblack-700">
                <img
                  src={course.thumbnail}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt=""
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="bg-yellow-50 p-2 rounded-full text-black hover:scale-110 transition-transform shadow-lg"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-richblack-5 line-clamp-1">
                      {course.courseName}
                    </h3>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${course.status === "Published" ? "bg-caribbeangreen-900 text-caribbeangreen-200" : "bg-pink-900 text-pink-200"}`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className="text-xs text-richblack-400 mt-1 italic">
                    Author: {course.instructor?.firstName}{" "}
                    {course.instructor?.lastName}
                  </p>
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
                        course.status === "Draft" ? "Published" : "Draft",
                      )
                    }
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      course.status === "Draft"
                        ? "bg-caribbeangreen-200 text-black shadow-md"
                        : "bg-pink-700 text-white"
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

      {/* MODAL PREVIEW HOÀN CHỈNH */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-[900px] rounded-3xl border border-richblack-700 bg-richblack-800 shadow-2xl overflow-hidden animate-slideUp">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-richblack-700 bg-richblack-900/50">
              <div>
                <h2 className="text-xl font-bold text-richblack-5 uppercase tracking-wide">
                  Course Inspection
                </h2>
                <p className="text-xs text-richblack-400 mt-1">
                  ID: {selectedCourse._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 hover:bg-richblack-700 rounded-full transition-colors text-richblack-200"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Course Metadata... giữ nguyên như code trước */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-richblack-700 pb-8">
                <div className="md:col-span-1">
                  <img
                    src={selectedCourse.thumbnail}
                    className="w-full object-cover rounded-2xl border border-richblack-700 shadow-xl"
                    alt=""
                  />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-3xl font-extrabold text-yellow-50 leading-tight">
                    {selectedCourse.courseName}
                  </h3>
                  <p className="text-richblack-200 text-sm leading-relaxed italic">
                    {selectedCourse.courseDescription}
                  </p>
                </div>
              </div>

              {/* Cấu trúc chương trình học */}
              <div className="space-y-4 pt-4">
                <h4 className="font-bold text-richblack-5 flex items-center gap-2 uppercase text-xs tracking-widest">
                  <FaChevronRight className="text-yellow-50 size-2" />{" "}
                  Curriculum Inspection
                </h4>

                {selectedCourse.courseContent &&
                typeof selectedCourse.courseContent[0] === "object" ? (
                  <div className="grid grid-cols-1 gap-4">
                    {selectedCourse.courseContent.map((section, idx) => (
                      <div
                        key={idx}
                        className="bg-richblack-900/50 rounded-2xl p-5 border border-richblack-700"
                      >
                        <h5 className="text-yellow-50 font-bold text-sm mb-4 border-b border-richblack-800 pb-2">
                          Section {idx + 1}: {section.sectionName}
                        </h5>

                        <div className="space-y-3 pl-2">
                          {section.subSection?.length > 0 ? (
                            section.subSection.map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex flex-col bg-richblack-800/40 p-4 rounded-xl border border-richblack-700/50 shadow-sm transition-all hover:bg-richblack-800/60"
                              >
                                <div className="flex items-center gap-3">
                                  {getSubSectionIcon(sub.type)}
                                  <div className="flex-1">
                                    <p className="text-xs font-bold text-richblack-5">
                                      {sub.title}
                                    </p>
                                    <div className="mt-1 flex gap-3 text-[9px] font-bold text-richblack-400 uppercase tracking-wider">
                                      <span>Type: {sub.type}</span>
                                    </div>
                                  </div>
                                </div>

                                {renderSubSectionLink(sub)}
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-pink-400 italic">
                              No lessons found in this section.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-richblack-900 rounded-3xl border border-dashed border-richblack-700">
                    <MdErrorOutline
                      size={32}
                      className="text-pink-200 mx-auto mb-2"
                    />
                    <p className="text-sm text-richblack-300 font-bold uppercase">
                      Data Population Error
                    </p>
                    <p className="text-[10px] text-richblack-500">
                      Backend is sending ID strings instead of populated
                      objects.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-6 bg-richblack-900/80 border-t border-richblack-700 flex flex-wrap justify-end gap-4">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-6 py-2.5 rounded-xl bg-richblack-700 text-richblack-50 font-bold hover:bg-richblack-600 transition-all text-xs uppercase tracking-widest"
              >
                Close Preview
              </button>
              <button
                onClick={() =>
                  handleStatus(
                    selectedCourse._id,
                    selectedCourse.status === "Draft" ? "Published" : "Draft",
                  )
                }
                className={`px-8 py-2.5 rounded-xl font-black transition-all hover:scale-105 text-xs uppercase tracking-widest shadow-lg ${
                  selectedCourse.status === "Draft"
                    ? "bg-yellow-50 text-black shadow-yellow-100/10"
                    : "bg-pink-700 text-white"
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
