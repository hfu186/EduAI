import { useTranslation } from "react-i18next";

const localeCookie = "locale";

export default function LocaleSwitcher() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const changeLocale = (nextLocale) => {
    if (nextLocale === locale) return;
    document.cookie = `${localeCookie}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
    i18n.changeLanguage(nextLocale);
  };

  return (
    <div
      className="inline-flex items-center rounded-full border border-richblack-600 bg-richblack-800 p-1"
      aria-label={t("common.change_language")}
    >
      <button
        type="button"
        onClick={() => changeLocale("vi")}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
          locale === "vi"
            ? "bg-yellow-50 text-richblack-900 shadow-sm"
            : "text-richblack-300 hover:text-richblack-5"
        }`}
      >
        VI
      </button>

      <button
        type="button"
        onClick={() => changeLocale("en")}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
          locale === "en"
            ? "bg-yellow-50 text-richblack-900 shadow-sm"
            : "text-richblack-300 hover:text-richblack-5"
        }`}
      >
        EN
      </button>
    </div>
  );
}