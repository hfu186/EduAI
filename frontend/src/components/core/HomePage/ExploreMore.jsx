/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import CourseCard from "../Course/CourseExploreCard";
import HighlightText from "./HighlightText";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const LEARNING_PATH = [
  {
    level: "Beginner",
    step: "01",
    title: "Foundations",
    tagline: "No prior experience needed. Build the vocabulary and habits you'll use everywhere else.",
  },
  {
    level: "Intermediate",
    step: "02",
    title: "Application",
    tagline: "You know the syntax. Now ship real projects and start making architectural decisions.",
  },
  {
    level: "Advanced",
    step: "03",
    title: "Specialization",
    tagline: "Go deep on performance, systems design, and the edge cases that separate senior work.",
  },
];

const ExploreMore = ({ allCourses }) => {
  const [activeLevel, setActiveLevel] = useState(LEARNING_PATH[0].level);

  const coursesByLevel = useMemo(() => {
    if (!allCourses) return {};
    return allCourses.reduce((acc, course) => {
      const level = course?.level   || "Beginner"; // fallback nếu course chưa gắn level
      if (!acc[level]) acc[level] = [];
      acc[level].push(course);
      return acc;
    }, {});
  }, [allCourses]);

  const activeCourses = (coursesByLevel[activeLevel] || []).slice(0, 3);
  const activeIndex = LEARNING_PATH.findIndex((s) => s.level === activeLevel);

  return (
    <div className="w-full py-10">
      {/* ===== HEADER ===== */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 text-center"
      >
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-caribbeangreen-100">
          Your learning path
        </p>
        <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-white tracking-tight">
          Progress at Your <HighlightText text="Own Pace" />
        </h2>
        <p className="text-richblack-300 text-lg max-w-[750px] mx-auto leading-relaxed">
          Three stages, one direction: forward. Pick where you stand today and see what's next.
        </p>
      </motion.div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* ===== PATH TRACK ===== */}
        <div className="relative mb-14">
          {/* Connecting line */}
          <div className="absolute top-6 left-0 right-0 h-[2px] bg-richblack-700 mx-6 sm:mx-10">
            <motion.div
              className="h-full bg-yellow-50"
              initial={{ width: "0%" }}
              animate={{
                width: `${(activeIndex / (LEARNING_PATH.length - 1)) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>

          <div className="relative grid grid-cols-3 gap-2 sm:gap-6">
            {LEARNING_PATH.map((stage, index) => {
              const isActive = stage.level === activeLevel;
              const isPast = index < activeIndex;
              return (
                <button
                  key={stage.level}
                  onClick={() => setActiveLevel(stage.level)}
                  className="flex flex-col items-center text-center group"
                >
                  {/* Step marker */}
                  <span
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold text-sm transition-all duration-300
                      ${isActive
                        ? "bg-yellow-50 border-yellow-50 text-richblack-900 scale-110"
                        : isPast
                          ? "bg-richblack-900 border-yellow-50 text-yellow-50"
                          : "bg-richblack-900 border-richblack-600 text-richblack-400 group-hover:border-richblack-400"
                      }`}
                  >
                    {isPast ? <FiCheck /> : stage.step}
                  </span>

                  <span
                    className={`mt-3 text-sm sm:text-base font-bold transition-colors ${
                      isActive ? "text-white" : "text-richblack-400 group-hover:text-richblack-200"
                    }`}
                  >
                    {stage.level}
                  </span>
                  <span className="hidden sm:block mt-1 text-xs text-richblack-500">
                    {coursesByLevel[stage.level]?.length || 0} courses
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== ACTIVE STAGE DETAIL ===== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-8 rounded-lg border border-richblack-700 bg-richblack-800/50 px-6 py-5">
              <h3 className="text-xl font-bold text-white mb-1.5">
                {LEARNING_PATH[activeIndex].title}
              </h3>
              <p className="text-richblack-300 leading-relaxed">
                {LEARNING_PATH[activeIndex].tagline}
              </p>
            </div>

            <div className="grid min-h-[320px] grid-cols-1 gap-6 md:grid-cols-3">
              {activeCourses.length > 0 ? (
                activeCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                  >
                    <CourseCard cardData={course} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-richblack-700 bg-richblack-800/20 px-6 py-20 text-center">
                  <p className="text-xl font-semibold text-richblack-200 mb-2">
                    No {activeLevel.toLowerCase()} courses yet
                  </p>
                  <p className="text-richblack-400 max-w-[380px]">
                    New content lands regularly. Try another stage on the path above.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExploreMore;