import { useEffect, useState } from "react";
import { getInstructorRequests, getInstructors, reviewInstructorRequest } from "@/services/operations/adminAPI";
import { getInstructorProfile } from "@/services/operations/profileAPI";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineEye,
} from "react-icons/hi";

export default function InstructorList() {
  const [requests, setRequests] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const fetchData = async () => {
    setLoadingData(true);
    const [reqRes, insRes] = await Promise.all([
      getInstructorRequests(token),
      getInstructors(token),
    ]);
    if (reqRes) setRequests(reqRes);
    if (insRes) setInstructors(insRes);
    setLoadingData(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openInstructorProfile = async (instructorId) => {
    setProfileLoading(true);
    const data = await getInstructorProfile(instructorId);
    if (!data) {
      toast.error(t("pages.admin.instructor_management.load_profile_error"));
      setProfileLoading(false);
      return;
    }
    setSelectedInstructor(data);
    setProfileLoading(false);
  };

  const openRequestDetails = (req) => {
    setSelectedRequest(req);
  };

  const handleReview = async (userId, decision) => {
    const result = await reviewInstructorRequest(userId, decision, token);
    if (result?.success) {
      toast.success(
        decision === "approved"
          ? t("pages.admin.instructor_management.approved")
          : t("pages.admin.instructor_management.rejected")
      );
      setSelectedRequest(null);
      fetchData();
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      {/* Header */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-richblack-5">
          {t("pages.admin.instructor_management.title")}
        </h2>
        <p className="text-sm text-richblack-300 mt-2 max-w-2xl">
          {t("pages.admin.instructor_management.description")}
        </p>
      </div>

      {/* ===== PENDING REQUESTS ===== */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-richblack-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            {t("pages.admin.instructor_management.pending_requests")}
          </h3>
          {requests.length > 0 && (
            <span className="text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-full">
              {requests.length} pending
            </span>
          )}
        </div>

        {loadingData ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-richblack-900 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-richblack-900 flex items-center justify-center mb-4">
              <HiOutlineUser className="text-3xl text-richblack-500" />
            </div>
            <p className="text-richblack-400 text-sm">
              {t("pages.admin.instructor_management.no_pending")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="group rounded-xl border border-richblack-700 bg-richblack-900 p-4 hover:border-richblack-600 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-12 h-12 rounded-full bg-richblack-700 flex items-center justify-center flex-shrink-0 text-yellow-50 font-bold text-lg">
                      {req.firstName?.[0]}
                      {req.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-richblack-5">
                        {req.firstName} {req.lastName}
                      </p>
                      <p className="text-sm text-richblack-400 mt-0.5">{req.email}</p>
                      {req.instructorRequestDetails?.documents?.length > 0 && (
                        <p className="text-xs text-caribbeangreen-200 mt-1.5 flex items-center gap-1.5">
                          <HiOutlineDocumentText className="text-sm" />
                          {req.instructorRequestDetails.documents.length} document
                          {req.instructorRequestDetails.documents.length > 1 ? "s" : ""} attached
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openRequestDetails(req)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-richblack-700 hover:bg-yellow-500 hover:text-richblack-900 px-4 py-2.5 text-sm font-medium text-richblack-5 transition-all"
                  >
                    <HiOutlineEye className="text-base" />
                    {t("pages.admin.instructor_management.view_profile")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== APPROVED INSTRUCTORS ===== */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-2xl p-5 md:p-6">
        <h3 className="text-lg font-semibold text-richblack-5 mb-5">
          {t("pages.admin.instructor_management.instructor_list")}
        </h3>

        {loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-richblack-900 animate-pulse" />
            ))}
          </div>
        ) : instructors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-richblack-400 text-sm">No instructors yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {instructors.map((ins) => (
              <div
                key={ins._id}
                className="group bg-richblack-900 border border-richblack-700 rounded-2xl p-5 text-center hover:border-yellow-500/40 transition-all duration-300"
              >
                <div className="relative inline-block mb-4">
                  <img
                    src={ins.image}
                    className="w-20 h-20 rounded-full object-cover border-2 border-yellow-50 group-hover:scale-105 transition-transform"
                    alt="avatar"
                  />
                </div>

                <h4 className="font-bold text-lg text-richblack-5">
                  {ins.firstName} {ins.lastName}
                </h4>
                <p className="text-sm text-richblack-400 mt-1 truncate">{ins.email}</p>

                <div className="mt-5 pt-4 border-t border-richblack-700">
                  <p className="text-2xl font-bold text-yellow-50">
                    {ins.courses?.length || 0}
                  </p>
                  <p className="text-xs text-richblack-400 mt-0.5">
                    {t("pages.admin.instructor_management.courses")}
                  </p>
                </div>

                <button
                  onClick={() => openInstructorProfile(ins._id)}
                  disabled={profileLoading}
                  className="mt-5 w-full bg-richblack-700 hover:bg-yellow-500 hover:text-richblack-900 text-richblack-5 text-sm font-medium py-2.5 rounded-lg transition-all disabled:opacity-50"
                >
                  {profileLoading ? "Loading..." : "View profile"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MODAL: PENDING REQUEST DETAILS ===== */}
      {selectedRequest && (
        <div className="fixed h-full inset-0 z-[1000] bg-black/75 backdrop-blur-sm grid place-items-center overflow-y-hidden">
          <div className="w-full max-w-2xl bg-richblack-800 border border-richblack-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-richblack-700">
              <div>
                <h3 className="text-xl font-bold text-richblack-5">
                  {selectedRequest.firstName} {selectedRequest.lastName}
                </h3>
                <span className="inline-flex items-center gap-1 mt-2 rounded-full bg-yellow-5 border border-yellow-500/30 px-3 py-1 text-xs font-semibold text-yellow-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  Pending review
                </span>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-lg text-richblack-400 hover:text-richblack-5 hover:bg-richblack-700 transition-colors"
              >
                <HiOutlineX className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Email */}
                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineMail /> {t("profile.personal.email")}
                  </p>
                  <p className="text-richblack-5 text-sm break-all">
                    {selectedRequest.instructorRequestDetails?.email || selectedRequest.email}
                  </p>
                </div>

                {/* Phone */}
                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlinePhone /> {t("profile.personal.phone")}
                  </p>
                  <p className="text-richblack-5 text-sm">
                    {selectedRequest.instructorRequestDetails?.phone || "N/A"}
                  </p>
                </div>

                {/* Bio */}
                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700 md:col-span-2">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineUser /> {t("profile.about.title")}
                  </p>
                  <p className="text-richblack-5 text-sm whitespace-pre-line leading-relaxed">
                    {selectedRequest.instructorRequestDetails?.bio ||
                      t("pages.admin.instructor_management.no_bio")}
                  </p>
                </div>

                {/* Qualifications */}
                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineAcademicCap /> Qualifications & certifications
                  </p>
                  <p className="text-richblack-5 text-sm whitespace-pre-line">
                    {selectedRequest.instructorRequestDetails?.qualifications || "Not provided"}
                  </p>
                </div>

                {/* Experience */}
                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineBriefcase /> Teaching experience
                  </p>
                  <p className="text-richblack-5 text-sm whitespace-pre-line">
                    {selectedRequest.instructorRequestDetails?.experience || "Not provided"}
                  </p>
                </div>

                {/* Documents */}
                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700 md:col-span-2">
                  <p className="text-xs text-richblack-400 mb-3 flex items-center gap-1.5">
                    <HiOutlineDocumentText /> Verification documents
                  </p>
                  {selectedRequest.instructorRequestDetails?.documents?.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {selectedRequest.instructorRequestDetails.documents.map((doc, index) => {
                        const isImage = /\.(jpe?g|png|webp|gif)$/i.test(doc.name || doc.url);
                        return isImage ? (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setPreviewImage(doc.url)}
                            className="group relative h-24 w-24 overflow-hidden rounded-xl border border-richblack-600 hover:border-yellow-50 transition-all"
                          >
                            <img
                              src={doc.url}
                              alt={doc.name || `Document ${index + 1}`}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </button>
                        ) : (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 rounded-xl border border-richblack-600 bg-richblack-800 px-3.5 py-2.5 text-xs text-richblack-200 hover:border-yellow-50 hover:text-yellow-50 transition-all"
                          >
                            <HiOutlineDocumentText className="text-base flex-shrink-0" />
                            <span className="truncate max-w-[140px]">{doc.name || "Document"}</span>
                            <HiOutlineExternalLink className="flex-shrink-0 opacity-70" />
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-richblack-500">No documents attached</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-richblack-700 bg-richblack-900/50">
              <button
                onClick={() => handleReview(selectedRequest._id, "rejected")}
                className="flex items-center gap-2 rounded-xl border border-richblack-600 px-5 py-2.5 text-sm font-medium text-richblack-300 hover:bg-richblack-700 hover:text-pink-200 transition-all"
              >
                <HiOutlineX />
                {t("pages.admin.instructor_management.reject")}
              </button>
              <button
                onClick={() => handleReview(selectedRequest._id, "approved")}
                className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-richblack-900 hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20"
              >
                <HiOutlineCheck />
                {t("pages.admin.instructor_management.approve")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: APPROVED INSTRUCTOR PROFILE ===== */}
      {selectedInstructor && (
        <div className="relative">
          <div className="w-full max-w-2xl bg-richblack-800 border border-richblack-700 rounded-2xl shadow-2xl my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-richblack-700">
              <div className="flex items-center gap-4">
                <img
                  src={selectedInstructor.image}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-yellow-50"
                />
                <div>
                  <h3 className="text-xl font-bold text-richblack-5">
                    {selectedInstructor.firstName} {selectedInstructor.lastName}
                  </h3>
                  <p className="text-sm text-richblack-400 mt-0.5">{selectedInstructor.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInstructor(null)}
                className="p-2 rounded-lg text-richblack-400 hover:text-richblack-5 hover:bg-richblack-700 transition-colors"
              >
                <HiOutlineX className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineMail /> {t("profile.personal.email")}
                  </p>
                  <p className="text-richblack-5 text-sm break-all">{selectedInstructor.email}</p>
                </div>

                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlinePhone /> {t("profile.personal.phone")}
                  </p>
                  <p className="text-richblack-5 text-sm">
                    {selectedInstructor.additionalDetails?.contactNumber || "N/A"}
                  </p>
                </div>

                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700 md:col-span-2">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineUser /> {t("profile.about.title")}
                  </p>
                  <p className="text-richblack-5 text-sm leading-relaxed">
                    {selectedInstructor.additionalDetails?.about ||
                      t("pages.admin.instructor_management.no_bio")}
                  </p>
                </div>

                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineAcademicCap /> Qualifications & certifications
                  </p>
                  <p className="text-richblack-5 text-sm whitespace-pre-line">
                    {selectedInstructor.additionalDetails?.qualifications || "Not provided"}
                  </p>
                </div>

                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
                  <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
                    <HiOutlineBriefcase /> Teaching experience
                  </p>
                  <p className="text-richblack-5 text-sm whitespace-pre-line">
                    {selectedInstructor.additionalDetails?.experience || "Not provided"}
                  </p>
                </div>

                {/* Stats */}
                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700 md:col-span-2">
                  <p className="text-xs text-richblack-400 mb-3">
                    {t("pages.admin.instructor_management.statistics")}
                  </p>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-2xl font-bold text-yellow-50">
                        {selectedInstructor.stats?.totalCourses || 0}
                      </p>
                      <p className="text-xs text-richblack-400 mt-0.5">
                        {t("pages.admin.instructor_management.courses")}
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-50">
                        {selectedInstructor.stats?.totalStudents || 0}
                      </p>
                      <p className="text-xs text-richblack-400 mt-0.5">
                        {t("pages.admin.instructor_management.students")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificates */}
                {selectedInstructor.additionalDetails?.certificates?.length > 0 && (
                  <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700 md:col-span-2">
                    <p className="text-xs text-richblack-400 mb-3">Certificate photos</p>
                    <div className="flex flex-wrap gap-3">
                      {selectedInstructor.additionalDetails.certificates.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setPreviewImage(url)}
                          className="h-24 w-24 overflow-hidden rounded-xl border border-richblack-600 hover:border-yellow-50 transition-all"
                        >
                          <img
                            src={url}
                            alt={`Certificate ${index + 1}`}
                            className="h-full w-full object-cover hover:scale-110 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-richblack-800 text-richblack-200 hover:text-white hover:bg-richblack-700 transition-colors"
          >
            <HiOutlineX className="text-2xl" />
          </button>
          <img
            src={previewImage}
            alt="Document preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}