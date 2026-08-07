import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <section className="p-[40px] bg-white pt-[100px]">
      <div>
        <div>
          <div>
            <div className="text-center">
              <div className="h-[400px] bg-center bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)]">
                <h1 className="text-center text-6xl font-extrabold text-black">{t("pages.page_not_found.heading")}</h1>
              </div>

              <div className="-mt-12">
                <h3 className="text-4xl mb-1">{t("pages.page_not_found.title")}</h3>
                <p>{t("pages.page_not_found.description")}</p>

                <Link
                  to="/"
                  className="py-[13px] px-10 text-lg bg-caribbeangreen-200 hover:bg-caribbeangreen-400 my-5 inline-block rounded-full font-semibold duration-300"
                >
                  {t("pages.page_not_found.home_button")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageNotFound;