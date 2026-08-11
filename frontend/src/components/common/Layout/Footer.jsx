import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ImGithub, ImLinkedin2 } from "react-icons/im";
import EduSpaceLogo from "@/assets/Logo/Logo-Full-Light.png";
const quickLinks = [
  { titleKey: "nav.home", link: "/" },
  { titleKey: "nav.about us", link: "/about" },
  { titleKey: "pages.courses.all_courses", link: "/all-courses" },
  { titleKey: "nav.instructors", link: "/profile/all-instructors" },
];

const accountLinks = [
  { titleKey: "auth.button.login", link: "/login" },
  { titleKey: "auth.signup.title", link: "/signup" },
  { titleKey: "profile.dashboard", link: "/dashboard/my-profile" },
];

const supportLinks = [
  { titleKey: "nav.contact us", link: "/contact" },
  { titleKey: "auth.forgot_password", link: "/forgot-password" },
];

const bottomLinks = [
  { titleKey: "pages.footer.privacy", link: "/privacy-policy" },
  { titleKey: "pages.footer.terms", link: "/terms" },
  { titleKey: "pages.footer.contact", link: "/contact" },
];

const Footer = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-richblack-800 mx-7 rounded-3xl mb-10">
      <div className="w-11/12 max-w-maxContent text-richblack-400 mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-richblack-700 pb-8">
          <div className="space-y-3">
            <img src={EduSpaceLogo} alt="EduSpace" className="h-10 w-auto object-contain" />
            <p className="text-sm text-richblack-300">
              {t("pages.footer.description")}
            </p>
          </div>

          <div>
            <h2 className="text-richblack-50 font-semibold text-base mb-3">{t("pages.footer.quick_links")}</h2>
            <div className="space-y-2">
              {quickLinks.map((item) => (
                <Link key={item.titleKey} to={item.link} className="block text-sm hover:text-richblack-50 transition-all duration-200">
                  {t(item.titleKey)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-richblack-50 font-semibold text-base mb-3">{t("pages.footer.account")}</h2>
            <div className="space-y-2">
              {accountLinks.map((item) => (
                <Link key={item.titleKey} to={item.link} className="block text-sm hover:text-richblack-50 transition-all duration-200">
                  {t(item.titleKey)}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-richblack-50 font-semibold text-base mb-3">{t("pages.footer.support")}</h2>
            <div className="space-y-2">
              {supportLinks.map((item) => (
                <Link key={item.titleKey} to={item.link} className="block text-sm hover:text-richblack-50 transition-all duration-200">
                  {t(item.titleKey)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 text-sm flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center lg:text-left">
            {bottomLinks.map((item, index) => (
              <div key={item.titleKey} className="flex items-center">
                <Link to={item.link} className="hover:text-richblack-50 transition-all duration-200">
                  {t(item.titleKey)}
                </Link>
                {index !== bottomLinks.length - 1 && (
                  <span className="mx-2 text-richblack-700">|</span>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <span>{t("pages.footer.copyright")}</span>
          </div>

          <div className="flex items-center">
            <a href="https://www.linkedin.com" className="text-white p-3 hover:bg-richblack-700 rounded-full duration-300" target="_blank" rel="noopener noreferrer">
              <ImLinkedin2 size={17} />
            </a>
            <a href="https://www.github.com" className="text-white p-3 hover:bg-richblack-700 rounded-full duration-300" target="_blank" rel="noopener noreferrer">
              <ImGithub size={17} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
