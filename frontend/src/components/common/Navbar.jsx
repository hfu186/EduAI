import { useState, useEffect, useRef } from "react";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiSearch, FiX, FiBell } from "react-icons/fi";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdKeyboardArrowDown } from "react-icons/md";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/operations/notificationAPI";

import { NavbarLinks } from "../../../data/navbar-links";
import EduSpaceLogo from "@/assets/Logo/Logo-Full-Light.png";
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
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const notificationRef = useRef(null);
  const [subLinks, setSubLinks] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [notifications, setNotifications,] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
    const loadNotifications = async () => {
      if (!token) return;
      try {
        const data = await getNotifications(token);
        setNotifications(data);
        setUnreadCount(data.filter((item) => !item.read).length);
      } catch (error) {
        console.log("Error loading notifications", error);
      }
    };

    loadNotifications();

    if (!token) return;

    const intervalId = window.setInterval(() => {
      loadNotifications();
    }, 10000);

    const handleWindowFocus = () => {
      loadNotifications();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [token]);

  // Auto focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

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
          .slice(0, 5);
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [searchValue, allCourses]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
        setSearchValue("");
      }

    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setShowSuggestions(false);
        setNotifications(false);
        setSearchValue("");
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/all-courses?query=${encodeURIComponent(searchValue)}`);
      setIsSearchOpen(false);
      setShowSuggestions(false);
      setSearchValue("");
    }
  };

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setShowSuggestions(false);
    setSearchValue("");
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(token, notification._id);
        setNotifications((prev) =>
          prev.map((item) => (item._id === notification._id ? { ...item, read: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.log("Error marking notification as read", error);
      }
    }

    if (notification.link) {
      navigate(notification.link);
      setShowNotifications(false);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log("Error marking all notifications as read", error);
    }
  };

  const matchRoute = (route) => matchPath({ path: route }, location.pathname);

  return (
    <nav className="fixed top-0 z-[1000] w-full border-b border-richblack-700/80 bg-richblack-900/95 backdrop-blur-md text-white">
      <div className="relative flex h-16 w-11/12 max-w-maxContent mx-auto items-center justify-between gap-6">

        {/* LOGO */}
        <Link to="/" className="flex-shrink-0 z-10">
          <img
            src={EduSpaceLogo}
            width={130}
            height={34}
            alt="EduSpace"
            className="object-contain"
          />
        </Link>

        {/* CENTER NAV LINKS */}
        <ul className="hidden lg:flex items-center gap-7 text-sm font-medium absolute left-1/2 -translate-x-1/2">
          {NavbarLinks.map((link, index) => (
            <li key={index}>
              {link.title === "Catalog" ? (
                <div className="group relative flex cursor-pointer items-center gap-1 text-richblack-25 hover:text-yellow-25 transition-colors">
                  <span>{link.title}</span>
                  <MdKeyboardArrowDown className="text-lg" />

                  <div className="invisible absolute left-1/2 top-full z-[1000] w-52 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="relative rounded-xl bg-richblack-5 p-2 text-richblack-900 shadow-xl">
                      <div className="absolute left-1/2 -top-1.5 h-3 w-3 -translate-x-1/2 rotate-45 bg-richblack-5" />
                      {subLinks.length > 0 ? (
                        subLinks.map((sub, i) => (
                          <Link
                            key={i}
                            to={`/catalog/${sub.name.split(" ").join("-").toLowerCase()}`}
                            className="block rounded-lg px-3 py-2 text-sm hover:bg-richblack-50 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-richblack-500">
                          Loading...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Link to={link.path}>
                  <p
                    className={`${matchRoute(link.path)
                        ? "text-yellow-25"
                        : "text-richblack-25 hover:text-yellow-25"
                      } transition-colors`}
                  >
                    {link.title}
                  </p>
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 shrink-0 z-10">

          <div className="relative" ref={searchRef}>
            {/* Search Icon Button */}
            <button
              onClick={openSearch}
              className="flex h-9 w-9 items-center justify-center rounded-full text-richblack-100 hover:bg-richblack-800 hover:text-[#12D8FA] transition-all"
              aria-label="Search"
            >
              <FiSearch size={18} />
            </button>

            {/* Search Popup */}
            {isSearchOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-[340px] sm:w-[400px] bg-richblack-800 border border-richblack-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-richblack-700">
                    <FiSearch className="text-richblack-400 shrink-0" size={18} />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search courses, instructors..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="flex-1 bg-transparent text-richblack-5 text-sm outline-none placeholder:text-richblack-400"
                    />
                    <button
                      type="button"
                      onClick={closeSearch}
                      className="text-richblack-400 hover:text-richblack-100 transition-colors p-1"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                </form>

                {/* Suggestions */}
                {showSuggestions && (
                  <div className="max-h-[300px] overflow-y-auto">
                    {suggestions.length > 0 ? (
                      <>
                        <p className="px-4 pt-3 pb-1.5 text-[10px] text-richblack-400 uppercase font-semibold tracking-wider">
                          Results
                        </p>
                        {suggestions.map((course) => (
                          <Link
                            key={course._id}
                            to={`/course/${course._id}`}
                            onClick={closeSearch}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-richblack-700/80 transition-colors"
                          >
                            <img
                              src={course.thumbnail}
                              alt=""
                              className="w-14 h-9 object-cover rounded-md shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-richblack-5 truncate">
                                {course.courseName}
                              </p>
                              <p className="text-xs text-richblack-400 truncate">
                                by {course.instructor?.firstName}
                              </p>
                            </div>
                          </Link>
                        ))}
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full px-4 py-3 text-left text-sm text-[#12D8FA] hover:bg-richblack-700/50 transition-colors border-t border-richblack-700"
                        >
                          View all results for  {searchValue}
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-richblack-400">
                        No results found
                      </div>
                    )}
                  </div>
                )}

                {/* Empty state hint */}
                {!showSuggestions && (
                  <div className="px-4 py-6 text-center text-xs text-richblack-400">
                    Type to search courses...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          {token && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-richblack-100 hover:bg-richblack-800 hover:text-[#12D8FA] transition-all"
                aria-label="Notifications"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>


              {showNotifications && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[320px] rounded-2xl border border-richblack-700 bg-richblack-800 shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between border-b border-richblack-700 px-4 py-3">
                    <p className="text-sm font-semibold text-richblack-5">Thông báo</p>
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs text-[#12D8FA] hover:underline"
                    >
                      Đánh dấu tất cả
                    </button>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`block w-full px-4 py-3 text-left transition-colors ${notification.read ? "bg-richblack-800" : "bg-richblack-700/60"}`}
                        >
                          <p className="text-sm font-medium text-richblack-5">{notification.title}</p>
                          <p className="mt-1 text-xs text-richblack-400">{notification.message}</p>
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-6 text-center text-sm text-richblack-400">Không có thông báo nào</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cart */}
          {user && user?.accountType !== "Instructor" && (
            <Link to="/dashboard/cart" className="relative group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-richblack-100 group-hover:bg-richblack-800 group-hover:text-yellow-25 transition-all">
                <AiOutlineShoppingCart className="text-xl" />
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {/* Auth */}
          {token === null ? (
            <div className="flex items-center gap-2.5">
              <Link to="/login">
                <button className="rounded-lg border border-richblack-600 bg-richblack-800 px-3.5 py-1.5 text-sm font-medium text-richblack-100 hover:bg-richblack-700 hover:border-richblack-500 transition-all">
                  Log In
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ProfileDropDown />
              <div className="md:hidden">
                <MobileProfileDropDown />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;