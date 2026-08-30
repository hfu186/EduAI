/* eslint-disable react/prop-types */
import { useEffect, useState, useMemo } from "react";
import {
  getAllUsers,
  deleteUser,
  promoteUser,
  getInstructorRequests,
  reviewInstructorRequest,
} from "@/services/operations/adminAPI";
import { getInstructorProfile } from "@/services/operations/profileAPI";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineUserAdd,
} from "react-icons/hi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [instructorDetail, setInstructorDetail] = useState(null);
  const [instructorDetailLoading, setInstructorDetailLoading] = useState(false);

  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers(token);
    if (result) setUsers(result);
    setLoading(false);
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    const result = await getInstructorRequests(token);
    if (result) setRequests(result);
    setRequestsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!users.length) {
      setSelectedUserId(null);
      return;
    }
    const stillExists = users.some((item) => item._id === selectedUserId);
    if (!stillExists) {
      setSelectedUserId(users[0]._id);
    }
  }, [users, selectedUserId]);

  const selectedUser = users.find((item) => item._id === selectedUserId);

  useEffect(() => {
    if (!selectedUser || selectedUser.accountType !== "Instructor") {
      setInstructorDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setInstructorDetailLoading(true);
      const data = await getInstructorProfile(selectedUser._id);
      if (!cancelled) {
        setInstructorDetail(data || null);
        setInstructorDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedUser?._id, selectedUser?.accountType]);

  // ===== Derived data =====
  const totalStudents = users.filter((u) => u.accountType === "Student").length;
  const totalInstructors = users.filter((u) => u.accountType === "Instructor").length;
  const totalAdmins = users.filter((u) => u.accountType === "Admin").length;

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        `${user.firstName} ${user.lastName} ${user.email}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.accountType === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const roleBadgeClass = (role) => {
    if (role === "Admin") return "bg-pink-900/80 text-pink-100 border-pink-700";
    if (role === "Instructor") return "bg-yellow-900/80 text-yellow-100 border-yellow-700";
    return "bg-richblack-700 text-richblack-100 border-richblack-600";
  };

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  // ===== Actions =====
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      t("pages.admin.user_management.delete_confirm")
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteUser(userId, token);
      if (res) {
        toast.success(t("pages.admin.user_management.deleted"));
        fetchUsers();
      }
    } catch (error) {
      toast.error(t("pages.admin.user_management.delete_error"));
      console.error(error);
    }
  };

  const handlePromoteUser = async (userId) => {
    const confirmPromote = window.confirm(
      t("pages.admin.user_management.promote_confirm")
    );
    if (!confirmPromote) return;

    const res = await promoteUser(userId, token);
    if (res?.success) {
      toast.success(t("pages.admin.user_management.promoted"));
      fetchUsers();
    }
  };

  const openRequestDetails = (req) => setSelectedRequest(req);

  const handleReview = async (userId, decision) => {
    const result = await reviewInstructorRequest(userId, decision, token);
    if (result?.success) {
      toast.success(
        decision === "approved"
          ? t("pages.admin.instructor_management.approved")
          : t("pages.admin.instructor_management.rejected")
      );
      setSelectedRequest(null);
      fetchRequests();
      fetchUsers();
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 min-h-screen">
      {/* Header */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
        <h2 className="text-2xl font-semibold text-richblack-5">
          {t("pages.admin.user_management.title")}
        </h2>
        <p className="text-sm text-richblack-300 mt-1">
          {t("pages.admin.user_management.description")}
        </p>
      </div>

      {/* ===== PENDING INSTRUCTOR REQUESTS ===== */}
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-richblack-5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            {t("pages.admin.instructor_management.pending_requests")}
          </h3>
          {requests.length > 0 && (
            <span className="text-xs font-medium bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-full">
              {requests.length} pending
            </span>
          )}
        </div>

        {requestsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-richblack-900 animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-richblack-400 text-sm">
              {t("pages.admin.instructor_management.no_pending")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-richblack-700 bg-richblack-900/60 p-4 hover:border-yellow-500/40 hover:bg-richblack-900 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center flex-shrink-0 text-yellow-50 font-bold text-sm shadow-md">
                    {getInitials(req.firstName, req.lastName)}
                  </div>
                  <div>
                    <p className="font-semibold text-richblack-5 text-sm">
                      {req.firstName} {req.lastName}
                    </p>
                    <p className="text-xs text-richblack-400 mt-0.5">{req.email}</p>
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
            ))}
          </div>
        )}
      </div>

      {/* ===== ALL USERS ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: List */}
        <div className="xl:col-span-2 rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden flex flex-col">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-richblack-700 p-4 text-xs">
            <div className="rounded-lg bg-richblack-700/50 px-3 py-2.5 text-richblack-100">
              {t("pages.admin.user_management.total")}:{" "}
              <span className="font-semibold text-richblack-5">{users.length}</span>
            </div>
            <div className="rounded-lg bg-richblack-700/50 px-3 py-2.5 text-richblack-100">
              {t("pages.admin.user_management.students")}:{" "}
              <span className="font-semibold text-richblack-5">{totalStudents}</span>
            </div>
            <div className="rounded-lg bg-richblack-700/50 px-3 py-2.5 text-richblack-100">
              {t("pages.admin.user_management.instructors")}:{" "}
              <span className="font-semibold text-richblack-5">{totalInstructors}</span>
            </div>
            <div className="rounded-lg bg-richblack-700/50 px-3 py-2.5 text-richblack-100">
              {t("pages.admin.user_management.admins")}:{" "}
              <span className="font-semibold text-richblack-5">{totalAdmins}</span>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="p-4 border-b border-richblack-700 space-y-3">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-richblack-400 text-lg" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-richblack-900 border border-richblack-600 rounded-lg pl-10 pr-4 py-2.5 text-sm text-richblack-5 placeholder:text-richblack-500 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["All", "Student", "Instructor", "Admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    roleFilter === role
                      ? "bg-yellow-500 text-richblack-900 border-yellow-500"
                      : "bg-richblack-700 text-richblack-200 border-richblack-600 hover:border-richblack-500"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* User rows */}
          <div className="overflow-y-auto max-h-[520px]">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-richblack-400 text-sm">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => setSelectedUserId(user._id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-richblack-700/50 transition-all ${
                    selectedUserId === user._id
                      ? "bg-richblack-700/80"
                      : "hover:bg-richblack-700/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        user.accountType === "Admin"
                          ? "bg-pink-800 text-pink-100"
                          : user.accountType === "Instructor"
                          ? "bg-yellow-800 text-yellow-100"
                          : "bg-richblack-600 text-richblack-100"
                      }`}
                    >
                      {getInitials(user.firstName, user.lastName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-richblack-5 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-richblack-400 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 text-xs rounded-full border flex-shrink-0 ${roleBadgeClass(
                        user.accountType
                      )}`}
                    >
                      {user.accountType}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-5 self-start sticky top-4">
          {!selectedUser ? (
            <div className="text-sm text-richblack-400 py-8 text-center">
              {t("pages.admin.user_management.no_user_selected")}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${
                    selectedUser.accountType === "Admin"
                      ? "bg-pink-800 text-pink-100"
                      : selectedUser.accountType === "Instructor"
                      ? "bg-yellow-800 text-yellow-100"
                      : "bg-richblack-600 text-richblack-100"
                  }`}
                >
                  {getInitials(selectedUser.firstName, selectedUser.lastName)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-richblack-400">
                    {t("pages.admin.user_management.selected_user")}
                  </p>
                  <h3 className="text-lg font-semibold text-richblack-5 mt-0.5 truncate">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-sm text-richblack-300 flex items-center gap-1.5 mt-1">
                    <HiOutlineMail className="text-xs flex-shrink-0" />
                    <span className="truncate">{selectedUser.email}</span>
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={`px-2.5 py-1 text-xs rounded-full border ${roleBadgeClass(
                    selectedUser.accountType
                  )}`}
                >
                  {selectedUser.accountType}
                </span>
              </div>

              {/* Instructor extra info */}
              {selectedUser.accountType === "Instructor" && (
                <div className="space-y-3 pt-3 border-t border-richblack-700">
                  {instructorDetailLoading ? (
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-richblack-900 animate-pulse" />
                      <div className="h-16 rounded-lg bg-richblack-900 animate-pulse" />
                    </div>
                  ) : instructorDetail ? (
                    <>
                      <InfoCard
                        icon={<HiOutlineUser />}
                        label={t("profile.about.title")}
                        value={
                          instructorDetail.additionalDetails?.about ||
                          t("pages.admin.instructor_management.no_bio")
                        }
                      />
                      <InfoCard
                        icon={<HiOutlineAcademicCap />}
                        label="Qualifications"
                        value={
                          instructorDetail.additionalDetails?.qualifications ||
                          "Not provided"
                        }
                      />
                      <InfoCard
                        icon={<HiOutlineBriefcase />}
                        label="Experience"
                        value={
                          instructorDetail.additionalDetails?.experience ||
                          "Not provided"
                        }
                      />

                      <div className="bg-richblack-900 rounded-lg p-3 border border-richblack-700 flex gap-6">
                        <div>
                          <p className="text-xl font-bold text-yellow-50">
                            {instructorDetail.stats?.totalCourses || 0}
                          </p>
                          <p className="text-xs text-richblack-400 mt-0.5">
                            {t("pages.admin.instructor_management.courses")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-yellow-50">
                            {instructorDetail.stats?.totalStudents || 0}
                          </p>
                          <p className="text-xs text-richblack-400 mt-0.5">
                            {t("pages.admin.instructor_management.students")}
                          </p>
                        </div>
                      </div>

                      {instructorDetail.additionalDetails?.certificates?.length > 0 && (
                        <div className="bg-richblack-900 rounded-lg p-3 border border-richblack-700">
                          <p className="text-xs text-richblack-400 mb-2">
                            Certificate photos
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {instructorDetail.additionalDetails.certificates.map(
                              (url, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setPreviewImage(url)}
                                  className="h-16 w-16 overflow-hidden rounded-lg border border-richblack-600 hover:border-yellow-50 transition-all"
                                >
                                  <img
                                    src={url}
                                    alt={`Certificate ${i + 1}`}
                                    className="h-full w-full object-cover"
                                  />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-richblack-500">
                      {t("pages.admin.instructor_management.load_profile_error")}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2.5 pt-3 border-t border-richblack-700">
                {selectedUser.accountType === "Student" && (
                  <button
                    onClick={() => handlePromoteUser(selectedUser._id)}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-black text-sm px-4 py-2.5 rounded-lg transition-all font-semibold"
                  >
                    <HiOutlineUserAdd className="text-base" />
                    {t("pages.admin.user_management.promote_to_instructor")}
                  </button>
                )}

                <button
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm px-4 py-2.5 rounded-lg transition-all"
                >
                  <HiOutlineTrash className="text-base" />
                  {t("pages.admin.user_management.delete_user")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MODAL: PENDING REQUEST DETAILS ===== */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-richblack-800 border border-richblack-700 rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-start justify-between p-5 border-b border-richblack-700">
              <div>
                <h3 className="text-xl font-bold text-richblack-5">
                  {selectedRequest.firstName} {selectedRequest.lastName}
                </h3>
                <span className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 text-xs font-semibold text-yellow-400">
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

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoCard
                  icon={<HiOutlineMail />}
                  label={t("profile.personal.email")}
                  value={
                    selectedRequest.instructorRequestDetails?.email ||
                    selectedRequest.email
                  }
                />
                <InfoCard
                  icon={<HiOutlinePhone />}
                  label={t("profile.personal.phone")}
                  value={
                    selectedRequest.instructorRequestDetails?.phone || "N/A"
                  }
                />
                <div className="md:col-span-2">
                  <InfoCard
                    icon={<HiOutlineUser />}
                    label={t("profile.about.title")}
                    value={
                      selectedRequest.instructorRequestDetails?.bio ||
                      t("pages.admin.instructor_management.no_bio")
                    }
                  />
                </div>
                <InfoCard
                  icon={<HiOutlineAcademicCap />}
                  label="Qualifications & certifications"
                  value={
                    selectedRequest.instructorRequestDetails?.qualifications ||
                    "Not provided"
                  }
                />
                <InfoCard
                  icon={<HiOutlineBriefcase />}
                  label="Teaching experience"
                  value={
                    selectedRequest.instructorRequestDetails?.experience ||
                    "Not provided"
                  }
                />

                <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700 md:col-span-2">
                  <p className="text-xs text-richblack-400 mb-3 flex items-center gap-1.5">
                    <HiOutlineDocumentText /> Verification documents
                  </p>
                  {selectedRequest.instructorRequestDetails?.documents?.length >
                  0 ? (
                    <div className="flex flex-wrap gap-3">
                      {selectedRequest.instructorRequestDetails.documents.map(
                        (doc, index) => {
                          const isImage = /\.(jpe?g|png|webp|gif)$/i.test(
                            doc.name || doc.url
                          );
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
                              <span className="truncate max-w-[140px]">
                                {doc.name || "Document"}
                              </span>
                              <HiOutlineExternalLink className="flex-shrink-0 opacity-70" />
                            </a>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-richblack-500">
                      No documents attached
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-richblack-700 bg-richblack-900/50">
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
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-richblack-900 rounded-xl p-4 border border-richblack-700">
      <p className="text-xs text-richblack-400 mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="text-richblack-5 text-sm whitespace-pre-line leading-relaxed break-words">
        {value}
      </p>
    </div>
  );
}