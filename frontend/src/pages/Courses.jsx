import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllCourses } from "../services/operations/courseDetailsAPI";
import Course_Card from "../components/core/Catalog/Course_Card";
import {
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiX,
} from "react-icons/fi";
import { FaStar, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { BiReset } from "react-icons/bi";

const AllCourses = () => {
  const location = useLocation();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minRating, setMinRating] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const result = await getAllCourses();
        if (result) setCourses(result);
      } catch (error) {
        console.log("Error fetching courses", error);
      }
      setLoading(false);
    };

    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    setSearchQuery(query || "");

    fetchCourses();
  }, [location.search]);

  const filteredCourses = courses
    .filter((course) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        course.courseName.toLowerCase().includes(searchLower) ||
        `${course.instructor?.firstName} ${course.instructor?.lastName}`
          .toLowerCase()
          .includes(searchLower)
      );
    })
    .filter((course) => {
      const avgRating =
        course?.ratingAndReviews?.length > 0
          ? course.ratingAndReviews.reduce((a, b) => a + b.rating, 0) /
            course.ratingAndReviews.length
          : 0;
      return minRating === 0 || avgRating >= minRating;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });

  const indexOfLast = currentPage * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, minRating]);

  const resetFilters = () => {
    setSearchQuery("");
    setSortBy("newest");
    setMinRating(0);
  };

  return (
    <div className="bg-richblack-900 min-h-screen font-inter text-richblack-5">
      {/* Header Section */}
      <div className="box-content bg-richblack-800 px-4 py-10 shadow-inner">
        <div className="mx-auto flex max-w-maxContentTab flex-col justify-center gap-4 lg:max-w-maxContent">
          <nav className="flex items-center gap-2 text-sm text-richblack-300 mb-2">
            <span>Home</span> / <span>Courses</span> /
            <span className="text-yellow-25 font-semibold">
              {searchQuery ? `Search: "${searchQuery}"` : "All Courses"}
            </span>
          </nav>

          <p className="max-w-[870px] text-lg text-richblack-200 leading-relaxed italic">
            {filteredCourses.length} courses available for you to explore and
            learn from.
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-11/12 max-w-maxContent mx-auto py-10 flex flex-col lg:flex-row gap-8">
        <button
          className="lg:hidden flex items-center justify-between bg-richblack-800 p-4 rounded-xl border border-richblack-700 font-bold"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
        >
          <span className="flex items-center gap-2">
            <FiFilter /> Filters{" "}
          </span>
          {showMobileFilter ? <FiChevronUp /> : <FiChevronDown />}
        </button>

        <div
          className={`lg:w-[300px] flex-shrink-0 ${showMobileFilter ? "block" : "hidden lg:block"} space-y-6`}
        >
          <div className="sticky top-24 space-y-6">
            {/* Search Box */}
            <div className="bg-richblack-800 p-5 rounded-2xl border border-richblack-700 shadow-xl">
              <h3 className="text-lg font-bold mb-4">Search</h3>
              <div className="flex items-center gap-3 bg-richblack-900 border border-richblack-600 rounded-xl px-4 py-3 focus-within:border-yellow-50 transition-all">
                <FiSearch className="text-richblack-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full outline-none text-sm"
                />
                {searchQuery && (
                  <FiX
                    className="cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                )}
              </div>
            </div>

            {/* Filter Group */}
            <div className="bg-richblack-800 p-5 rounded-2xl border border-richblack-700 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-richblack-700">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FiFilter className="text-yellow-50" /> Filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-yellow-50 hover:underline flex items-center gap-1 font-medium"
                >
                  <BiReset /> Reset
                </button>
              </div>

              {/* Sort */}
              <div>
                <p className="text-sm text-richblack-300 font-semibold mb-3 uppercase">
                  Sort by
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setSortBy("price-low")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${sortBy === "price-low" ? "bg-yellow-50/10 border-yellow-50 text-yellow-50" : "bg-richblack-900 border-richblack-700 text-richblack-300"}`}
                  >
                    <FaSortAmountUp /> Lowest Price
                  </button>
                  <button
                    onClick={() => setSortBy("price-high")}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${sortBy === "price-high" ? "bg-yellow-50/10 border-yellow-50 text-yellow-50" : "bg-richblack-900 border-richblack-700 text-richblack-300"}`}
                  >
                    <FaSortAmountDown /> Highest Price
                  </button>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <p className="text-sm text-richblack-300 font-semibold mb-3 uppercase">
                  Ratings
                </p>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((star) => (
                    <div
                      key={star}
                      onClick={() => setMinRating(star)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${minRating === star ? "bg-richblack-700 ring-1 ring-yellow-50" : "hover:bg-richblack-900"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-100 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < star
                                  ? "text-yellow-50"
                                  : "text-richblack-600"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs">& Up</span>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full border border-richblack-400 ${minRating === star ? "bg-yellow-50" : ""}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-6 bg-richblack-800 p-4 rounded-xl border border-richblack-700">
            <p className="text-richblack-200 text-sm">
              Displaying{" "}
              <span className="text-white font-bold">
                {filteredCourses.length}
              </span>{" "}
              courses
            </p>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-[300px] bg-richblack-800 rounded-2xl"
                />
              ))}
            </div>
          )}
          {filteredCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentCourses.map((course) => (
                <Course_Card key={course._id} course={course} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 bg-richblack-800 rounded"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === i + 1
                      ? "bg-yellow-50 text-black"
                      : "bg-richblack-800"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className="px-4 py-2 bg-richblack-800 rounded"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllCourses;
