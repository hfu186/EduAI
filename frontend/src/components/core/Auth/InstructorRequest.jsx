import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { apiConnector } from "../../../services/apiConnector";
import { profileEndpoints } from "../../../services/apis";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];

export default function InstructorRequest() {
  const { t } = useTranslation();

  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    qualifications: "",
    experience: "",
  });

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.additionalDetails?.contactNumber || "",
        bio: user.additionalDetails?.about || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);

    setFileError("");

    const tooBig = selected.find(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024,
    );

    if (tooBig) {
      setFileError(
        t("pages.instructor_request.errors.file_too_large", {
          name: tooBig.name,
          size: MAX_FILE_SIZE_MB,
        }),
      );

      e.target.value = "";
      return;
    }

    const invalidType = selected.find(
      (file) =>
        !ACCEPTED_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext)),
    );

    if (invalidType) {
      setFileError(
        t("pages.instructor_request.errors.invalid_file_type", {
          name: invalidType.name,
        }),
      );

      e.target.value = "";
      return;
    }

    setFiles((prev) => {
      const merged = [...prev];

      selected.forEach((file) => {
        const exists = merged.some(
          (existingFile) =>
            existingFile.name === file.name && existingFile.size === file.size,
        );

        if (!exists) {
          merged.push(file);
        }
      });

      return merged;
    });

    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error(t("pages.instructor_request.errors.login_required"));
      return;
    }

    if (files.length === 0) {
      setFileError(t("pages.instructor_request.errors.document_required"));
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();

      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("bio", formData.bio);
      payload.append("qualifications", formData.qualifications);
      payload.append("experience", formData.experience);

      files.forEach((file) => {
        payload.append("documents", file);
      });

      const response = await apiConnector(
        "POST",
        profileEndpoints.REQUEST_INSTRUCTOR_API,
        payload,
        {
          Authorization: `Bearer ${token}`,
        },
      );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            t("pages.instructor_request.errors.submit_failed"),
        );
      }

      toast.success(t("pages.instructor_request.success"));

      navigate("/dashboard/my-profile");
    } catch (error) {
      toast.error(
        error.message || t("pages.instructor_request.errors.submit_error"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-richblack-900 px-4 py-10 text-richblack-5">
      <div className="mx-auto max-w-3xl rounded-2xl border border-richblack-700 bg-richblack-800 p-8 shadow-2xl">
        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-50">
            {t("pages.instructor_request.badge")}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {t("pages.instructor_request.title")}
          </h1>

          <p className="mt-3 text-sm text-richblack-300">
            {t("pages.instructor_request.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ================= NAME ================= */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-richblack-300">
                {t("pages.instructor_request.first_name")}
              </label>

              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none focus:border-yellow-50"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-richblack-300">
                {t("pages.instructor_request.last_name")}
              </label>

              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none focus:border-yellow-50"
                required
              />
            </div>
          </div>

          {/* ================= CONTACT ================= */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-richblack-300">
                {t("pages.instructor_request.email")}
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none focus:border-yellow-50"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-richblack-300">
                {t("pages.instructor_request.phone")}
              </label>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none focus:border-yellow-50"
              />
            </div>
          </div>

          {/* ================= BIO ================= */}
          <div>
            <label className="mb-2 block text-sm text-richblack-300">
              {t("pages.instructor_request.about")}
            </label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none focus:border-yellow-50"
              placeholder={t("pages.instructor_request.about_placeholder")}
            />
          </div>

          {/* ================= QUALIFICATIONS ================= */}
          <div>
            <label className="mb-2 block text-sm text-richblack-300">
              {t("pages.instructor_request.qualifications")}
            </label>

            <textarea
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none focus:border-yellow-50"
              placeholder={t(
                "pages.instructor_request.qualifications_placeholder",
              )}
            />
          </div>

          {/* ================= EXPERIENCE ================= */}
          <div>
            <label className="mb-2 block text-sm text-richblack-300">
              {t("pages.instructor_request.experience")}
            </label>

            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-3 outline-none focus:border-yellow-50"
              placeholder={t("pages.instructor_request.experience_placeholder")}
            />
          </div>

          {/* ================= DOCUMENTS ================= */}
          <div>
            <label className="mb-2 block text-sm text-richblack-300">
              {t("pages.instructor_request.documents")}
            </label>

            <label
              htmlFor="documents"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-richblack-600 bg-richblack-900 px-4 py-6 text-center transition hover:border-yellow-50"
            >
              <span className="text-sm text-richblack-300">
                {t("pages.instructor_request.upload_hint", {
                  size: MAX_FILE_SIZE_MB,
                })}
              </span>

              <input
                id="documents"
                type="file"
                multiple
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* File Error */}
            {fileError && (
              <p className="mt-2 text-sm text-pink-200">{fileError}</p>
            )}

            {/* Selected Files */}
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-richblack-600 bg-richblack-900 px-4 py-2 text-sm"
                  >
                    <span className="truncate text-richblack-100">
                      {file.name}{" "}
                      <span className="text-richblack-400">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-3 shrink-0 text-richblack-300 transition hover:text-pink-200"
                    >
                      {t("pages.instructor_request.remove")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ================= BUTTONS ================= */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-yellow-500 px-5 py-3 font-semibold text-richblack-900 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? t("pages.instructor_request.submitting")
                : t("pages.instructor_request.submit")}
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard/my-profile")}
              className="rounded-lg border border-richblack-600 px-5 py-3 text-sm text-richblack-300 transition hover:bg-richblack-700"
            >
              {t("pages.instructor_request.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
