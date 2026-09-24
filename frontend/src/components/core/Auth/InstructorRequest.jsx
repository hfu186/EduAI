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
const [requestStatus, setRequestStatus] = useState(null);
const [checkingStatus, setCheckingStatus] = useState(true);
  useEffect(() => {
    
  const checkRequestStatus = async () => {
    if (!token) {
      setCheckingStatus(false);
      return;
    }

    try {
      const response = await apiConnector(
        "GET",
        profileEndpoints.GET_INSTRUCTOR_REQUEST_STATUS_API,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response?.data?.success) {
        const status =
          response.data.data?.instructorRequestStatus || null;

        setRequestStatus(status);
      }
    } catch (error) {
      console.log("GET_INSTRUCTOR_REQUEST_STATUS_ERROR...", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  checkRequestStatus();
}, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          (f) => f.name === file.name && f.size === file.size,
        );
        if (!exists) merged.push(file);
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
        { Authorization: `Bearer ${token}` },
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
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
       {checkingStatus ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-richblack-600 border-t-yellow-50" />

            <p className="mt-4 text-sm text-richblack-400">
              Checking your request status...
            </p>
          </div>
        </div>
      ) : requestStatus === "pending" ? (
        /* Pending */
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-yellow-50/20 bg-richblack-800 p-8 text-center shadow-xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50/10">
              <svg
                className="h-7 w-7 text-yellow-50"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  strokeLinecap="round"
                  d="M12 7v5l3 2"
                />
              </svg>
            </div>

            <h1 className="mt-5 text-xl font-semibold text-richblack-5">
              Instructor Request Pending
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-richblack-400">
              Your instructor request has been submitted successfully
              and is currently waiting for admin approval.
            </p>

            <div className="mt-6 rounded-lg border border-richblack-700 bg-richblack-900/50 px-4 py-3">
              <p className="text-xs text-richblack-500">
                Request status
              </p>

              <p className="mt-1 text-sm font-medium text-yellow-50">
                Pending approval
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/my-profile")}
              className="mt-6 rounded-lg border border-richblack-600 px-5 py-2.5 text-sm font-medium text-richblack-300 transition-colors hover:bg-richblack-700 hover:text-richblack-5"
            >
              Back to Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-5 rounded-xl border border-richblack-700 bg-richblack-800 p-5 md:p-6">
          {/* Header - gọn */}
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-50/90">
                {t("pages.instructor_request.badge")}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-richblack-5 md:text-2xl">
              {t("pages.instructor_request.title")}
            </h1>
            <p className="mt-0.5 text-sm text-richblack-400">
              {t("pages.instructor_request.description")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Contact - 2x2 grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-richblack-5">
                  {t("pages.instructor_request.first_name")}{" "}
                  <sup className="text-pink-200">*</sup>
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-style w-full !py-2.5"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-richblack-5">
                  {t("pages.instructor_request.last_name")}{" "}
                  <sup className="text-pink-200">*</sup>
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-style w-full !py-2.5"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-richblack-5">
                  {t("pages.instructor_request.email")}{" "}
                  <sup className="text-pink-200">*</sup>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-style w-full !py-2.5"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-richblack-5">
                  {t("pages.instructor_request.phone")}
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-style w-full !py-2.5"
                />
              </div>
            </div>

            {/* Bio - thấp hơn */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-richblack-5">
                {t("pages.instructor_request.about")}
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="form-style w-full resize-none !py-2.5"
                placeholder={t("pages.instructor_request.about_placeholder")}
              />
            </div>

            {/* Qualifications + Experience - 2 cột */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-richblack-5">
                  {t("pages.instructor_request.qualifications")}
                </label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows={3}
                  className="form-style w-full resize-none !py-2.5"
                  placeholder={t(
                    "pages.instructor_request.qualifications_placeholder",
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-richblack-5">
                  {t("pages.instructor_request.experience")}
                </label>
                <textarea
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  rows={3}
                  className="form-style w-full resize-none !py-2.5"
                  placeholder={t(
                    "pages.instructor_request.experience_placeholder",
                  )}
                />
              </div>
            </div>

            {/* Documents - compact upload zone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-richblack-5">
                {t("pages.instructor_request.documents")}{" "}
                <sup className="text-pink-200">*</sup>
              </label>

              <label
                htmlFor="documents"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-richblack-600 bg-richblack-900/50 px-4 py-4 text-center transition hover:border-yellow-50/50"
              >
                <span className="text-sm text-richblack-400">
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

              {fileError && (
                <p className="text-xs text-pink-200">{fileError}</p>
              )}

              {files.length > 0 && (
                <ul className="mt-1 space-y-1.5">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-richblack-700 bg-richblack-900/60 px-3 py-2 text-sm"
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
                        className="ml-3 shrink-0 text-xs text-richblack-400 transition hover:text-pink-200"
                      >
                        {t("pages.instructor_request.remove")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 border-t border-richblack-700 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard/my-profile")}
                className="rounded-lg border border-richblack-600 px-4 py-2 text-sm font-semibold text-richblack-300 transition-colors hover:bg-richblack-700 hover:text-richblack-5"
              >
                {t("pages.instructor_request.cancel")}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-yellow-50 px-5 py-2 text-sm font-bold text-richblack-900 transition-all hover:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? t("pages.instructor_request.submitting")
                  : t("pages.instructor_request.submit")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
