/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserEnrolledCourses } from "../../../../services/operations/profileAPI";
import ProgressBar from "@ramonak/react-progress-bar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineChartBar,
  HiFire,
} from "react-icons/hi";

export default function EnrolledCoursesStats() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const [enrolledCourses, setEnrolledCourses] = useState(null);

  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);

      setEnrolledCourses(Array.isArray(res) ? res : []);
    } catch (error) {
      console.log("Could not fetch enrolled courses.", error);
      setEnrolledCourses([]);
    }
  };

  useEffect(() => {
    if (token) {
      getEnrolledCourses();
    }
  }, [token]);

  const totalCourses = enrolledCourses?.length || 0;

  const completedCourses =
    enrolledCourses?.filter(
      (course) => Number(course?.progressPercentage || 0) >= 100
    ).length || 0;

  const avgProgress =
    totalCourses > 0
      ? Math.round(
          enrolledCourses.reduce(
            (acc, curr) =>
              acc + Number(curr?.progressPercentage || 0),
            0
          ) / totalCourses
        )
      : 0;

  const studyStreak = user?.studyStreak || 0;

  return (
    <div className="pb-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mt-10 text-center text-3xl font-bold text-richblack-5 sm:text-left">
            {t("pages.learning_dashboard.title")}
          </h1>

          <p className="mt-2 text-center text-sm text-richblack-400 sm:text-left">
            {t("pages.learning_dashboard.subtitle")}
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-orange-500/30 bg-orange-600/10 px-4 py-2 md:flex">
          <HiFire
            className="animate-pulse text-orange-500"
            size={20}
          />

          <span className="font-bold text-orange-200">
            {t("pages.learning_dashboard.streak_days", {
              count: studyStreak,
            })}
          </span>
        </div>
      </div>
      <div className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-orange-500/30 bg-gradient-to-br from-orange-600/20 to-richblack-800 p-6 shadow-[0_0_20px_rgba(234,88,12,0.1)] transition-all duration-300 hover:border-orange-400/50 hover:shadow-[0_0_25px_rgba(234,88,12,0.15)]">
          <div className="flex items-center gap-3 text-orange-400">
            <HiFire
              size={28}
              className="animate-bounce text-orange-500"
            />

            <span className="text-xs font-bold uppercase tracking-widest">
              {t("pages.learning_dashboard.stats.streak")}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-white">
              {studyStreak}
            </p>

            <p className="text-sm font-medium text-orange-200">
              {t("pages.learning_dashboard.days")}
            </p>
          </div>
        </div>

        {/* ================= COURSES ================= */}
        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-richblack-700 bg-richblack-800 p-6 transition-all duration-300 hover:border-richblack-600">
          <div className="flex items-center gap-3 text-richblack-300">
            <HiOutlineAcademicCap
              size={24}
              className="text-yellow-50"
            />

            <span className="text-xs font-bold uppercase tracking-widest">
              {t("pages.learning_dashboard.stats.courses")}
            </span>
          </div>

          <p className="text-4xl font-black text-white">
            {totalCourses}
          </p>
        </div>

        {/* ================= AVG PROGRESS ================= */}
        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-richblack-700 bg-richblack-800 p-6 transition-all duration-300 hover:border-richblack-600">
          <div className="flex items-center gap-3 text-richblack-300">
            <HiOutlineChartBar
              size={24}
              className="text-caribbeangreen-200"
            />

            <span className="text-xs font-bold uppercase tracking-widest">
              {t("pages.learning_dashboard.stats.avg_progress")}
            </span>
          </div>

          <p className="text-4xl font-black text-white">
            {avgProgress}%
          </p>
        </div>

        {/* ================= COMPLETED ================= */}
        <div className="flex flex-col justify-center gap-2 rounded-2xl border border-richblack-700 bg-richblack-800 p-6 transition-all duration-300 hover:border-richblack-600">
          <div className="flex items-center gap-3 text-richblack-300">
            <HiOutlineClock
              size={24}
              className="text-blue-200"
            />

            <span className="text-xs font-bold uppercase tracking-widest">
              {t("pages.learning_dashboard.stats.completed")}
            </span>
          </div>

          <p className="text-4xl font-black text-white">
            {completedCourses}
          </p>
        </div>
      </div>

      {/* =========================
          MY COURSES TITLE
      ========================= */}
      <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold">
        {t("pages.learning_dashboard.my_courses")}

        <span className="text-sm font-normal text-richblack-400">
          ({totalCourses})
        </span>
      </h2>

      {/* =========================
          COURSE TABLE
      ========================= */}
      <div className="overflow-hidden rounded-2xl border border-richblack-700 bg-richblack-800 shadow-2xl">
        {/* TABLE HEADER */}
        <div className="hidden bg-richblack-700 p-4 px-8 text-sm font-semibold uppercase tracking-wider text-richblack-50 sm:flex">
          <p className="w-[50%]">
            {t("pages.learning_dashboard.table.course_info")}
          </p>

          <p className="w-[20%] text-center">
            {t("pages.learning_dashboard.table.status")}
          </p>

          <p className="w-[30%]">
            {t("pages.learning_dashboard.table.progress")}
          </p>
        </div>

        {/* =========================
            LOADING
        ========================= */}
        {!enrolledCourses ? (
          <div className="grid h-[20vh] place-items-center">
            <div className="spinner"></div>
          </div>
        ) : !enrolledCourses.length ? (
          /* =========================
              EMPTY
          ========================= */
          <div className="flex h-[30vh] flex-col items-center justify-center gap-3">
            <HiOutlineAcademicCap
              size={45}
              className="text-richblack-500"
            />

            <p className="text-center text-lg italic text-richblack-300">
              {t("pages.learning_dashboard.empty")}
            </p>

            <button
              onClick={() => navigate("/catalog")}
              className="font-bold text-yellow-50 underline transition-colors hover:text-yellow-100"
            >
              {t("pages.learning_dashboard.explore_catalog")}
            </button>
          </div>
        ) : (
          /* =========================
              COURSES
          ========================= */
          enrolledCourses.map((course, i) => {
            const progress = Math.min(
              100,
              Math.max(
                0,
                Number(course?.progressPercentage || 0)
              )
            );

            const isCompleted = progress >= 100;

            return (
              <div
                key={course?._id || i}
                className="group flex cursor-pointer flex-col items-center border-b border-richblack-700 p-4 transition-all duration-200 hover:bg-richblack-700/30 sm:flex-row sm:px-8"
                onClick={() =>
                  navigate(`/course/${course?._id}`)
                }
              >
                {/* =========================
                    COURSE INFO
                ========================= */}
                <div className="mb-4 flex w-full items-center gap-5 sm:mb-0 sm:w-[50%]">
                  <img
                    src={course?.thumbnail}
                    alt={
                      course?.courseName ||
                      t("pages.learning_dashboard.course")
                    }
                    className="h-20 w-20 flex-shrink-0 rounded-xl border border-richblack-600 object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="truncate text-lg font-bold text-richblack-5 transition-colors group-hover:text-yellow-50">
                      {course?.courseName}
                    </p>

                    <p className="line-clamp-2 max-w-[250px] text-xs text-richblack-400">
                      {course?.courseDescription}
                    </p>
                  </div>
                </div>

                {/* =========================
                    STATUS
                ========================= */}
                <div className="mb-4 w-full text-left sm:mb-0 sm:w-[20%] sm:text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold uppercase ${
                      isCompleted
                        ? "bg-caribbeangreen-900 text-caribbeangreen-200"
                        : "border border-yellow-500/20 bg-richblack-900 text-yellow-100"
                    }`}
                  >
                    {isCompleted
                      ? t("pages.learning_dashboard.status.finished")
                      : t("pages.learning_dashboard.status.learning")}
                  </span>
                </div>

                {/* =========================
                    PROGRESS
                ========================= */}
                <div className="w-full sm:w-[30%]">
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-[12px] font-bold uppercase text-richblack-400">
                      {t("pages.learning_dashboard.completion")}
                    </span>

                    <span className="text-sm font-bold text-richblack-5">
                      {progress}%
                    </span>
                  </div>

                  <ProgressBar
                    completed={progress}
                    height="6px"
                    isLabelVisible={false}
                    baseBgColor="#161D29"
                    bgColor={
                      isCompleted
                        ? "#05A34A"
                        : "#1FA2FF"
                    }
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}