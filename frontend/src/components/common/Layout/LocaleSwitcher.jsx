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
      <div className="inline-flex items-center gap-1 rounded-full border border-richblack-600 bg-richblack-800 p-1">
        <button
          type="button"
          onClick={() => changeLocale("vi")}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${locale === "vi"
              ? "bg-yellow-50 shadow-sm ring-2 ring-yellow-50/50"
              : "hover:bg-richblack-700"
            }`}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1280px-Flag_of_Vietnam.svg.png"
            alt="VN"
            className="h-4 w-6 rounded-sm object-cover"
          />
        </button>

        <button
          type="button"
          onClick={() => changeLocale("en")}
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${locale === "en"
              ? "bg-yellow-50 shadow-sm ring-2 ring-yellow-50/50"
              : "hover:bg-richblack-700"
            }`}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/3840px-Flag_of_the_United_States.svg.png"
            alt="EN"
            className="h-4 w-6 rounded-sm object-cover"
          />
        </button>
      </div>
    </div>
  );
}