import { useState, useEffect } from "react";
import { FaArrowRight, FaBrain, FaSearch, FaLightbulb, FaBookOpen, FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";

import HighlightText from '../../components/core/HomePage/HighlightText';
import CTAButton from "../../components/core/HomePage/Button";
import CodeBlocks from "../../components/core/HomePage/CodeBlocks";
import ExploreMore from "../../components/core/HomePage/ExploreMore";
import Footer from '../../components/common/Footer';
import Course_Slider from "../../components/core/Catalog/Course_Slider";
import { getAllCourses } from "../../services/operations/courseDetailsAPI";

const quickLinks = [
  { icon: FaSearch, text: "Search Catalog", link: "/all-courses/" },
  { icon: FaBookOpen, text: "My Learning", link: "/dashboard/enrolled-courses" },
  { icon: FaBrain, text: "AI Assessment", link: "/dashboard/ai-practice" },
  { icon: FaLightbulb, text: "Soft Skills", link: "/catalog/soft-skills" },
];

const stats = [
  { label: "Published Courses", value: "500+", icon: <FaBookOpen /> },
  { label: "Active Learners", value: "10K+", icon: <FaGraduationCap /> },
  { label: "AI Support", value: "24/7", icon: <FaBrain /> },
  { icon: <FaChalkboardTeacher />, label: "Expert Mentors", value: "200+" },
];

const Home = () => {
  const [courses, setCourses] = useState([]);
  const dispatch = useDispatch();

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
      
      <div className="relative box-content bg-richblack-800 px-4 py-20 shadow-2xl border-b border-richblack-700 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-pink-200 rounded-full blur-[120px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mx-auto flex max-w-maxContentTab flex-col justify-center gap-8 lg:max-w-maxContent text-center items-center"
        >
          <Link to={"/signup"}>
            <div className="group rounded-full bg-richblack-700 p-1 font-bold text-richblack-200 transition-all duration-300 hover:scale-95 border border-richblack-600 shadow-lg">
              <div className="flex flex-row items-center gap-2 rounded-full px-8 py-[6px] transition-all duration-300 group-hover:bg-richblack-900">
                <p>Start Your Professional Journey</p>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <h1 className="text-4xl font-extrabold text-richblack-5 sm:text-6xl leading-[1.1] tracking-tight max-w-[900px]">
            The Future of IT Education is <HighlightText text={"Intelligent & Personal"} />
          </h1>

          <p className="max-w-[850px] text-lg md:text-xl text-richblack-300 leading-relaxed mx-auto italic">
            Experience a revolutionary LMS powered by <span className="text-blue-100 font-semibold underline decoration-blue-200">RAG-based AI</span>. 
            Get real-time academic assistance, grounded in university-standard curriculum.
          </p>

          <div className="flex flex-wrap gap-6 justify-center mt-4">
            <CTAButton active={true} linkto={"/all-courses"}>Explore Catalog</CTAButton>
            <CTAButton active={false} linkto={"/signup"}>Try AI Tutor</CTAButton>
          </div>
        </motion.div>
      </div>

      <div className="mx-auto max-w-maxContentTab lg:max-w-maxContent px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-4xl font-bold text-richblack-5 leading-tight">
              Why Learn with our <br/>
              <HighlightText text={"AI Advantage?"} />
            </h2>
            <div className="space-y-6">
              {[
                { title: "Grounded Knowledge", desc: "Responses are derived directly from course PDFs, not generic data.", icon: <FaBookOpen className="text-yellow-50"/> },
                { title: "24/7 AI Assistance", desc: "Never wait for an instructor. Get instant explanations for complex code.", icon: <FaBrain className="text-pink-200"/> },
                { title: "Instant Quiz Gen", desc: "AI designs practice tests tailored to your learning progress.", icon: <FaLightbulb className="text-caribbeangreen-100"/> }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-richblack-800 transition-colors border border-transparent hover:border-richblack-700">
                  <div className="text-2xl mt-1">{item.icon}</div>
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
                <Link key={index} to={link.link} className="group relative flex flex-col items-center gap-4 p-10 bg-richblack-800 rounded-2xl border border-richblack-700 shadow-xl hover:shadow-blue-900/20 transition-all hover:-translate-y-2">
                  <div className="p-4 bg-richblack-900 rounded-full group-hover:scale-110 transition-transform">
                    <Icon className="text-4xl text-yellow-50" />
                  </div>
                  <span className="text-lg text-richblack-50 font-bold tracking-wide">{link.text}</span>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaArrowRight className="text-yellow-50" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-maxContentTab lg:max-w-maxContent px-4 pb-20">
        <CodeBlocks 
          position={"lg:flex-row"}
          heading={
            <div className='text-3xl font-bold'>
              Start <HighlightText text={"Coding in Seconds"} />
            </div>
          }
          subheading={"Our integrated environment allows you to practice while you learn, with AI suggestions for debugging and optimization."}
          ctabtn1={{ btnText: "Try Interactive Coding", linkto: "/signup", active: true }}
          ctabtn2={{ btnText: "View Documentation", linkto: "/login", active: false }}
          codeblock={`function welcomeToEduSpace() {\n  const goal = "Intelligent Learning";\n  const tools = ["Llama 3.1", "RAG", "Gemini"];\n  console.log(\`Unlocking \${goal} using \${tools.join(", ")}\`);\n}\nwelcomeToEduSpace();`}
          codeColor={"text-blue-100"}
          backgroundGradient={<div className="codeblock1 absolute"></div>}
        />
      </div>

      <div className="bg-richblack-800 py-20 border-t border-b border-richblack-700">
        <div className="mx-auto max-w-maxContentTab lg:max-w-maxContent px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-3 p-8 bg-richblack-900 rounded-2xl border border-richblack-700 hover:border-yellow-50 transition-colors shadow-2xl">
                <div className="text-3xl text-yellow-50 mb-2">{stat.icon}</div>
                <span className="text-4xl font-black text-white">{stat.value}</span>
                <span className="text-sm text-richblack-400 font-bold uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: TRENDING COURSES - Hiển thị dữ liệu thực tế */}
      {trendingCourses.length > 0 && (
        <div className="mx-auto w-full max-w-maxContentTab lg:max-w-maxContent px-4 py-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Trending <HighlightText text={"IT Skill Tracks"} />
              </h2>
              <p className="text-richblack-400 max-w-[600px] text-lg">
                The most popular courses chosen by our community of 10,000+ learners.
              </p>
            </div>
            <Link to="/all-courses" className="text-yellow-50 font-bold flex items-center gap-2 hover:underline pb-2">
              View All Courses <FaArrowRight />
            </Link>
          </div>
          <Course_Slider Courses={trendingCourses} />
        </div>
      )}

      <div className='text-richblack-700 py-24'>
        <div className="mx-auto w-full max-w-maxContentTab lg:max-w-maxContent px-4">
          <ExploreMore allCourses={courses} />
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Home;