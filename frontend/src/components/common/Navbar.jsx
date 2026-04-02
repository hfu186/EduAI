import { useState, useEffect, useRef } from "react";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiSearch } from "react-icons/fi";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";

import { NavbarLinks } from "../../../data/navbar-links";
import EduSpaceLogo from "../../assets/Logo/Logo-Full-Light.png";
import {
  fetchCourseCategories,
  getAllCourses,
} from "./../../services/operations/courseDetailsAPI";
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import MobileProfileDropDown from "../core/Auth/MobileProfileDropDown";

const Navbar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { totalItems } = useSelector((state) => state.cart);

  const location = useLocation();
  const navigate = useNavigate();
  const suggestionRef = useRef(null);

  const [subLinks, setSubLinks] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [categories, courses] = await Promise.all([
          fetchCourseCategories(),
          getAllCourses(),
        ]);
        if (categories) setSubLinks(categories);
        if (courses) setAllCourses(courses);
      } catch (error) {
        console.log("Error initializing Navbar data", error);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue.trim().length > 0) {
        const filtered = allCourses
          .filter(
            (course) =>
              course.courseName
                .toLowerCase()
                .includes(searchValue.toLowerCase()) ||
              `${course.instructor?.firstName} ${course.instructor?.lastName}`
                .toLowerCase()
                .includes(searchValue.toLowerCase()),
          )
          .slice(0, 6);
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue, allCourses]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/all-courses?query=${encodeURIComponent(searchValue)}`);
      setShowSuggestions(false);
    }
  };

  const matchRoute = (route) => matchPath({ path: route }, location.pathname);

  return (
    <nav className="fixed top-0 z-[1000] flex h-16 w-full items-center justify-center border-b border-richblack-700 bg-richblack-900 text-white shadow-lg">
      <div className="flex w-11/12 max-w-maxContent items-center justify-between gap-4">
        <Link to="/" className="flex-shrink-0">
          <img
            src={EduSpaceLogo}
            width={135}
            height={35}
            alt="EduSpace"
            className="object-contain"
          />
        </Link>

        <div
          className="hidden lg:flex flex-1 justify-center relative transition-all duration-300 max-w-[400px] focus-within:max-w-[520px]"
          ref={suggestionRef}
        >
          {" "}
          <form onSubmit={handleSearchSubmit} className="w-full relative group">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => searchValue.trim() && setShowSuggestions(true)}
              className="w-full bg-richblack-800 text-richblack-5 border border-richblack-700 rounded-full py-1.5 pl-4 pr-10 outline-none focus:border-yellow-50 focus:ring-1 focus:ring-yellow-50 transition-all duration-300 text-sm shadow-inner focus:scale-105"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-richblack-400 group-focus-within:text-yellow-50 transition-colors"
            >
              <FiSearch size={18} />
            </button>
          </form>
          {/* DROPDOWN RESULTS */}
          {showSuggestions && (
            <div className="absolute top-[115%] left-0 w-full bg-richblack-800 border border-richblack-700 rounded-2xl py-3 shadow-2xl z-[1001] overflow-hidden">
              <p className="px-4 pb-2 text-[10px] text-richblack-400 uppercase font-bold tracking-widest border-b border-richblack-700">
                Suggestions
              </p>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {suggestions.length > 0 ? (
                  suggestions.map((course) => (
                    <Link
                      key={course._id}
                      to={`/course/${course._id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchValue("");
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-richblack-700 transition-all border-b border-richblack-700/50 last:border-0"
                    >
                      <img
                        src={course.thumbnail}
                        alt=""
                        className="w-20 h-10 object-cover rounded shadow-sm"
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-md font-bold text-richblack-5 truncate">
                          {course.courseName}
                        </p>
                        <p className="text-[15px] text-richblack-300">
                          by {course.instructor?.firstName}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-xs text-richblack-400">
                    No results found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION LINKS & AUTH - Nhóm lại một khối để cân bằng với Logo */}
        <div className="flex items-center gap-x-4 md:gap-x-6 flex-shrink-0">
          <ul className="hidden xl:flex gap-x-6 text-richblack-25 font-medium text-sm">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div className="group relative flex cursor-pointer items-center gap-1 py-2 hover:text-yellow-25 transition-all">
                    <p>{link.title}</p>
                    <MdKeyboardArrowDown />
                    <div className="invisible absolute left-[50%] top-[80%] z-[1000] flex w-[220px] translate-x-[-50%] flex-col rounded-xl bg-richblack-5 p-4 text-richblack-900 opacity-0 transition-all duration-200 group-hover:visible group-hover:top-[100%] group-hover:opacity-100 shadow-2xl">
                      <div className="absolute left-[50%] top-0 h-6 w-6 translate-x-[-50%] translate-y-[-40%] rotate-45 rounded bg-richblack-5"></div>
                      {subLinks.map((sub, i) => (
                        <Link
                          key={i}
                          to={`/catalog/${sub.name.split(" ").join("-").toLowerCase()}`}
                          className="py-2 pl-2 hover:bg-richblack-50 rounded-lg text-sm transition-all"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link to={link.path}>
                    <p
                      className={`${matchRoute(link.path) ? "text-yellow-25" : "text-richblack-25 hover:text-yellow-25 transition-all"} py-2`}
                    >
                      {link.title}
                    </p>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* CART & PROFILE */}
          <div className="flex gap-x-4 items-center">
            {user && user?.accountType !== "Instructor" && (
              <Link to="/dashboard/cart" className="relative group">
                <AiOutlineShoppingCart className="text-2xl text-richblack-5 group-hover:text-yellow-50 transition-all" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 grid h-4 w-4 place-items-center rounded-full bg-pink-500 text-[10px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {token === null ? (
              <Link to="/login">
                <button className="rounded-lg border border-richblack-700 bg-richblack-800 px-3 py-2 text-richblack-100 hover:bg-richblack-700 transition-all text-sm font-medium">
                  Log In
                </button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <ProfileDropDown />
                <div className="md:hidden">
                  <MobileProfileDropDown />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
