/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import CourseCard from "../Course/CourseExploreCard";
import HighlightText from "./HighlightText";
import { fetchCourseCategories } from "../../../services/operations/courseDetailsAPI";
import { motion } from "framer-motion";
import { FiBookOpen, FiCompass, FiCpu, FiDatabase, FiGlobe, FiLayout, } from "react-icons/fi";

const ExploreMore = ({ allCourses }) => {
  const [categories, setCategories] = useState([]);
  const [currentTab, setCurrentTab] = useState("");
  const [currentCard, setCurrentCard] = useState("");

  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    const iconMap = [
      { key: "web", icon: <FiGlobe /> },
      { key: "data", icon: <FiDatabase /> },
      { key: "ai", icon: <FiCpu /> },
      { key: "machine", icon: <FiCpu /> },
      { key: "design", icon: <FiLayout /> },
      { key: "network", icon: <FiCompass /> },
    ];
    const match = iconMap.find(item => n.includes(item.key));
    return match ? match.icon : <FiBookOpen />;
  };

  useEffect(() => {
    const getCategories = async () => {
      try {
        const res = await fetchCourseCategories();
        if (res?.length > 0) {
          setCategories(res);
          setCurrentTab(res[0]?.name);
        }
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    };
    getCategories();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!currentTab || !allCourses) return [];
    return allCourses
      .filter((course) => course?.category?.name === currentTab)
      .slice(0, 6);
  }, [currentTab, allCourses]);

  useEffect(() => {
    setCurrentCard(filteredCourses[0]?.courseName || "");
  }, [filteredCourses]);

  return (
    <div className="w-full py-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12 text-center"
      >
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-caribbeangreen-100">Explore by category</p>
        <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-white tracking-tight">
          Academic <HighlightText text="Excellence Catalog" />
        </h2>
        <p className="text-richblack-300 text-lg max-w-[750px] mx-auto leading-relaxed">
          Explore specialized curricula crafted for the next generation of IT leaders. 
          Validated by industry standards and enhanced by intelligent tutoring.
        </p>
      </motion.div>

      <div className="mb-14 flex justify-center px-4">
        <div className="flex flex-wrap justify-center gap-2 rounded-lg border border-richblack-700 bg-richblack-800/70 p-2 shadow-2xl backdrop-blur">
          {
            categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setCurrentTab(category.name)}
                className={`flex min-h-[44px] items-center gap-2.5 rounded-lg px-5 py-3 text-sm font-bold transition-all duration-300
                  ${currentTab === category.name
                    ? "bg-yellow-50 text-richblack-900 shadow-[0_10px_30px_rgba(255,214,10,0.22)]"
                    : "text-richblack-200 hover:text-white hover:bg-richblack-700"
                  }`}
              >
                <span className="text-lg">{getCategoryIcon(category.name)}</span>
                {category.name}
              </button>
            ))
          }
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-0 sm:px-2">
        <motion.div layout className="grid min-h-[430px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CourseCard
                    cardData={course}
                    currentCard={currentCard}
                    setCurrentCard={setCurrentCard}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-richblack-700 bg-richblack-800/20 px-6 py-24 text-richblack-400"
              >
                <div className="relative mb-6">
                   <FiCompass size={64} className="text-richblack-600 animate-[spin_10s_linear_infinite]" />
                   <FiCpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-50" />
                </div>
                <p className="text-2xl font-semibold text-richblack-200 mb-2">No Syllabus Found</p>
                <p className="text-richblack-400 max-w-[400px] text-center">
                  We are currently curating high-quality content for <span className="text-yellow-50">{currentTab}</span>. 
                  Check back for AI-enhanced modules soon.
                </p>
              </motion.div>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExploreMore;
