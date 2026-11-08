/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { RiEditBoxLine } from "react-icons/ri";
import { HiOutlineDocumentText } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { dateFormatter } from "../../../utils/dateFormatter";
import Img from "./../../common/Img";


function Card({ className = "", children }) {
  return (
    <section
      className={`rounded-2xl border border-richblack-700 bg-richblack-800 ${className}`}
    >
      {children}
    </section>
  );
}

function CardHeader({ title, onEdit, editText }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-richblack-700 px-6 py-4 sm:px-8">
      <h2 className="text-base font-semibold text-richblack-5">{title}</h2>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-richblack-300 transition-colors hover:bg-richblack-700 hover:text-yellow-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-50"
        >
          <RiEditBoxLine className="text-base" />
          <span className="hidden sm:inline">{editText}</span>
        </button>
      )}
    </div>
  );
}

function Field({ label, value, placeholder, capitalize = false }) {
  const hasValue = Boolean(value);
  return (
    <div className="min-w-0">
      <dt className="mb-1 text-sm text-richblack-400">{label}</dt>
      <dd
        className={`break-words text-sm ${
          hasValue
            ? `font-medium text-richblack-5 ${capitalize ? "capitalize" : ""}`
            : "text-richblack-500"
        }`}
      >
        {hasValue ? value : placeholder}
      </dd>
    </div>
  );
}

function WaveStyles() {
  return (
    <style>{`
      @keyframes wave-letter {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-8px); }
      }
      @keyframes marquee-left {
        from { transform: translateX(0); }
        to { transform: translateX(-20%); }
      }
      @keyframes marquee-right {
        from { transform: translateX(-20%); }
        to { transform: translateX(0); }
      }
    
      .marquee-left { animation: marquee-left 30s linear infinite; }
      .marquee-right { animation: marquee-right 36s linear infinite; }
      @media (prefers-reduced-motion: reduce) {
        .wave-letter, .marquee-left, .marquee-right { animation: none; }
      }
    `}</style>
  );
}

function WaveText({ text = "" }) {
  return (
    <span>
      {Array.from(text).map((char, i) => (
        <span
          key={i}
          className="wave-letter"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

function MarqueeRow({ text, direction = "left", repeat = 6 }) {
  const half = Array.from({ length: repeat }).map((_, k) => (
    <span key={k} className="mx-6 whitespace-nowrap">
      <WaveText text={text} />
    </span>
  ));
  return (
    <div className="w-full overflow-hidden">
      <div className={`flex w-max marquee-${direction}`}>
        {half}
        {half}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function MyProfile() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState(null);

  const goToSettings = () => navigate("/dashboard/settings");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!previewImage) return;
    const onKey = (e) => e.key === "Escape" && setPreviewImage(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewImage]);

  const details = user?.additionalDetails;
  const certificates = details?.certificates || [];
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const isInstructor = user?.accountType === "Instructor";
  const dob = details?.dateOfBirth ? dateFormatter(details.dateOfBirth) : null;

  return (
    <div className="h-[calc(100vh-5rem)] overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
      <Card className="overflow-hidden mt-4">
        <div
          aria-hidden="true"
          className="flex h-28 select-none items-center overflow-hidden bg-gradient-to-r from-yellow-600 via-blue-700 to-richblack-800 text-xl font-bold capitalize text-white/30 sm:h-36 sm:text-3xl"
        >
          <WaveStyles />
          <div
            className="flex w-full flex-col gap-1 sm:gap-2"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
              maskImage:
                "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)",
            }}
          >
            <MarqueeRow text={fullName} direction="left" />
            <MarqueeRow text={fullName} direction="right" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div className="-mt-12 flex flex-col items-center gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <Img
              src={user?.image}
              alt={`profile-${user?.firstName}`}
              className="aspect-square w-24 rounded-full object-cover ring-4 ring-richblack-800 sm:w-32"
            />
            <div className="pb-1 text-center sm:text-left">
              <p className="text-xl font-semibold capitalize text-richblack-5 sm:text-2xl">
                {fullName}
              </p>
              <p className="mt-0.5 text-sm text-richblack-300">{user?.email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== Body: About (narrow) + Personal details (wide) ===== */}
      <div className="my-6 grid gap-6 lg:grid-cols-3 ">
        <Card className="lg:col-span-1">
          <CardHeader
            title={t("profile.about.title")}
            onEdit={goToSettings}
            editText={t("common.edit")}
          />
          <div className="px-6 py-6 sm:px-8">
            <p
              className={`whitespace-pre-line text-sm text-balance leading-relaxed ${
                details?.about ? "text-richblack-100" : "text-richblack-500"
              }`}
            >
              {details?.about ?? t("profile.about.empty")}
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title={t("profile.personal.title")}
            onEdit={goToSettings}
            editText={t("common.edit")}
          />
          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2 sm:px-8">
            <Field
              label={t("profile.personal.first_name")}
              value={user?.firstName}
              capitalize
            />
            <Field
              label={t("profile.personal.last_name")}
              value={user?.lastName}
              capitalize
            />
            <Field label={t("profile.personal.email")} value={user?.email} />
            <Field
              label={t("profile.personal.account_type")}
              value={user?.accountType}
              capitalize
            />
            <Field
              label={t("profile.personal.gender")}
              value={details?.gender}
              placeholder={t("profile.personal.add_gender")}
            />
            <Field
              label={t("profile.personal.dob")}
              value={dob}
              placeholder={t("profile.personal.add_dob")}
            />
          </dl>
        </Card>
      </div>

      {/* ===== Instructor only ===== */}
      {isInstructor && (
        <Card className="mb-10">
          <CardHeader
            title="Qualifications & Experience"
            onEdit={goToSettings}
            editText={t("common.edit")}
          />

          <div className="grid gap-8 px-6 py-6 sm:grid-cols-2 sm:px-8">
            <div>
              <h3 className="mb-2 text-sm text-richblack-400">
                Qualifications & certifications
              </h3>
              <p
                className={`whitespace-pre-line text-sm leading-relaxed ${
                  details?.qualifications
                    ? "font-medium text-richblack-5"
                    : "text-richblack-500"
                }`}
              >
                {details?.qualifications || "No qualifications added yet"}
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-sm text-richblack-400">
                Teaching experience
              </h3>
              <p
                className={`whitespace-pre-line text-sm leading-relaxed ${
                  details?.experience
                    ? "font-medium text-richblack-5"
                    : "text-richblack-500"
                }`}
              >
                {details?.experience || "No experience added yet"}
              </p>
            </div>
          </div>

          <div className="border-t border-richblack-700 px-6 py-6 sm:px-8">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-sm text-richblack-400">Certificate photos</h3>
              {certificates.length > 0 && (
                <span className="text-xs text-richblack-500">
                  {certificates.length} uploaded
                </span>
              )}
            </div>

            {certificates.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {certificates.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPreviewImage(url)}
                    aria-label={`View certificate ${index + 1}`}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-richblack-600 transition-colors hover:border-yellow-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-50"
                  >
                    <img
                      src={url}
                      alt={`Certificate ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-richblack-600 px-4 py-5 text-sm text-richblack-400">
                <HiOutlineDocumentText className="flex-shrink-0 text-xl" />
                <span>No certificate photos added yet</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ===== Lightbox ===== */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Certificate preview"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            aria-label="Close preview"
            onClick={() => setPreviewImage(null)}
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-richblack-800 text-white transition-colors hover:bg-richblack-700"
          >
            <IoClose size={20} />
          </button>
          <img
            src={previewImage}
            alt="Certificate preview"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}