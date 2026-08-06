/* eslint-disable react/prop-types */
import {
  MdPictureAsPdf,
  MdQuiz,
  MdAssignment,
  MdCheckCircle,
  MdPlayCircle,
} from "react-icons/md";
import { useSelector } from "react-redux";

function getIcon(type) {
  const base = "text-base";
  switch (type) {
    case "slide":
      return <MdPictureAsPdf className={`${base} text-blue-300`} />;
    case "quiz":
      return <MdQuiz className={`${base} text-pink-300`} />;
    case "assignment":
      return <MdAssignment className={`${base} text-caribbeangreen-200`} />;
    default:
      return <MdPlayCircle className={`${base} text-richblack-300`} />;
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

  const completedCount = completedLectures?.length || 0;
  const progressPercentage =
    totalNoOfLectures > 0
      ? Math.round((completedCount / totalNoOfLectures) * 100)
      : 0;

  return (
    <aside className="flex h-[calc(100vh-3.5rem)] w-72 shrink-0 flex-col border-r border-richblack-700/80 bg-richblack-900 ">
      {/* Header */}
      <div className="shrink-0 space-y-4 border-b border-richblack-700/80 px-5 py-4">
        <div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-richblack-500">
            Learning Path
          </p>
          <h2 className="mt-1 text-lg font-bold text-richblack-5">
            Course Content
          </h2>
        </div>

        {/* Progress card */}
        <div className="rounded-2xl border border-richblack-700 bg-richblack-800/60 p-4">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-richblack-400">Progress</p>
              <p className="mt-0.5 text-2xl font-bold text-yellow-50">
                {progressPercentage}%
              </p>
            </div>
            <p className="text-xs text-richblack-400">
              <span className="font-semibold text-richblack-200">
                {completedCount}
              </span>
              /{totalNoOfLectures}
            </p>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-richblack-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-100 via-yellow-50 to-[#A6FFCB] transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {Object.entries(grouped || {}).map(([type, items]) => (
          <section key={type} className="space-y-1.5">
            {/* Group header */}
            <div className="flex items-center gap-2 px-2 pb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-richblack-800">
                {getIcon(type)}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-richblack-400">
                {type}s
              </span>
              <span className="ml-auto rounded-md bg-richblack-800 px-2 py-0.5 text-[10px] font-medium text-richblack-400">
                {items.length}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-1">
              {items.map((item) => {
                const isCompleted = completedLectures?.some(
                  (id) => String(id) === String(item._id)
                );
                const isActive = currentItem?._id === item._id;

                return (
                  <button
                    key={item._id}
                    onClick={() => {
                      setActiveGroup(type);
                      setCurrentItem(item);
                    }}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                      isActive
                        ? "bg-yellow-50 text-richblack-900 shadow-[0_8px_24px_rgba(255,214,10,0.18)]"
                        : "text-richblack-200 hover:bg-richblack-800/80 hover:text-richblack-5"
                    }`}
                  >
                    {/* Active bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-richblack-900" />
                    )}

                    {/* Status */}
                    {isCompleted ? (
                      <MdCheckCircle
                        size={18}
                        className={`shrink-0 ${
                          isActive
                            ? "text-richblack-900"
                            : "text-caribbeangreen-200"
                        }`}
                      />
                    ) : (
                      <span
                        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                          isActive
                            ? "border-richblack-900"
                            : "border-richblack-600 group-hover:border-richblack-400"
                        }`}
                      />
                    )}

                    {/* Title */}
                    <span
                      className={`min-w-0 flex-1 truncate text-sm leading-snug ${
                        isActive ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {Object.keys(grouped || {}).length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <p className="text-sm font-medium text-richblack-400">
              No content yet
            </p>
            <p className="text-xs text-richblack-600">
              Content will appear here once added
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default CourseSidebar;