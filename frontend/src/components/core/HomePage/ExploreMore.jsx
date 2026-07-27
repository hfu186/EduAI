/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo } from "react";
import CourseCard from "../Course/CourseExploreCard";
import HighlightText from "./HighlightText";
import { fetchCourseCategories } from "../../../services/operations/courseDetailsAPI";
import { motion,  } from "framer-motion";
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
    const result = allCourses
      .filter((course) => course?.category?.name === currentTab)
      .slice(0, 6);
    
    if (result.length > 0) setCurrentCard(result[0]?.courseName);
    return result;
  }, [currentTab, allCourses]);

  return (
    <div className="w-full py-12">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16 text-center"
      >
        <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white tracking-tight">
          Academic <HighlightText text="Excellence Catalog" />
        </h2>
        <div className="h-1.5 w-20 bg-gradient-to-r from-yellow-50 to-orange-200 mx-auto mb-6 rounded-full"></div>
        <p className="text-richblack-300 text-lg max-w-[750px] mx-auto leading-relaxed">
          Explore specialized curricula crafted for the next generation of IT leaders. 
          Validated by industry standards and enhanced by intelligent tutoring.
        </p>
      </motion.div>

      {/* Modern Tab Bar */}
      <div className="flex justify-center mb-20 px-4">
        <div className="flex flex-wrap justify-center gap-3 p-2 bg-richblack-800/40 backdrop-blur-xl rounded-[2rem] border border-richblack-700 shadow-2xl">
          {
            categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setCurrentTab(category.name)}
                className={`flex items-center gap-2.5 px-7 py-3.5 rounded-[1.6rem] text-sm font-bold transition-all duration-500
                  ${currentTab === category.name
                    ? "bg-yellow-50 text-richblack-900 shadow-[0_10px_30px_rgba(255,214,10,0.3)] -translate-y-1"
                    : "text-richblack-200 hover:text-white hover:bg-richblack-700"
                  }`}
              >
                <span className="text-xl">{getCategoryIcon(category.name)}</span>
                {category.name}
              </button>
            ))
          }
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[480px]">
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
                className="col-span-full flex flex-col items-center justify-center text-richblack-400 py-28 bg-richblack-800/20 rounded-[3rem] border-2 border-dashed border-richblack-700"
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