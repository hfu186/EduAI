import { useEffect, useState } from "react";
import ProgressBar from "@ramonak/react-progress-bar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import Img from "./../../common/Img";

export default function EnrolledCourses() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [enrolledCourses, setEnrolledCourses] = useState(null);

  const getEnrolledCourses = async () => {
    try {
      const res = await getUserEnrolledCourses(token);
      setEnrolledCourses(Array.isArray(res) ? res : []);
    } catch (error) {
      console.log("Could not fetch enrolled courses.", error);
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, [token]);

  const sklItem = () => {
    return (
      <div className="flex w-full border border-richblack-700 px-5 py-3">
        <div className="flex flex-1 gap-x-4">
          <div className="skeleton h-14 w-14 rounded-lg"></div>

          <div className="flex w-[40%] flex-col">
            <p className="skeleton h-2 w-[50%] rounded-xl"></p>
            <p className="skeleton mt-3 h-2 w-[70%] rounded-xl"></p>
          </div>
        </div>

        <div className="flex flex-[0.4] flex-col">
          <p className="skeleton mt-2 h-2 w-[20%] rounded-xl"></p>
          <p className="skeleton mt-3 h-2 w-[40%] rounded-xl"></p>
        </div>
      </div>
    );
  };

  if (enrolledCourses?.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-2.5rem-5rem)] flex-1 items-center justify-center">
        <p className="text-center text-xl text-richblack-5">
          {t("pages.enrolled_courses.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-2.5rem-5rem)] items-center justify-center">
      <div className="mt-10 text-center text-3xl font-bold text-richblack-5 sm:text-left">
        {t("pages.enrolled_courses.title")}
      </div>

      <div className="my-5 text-richblack-5">
        <div className="grid grid-cols-[7fr_3fr] rounded-t-2xl bg-richblack-800">
          <p className="px-5 py-3 font-medium">
            {t("pages.enrolled_courses.course_name")}
          </p>

          <p className="py-3 font-medium">
            {t("pages.enrolled_courses.progress")}
          </p>
        </div>

        {!enrolledCourses && (
          <div>
            {sklItem()}
            {sklItem()}
            {sklItem()}
            {sklItem()}
            {sklItem()}
          </div>
        )}

        {enrolledCourses?.map((course, i, arr) => (
          <div
            className={`flex flex-col border border-richblack-700 sm:flex-row sm:items-center ${
              i === arr.length - 1 ? "rounded-b-2xl" : "rounded-none"
            }`}
            key={course?._id || i}
          >
            <div
              className="flex cursor-pointer items-center gap-4 px-5 py-3 sm:w-[70%]"
              onClick={() => {
                navigate(`/course-workspace/${course?._id}`);
              }}
            >
              <Img
                src={course.thumbnail}
                alt={course.courseName}
                className="h-20 w-20 rounded-lg object-cover"
              />

              <div className="flex flex-col gap-2">
                <p className="text-base font-semibold">
                  {course.courseName}
                </p>

                <p className="max-w-[400px] truncate text-sm text-richblack-300">
                  {course.courseDescription}
                </p>
              </div>
            </div>

            {/* Mobile */}
            <div className="sm:hidden">
              <div className="px-2 py-3">
                {course?.totalDuration}
              </div>

              <div className="flex flex-col gap-2 px-2 py-3 sm:w-2/5">
                <p>
                  {t("pages.enrolled_courses.progress")}:{" "}
                  {course.progressPercentage || 0}%
                </p>

                <ProgressBar
                  completed={course.progressPercentage || 0}
                  height="8px"
                  isLabelVisible={false}
                />
              </div>
            </div>

            <div className="hidden">
              {course?.totalDuration}
            </div>

            {/* Desktop */}
            <div className="hidden w-1/5 flex-col gap-2 px-2 py-3 sm:flex">
              <p>
                {t("pages.enrolled_courses.progress")}:{" "}
                {course.progressPercentage || 0}%
              </p>

              <ProgressBar
                completed={course.progressPercentage || 0}
                height="8px"
                isLabelVisible={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}