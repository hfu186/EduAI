import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  HiOutlineCloudUpload,
  HiOutlineDocumentText,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineExclamation,
} from "react-icons/hi";
import { apiConnector } from "../../../services/apiConnector";
import { profileEndpoints } from "../../../services/apis";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = [".pdf", ".jpg", ".jpeg", ".png"];

const inputBase =
  "w-full rounded-lg border bg-richblack-900 px-3 py-2 text-sm text-richblack-5 outline-none transition-all placeholder:text-richblack-500 focus:ring-4";
const inputOk =
  "border-richblack-700 focus:border-yellow-50/60 focus:ring-yellow-50/10";
const inputErr = "border-pink-500/70 focus:ring-pink-500/10";

const isImageFile = (file) => /\.(jpe?g|png)$/i.test(file.name);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [errors, setErrors] = useState({});

  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
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
          const status = response.data.data?.instructorRequestStatus || null;
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const processFiles = (selected) => {
    setFileError("");
    if (!selected.length) return;

    const tooBig = selected.find(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );
    if (tooBig) {
      setFileError(
        t("pages.instructor_request.errors.file_too_large", {
          name: tooBig.name,
          size: MAX_FILE_SIZE_MB,
        })
      );
      return;
    }

    const invalidType = selected.find(
      (file) =>
        !ACCEPTED_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
    if (invalidType) {
      setFileError(
        t("pages.instructor_request.errors.invalid_file_type", {
          name: invalidType.name,
        })
      );
      return;
    }

    setFiles((prev) => {
      const merged = [...prev];
      selected.forEach((file) => {
        const exists = merged.some(
          (f) => f.name === file.name && f.size === file.size
        );
        if (!exists) merged.push(file);
      });
      return merged;
    });
  };

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer?.files || []));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateAll = () => {
    const next = {};
    const required = t("pages.instructor_request.errors.field_required", {
      defaultValue: "This field is required",
    });
    if (!formData.firstName.trim()) next.firstName = required;
    if (!formData.lastName.trim()) next.lastName = required;
    if (!formData.email.trim()) next.email = required;
    else if (!EMAIL_RE.test(formData.email.trim()))
      next.email = t("pages.instructor_request.errors.invalid_email", {
        defaultValue: "Please enter a valid email",
      });
    setErrors(next);

    let ok = Object.keys(next).length === 0;
    if (files.length === 0) {
      setFileError(t("pages.instructor_request.errors.document_required"));
      ok = false;
    }
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("pages.instructor_request.errors.login_required"));
      return;
    }

    if (!validateAll()) return;

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
        { Authorization: `Bearer ${token}` }
      );

      if (!response?.data?.success) {
        throw new Error(
          response?.data?.message ||
            t("pages.instructor_request.errors.submit_failed")
        );
      }

      toast.success(t("pages.instructor_request.success"));
      navigate("/dashboard/my-profile");
    } catch (error) {
      toast.error(
        error.message || t("pages.instructor_request.errors.submit_error")
      );
    } finally {
      setLoading(false);
    }
  };

  // Tiến độ các mục bắt buộc
  const requiredChecks = [
    !!formData.firstName.trim(),
    !!formData.lastName.trim(),
    !!formData.email.trim(),
    files.length > 0,
  ];
  const doneCount = requiredChecks.filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl px-4 md:py-8 min-h-[calc(100vh-5rem)]">
      <style>{`
        @keyframes ir-fade { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
        .ir-fade { animation: ir-fade .35s ease-out both }
      `}</style>

      {checkingStatus ? (
        <div className="h-[460px] animate-pulse rounded-2xl bg-richblack-800" />
      ) : requestStatus === "pending" ? (
        /* ===== Pending ===== */
        <div className="ir-fade flex min-h-[420px] items-center justify-center">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-richblack-700 bg-richblack-800 p-8 text-center shadow-2xl">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-yellow-50/10 blur-3xl" />

            <div className="relative mx-auto grid h-16 w-16 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-yellow-50/10" />
              <span className="relative grid h-16 w-16 place-items-center rounded-full border border-yellow-50/30 bg-yellow-50/10 text-3xl text-yellow-50">
                <HiOutlineClock />
              </span>
            </div>

            <h1 className="relative mt-6 text-2xl font-bold text-richblack-5">
              Instructor Request Pending
            </h1>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-richblack-300">
              Your instructor request has been submitted successfully and is
              currently waiting for admin approval.
            </p>

            <ol className="relative mx-auto mt-8 flex max-w-sm items-start justify-between text-xs">
              <span className="absolute left-[16%] right-[16%] top-4 h-px bg-richblack-600" />
              <span className="absolute left-[16%] top-4 h-px w-[34%] bg-yellow-50" />
              {[
                { label: "Submitted", state: "done" },
                { label: "Under review", state: "current" },
                { label: "Decision", state: "todo" },
              ].map((s) => (
                <li
                  key={s.label}
                  className="relative flex w-1/3 flex-col items-center gap-2"
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 text-sm ${
                      s.state === "done"
                        ? "border-yellow-50 bg-yellow-50 text-richblack-900"
                        : s.state === "current"
                        ? "border-yellow-50 bg-richblack-800 text-yellow-50"
                        : "border-richblack-600 bg-richblack-800 text-richblack-500"
                    }`}
                  >
                    {s.state === "done" ? (
                      <HiOutlineCheck />
                    ) : s.state === "current" ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-50" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-richblack-600" />
                    )}
                  </span>
                  <span
                    className={
                      s.state === "todo"
                        ? "text-richblack-500"
                        : "text-richblack-100"
                    }
                  >
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>

            <div className="relative mt-8 rounded-xl border border-richblack-700 bg-richblack-900/60 px-4 py-3">
              <p className="text-xs text-richblack-500">Request status</p>
              <p className="mt-1 text-sm font-semibold text-yellow-50">
                Pending approval
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard/my-profile")}
              className="relative mt-6 rounded-xl border border-richblack-600 px-6 py-2.5 text-sm font-medium text-richblack-200 transition-all hover:bg-richblack-700 hover:text-richblack-5"
            >
              Back to Profile
            </button>
          </div>
        </div>
      ) : (
        /* ===== Compact single-page form ===== */
        <form
          onSubmit={handleSubmit}
          noValidate
          className="ir-fade overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800"
        >
          {/* Header bar */}
          <div className="flex flex-col gap-3 border-b border-richblack-700 bg-gradient-to-r from-richblack-800 to-richblack-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-50" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-yellow-50/90">
                  {t("pages.instructor_request.badge")}
                </span>
              </div>
              <h1 className="text-xl font-bold text-richblack-5">
                {t("pages.instructor_request.title")}
              </h1>
              <p className="mt-0.5 truncate text-xs text-richblack-400">
                {t("pages.instructor_request.description")}
              </p>
            </div>

            {/* Mini progress */}
            <div className="flex flex-shrink-0 items-center gap-3 rounded-xl border border-richblack-700 bg-richblack-900/60 px-4 py-2.5">
              <div className="flex gap-1">
                {requiredChecks.map((ok, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-6 rounded-full transition-colors ${
                      ok ? "bg-yellow-50" : "bg-richblack-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-richblack-200">
                {doneCount}/{requiredChecks.length}
              </span>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
            {/* ===== LEFT: all text fields ===== */}
            <div className="space-y-4 p-5 md:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t("pages.instructor_request.first_name")}
                  required
                  error={errors.firstName}
                >
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.firstName ? inputErr : inputOk}`}
                  />
                </Field>
                <Field
                  label={t("pages.instructor_request.last_name")}
                  required
                  error={errors.lastName}
                >
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.lastName ? inputErr : inputOk}`}
                  />
                </Field>
                <Field
                  label={t("pages.instructor_request.email")}
                  required
                  error={errors.email}
                >
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${inputBase} ${errors.email ? inputErr : inputOk}`}
                  />
                </Field>
                <Field label={t("pages.instructor_request.phone")}>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${inputBase} ${inputOk}`}
                  />
                </Field>
              </div>

              <Field label={t("pages.instructor_request.about")}>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={2}
                  className={`${inputBase} ${inputOk} resize-none`}
                  placeholder={t("pages.instructor_request.about_placeholder")}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t("pages.instructor_request.qualifications")}>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    rows={3}
                    className={`${inputBase} ${inputOk} resize-none`}
                    placeholder={t(
                      "pages.instructor_request.qualifications_placeholder"
                    )}
                  />
                </Field>
                <Field label={t("pages.instructor_request.experience")}>
                  <textarea
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    rows={3}
                    className={`${inputBase} ${inputOk} resize-none`}
                    placeholder={t(
                      "pages.instructor_request.experience_placeholder"
                    )}
                  />
                </Field>
              </div>
            </div>

            {/* ===== RIGHT: documents + actions ===== */}
            <div className="flex flex-col border-t border-richblack-700 bg-richblack-900/40 p-5 lg:border-l lg:border-t-0 md:p-6">
              <label className="mb-2 text-xs font-medium text-richblack-100">
                {t("pages.instructor_request.documents")}{" "}
                <sup className="text-pink-200">*</sup>
              </label>

              <label
                htmlFor="documents"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-3 py-3 transition-all ${
                  isDragging
                    ? "border-yellow-50 bg-yellow-50/5"
                    : fileError
                    ? "border-pink-500/60 bg-pink-500/5"
                    : "border-richblack-600 hover:border-yellow-50/50"
                }`}
              >
                <span
                  className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full text-xl transition-colors ${
                    isDragging
                      ? "bg-yellow-50 text-richblack-900"
                      : "bg-richblack-700 text-yellow-50"
                  }`}
                >
                  <HiOutlineCloudUpload />
                </span>
                <span className="min-w-0 text-xs leading-snug text-richblack-300">
                  {t("pages.instructor_request.upload_hint", {
                    size: MAX_FILE_SIZE_MB,
                  })}
                  <span className="mt-0.5 block text-[10px] text-richblack-500">
                    {ACCEPTED_TYPES.join(" · ").toUpperCase()}
                  </span>
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
                <p className="mt-2 flex items-start gap-1.5 text-xs text-pink-200">
                  <HiOutlineExclamation className="mt-0.5 flex-shrink-0" />
                  {fileError}
                </p>
              )}

              {/* Danh sách file: cuộn khi nhiều */}
              {files.length > 0 && (
                <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${index}`}
                      className="flex items-center gap-2.5 rounded-lg border border-richblack-700 bg-richblack-800 p-1.5"
                    >
                      <FileThumb file={file} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-richblack-100">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-richblack-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        title={t("pages.instructor_request.remove")}
                        onClick={() => removeFile(index)}
                        className="rounded-md p-1 text-richblack-400 transition-colors hover:bg-pink-500/10 hover:text-pink-200"
                      >
                        <HiOutlineX />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Actions */}
              <div className="mt-auto flex flex-col-reverse gap-2 pt-5 sm:flex-row lg:flex-col-reverse xl:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/my-profile")}
                  className="flex-1 rounded-lg border border-richblack-600 px-4 py-2 text-sm font-semibold text-richblack-300 transition-colors hover:bg-richblack-700 hover:text-richblack-5"
                >
                  {t("pages.instructor_request.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 px-4 py-2 text-sm font-bold text-richblack-900 transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-richblack-900 border-t-transparent" />
                  )}
                  {loading
                    ? t("pages.instructor_request.submitting")
                    : t("pages.instructor_request.submit")}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-richblack-100">
        {label} {required && <sup className="text-pink-200">*</sup>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-pink-200">
          <HiOutlineExclamation className="flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function FileThumb({ file }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!isImageFile(file)) return;
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="grid h-9 w-9 flex-shrink-0 place-items-center overflow-hidden rounded-md bg-richblack-700 text-base text-richblack-300">
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <HiOutlineDocumentText />
      )}
    </div>
  );
}