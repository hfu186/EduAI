import { useState, useEffect } from "react";
import { FaArrowRight, FaBrain, FaSearch, FaLightbulb, FaBookOpen, FaGraduationCap, FaChalkboardTeacher, FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import HighlightText from '@/components/core/HomePage/HighlightText';
import CTAButton from "@/components/core/HomePage/Button";
import CodeBlocks from "@/components/core/HomePage/CodeBlocks";
import ExploreMore from "@/components/core/HomePage/ExploreMore";
import Footer from '@/components/common/Layout/Footer';
import Course_Slider from "@/components/core/Catalog/Course_Slider";
import { getAllCourses } from "@/services/operations/courseDetailsAPI";

const Home = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const dispatch = useDispatch();
  const quickLinks = [
    { icon: FaSearch, text: t("pages.home.quick_links.search_catalog"), link: "/all-courses/" },
    { icon: FaBookOpen, text: t("pages.home.quick_links.my_learning"), link: "/dashboard/enrolled-courses" },
    { icon: FaBrain, text: t("pages.home.quick_links.ai_assessment"), link: "/dashboard/ai-practice" },
    { icon: FaLightbulb, text: t("pages.home.quick_links.soft_skills"), link: "/catalog/soft-skills" },
  ];

  const stats = [
    { label: t("pages.home.stats.published_courses"), value: "500+", icon: <FaBookOpen /> },
    { label: t("pages.home.stats.active_learners"), value: "10K+", icon: <FaGraduationCap /> },
    { label: t("pages.home.stats.ai_support"), value: "24/7", icon: <FaBrain /> },
    { icon: <FaChalkboardTeacher />, label: t("pages.home.stats.expert_mentors"), value: "200+" },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      const result = await getAllCourses();
      setCourses(result || []);
    };
    fetchCourses();
  }, [dispatch]);

  const trendingCourses = [...courses]
    .sort((a, b) => (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0))
    .slice(0, 8);

  return (
    <div className='bg-richblack-900 text-richblack-5 min-h-screen font-inter'>

      <section className="relative overflow-hidden border-b border-richblack-700/70 bg-[linear-gradient(180deg,#000814_0%,#101723_58%,#000814_100%)] px-4 pb-16 pt-14 sm:pt-20">
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:72px_72px]"></div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-richblack-900 to-transparent pointer-events-none"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mx-auto grid max-w-maxContentTab items-center gap-12 lg:max-w-maxContent lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="flex flex-col items-start gap-8 text-left">
            {/* Badge / Small CTA */}
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2.5 rounded-full border border-caribbeangreen-100/30 bg-caribbeangreen-100/10 px-4 py-1.5 text-sm font-medium text-caribbeangreen-50 transition-all duration-300 hover:border-caribbeangreen-100/60 hover:bg-caribbeangreen-100/15"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-caribbeangreen-100"></span>
              {t("pages.home.badge")}
              <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <div className="space-y-5">
              <h1 className="max-w-[800px] text-xl font-extrabold leading-[1.1] tracking-tight text-richblack-5 sm:text-5xl lg:text-5xl">
                {t("pages.home.hero_part1")} <HighlightText text={t("pages.home.hero_highlight")} />
              </h1>

              <p className="max-w-[680px] text-base leading-7 text-richblack-300 md:text-lg">
                {t("pages.home.hero_description")}
              </p>
            </div>

            {/* Main Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <CTAButton active={true} linkto="/all-courses">
                {t("pages.home.explore_catalog")}
              </CTAButton>

              <CTAButton active={false} linkto="/signup">
                <span className="flex items-center gap-2">
                  <FaPlay className="text-xs" />
                  {t("pages.home.try_ai_tutor")}
                </span>
              </CTAButton>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="rounded-lg border border-richblack-600 bg-richblack-800/80 p-3 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="flex items-center justify-between rounded-lg border border-richblack-700 bg-richblack-900 px-4 py-3">
                <div>
                  <p className="text-xs font-bold uppercase text-richblack-400">EduAI workspace</p>
                  <p className="text-sm font-semibold text-richblack-50">Personalized learning path</p>
                </div>
                <div className="rounded-lg bg-yellow-50 px-3 py-1 text-xs font-bold text-richblack-900">Live</div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_0.8fr]">
                <div className="rounded-sm bg-richblack-900 p-4">
                  <img
                    src="https://img.magnific.com/free-photo/it-specialist-checking-code-computer-dark-office-night_1098-18699.jpg?semt=ais_hybrid&w=740&q=80"
                    alt="Interactive course workspace"
                    className="h-[220px] w-full object-cover sm:h-[280px]"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="rounded-lg border border-blue-100/20 bg-blue-200/10 p-4">
                    <p className="text-xs font-semibold uppercase text-blue-100">AI Tutor</p>
                    <p className="mt-2 text-sm text-richblack-100">
                      Answers grounded in your lessons and slides.
                    </p>
                  </div>

                  <div className="rounded-lg border border-yellow-50/20 bg-yellow-50/10 p-4">
                    <p className="text-xs font-semibold uppercase text-yellow-50">Practice</p>
                    <p className="mt-2 text-sm text-richblack-100">
                      Quizzes generated from real course material.
                    </p>
                  </div>

                  <img
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80"
                    alt="Progress tracking preview"
                    className="mt-auto h-[110px] w-full rounded-lg bg-richblack-900 object-cover p-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-maxContentTab lg:max-w-maxContent px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          <div className="lg:col-span-5 space-y-8">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-caribbeangreen-100">{t("pages.home.feature_heading")}</p>
            <h2 className="text-4xl font-bold text-richblack-5 leading-tight sm:text-4xl ">
              {t("pages.home.feature_heading")} 
              <HighlightText text={t("pages.home.feature_highlight")} />
            </h2>
            <div className="space-y-6">
              {[
                { title: t("pages.home.features.0.title"), desc: t("pages.home.features.0.desc"), icon: <FaBookOpen className="text-yellow-50" /> },
                { title: t("pages.home.features.1.title"), desc: t("pages.home.features.1.desc"), icon: <FaBrain className="text-pink-200" /> },
                { title: t("pages.home.features.2.title"), desc: t("pages.home.features.2.desc"), icon: <FaLightbulb className="text-caribbeangreen-100" /> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 rounded-lg border border-richblack-700/60 bg-richblack-800/45 p-4 transition-colors hover:border-richblack-600 hover:bg-richblack-800">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-richblack-900 text-xl">{item.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-richblack-5">{item.title}</h3>
                    <p className="text-richblack-400 text-sm mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 gap-6 p-2">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link key={index} to={link.link} className="group relative flex min-h-[180px] flex-col justify-between rounded-lg border border-richblack-700 bg-richblack-800 p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-blue-100/60 hover:shadow-blue-900/20">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-richblack-900 transition-transform group-hover:scale-105">
                    <Icon className="text-2xl text-yellow-50" />
                  </div>
                  <span className="text-lg text-richblack-50 font-bold">{link.text}</span>
                  <FaArrowRight className="absolute bottom-6 right-6 text-yellow-50 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-maxContentTab lg:max-w-maxContent px-4 pb-20">
        <CodeBlocks
          position={"lg:flex-row"}
          heading={
            <div className='text-3xl font-bold'>
              {t("pages.home.code_section.heading_part1")} <HighlightText text={t("pages.home.code_section.heading_highlight")} />
            </div>
          }
          subheading={t("pages.home.code_section.subheading")}
          ctabtn1={{ btnText: t("pages.home.code_section.btn_try"), linkto: "/signup", active: true }}
          ctabtn2={{ btnText: t("pages.home.code_section.btn_view"), linkto: "/login", active: false }}
          codeblock={`function startLearning() {\n  const skills = ["JavaScript", "React", "Node.js"];\n  console.log("Building real projects...");\n  return skills.map(skill => skill + " ✓");\n}\n\nstartLearning();`} codeColor={"text-blue-100"}
          backgroundGradient={"code-block2-grad"}
        />
      </section>

      <section className="bg-richblack-800/70 py-16 border-t border-b border-richblack-700">
        <div className="mx-auto max-w-maxContentTab lg:max-w-maxContent px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-3 rounded-lg border border-richblack-700 bg-richblack-900 p-6 text-center shadow-2xl transition-colors hover:border-yellow-50">
                <div className="text-3xl text-yellow-50 mb-2">{stat.icon}</div>
                <span className="text-3xl font-black text-white sm:text-4xl">{stat.value}</span>
                <span className="text-sm text-richblack-400 font-bold uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {trendingCourses.length > 0 && (
        <section className="mx-auto w-full max-w-maxContentTab lg:max-w-maxContent px-4 py-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="space-y-4">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-50">{t("pages.home.popular.title")}</p>
              <h2 className="text-3xl font-bold text-white leading-tight sm:text-3xl">
                {t("pages.home.popular.title")} <HighlightText text={t("pages.home.popular.highlight")} />
              </h2>
              <p className="text-richblack-400 max-w-[600px] text-md">
                {t("pages.home.popular.description")}
              </p>
            </div>
            <Link to="/all-courses" className="text-yellow-50 font-bold flex items-center gap-2 hover:underline pb-2">
              {t("pages.home.popular.view_all")} <FaArrowRight />
            </Link>
          </div>
          <Course_Slider Courses={trendingCourses} />
        </section>
      )}

      <section className='text-richblack-700 py-16'>
        <div className="mx-auto w-full max-w-maxContentTab lg:max-w-maxContent px-4">
          <ExploreMore allCourses={courses} />
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home;
