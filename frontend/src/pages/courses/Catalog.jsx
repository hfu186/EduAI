import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "@/components/common/Layout/Footer";
import Course_Card from "@/components/core/Catalog/Course_Card";
import Course_Slider from "@/components/core/Catalog/Course_Slider";
import Loading from "@/components/common/Loading";
import { getCatalogPageData } from "@/services/operations/pageAndComponentData";
import { fetchCourseCategories } from "@/services/operations/courseDetailsAPI";
import { FiAlertCircle, FiBookOpen } from "react-icons/fi";

function Catalog() {
  const { catalogName } = useParams();
  const { t } = useTranslation();
  const [active, setActive] = useState(1); 
  const [catalogPageData, setCatalogPageData] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetchCourseCategories();
        const category = res.filter(
          (ct) => ct.name.split(" ").join("-").toLowerCase() === catalogName,
        )[0];
        if (category) {
          setCategoryId(category._id);
        }
      } catch (error) {
        console.log("Could not fetch Categories.", error);
      }
    };
    getCategories();
  }, [catalogName]);

  useEffect(() => {
    if (categoryId) {
      const getPageData = async () => {
        try {
          const res = await getCatalogPageData(categoryId);
          setCatalogPageData(res);
        } catch (error) {
          console.log(error);
        }
        setLoading(false);
      };
      getPageData();
    }
  }, [categoryId]);

  const displayCourses = useMemo(() => {
    if (!catalogPageData?.selectedCategory?.courses) return [];

    const courses = [...catalogPageData.selectedCategory.courses];

    if (active === 1) {
      return courses.sort(
        (a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length,
      );
    } else {
      return courses.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }
  }, [active, catalogPageData]);

  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-richblack-900">
        <Loading />
      </div>
    );
  }

  if (!catalogPageData || !catalogPageData.selectedCategory) {
    return (
      <div className="flex flex-col gap-4 min-h-[60vh] justify-center items-center bg-richblack-900 text-white">
        <FiAlertCircle size={50} className="text-pink-200" />
        <h2 className="text-3xl font-bold">{t("pages.catalog.no_courses_found")}</h2>
        <p className="text-richblack-300">
          {t("pages.catalog.no_category_courses")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-richblack-900">
      {/* Hero Section */}
      <div className=" bg-richblack-800 px-4 py-10 shadow-inner border-b border-richblack-700">
        <div className="mx-auto flex max-w-maxContentTab flex-col justify-center gap-4 md:max-w-maxContent">
          <nav className="flex items-center gap-2 text-sm text-richblack-300 mb-2">
            <span>{t("pages.courses.breadcrumb_home")}</span> / <span>{t("pages.courses.breadcrumb_catalog")}</span> /
            <span className="text-yellow-25 font-semibold">
              {catalogPageData?.selectedCategory?.name}
            </span>
          </nav>
          <h1 className=" font-extrabold text-richblack-5 sm:text-4xl">
            {catalogPageData?.selectedCategory?.name}
          </h1>
          <p className=" text-lg text-richblack-200 leading-relaxed italic">
            {catalogPageData?.selectedCategory?.description ||
              t("pages.catalog.default_description")}
          </p>
        </div>
      </div>

      {/* Section 1: Dynamic Courses List */}
      <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
        <div className="flex items-center gap-2 text-2xl font-bold text-richblack-5 mb-6">
          <FiBookOpen className="text-yellow-50" />
          <span>{t("pages.catalog.get_started")}</span>
        </div>

        <div className="flex border-b border-richblack-700 text-sm font-medium">
          <button
            className={`px-6 py-3 transition-all duration-200 text-lg ${
              active === 1
                ? "border-b-2 border-yellow-25 text-yellow-25"
                : "text-richblack-400 hover:text-richblack-50"
            }`}
            onClick={() => setActive(1)}
          >
            {t("pages.catalog.most_popular")}
          </button>
          <button
            className={`px-6 py-3 transition-all duration-200 text-lg ${
              active === 2
                ? "border-b-2 border-yellow-25 text-yellow-25"
                : "text-richblack-400 hover:text-richblack-50"
            }`}
            onClick={() => setActive(2)}
          >
            {t("pages.catalog.newest")}
          </button>
        </div>

        <div className="mt-8">
          {displayCourses.length > 0 ? (
            <Course_Slider Courses={displayCourses} />
          ) : (
            <p className="py-10 text-center text-richblack-400 italic">
              {t("pages.catalog.no_courses_in_category")}
            </p>
          )}
        </div>
      </div>

      {/* Section 2: Different Category */}
      {catalogPageData?.differentCategory?.courses?.length > 0 && (
        <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent border-t border-richblack-800">
          <h2 className="text-2xl font-bold text-richblack-5 mb-8">
            {t("pages.catalog.check_out")}{" "}
            <span className="text-yellow-50">
              {catalogPageData?.differentCategory?.name}
            </span>{" "}
            {t("pages.catalog.courses")}
          </h2>
          <Course_Slider
            Courses={catalogPageData?.differentCategory?.courses}
          />
        </div>
      )}

      {/* Section 3: Frequently Bought */}
      {catalogPageData?.mostSellingCourses?.length > 0 && (
        <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent border-t border-richblack-800">
          <h2 className="text-2xl font-bold text-richblack-5 mb-8 uppercase tracking-widest">
            {t("pages.catalog.top_selling_courses")}
          </h2>
          <div className="py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
              {" "}
              {catalogPageData.mostSellingCourses
                .slice(0, 4)
                .map((course, i) => (
                  <div
                    key={i}
                    className="hover:scale-[1.01] transition-all duration-300"
                  >
                    <Course_Card course={course} Height={"h-[200px]"} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Catalog;
