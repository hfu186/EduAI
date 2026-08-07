import { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  promoteUser,
} from "@/services/operations/adminAPI";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const fetchUsers = async () => {
    setLoading(true);
    const result = await getAllUsers(token);
    if (result) setUsers(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
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

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      t("pages.admin.user_management.delete_confirm")
    );

    if (!confirmDelete) return;

    try {
      const res = await deleteUser(userId, token);
      if (res) {
        toast.success(t("pages.admin.user_management.deleted"));
        fetchUsers(); // Refresh list
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

  if (loading) return <div className="grid min-h-[420px] place-items-center"><div className="spinner"></div></div>;

  const selectedUser = users.find((item) => item._id === selectedUserId);
  const totalStudents = users.filter((u) => u.accountType === "Student").length;
  const totalInstructors = users.filter((u) => u.accountType === "Instructor").length;
  const totalAdmins = users.filter((u) => u.accountType === "Admin").length;

  const roleBadgeClass = (role) => {
    if (role === "Admin") return "bg-pink-900 text-pink-100 border-pink-700";
    if (role === "Instructor") return "bg-yellow-900 text-yellow-100 border-yellow-700";
    return "bg-richblack-700 text-richblack-100 border-richblack-600";
  };

  return (
    <div className="space-y-6">
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4">
        <h2 className="text-2xl font-semibold text-richblack-5">{t("pages.admin.user_management.title")}</h2>
        <p className="text-sm text-richblack-300 mt-1">
          {t("pages.admin.user_management.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden">
          <div className="grid grid-cols-4 gap-2 border-b border-richblack-700 p-3 text-xs">
            <div className="rounded-md bg-richblack-700/60 px-3 py-2 text-richblack-100">
              {t("pages.admin.user_management.total")}: <span className="font-semibold">{users.length}</span>
            </div>
            <div className="rounded-md bg-richblack-700/60 px-3 py-2 text-richblack-100">
              {t("pages.admin.user_management.students")}: <span className="font-semibold">{totalStudents}</span>
            </div>
            <div className="rounded-md bg-richblack-700/60 px-3 py-2 text-richblack-100">
              {t("pages.admin.user_management.instructors")}: <span className="font-semibold">{totalInstructors}</span>
            </div>
            <div className="rounded-md bg-richblack-700/60 px-3 py-2 text-richblack-100">
              {t("pages.admin.user_management.admins")}: <span className="font-semibold">{totalAdmins}</span>
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto">
            {users.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => setSelectedUserId(user._id)}
                className={`w-full text-left px-4 py-4 border-b border-richblack-700/60 transition-all ${
                  selectedUserId === user._id
                    ? "bg-richblack-700/70"
                    : "hover:bg-richblack-700/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-richblack-5 font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-richblack-300 mt-1">{user.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full border ${roleBadgeClass(user.accountType)}`}>
                    {user.accountType}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4">
          {selectedUser ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-richblack-300">{t("pages.admin.user_management.selected_user")}</p>
                <h3 className="text-lg font-semibold text-richblack-5 mt-1">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-sm text-richblack-300">{selectedUser.email}</p>
              </div>

              <div className="rounded-lg bg-richblack-900 border border-richblack-700 p-3">
                <p className="text-xs text-richblack-300">{t("pages.admin.user_management.role")}</p>
                <span className={`mt-2 inline-block px-2.5 py-1 text-xs rounded-full border ${roleBadgeClass(selectedUser.accountType)}`}>
                  {selectedUser.accountType}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {selectedUser.accountType === "Student" && (
                  <button
                    onClick={() => handlePromoteUser(selectedUser._id)}
                    className="w-full bg-yellow-50 hover:bg-yellow-100 text-black text-sm px-4 py-2.5 rounded-md transition-all font-semibold"
                  >
                    {t("pages.admin.user_management.promote_to_instructor")}
                  </button>
                )}

                <button
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white text-sm px-4 py-2.5 rounded-md transition-all"
                >
                  {t("pages.admin.user_management.delete_user")}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-richblack-300">{t("pages.admin.user_management.no_user_selected")}</div>
          )}
        </div>
      </div>
    </div>
  );
}