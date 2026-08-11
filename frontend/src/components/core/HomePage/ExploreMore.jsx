/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import CourseCard from "../Course/CourseExploreCard";
import HighlightText from "./HighlightText";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck } from "react-icons/fi";

const LEARNING_PATH = [
  {
    level: "Beginner",
    step: "01",
    titleKey: "beginner.title",
    taglineKey: "beginner.tagline",
  },
  {
    level: "Intermediate",
    step: "02",
    titleKey: "intermediate.title",
    taglineKey: "intermediate.tagline",
  },
  {
    level: "Advanced",
    step: "03",
    titleKey: "advanced.title",
    taglineKey: "advanced.tagline",
  },
];

const ExploreMore = ({ allCourses }) => {
  const { t } = useTranslation();

  const [activeLevel, setActiveLevel] = useState(
    LEARNING_PATH[0].level
  );

  const coursesByLevel = useMemo(() => {
    if (!allCourses) return {};

    return allCourses.reduce((acc, course) => {
      const level = course?.level || "Beginner";

      if (!acc[level]) {
        acc[level] = [];
      }

      acc[level].push(course);

      return acc;
    }, {});
  }, [allCourses]);

  const activeCourses = (coursesByLevel[activeLevel] || []).slice(0, 3);

  const activeIndex = LEARNING_PATH.findIndex(
    (stage) => stage.level === activeLevel
  );

  const activeStage = LEARNING_PATH[activeIndex];

  return (
    <div className="w-full py-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14 text-center"
      >
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-caribbeangreen-100">
          {t("pages.home.learning_path.label")}
        </p>

        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white lg:text-5xl">
          {t("pages.home.learning_path.heading_part1")}{" "}
          <HighlightText
            text={t("pages.home.learning_path.heading_highlight")}
          />
        </h2>

        <p className="mx-auto max-w-[750px] text-lg leading-relaxed text-richblack-300">
          {t("pages.home.learning_path.description")}
        </p>
      </motion.div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* PATH TRACK */}
        <div className="relative mb-14">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-6 mx-6 h-[2px] bg-richblack-700 sm:mx-10">
            <motion.div
              className="h-full bg-yellow-50"
              initial={{ width: "0%" }}
              animate={{
                width:
                  activeIndex === 0
                    ? "0%"
                    : `${(activeIndex / (LEARNING_PATH.length - 1)) * 100}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 30,
              }}
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
                  className="group flex flex-col items-center text-center"
                >
                  {/* Step marker */}
                  <span
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "scale-110 border-yellow-50 bg-yellow-50 text-richblack-900"
                        : isPast
                          ? "border-yellow-50 bg-richblack-900 text-yellow-50"
                          : "border-richblack-600 bg-richblack-900 text-richblack-400 group-hover:border-richblack-400"
                    }`}
                  >
                    {isPast ? <FiCheck /> : stage.step}
                  </span>

                  <span
                    className={`mt-3 text-sm font-bold transition-colors sm:text-base ${
                      isActive
                        ? "text-white"
                        : "text-richblack-400 group-hover:text-richblack-200"
                    }`}
                  >
                    {t(
                      `pages.home.learning_path.levels.${stage.level.toLowerCase()}`
                    )}
                  </span>

                  <span className="mt-1 hidden text-xs text-richblack-500 sm:block">
                    {t("pages.home.learning_path.course_count", {
                      count: coursesByLevel[stage.level]?.length || 0,
                    })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE STAGE DETAIL */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-8 rounded-lg border border-richblack-700 bg-richblack-800/50 px-6 py-5">
              <h3 className="mb-1.5 text-xl font-bold text-white">
                {t(`pages.home.learning_path.${activeStage.titleKey}`)}
              </h3>

              <p className="leading-relaxed text-richblack-300">
                {t(
                  `pages.home.learning_path.${activeStage.taglineKey}`
                )}
              </p>
            </div>

            <div className="grid min-h-[320px] grid-cols-1 gap-6 md:grid-cols-3">
              {activeCourses.length > 0 ? (
                activeCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.05,
                    }}
                  >
                    <CourseCard cardData={course} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-richblack-700 bg-richblack-800/20 px-6 py-20 text-center">
                  <p className="mb-2 text-xl font-semibold text-richblack-200">
                    {t("pages.home.learning_path.no_courses", {
                      level: t(
                        `pages.home.learning_path.levels.${activeLevel.toLowerCase()}`
                      ),
                    })}
                  </p>

                  <p className="max-w-[380px] text-richblack-400">
                    {t("pages.home.learning_path.no_courses_description")}
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