import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import logo from "../imgs/logo.png";

const Navbar = () => {
  const [searchBoxVisible, setSearchBoxVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);
  const { user, isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Hide Navbar search if the user is already on the search page
  const isSearchPage = pathname === "/search";

  // Auto-close dropdown & mobile search box when route changes
  useEffect(() => {
    setDropdownOpen(false);
    setSearchBoxVisible(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchBoxVisible(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/users/Logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      dispatch(logout());
      setDropdownOpen(false);
      toast.success("Logged out");
      navigate("/signin");
    }
  };

  return (
    <>
      <nav className="navbar relative z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
        {/* Brand Logo - Added brightness/invert support for Dark Mode visibility */}
        {/* Brand Logo - Styled for perfect light & dark mode visibility */}
        <Link
          to="/"
          className="flex-none w-28 sm:w-32 md:w-36 mr-2 sm:mr-4 flex items-center"
        >
          <img
            src={logo}
            className="w-full h-auto max-h-9 object-contain mix-blend-multiply dark:mix-blend-normal dark:invert dark:hue-rotate-180"
            alt="Pulse.Blog"
          />
        </Link>

        {/* Search Bar - Expandable overlay on Mobile, persistent input on Desktop */}
        {!isSearchPage && (
          <form
            onSubmit={handleSearchSubmit}
            className={`absolute top-full left-0 w-full p-3 sm:p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50 transition-all duration-200 md:border-none md:p-0 md:static md:w-[280px] lg:w-[380px] md:block ${
              searchBoxVisible ? "block shadow-lg md:shadow-none" : "hidden"
            }`}
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-gray-100 dark:bg-gray-800 text-sm sm:text-base p-2.5 sm:p-3 pl-10 sm:pl-12 pr-4 rounded-full placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
              <button
                type="submit"
                className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Search"
              >
                <i className="fi fi-br-search text-base sm:text-lg block" />
              </button>
            </div>
          </form>
        )}

        {/* Actions & Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          {/* Mobile Search Toggle Button */}
          {!isSearchPage && (
            <button
              type="button"
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-700 dark:text-gray-200 active:scale-95 transition-transform"
              onClick={() => setSearchBoxVisible((c) => !c)}
              aria-label="Toggle Search"
            >
              <i
                className={`fi ${searchBoxVisible ? "fi-rr-cross" : "fi-br-search"} text-base sm:text-lg`}
              />
            </button>
          )}

          {/* Write Button - High-contrast styling for both light and dark themes */}
          {isLoggedIn && (
            <Link
              to="/write"
              className="hidden md:flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white font-medium text-sm lg:text-base py-2 px-3.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <i className="fi fi-rr-edit text-lg text-gray-700 dark:text-gray-200" />
              <p>Write</p>
            </Link>
          )}

          {/* Auth State Switcher */}
          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-xs sm:text-sm py-2 px-3.5 sm:px-5 rounded-full font-medium active:scale-95 transition-all shadow-sm"
                to="/signin"
              >
                Sign In
              </Link>
              <Link
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs sm:text-sm py-2 px-3.5 sm:px-5 rounded-full hidden sm:block font-medium active:scale-95 transition-all"
                to="/signup"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            /* User Dropdown Menu Wrapper */
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((p) => !p)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-all focus:outline-none shrink-0"
              >
                {user?.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user?.username || "User avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700/50 flex items-center justify-center font-bold text-sm">
                    {(user?.username || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {/* Floating Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-12 sm:top-14 w-56 sm:w-60 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-[150] overflow-hidden transform origin-top-right transition-all">
                  <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1.5">
                    <Link
                      to={`/user/${user?.username}`}
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="fi fi-rr-user text-base text-gray-500 dark:text-gray-400" />{" "}
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="fi fi-rr-apps text-base text-gray-500 dark:text-gray-400" />{" "}
                      Dashboard
                    </Link>

                    {/* Mobile-only Write link */}
                    <Link
                      to="/write"
                      className="flex md:hidden items-center gap-3 px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="fi fi-rr-edit text-base text-gray-500 dark:text-gray-400" />{" "}
                      Write a post
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs sm:text-sm text-gray-800 dark:text-gray-200 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="fi fi-rr-settings text-base text-gray-500 dark:text-gray-400" />{" "}
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-800 py-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs sm:text-sm text-red-500 font-medium transition-colors"
                    >
                      <i className="fi fi-rr-sign-out-alt text-base" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
};
export default Navbar;
