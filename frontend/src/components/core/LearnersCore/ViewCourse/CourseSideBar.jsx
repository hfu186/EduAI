/* eslint-disable react/prop-types */
import {
  MdPictureAsPdf,
  MdQuiz,
  MdAssignment,
  MdForum,
  MdCheckCircle,
} from "react-icons/md";
import { useSelector } from "react-redux";

function getIcon(type) {
  switch (type) {
    case "slide":
      return <MdPictureAsPdf />;
    case "quiz":
      return <MdQuiz />;
    case "assignment":
      return <MdAssignment />;
    default:
      return null;
  }
}

function CourseSidebar({
  grouped,
  currentItem,
  setCurrentItem,
  setActiveGroup,
}) {
  const { completedLectures, totalNoOfLectures } = useSelector(
    (state) => state.viewCourse
  );

  const progressPercentage =
    totalNoOfLectures > 0
      ? Math.round(
          (completedLectures.length / totalNoOfLectures) * 100
        )
      : 0;

  return (
    <div className="w-80 bg-richblack-900 border-r border-richblack-700 h-screen p-4 flex flex-col gap-y-4 shadow-2xl">
      <div className="px-2 py-4 border-b border-richblack-700">
        <h1 className="text-xl font-bold text-white mb-4">
          Course Content
        </h1>

        <div className="flex flex-col gap-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-richblack-300">
              Your Progress
            </span>
            <span className="text-yellow-50">
              {progressPercentage}%
            </span>
          </div>

          <div className="w-full h-2 bg-richblack-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-50 transition-all duration-700 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4 overflow-y-auto custom-scrollbar flex-1">
        {Object.entries(grouped || {}).map(([type, items]) => (
          <div key={type} className="flex flex-col gap-y-1">
            <div className="flex items-center gap-x-2 px-2 text-[10px] font-bold text-richblack-500 uppercase tracking-widest mb-2 mt-4">
              {getIcon(type)}
              <span>{type}s</span>
            </div>

            {items.map((item) => {
              const isCompleted = completedLectures.some(
                (completedId) =>
                  String(completedId) === String(item._id)
              );

              const isActive =
                currentItem?._id === item._id;

              return (
                <button
                  key={item._id}
                  onClick={() => {
                    setActiveGroup(type);
                    setCurrentItem(item);
                  }}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-yellow-50 text-black shadow-[0_0_15px_rgba(255,212,59,0.3)]"
                        : "text-richblack-100 hover:bg-richblack-800 hover:text-white"
                    }`}
                >
                  <div className="flex items-center gap-x-3">
                    {isCompleted ? (
                      <MdCheckCircle
                        className={
                          isActive
                            ? "text-black"
                            : "text-caribbeangreen-200"
                        }
                        size={20}
                      />
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          isActive
                            ? "border-black"
                            : "border-richblack-600 group-hover:border-richblack-400"
                        }`}
                      />
                    )}

                    <span
                      className={`text-sm font-medium truncate max-w-[160px] ${
                        isActive ? "font-bold" : ""
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseSidebar;