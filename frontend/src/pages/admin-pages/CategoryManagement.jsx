import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  createCategory,
  fetchAllCategories,
  updateCategory,
  deleteCategory,
} from "@/services/operations/adminAPI";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const AdminCategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingCategoryId, setEditingCategoryId] = useState(null);
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

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategoryId(null);
      return;
    }
    const stillExists = categories.some((item) => item._id === selectedCategoryId);
    if (!stillExists) {
      setSelectedCategoryId(categories[0]._id);
    }
  }, [categories, selectedCategoryId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error(t("pages.admin.category_management.fill_all_fields"));
      return;
    }

    if (editingCategoryId) {
      const updated = await updateCategory(editingCategoryId, formData, token);
      if (updated) {
        setCategories((prev) =>
          prev.map((item) => (item._id === editingCategoryId ? updated : item))
        );
        toast.success(t("pages.admin.category_management.updated"));
        setEditingCategoryId(null);
        setFormData({ name: "", description: "" });
      }
      return;
    }

    const created = await createCategory(formData, token);
    if (created) {
      setCategories((prev) => [created, ...prev]);
      toast.success(t("pages.admin.category_management.created"));
      setFormData({ name: "", description: "" });
    }
  };

  const handleEdit = (category) => {
    setEditingCategoryId(category._id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
  };

  const handleDelete = async (categoryId) => {
    const confirmDelete = window.confirm(
      t("pages.admin.category_management.delete_confirm")
    );
    if (!confirmDelete) return;

    const success = await deleteCategory(categoryId, token);
    if (success) {
      setCategories((prev) => prev.filter((item) => item._id !== categoryId));
      toast.success(t("pages.admin.category_management.deleted"));
    }
  };

  const resetForm = () => {
    setEditingCategoryId(null);
    setFormData({ name: "", description: "" });
  };

  if (loading)
    return <div className="grid min-h-[450px] place-items-center">{t("pages.admin.category_management.loading")}</div>;

  const filteredCategories = categories.filter((item) => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return true;
    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword)
    );
  });

  const selectedCategory = categories.find((item) => item._id === selectedCategoryId);

  return (
    <div className="space-y-6 min-h-screen">
      <div className="bg-richblack-800 border border-richblack-700 rounded-xl p-4">
        <h1 className="text-2xl font-semibold text-richblack-5">{t("pages.admin.category_management.title")}</h1>
        <p className="text-sm text-richblack-300 mt-1">
          {t("pages.admin.category_management.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-richblack-700 bg-richblack-800 overflow-hidden">
          <div className="border-b border-richblack-700 p-3 flex flex-col md:flex-row md:items-center gap-3">
            <div className="rounded-md bg-richblack-700/60 px-3 py-2 text-sm text-richblack-100">
              {t("pages.admin.category_management.total_categories")}: <span className="font-semibold">{categories.length}</span>
            </div>
            <input
              type="text"
              placeholder={t("pages.admin.category_management.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:ml-auto w-full md:w-80 bg-richblack-900 border border-richblack-700 rounded-md p-2.5 text-richblack-5 outline-none"
            />
          </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category._id)}
                  className={`w-full text-left px-4 py-4 border-b border-richblack-700/60 transition-all ${
                    selectedCategoryId === category._id
                      ? "bg-richblack-700/70"
                      : "hover:bg-richblack-700/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-richblack-5 font-medium">{category.name}</p>
                      <p className="text-xs text-richblack-300 mt-1 line-clamp-2">
                        {category.description || "No description"}
                      </p>
                    </div>
                    <span className="text-[10px] text-richblack-300 border border-richblack-600 px-2 py-1 rounded-full">
                      {category._id.slice(-6)}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center py-10 text-richblack-300">
                {t("pages.admin.category_management.no_results")}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-richblack-700 bg-richblack-800 p-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-richblack-300">
              {editingCategoryId ? t("pages.admin.category_management.edit_title") : t("pages.admin.category_management.create_title")}
            </p>
            <h3 className="text-lg font-semibold text-richblack-5 mt-1">
              {editingCategoryId ? t("pages.admin.category_management.edit_subtitle") : t("pages.admin.category_management.create_subtitle")}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="name"
              placeholder={t("pages.admin.category_management.form_name")}
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-richblack-900 border border-richblack-700 rounded-md p-3 text-richblack-5 outline-none"
            />
            <textarea
              name="description"
              placeholder={t("pages.admin.category_management.form_description")}
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-richblack-900 border border-richblack-700 rounded-md p-3 text-richblack-5 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-yellow-50 text-black font-semibold rounded-md px-4 py-2 hover:bg-yellow-100 transition-all"
              >
                {editingCategoryId ? "Update" : "Create"}
              </button>
              {editingCategoryId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-richblack-700 text-richblack-5 rounded-md px-4 py-2 hover:bg-richblack-600 transition-all"
                >
                  {t("common.cancel")}
                </button>
              )}
            </div>
          </form>

          <div className="border-t border-richblack-700 pt-4">
            <p className="text-xs uppercase tracking-wide text-richblack-300 mb-2">
              {t("pages.admin.category_management.selected_category")}
            </p>
            {selectedCategory ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-richblack-900 border border-richblack-700 p-3">
                  <p className="text-sm font-medium text-richblack-5">{selectedCategory.name}</p>
                  <p className="text-xs text-richblack-300 mt-1">
                    {selectedCategory.description || "No description"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(selectedCategory)}
                    className="flex-1 bg-richblack-700 hover:bg-richblack-600 text-richblack-5 text-sm px-3 py-2 rounded-md transition-all"
                  >
                    {t("pages.admin.category_management.edit_selected")}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedCategory._id)}
                    className="flex-1 bg-pink-700 hover:bg-pink-800 text-white text-sm px-3 py-2 rounded-md transition-all"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-richblack-300">Select a category from the list.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryManager;