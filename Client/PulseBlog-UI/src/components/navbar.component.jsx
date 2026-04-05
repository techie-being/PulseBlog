import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import logo from "../imgs/logo.png";

const Navbar = () => {
    // State to toggle search visibility on mobile if needed
    const [searchBoxVisible, setSearchBoxVisible] = useState(false);

    return (
        <>      
        <nav className="navbar flex items-center p-4 border-b border-grey bg-white sticky top-0 z-50">
            
            {/* LOGO: Stays left on all screens */}
            <Link to="/" className="flex-none w-20 md:w-32 mr-4">
                <img src={logo} className="w-full" alt="Logo" />
            </Link>

            {/* SEARCH BAR CONTAINER */}
            {/* Mobile: absolute, below logo, full width | Desktop: relative, beside logo */}
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
                    {/* Icon aligned to the left of the text */}
                    <i className="fi fi-br-search absolute left-4 top-1/2 -translate-y-1/2 text-xl text-dark-grey pointer-events-none"></i>
                </div>
            </div>

            {/* RIGHT SIDE BUTTONS  */}
            <div className="flex items-center gap-3 ml-auto">
                <button 
                    className="md:hidden w-10 h-10 rounded-full bg-grey flex items-center justify-center"
                    onClick={() => setSearchBoxVisible(current => !current)}
                >
                    <i className="fi fi-br-search text-xl"></i>
                </button>
                    <Link to="/write" className="md:hidden w-10 h-10 rounded-full bg-grey flex items-center justify-center">
                        <i className="fi fi-rr-edit text-xl"></i>
                    </Link>
                <Link className="btn-dark py-2" to="/signin">Sign In</Link>
                <Link className="btn-light py-2 hidden md:block" to="/signup">Sign Up</Link>

            </div>

        </nav>
        <Outlet/>
        </>
    );
};

export default Navbar;