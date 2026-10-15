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
import useAlertDialog from "@/hooks/useAlertDialog";
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
  HiOutlineInbox,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";

const PAGE_SIZE = 8;

const ROLE_STYLES = {
  Admin: {
    badge: "bg-pink-500/10 text-pink-300 border-pink-500/30",
    dot: "bg-pink-400",
    avatar: "from-pink-500 to-rose-700",
  },
  Instructor: {
    badge: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    dot: "bg-yellow-400",
    avatar: "from-yellow-400 to-amber-700",
  },
  Student: {
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    dot: "bg-sky-400",
    avatar: "from-sky-500 to-indigo-700",
  },
};

const getAvatar = (u) => u?.profilePicture || u?.image || u?.avatar || null;
const roleStyle = (role) => ROLE_STYLES[role] || ROLE_STYLES.Student;

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
  const [tab, setTab] = useState("users");
  const [page, setPage] = useState(1);

  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const confirm = useAlertDialog();

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
    setPage(1);
  }, [searchTerm, roleFilter]);

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

  // Esc closes drawer / modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (previewImage) setPreviewImage(null);
      else if (selectedRequest) setSelectedRequest(null);
      else if (selectedUserId) setSelectedUserId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewImage, selectedRequest, selectedUserId]);

  // ===== Derived data =====
  const countByRole = useMemo(
    () => ({
      All: users.length,
      Student: users.filter((u) => u.accountType === "Student").length,
      Instructor: users.filter((u) => u.accountType === "Instructor").length,
      Admin: users.filter((u) => u.accountType === "Admin").length,
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.accountType === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const getInitials = (first, last) =>
    `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();

  // ===== Actions =====
  const handleDeleteUser = async (userId) => {
    const confirmDelete = await confirm({
      title: t("pages.admin.user_management.delete_confirm"),
      description: t("pages.admin.user_management.delete_confirm"),
      confirmText: t("common.delete", "Delete"),
      isDestructive: true,
    });
    if (!confirmDelete) return;

    try {
      const res = await deleteUser(userId, token);
      if (res) {
        toast.success(t("pages.admin.user_management.deleted"));
        setSelectedUserId(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error(t("pages.admin.user_management.delete_error"));
      console.error(error);
    }
  };

  const handlePromoteUser = async (userId) => {
    const confirmPromote = await confirm({
      title: t("pages.admin.user_management.promote_confirm"),
      description: t("pages.admin.user_management.promote_confirm"),
      confirmText: t("common.confirm", "Confirm"),
    });
    if (!confirmPromote) return;

    const res = await promoteUser(userId, token);
    if (res?.success) {
      toast.success(t("pages.admin.user_management.promoted"));
      fetchUsers();
    }
  };

  const handleReview = async (userId, decision) => {
    const confirmed = await confirm({
      title:
        decision === "approved"
          ? t("pages.admin.instructor_management.approved")
          : t("pages.admin.instructor_management.rejected"),
      description: t("pages.admin.user_management.review_confirm", {
        defaultValue: "Confirm this instructor application decision?",
      }),
      confirmText: t("common.confirm", "Confirm"),
      isDestructive: decision !== "approved",
    });
    if (!confirmed) return;

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

  const stats = [
    { label: t("pages.admin.user_management.total"), value: countByRole.All, color: "text-richblack-5" },
    { label: t("pages.admin.user_management.students"), value: countByRole.Student, color: "text-sky-300" },
    { label: t("pages.admin.user_management.instructors"), value: countByRole.Instructor, color: "text-yellow-300" },
    { label: t("pages.admin.user_management.admins"), value: countByRole.Admin, color: "text-pink-300" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <style>{`
        @keyframes um-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes um-pop-in { from { opacity: 0; transform: translateY(12px) scale(.97) } to { opacity: 1; transform: none } }
        @keyframes um-slide-in { from { transform: translateX(100%) } to { transform: none } }
        .um-fade-in { animation: um-fade-in .2s ease-out both }
        .um-pop-in { animation: um-pop-in .25s cubic-bezier(.2,.8,.2,1) both }
        .um-slide-in { animation: um-slide-in .3s cubic-bezier(.2,.8,.2,1) both }
      `}</style>

      <div className="mx-auto max-w-6xl space-y-6">
        {/* ===== Title + inline stats ===== */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-richblack-5 md:text-3xl">
              {t("pages.admin.user_management.title")}
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-richblack-300">
              {t("pages.admin.user_management.description")}
            </p>
          </div>

          <div className="flex divide-x divide-richblack-700 overflow-hidden rounded-xl border border-richblack-700 bg-richblack-800">
            {stats.map((s) => (
              <div key={s.label} className="px-4 py-2.5 text-center sm:px-6">
                <p className={`text-xl font-bold leading-none ${s.color}`}>
                  {s.value}
                </p>
                <p className="mt-1.5 text-[11px] text-richblack-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Tabs ===== */}
        <div className="flex gap-1 border-b border-richblack-700">
          <TabButton active={tab === "users"} onClick={() => setTab("users")}>
            {t("pages.admin.user_management.title")}
            <span className="rounded-full bg-richblack-700 px-2 py-0.5 text-[11px] text-richblack-200">
              {users.length}
            </span>
          </TabButton>
          <TabButton active={tab === "requests"} onClick={() => setTab("requests")}>
            {t("pages.admin.instructor_management.pending_requests")}
            {requests.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-0.5 text-[11px] font-bold text-richblack-900">
                {requests.length}
              </span>
            )}
          </TabButton>
        </div>

        {/* ===== TAB: USERS ===== */}
        {tab === "users" && (
          <div className="um-fade-in overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-richblack-700 p-4 md:flex-row md:items-center md:justify-between">
              <div className="relative md:w-80">
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-richblack-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-richblack-700 bg-richblack-900 py-2.5 pl-10 pr-9 text-sm text-richblack-5 outline-none transition-all placeholder:text-richblack-500 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-richblack-400 hover:text-richblack-5"
                  >
                    <HiOutlineX />
                  </button>
                )}
              </div>

              <div className="inline-flex self-start rounded-xl bg-richblack-900 p-1">
                {["All", "Student", "Instructor", "Admin"].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                      roleFilter === role
                        ? "bg-yellow-500 text-richblack-900 shadow"
                        : "text-richblack-300 hover:text-richblack-5"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Table header (desktop) */}
            <div className="hidden grid-cols-12 gap-4 border-b border-richblack-700 bg-richblack-900/40 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-richblack-400 md:grid">
              <div className="col-span-5">User</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-4 text-right">Actions</div>
            </div>

            {/* Rows */}
            {pagedUsers.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <HiOutlineSearch className="text-3xl text-richblack-600" />
                <p className="text-sm text-richblack-400">No users found</p>
              </div>
            ) : (
              <ul>
                {pagedUsers.map((user) => {
                  const rs = roleStyle(user.accountType);
                  return (
                    <li
                      key={user._id}
                      onClick={() => setSelectedUserId(user._id)}
                      className="group grid cursor-pointer grid-cols-12 items-center gap-4 border-b border-richblack-700/60 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-richblack-700/30"
                    >
                      <div className="col-span-12 flex min-w-0 items-center gap-3 md:col-span-5">
                        <Avatar
                          src={getAvatar(user)}
                          role={user.accountType}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-richblack-5">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-richblack-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-6 md:col-span-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${rs.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${rs.dot}`} />
                          {user.accountType}
                        </span>
                      </div>

                      <div className="col-span-6 flex justify-end gap-1.5 md:col-span-4">
                        {user.accountType === "Student" && (
                          <IconButton
                            title={t("pages.admin.user_management.promote_to_instructor")}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePromoteUser(user._id);
                            }}
                            className="hover:bg-yellow-500/15 hover:text-yellow-300"
                          >
                            <HiOutlineUserAdd />
                          </IconButton>
                        )}
                        <IconButton
                          title="View"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUserId(user._id);
                          }}
                          className="hover:bg-richblack-600 hover:text-richblack-5"
                        >
                          <HiOutlineEye />
                        </IconButton>
                        <IconButton
                          title={t("pages.admin.user_management.delete_user")}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user._id);
                          }}
                          className="hover:bg-pink-500/15 hover:text-pink-300"
                        >
                          <HiOutlineTrash />
                        </IconButton>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pagination */}
            {filteredUsers.length > PAGE_SIZE && (
              <div className="flex items-center justify-between border-t border-richblack-700 px-5 py-3 text-xs text-richblack-300">
                <span>
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} /{" "}
                  {filteredUsers.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="rounded-lg p-2 hover:bg-richblack-700 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <HiOutlineChevronLeft />
                  </button>
                  <span className="px-2 font-medium text-richblack-5">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="rounded-lg p-2 hover:bg-richblack-700 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <HiOutlineChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: PENDING REQUESTS ===== */}
        {tab === "requests" && (
          <div className="um-fade-in">
            {requestsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-44 animate-pulse rounded-2xl bg-richblack-800" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-richblack-700 py-20 text-center">
                <HiOutlineInbox className="text-4xl text-richblack-500" />
                <p className="text-sm text-richblack-400">
                  {t("pages.admin.instructor_management.no_pending")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {requests.map((req) => (
                  <div
                    key={req._id}
                    className="flex flex-col items-center rounded-2xl border border-richblack-700 bg-richblack-800 p-6 text-center transition-all hover:-translate-y-1 hover:border-yellow-500/40 hover:shadow-xl hover:shadow-black/30"
                  >
                    <Avatar
                      src={req.profilePicture}
                      initials={getInitials(req.firstName, req.lastName)}
                      role="Instructor"
                      size="xl"
                    />
                    <p className="mt-3 text-base font-semibold text-richblack-5">
                      {req.firstName} {req.lastName}
                    </p>
                    <p className="mt-0.5 max-w-full truncate text-xs text-richblack-400">
                      {req.email}
                    </p>
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-richblack-700 px-4 py-2.5 text-sm font-medium text-richblack-5 transition-all hover:bg-yellow-500 hover:text-richblack-900"
                    >
                      <HiOutlineEye />
                      {t("pages.admin.instructor_management.view_profile")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== DRAWER: USER DETAIL ===== */}
      {selectedUser && (
        <div className="fixed inset-0">
          <div
            className="um-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedUserId(null)}
          />
          <aside className="um-slide-in absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-richblack-700 bg-richblack-800 shadow-2xl">
            <div
              className={`relative h-28 flex-shrink-0 bg-gradient-to-br ${
                roleStyle(selectedUser.accountType).avatar
              }`}
            >
             
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <div className="-mt-9 flex items-end justify-between">
                <div className="rounded-full ring-4 ring-richblack-800">
                  <Avatar
                    src={getAvatar(selectedUser)}
                    role={selectedUser.accountType}
                    size="xl"
                  />
                </div>
                <span
                  className={`mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
                    roleStyle(selectedUser.accountType).badge
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${roleStyle(selectedUser.accountType).dot}`} />
                  {selectedUser.accountType}
                </span>
              </div>

              <p className="mt-4 text-[11px] font-medium uppercase tracking-widest text-richblack-400">
                {t("pages.admin.user_management.selected_user")}
              </p>
              <h3 className="mt-0.5 text-xl font-bold text-richblack-5">
                {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-richblack-300">
                <HiOutlineMail className="flex-shrink-0" />
                <span className="truncate">{selectedUser.email}</span>
              </p>

              {selectedUser.accountType === "Instructor" && (
                <div className="mt-6 space-y-3 border-t border-richblack-700 pt-6">
                  {instructorDetailLoading ? (
                    <div className="space-y-2">
                      <div className="h-16 animate-pulse rounded-xl bg-richblack-900" />
                      <div className="h-16 animate-pulse rounded-xl bg-richblack-900" />
                    </div>
                  ) : instructorDetail ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <StatTile
                          value={instructorDetail.stats?.totalCourses || 0}
                          label={t("pages.admin.instructor_management.courses")}
                        />
                        <StatTile
                          value={instructorDetail.stats?.totalStudents || 0}
                          label={t("pages.admin.instructor_management.students")}
                        />
                      </div>
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
                        value={instructorDetail.additionalDetails?.qualifications || "Not provided"}
                      />
                      <InfoCard
                        icon={<HiOutlineBriefcase />}
                        label="Experience"
                        value={instructorDetail.additionalDetails?.experience || "Not provided"}
                      />
                      {instructorDetail.additionalDetails?.certificates?.length > 0 && (
                        <div className="rounded-xl border border-richblack-700 bg-richblack-900 p-4">
                          <p className="mb-3 text-xs text-richblack-400">Certificate photos</p>
                          <div className="flex flex-wrap gap-2">
                            {instructorDetail.additionalDetails.certificates.map((url, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setPreviewImage(url)}
                                className="h-16 w-16 overflow-hidden rounded-lg border border-richblack-600 transition-all hover:scale-105 hover:border-yellow-50"
                              >
                                <img src={url} alt={`Certificate ${i + 1}`} className="h-full w-full object-cover" />
                              </button>
                            ))}
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
            </div>

            {/* Sticky footer actions */}
            <div className="flex flex-shrink-0 gap-3 border-t border-richblack-700 bg-richblack-900/60 p-4">
              {selectedUser.accountType === "Student" && (
                <button
                  onClick={() => handlePromoteUser(selectedUser._id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:-translate-y-0.5"
                >
                  <HiOutlineUserAdd />
                  {t("pages.admin.user_management.promote_to_instructor")}
                </button>
              )}
              <button
                onClick={() => handleDeleteUser(selectedUser._id)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-pink-500/40 bg-pink-500/10 px-4 py-2.5 text-sm font-medium text-pink-300 transition-all hover:bg-pink-600 hover:text-white"
              >
                <HiOutlineTrash />
                {t("pages.admin.user_management.delete_user")}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== MODAL: PENDING REQUEST DETAILS ===== */}
      {selectedRequest && (
        <div
          className="um-fade-in fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="um-pop-in my-8 w-full max-w-4xl overflow-hidden rounded-3xl border border-richblack-700 bg-richblack-800 shadow-2xl"
          >
            <div className="grid md:grid-cols-[260px_1fr]">
              {/* Left: identity + decision */}
              <div className="relative flex flex-col items-center border-b border-richblack-700 bg-gradient-to-b from-richblack-700/50 to-richblack-900/40 p-6 text-center md:border-b-0 md:border-r">
                <Avatar
                  src={selectedRequest.profilePicture}
                  initials={getInitials(selectedRequest.firstName, selectedRequest.lastName)}
                  role="Instructor"
                  size="xl"
                />
                <h3 className="mt-4 text-lg font-bold text-richblack-5">
                  {selectedRequest.firstName} {selectedRequest.lastName}
                </h3>
                <p className="mt-0.5 max-w-full truncate text-xs text-richblack-400">
                  {selectedRequest.email}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                  Pending review
                </span>

                <div className="mt-6 flex w-full flex-col gap-2.5 md:mt-auto md:pt-8">
                  <button
                    onClick={() => handleReview(selectedRequest._id, "approved")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-richblack-900 shadow-lg shadow-yellow-500/20 transition-all hover:-translate-y-0.5 hover:bg-yellow-400"
                  >
                    <HiOutlineCheck />
                    {t("pages.admin.instructor_management.approve")}
                  </button>
                  <button
                    onClick={() => handleReview(selectedRequest._id, "rejected")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-richblack-600 px-5 py-2.5 text-sm font-medium text-richblack-300 transition-all hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-200"
                  >
                    <HiOutlineX />
                    {t("pages.admin.instructor_management.reject")}
                  </button>
                </div>
              </div>

              {/* Right: details */}
              <div className="relative p-6">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="absolute right-4 top-4 rounded-lg p-2 text-richblack-400 transition-colors hover:bg-richblack-700 hover:text-richblack-5"
                >
                  <HiOutlineX className="text-xl" />
                </button>

                <div className="grid grid-cols-1 gap-3 pt-6 sm:grid-cols-2 md:pt-4">
                  <InfoCard
                    icon={<HiOutlineMail />}
                    label={t("profile.personal.email")}
                    value={selectedRequest.instructorRequestDetails?.email || selectedRequest.email}
                  />
                  <InfoCard
                    icon={<HiOutlinePhone />}
                    label={t("profile.personal.phone")}
                    value={selectedRequest.instructorRequestDetails?.phone || "N/A"}
                  />
                  <div className="sm:col-span-2">
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
                    value={selectedRequest.instructorRequestDetails?.qualifications || "Not provided"}
                  />
                  <InfoCard
                    icon={<HiOutlineBriefcase />}
                    label="Teaching experience"
                    value={selectedRequest.instructorRequestDetails?.experience || "Not provided"}
                  />

                  <div className="rounded-xl border border-richblack-700 bg-richblack-900 p-4 sm:col-span-2">
                    <p className="mb-3 flex items-center gap-1.5 text-xs text-richblack-400">
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
                              className="group relative h-24 w-24 overflow-hidden rounded-xl border border-richblack-600 transition-all hover:border-yellow-50"
                            >
                              <img
                                src={doc.url}
                                alt={doc.name || `Document ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <span className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <HiOutlineEye className="text-xl text-white" />
                              </span>
                            </button>
                          ) : (
                            <a
                              key={index}
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-xl border border-richblack-600 bg-richblack-800 px-3.5 py-2.5 text-xs text-richblack-200 transition-all hover:border-yellow-50 hover:text-yellow-50"
                            >
                              <HiOutlineDocumentText className="flex-shrink-0 text-base" />
                              <span className="max-w-[140px] truncate">{doc.name || "Document"}</span>
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
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {previewImage && (
        <div
          className="um-fade-in fixed inset-0 z-[1100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute right-6 top-6 rounded-full bg-richblack-800 p-2.5 text-richblack-200 transition-colors hover:bg-richblack-700 hover:text-white"
          >
            <HiOutlineX className="text-2xl" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            onClick={(e) => e.stopPropagation()}
            className="um-pop-in max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-yellow-500 text-richblack-5"
          : "border-transparent text-richblack-400 hover:text-richblack-100"
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`rounded-lg p-2 text-lg text-richblack-300 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Avatar({ src, initials, role, size = "md" }) {
  const [broken, setBroken] = useState(false);
  const sizes = {
    md: "h-10 w-10 text-sm",
    xl: "h-[72px] w-[72px] text-xl",
  };
  return (
    <div
      className={`grid flex-shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br font-bold text-white shadow-md ${
        roleStyle(role).avatar
      } ${sizes[size]}`}
    >
      {src && !broken ? (
        <img
          src={src}
          alt=""
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

function StatTile({ value, label }) {
  return (
    <div className="rounded-xl border border-richblack-700 bg-gradient-to-br from-richblack-900 to-richblack-800 p-4">
      <p className="text-2xl font-bold text-yellow-50">{value}</p>
      <p className="mt-1 text-xs text-richblack-400">{label}</p>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-richblack-700 bg-richblack-900 p-4 transition-colors hover:border-richblack-600">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-richblack-400">
        {icon} {label}
      </p>
      <p className="whitespace-pre-line break-words text-sm leading-relaxed text-richblack-5">
        {value}
      </p>
    </div>
  );
}