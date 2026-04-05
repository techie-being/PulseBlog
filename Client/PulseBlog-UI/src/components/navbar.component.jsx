import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import logo from "../imgs/logo.png";

const Navbar = () => {
    const [searchBoxVisible, setSearchBoxVisible] = useState(false);
    const [dropdownOpen, setDropdownOpen]         = useState(false);

    const { user, isLoggedIn } = useSelector((state) => state.auth);
    const dispatch              = useDispatch();
    const navigate              = useNavigate();

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/users/Logout");
        } catch {
            // if backend fails, clear frontend state
        } finally {
            dispatch(logout());
            toast.success("Logged out");
            navigate("/signin");
        }
    };

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-20 md:w-32 mr-4">
                    <img src={logo} className="w-full" alt="PulseBlog" />
                </Link>

                <div className={`
                    absolute md:relative top-full md:top-0 left-0 w-full md:w-auto
                    bg-white md:bg-transparent py-4 md:py-0 px-[5vw] md:px-0
                    border-b md:border-none border-grey
                    ${searchBoxVisible ? "block" : "hidden md:flex"}
                `}>
                    <div className="relative w-full md:w-[300px] lg:w-[400px]">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-grey p-3 pl-12 pr-6 rounded-full placeholder:text-dark-grey outline-none"
                        />
                        <i className="fi fi-br-search absolute left-4 top-1/2 -translate-y-1/2 text-xl text-dark-grey pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <button
                        className="md:hidden w-10 h-10 rounded-full bg-grey flex items-center justify-center"
                        onClick={() => setSearchBoxVisible((c) => !c)}
                    >
                        <i className="fi fi-br-search text-xl" />
                    </button>

                    {isLoggedIn && (
                        <Link to="/write" className="hidden md:flex gap-2 link">
                            <i className="fi fi-rr-edit" />
                            <p>Write</p>
                        </Link>
                    )}

                    {!isLoggedIn ? (
                        <>
                            <Link className="btn-dark py-2" to="/signin">Sign In</Link>
                            <Link className="btn-light py-2 hidden md:block" to="/signup">Sign Up</Link>
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
                                        <p className="font-medium">{user?.username}</p>
                                        <p className="text-sm text-dark-grey truncate">{user?.email}</p>
                                    </div>
                                    <Link
                                        to={`/profile/${user?.username}`}
                                        className="block px-4 py-2 hover:bg-grey text-sm"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/write"
                                        className="block px-4 py-2 hover:bg-grey text-sm"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Write a post
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 hover:bg-grey text-sm text-red-500"
                                    >
                                        Sign Out
                                    </button>
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