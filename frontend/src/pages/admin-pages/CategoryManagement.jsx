import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  createCategory,
  fetchAllCategories,
  updateCategory,
  deleteCategory,
} from "@/services/operations/adminAPI";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineTag,
  HiOutlineBookOpen,
  HiOutlineExclamation,
} from "react-icons/hi";

const EMPTY_FORM = { name: "", description: "" };

const TILE_COLORS = [
  "from-yellow-400 to-amber-600",
  "from-sky-400 to-indigo-600",
  "from-pink-400 to-rose-600",
  "from-emerald-400 to-teal-600",
  "from-violet-400 to-purple-600",
  "from-orange-400 to-red-500",
];

// Cùng một tên luôn ra cùng một màu
const colorFor = (name = "") =>
  TILE_COLORS[
    [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TILE_COLORS.length
  ];

const SORTS = [
  { key: "default", label: "Default" },
  { key: "az", label: "A–Z" },
  { key: "za", label: "Z–A" },
];

const AdminCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("default");

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const getCategories = async () => {
    setLoading(true);
    const response = await fetchAllCategories();
    if (response) setCategories(response);
    setLoading(false);
  };

  useEffect(() => {
    getCategories();
  }, []);

  // Esc đóng modal / dialog
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (deleteTarget && !deleting) setDeleteTarget(null);
      else if (modalOpen && !submitting) closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, deleteTarget, submitting, deleting]);

  const visibleCategories = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const list = categories.filter((item) => {
      if (!keyword) return true;
      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
      );
    });
    if (sortKey === "az") {
      return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    if (sortKey === "za") {
      return [...list].sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }
    return list;
  }, [categories, searchTerm, sortKey]);

  // ===== Modal helpers =====
  const openCreate = () => {
    setEditingCategoryId(null);
    setFormData(EMPTY_FORM);
    setSubmitted(false);
    setModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategoryId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setSubmitted(false);
    setModalOpen(true);
  };

  function closeModal() {
    setModalOpen(false);
    setEditingCategoryId(null);
    setFormData(EMPTY_FORM);
    setSubmitted(false);
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===== Actions =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error(t("pages.admin.category_management.fill_all_fields"));
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategoryId) {
        const updated = await updateCategory(editingCategoryId, formData, token);
        if (updated) {
          setCategories((prev) =>
            prev.map((item) => (item._id === editingCategoryId ? updated : item))
          );
          toast.success(t("pages.admin.category_management.updated"));
          closeModal();
        }
        return;
      }

      const created = await createCategory(formData, token);
      if (created) {
        setCategories((prev) => [created, ...prev]);
        toast.success(t("pages.admin.category_management.created"));
        closeModal();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const success = await deleteCategory(deleteTarget._id, token);
      if (success) {
        setCategories((prev) =>
          prev.filter((item) => item._id !== deleteTarget._id)
        );
        toast.success(t("pages.admin.category_management.deleted"));
        setDeleteTarget(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const nameError = submitted && !formData.name.trim();
  const descError = submitted && !formData.description.trim();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <style>{`
        @keyframes cat-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cat-pop { from { opacity: 0; transform: translateY(12px) scale(.97) } to { opacity: 1; transform: none } }
        .cat-fade { animation: cat-fade .2s ease-out both }
        .cat-pop { animation: cat-pop .25s cubic-bezier(.2,.8,.2,1) both }
      `}</style>

      <div className="mx-auto max-w-6xl space-y-6">
        {/* ===== Hero header ===== */}
        <div className="relative overflow-hidden rounded-2xl border border-richblack-700 bg-gradient-to-br from-richblack-800 via-richblack-800 to-richblack-900 p-6 md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-richblack-5 md:text-3xl">
                {t("pages.admin.category_management.title")}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-richblack-300">
                {t("pages.admin.category_management.description")}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl border border-richblack-700 bg-richblack-900/60 px-5 py-3 text-center backdrop-blur">
                <p className="text-xl font-bold leading-none text-yellow-300">
                  {categories.length}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-richblack-400">
                  {t("pages.admin.category_management.total_categories")}
                </p>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-3 text-sm font-semibold text-richblack-900 shadow-lg shadow-yellow-500/20 transition-all hover:-translate-y-0.5 hover:shadow-yellow-500/30"
              >
                <HiOutlinePlus className="text-lg" />
                {t("pages.admin.category_management.create_title")}
              </button>
            </div>
          </div>
        </div>

        {/* ===== Toolbar ===== */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative sm:w-96">
            <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-richblack-500" />
            <input
              type="text"
              placeholder={t("pages.admin.category_management.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-richblack-700 bg-richblack-800 py-3 pl-11 pr-10 text-sm text-richblack-5 outline-none transition-all placeholder:text-richblack-500 focus:border-yellow-500/60 focus:ring-4 focus:ring-yellow-500/10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-richblack-400 transition-colors hover:bg-richblack-700 hover:text-richblack-5"
              >
                <HiOutlineX />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-richblack-400">
              {visibleCategories.length}{" "}
              {visibleCategories.length === 1 ? "category" : "categories"}
            </p>
            <div className="inline-flex rounded-xl bg-richblack-800 p-1 ring-1 ring-richblack-700">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSortKey(s.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    sortKey === s.key
                      ? "bg-yellow-500 text-richblack-900 shadow"
                      : "text-richblack-300 hover:text-richblack-5"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Grid ===== */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-richblack-700 bg-richblack-800"
              />
            ))}
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-richblack-700 py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-richblack-800 text-2xl text-richblack-500">
              <HiOutlineTag />
            </div>
            <p className="text-sm font-medium text-richblack-300">
              {t("pages.admin.category_management.no_results")}
            </p>
            {categories.length === 0 ? (
              <button
                onClick={openCreate}
                className="mt-1 flex items-center gap-2 rounded-xl border border-richblack-600 px-4 py-2 text-sm text-richblack-100 transition-colors hover:border-yellow-500 hover:text-yellow-50"
              >
                <HiOutlinePlus />
                {t("pages.admin.category_management.create_title")}
              </button>
            ) : (
              <p className="text-xs text-richblack-500">
                Try a different search term
              </p>
            )}
          </div>
        ) : (
          <div className="cat-fade grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCategories.map((category) => (
              <div
                key={category._id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800 p-5 transition-all hover:-translate-y-1 hover:border-richblack-500 hover:shadow-xl hover:shadow-black/30"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br text-xl text-white shadow-md ${colorFor(
                      category.name
                    )}`}
                  >
                    <HiOutlineTag />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-richblack-5">
                      {category.name}
                    </h3>
                    <span className="mt-1 inline-block rounded-full border border-richblack-600 px-2 py-0.5 text-[10px] font-medium text-richblack-400">
                      #{category._id.slice(-6)}
                    </span>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-richblack-300">
                  {category.description || "No description"}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-richblack-700 pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-richblack-400">
                    {Array.isArray(category.courses) && (
                      <>
                        <HiOutlineBookOpen />
                        {category.courses.length} courses
                      </>
                    )}
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      title={t("pages.admin.category_management.edit_selected")}
                      onClick={() => handleEdit(category)}
                      className="rounded-lg bg-richblack-700 p-2 text-base text-richblack-100 transition-colors hover:bg-yellow-500 hover:text-richblack-900"
                    >
                      <HiOutlinePencil />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => setDeleteTarget(category)}
                      className="rounded-lg bg-pink-500/10 p-2 text-base text-pink-300 transition-colors hover:bg-pink-600 hover:text-white"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== MODAL: CREATE / EDIT ===== */}
      {modalOpen && (
        <div
          className="cat-fade fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md"
          onClick={() => !submitting && closeModal()}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cat-pop my-8 w-full max-w-lg overflow-hidden rounded-3xl border border-richblack-700 bg-richblack-800 shadow-2xl"
          >
            <div className="relative flex items-center justify-between border-b border-richblack-700 bg-gradient-to-br from-richblack-700/50 to-richblack-800 px-6 py-5">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-yellow-500/15 text-xl text-yellow-400">
                  {editingCategoryId ? <HiOutlinePencil /> : <HiOutlinePlus />}
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-richblack-400">
                    {editingCategoryId
                      ? t("pages.admin.category_management.edit_title")
                      : t("pages.admin.category_management.create_title")}
                  </p>
                  <h3 className="text-lg font-semibold text-richblack-5">
                    {editingCategoryId
                      ? t("pages.admin.category_management.edit_subtitle")
                      : t("pages.admin.category_management.create_subtitle")}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="relative rounded-lg p-2 text-richblack-400 transition-colors hover:bg-richblack-700 hover:text-richblack-5 disabled:opacity-40"
              >
                <HiOutlineX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-richblack-300">
                  {t("pages.admin.category_management.form_name")}
                </label>
                <input
                  autoFocus
                  type="text"
                  name="name"
                  placeholder="e.g. Web Development"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border bg-richblack-900 px-4 py-3 text-sm text-richblack-5 outline-none transition-all placeholder:text-richblack-500 focus:ring-4 ${
                    nameError
                      ? "border-pink-500/70 focus:ring-pink-500/10"
                      : "border-richblack-700 focus:border-yellow-500/60 focus:ring-yellow-500/10"
                  }`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-richblack-300">
                  {t("pages.admin.category_management.form_description")}
                </label>
                <textarea
                  name="description"
                  placeholder="Short description about this category..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full resize-none rounded-xl border bg-richblack-900 px-4 py-3 text-sm text-richblack-5 outline-none transition-all placeholder:text-richblack-500 focus:ring-4 ${
                    descError
                      ? "border-pink-500/70 focus:ring-pink-500/10"
                      : "border-richblack-700 focus:border-yellow-500/60 focus:ring-yellow-500/10"
                  }`}
                />
              </div>

              {(nameError || descError) && (
                <p className="flex items-center gap-1.5 text-xs text-pink-300">
                  <HiOutlineExclamation />
                  {t("pages.admin.category_management.fill_all_fields")}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-richblack-600 px-5 py-2.5 text-sm font-medium text-richblack-200 transition-all hover:bg-richblack-700 disabled:opacity-40"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-2.5 text-sm font-semibold text-richblack-900 shadow-lg shadow-yellow-500/20 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-richblack-900 border-t-transparent" />
                  ) : editingCategoryId ? (
                    <>
                      <HiOutlinePencil />
                      Update
                    </>
                  ) : (
                    <>
                      <HiOutlinePlus />
                      Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DIALOG: CONFIRM DELETE ===== */}
      {deleteTarget && (
        <div
          className="cat-fade fixed inset-0 z-[1100] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="cat-pop w-full max-w-sm rounded-3xl border border-richblack-700 bg-richblack-800 p-6 text-center shadow-2xl"
          >
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-pink-500/10 text-2xl text-pink-400">
              <HiOutlineTrash />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-richblack-5">
              {deleteTarget.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-richblack-300">
              {t("pages.admin.category_management.delete_confirm")}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-richblack-600 px-4 py-2.5 text-sm font-medium text-richblack-200 transition-all hover:bg-richblack-700 disabled:opacity-40"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-pink-700 disabled:opacity-60"
              >
                {deleting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <HiOutlineTrash />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryManager;