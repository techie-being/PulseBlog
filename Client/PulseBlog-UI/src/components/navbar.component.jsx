import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import logo from "../imgs/logo.png";

const Navbar = () => {
    const [searchBoxVisible, setSearchBoxVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const { user, isLoggedIn } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState("");
    
    const navigate = useNavigate();
    const { pathname } = useLocation(); 

    // Hide Navbar search if the user is already on the search page
    const isSearchPage = pathname === "/search"; 

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
            toast.success("Logged out");
            navigate("/signin");
        }
    };

    return (
        <>
            {/* p-4 gives the navbar 1rem of padding on all sides */}
            <nav className="navbar relative flex items-center justify-between p-4 bg-white">
                <Link to="/" className="flex-none w-20 md:w-32 mr-4">
                    <img src={logo} className="w-full" alt="PulseBlog" />
                </Link>

                {/* Navbar Search - Hides on /search page */}
                {!isSearchPage && (
                    <form 
                        onSubmit={handleSearchSubmit} 
                        className={`absolute top-full left-0 w-full p-4 bg-white border-b border-grey z-50 md:border-none md:p-0 md:static md:w-[300px] lg:w-[400px] md:block ${searchBoxVisible ? "block" : "hidden"}`}
                    >
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search"
                                className="w-full bg-grey p-3 pl-12 pr-6 rounded-full placeholder:text-dark-grey outline-none"
                            />
                            <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2">
                                <i className="fi fi-br-search text-xl text-dark-grey" />
                            </button>
                        </div>
                    </form>
                )}

                <div className="flex items-center gap-3 ml-auto">
                    {!isSearchPage && (
                        <button
                            className="md:hidden w-10 h-10 rounded-full bg-grey flex items-center justify-center"
                            onClick={() => setSearchBoxVisible((c) => !c)}
                        >
                            <i className="fi fi-br-search text-xl" />
                        </button>
                    )}

                    {isLoggedIn && (
                        <Link to="/write" className="hidden md:flex gap-2 link">
                            <i className="fi fi-rr-edit" />
                            <p>Write</p>
                        </Link>
                    )}

                    {!isLoggedIn ? (
                        <>
                            <Link className="btn-dark py-2 px-4 rounded-full" to="/signin">Sign In</Link>
                            <Link className="btn-light py-2 px-4 rounded-full hidden md:block bg-grey" to="/signup">Sign Up</Link>
                        </>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen((p) => !p)}
                                className="w-10 h-10 rounded-full overflow-hidden border-2 border-grey hover:border-black transition"
                            >
                                <img src={user?.avatar} alt={user?.username} className="w-full h-full object-cover" />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 top-12 w-48 bg-white border border-grey rounded-xl shadow-lg z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-grey">
                                        <p className="font-medium truncate">{user?.username}</p>
                                        <p className="text-sm text-dark-grey truncate">{user?.email}</p>
                                    </div>
                                    <Link to={`/user/${user?.username}`} className="block px-4 py-2 hover:bg-grey text-sm" onClick={() => setDropdownOpen(false)}>Profile</Link>
                                    <Link to="/dashboard" className="block px-4 py-2 hover:bg-grey text-sm" onClick={() => setDropdownOpen(false)}>Dashboard</Link>
                                    <Link to="/write" className="block px-4 py-2 hover:bg-grey text-sm" onClick={() => setDropdownOpen(false)}>Write a post</Link>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-grey text-sm text-red-500">Sign Out</button>
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