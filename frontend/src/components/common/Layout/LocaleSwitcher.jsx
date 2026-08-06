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
  className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all duration-200 ${
    locale === "vi"
      ? "bg-yellow-50 shadow-sm text-black"
      : "hover:bg-richblack-700"
  }`}
>
  🇻🇳
</button>

<button
  type="button"
  onClick={() => changeLocale("en")}
  className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition-all duration-200 ${
    locale === "en"
      ? "bg-yellow-50 shadow-sm text-black"
      : "hover:bg-richblack-700"
  }`}
>
  🇺🇸
</button>
    </div>
  );
}