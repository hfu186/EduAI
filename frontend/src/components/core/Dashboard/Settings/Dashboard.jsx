import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserEnrolledCourses } from "../../../../services/operations/profileAPI";
import ProgressBar from "@ramonak/react-progress-bar";
import { useNavigate } from "react-router-dom";
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
  const [enrolledCourses, setEnrolledCourses] = useState(null);

  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);
      setEnrolledCourses(res);
    } catch (error) {
      console.log("Could not fetch s.");
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, []);

  const totalCourses = enrolledCourses?.length || 0;
  const completedCourses = enrolledCourses?.filter((course) => course.progressPercentage === 100).length || 0;
  const avgProgress = totalCourses > 0 
    ? Math.round(enrolledCourses.reduce((acc, curr) => acc + curr.progressPercentage, 0) / totalCourses)
    : 0;

  return (
    <div className="text-white pb-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-medium text-richblack-5 font-boogaloo">Learning Dashboard</h1>
        <div className="hidden md:flex items-center gap-2 bg-orange-600/10 border border-orange-500/30 px-4 py-2 rounded-full">
          <HiFire className="text-orange-500 animate-pulse" size={20} />
          <span className="text-orange-200 font-bold">{user?.studyStreak || 0} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <div className="flex flex-col justify-center gap-2 rounded-2xl bg-gradient-to-br from-orange-600/20 to-richblack-800 p-6 border border-orange-500/30 shadow-[0_0_20px_rgba(234,88,12,0.1)]">
          <div className="flex items-center gap-3 text-orange-400">
            <HiFire size={28} className="animate-bounce text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-widest">Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black text-white">{user?.studyStreak || 0}</p>
            <p className="text-sm font-medium text-orange-200">Days</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-2 rounded-2xl bg-richblack-800 p-6 border border-richblack-700 hover:border-richblack-600 transition-all">
          <div className="flex items-center gap-3 text-richblack-300">
            <HiOutlineAcademicCap size={24} className="text-yellow-50" />
            <span className="text-xs font-bold uppercase tracking-widest">Courses</span>
          </div>
          <p className="text-4xl font-black text-white">{totalCourses}</p>
        </div>

        <div className="flex flex-col justify-center gap-2 rounded-2xl bg-richblack-800 p-6 border border-richblack-700 hover:border-richblack-600 transition-all">
          <div className="flex items-center gap-3 text-richblack-300">
            <HiOutlineChartBar size={24} className="text-caribbeangreen-200" />
            <span className="text-xs font-bold uppercase tracking-widest">Avg Progress</span>
          </div>
          <p className="text-4xl font-black text-white">{avgProgress}%</p>
        </div>

        <div className="flex flex-col justify-center gap-2 rounded-2xl bg-richblack-800 p-6 border border-richblack-700 hover:border-richblack-600 transition-all">
          <div className="flex items-center gap-3 text-richblack-300">
            <HiOutlineClock size={24} className="text-blue-200" />
            <span className="text-xs font-bold uppercase tracking-widest">Completed</span>
          </div>
          <p className="text-4xl font-black text-white">{completedCourses}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-5 text-richblack-50 flex items-center gap-2">
        My Courses <span className="text-sm font-normal text-richblack-400">({totalCourses})</span>
      </h2>

      <div className="rounded-2xl border border-richblack-700 bg-richblack-800 overflow-hidden shadow-2xl">
        <div className="hidden sm:flex bg-richblack-700 p-4 px-8 font-semibold text-richblack-50 text-sm uppercase tracking-wider">
          <p className="w-[50%]">Course Info</p>
          <p className="w-[20%] text-center">Status</p>
          <p className="w-[30%]">Progress</p>
        </div>

        {!enrolledCourses ? (
          <div className="grid h-[20vh] place-items-center">
            <div className="spinner"></div>
          </div>
        ) : !enrolledCourses.length ? (
          <div className="flex flex-col items-center justify-center h-[30vh] gap-3">
            <p className="text-richblack-300 text-lg italic">You havent enrolled in any courses yet.</p>
            <button onClick={() => navigate("/catalog")} className="text-yellow-50 font-bold underline">Explore Catalog</button>
          </div>
        ) : (
          enrolledCourses.map((course, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row items-center border-b border-richblack-700 p-5 px-8 hover:bg-richblack-700/30 transition-all cursor-pointer group"
              onClick={() => navigate(`/course/${course?._id}`)}
            >
              <div className="flex w-full sm:w-[50%] items-center gap-5 mb-4 sm:mb-0">
                <img
                  src={course.thumbnail}
                  alt="course_img"
                  className="h-16 w-16 rounded-xl object-cover border border-richblack-600 group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-richblack-5 text-lg group-hover:text-yellow-50 transition-colors">
                    {course.courseName}
                  </p>
                  <p className="text-xs text-richblack-400 line-clamp-1 max-w-[250px]">
                    {course.courseDescription}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-[20%] text-center mb-4 sm:mb-0">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  course.progressPercentage === 100 
                  ? "bg-caribbeangreen-900 text-caribbeangreen-200" 
                  : "bg-richblack-900 text-yellow-100 border border-yellow-500/20"
                }`}>
                  {course.progressPercentage === 100 ? "Finished" : "Learning"}
                </span>
              </div>

              <div className="w-full sm:w-[30%] flex flex-col gap-2">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-richblack-300 uppercase">Completion</span>
                    <span className="text-xs font-bold text-richblack-5">{course.progressPercentage || 0}%</span>
                </div>
                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="6px"
                  isLabelVisible={false}
                  baseBgColor="#161D29"
                  bgColor={course.progressPercentage === 100 ? "#05A34A" : "#1FA2FF"}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}