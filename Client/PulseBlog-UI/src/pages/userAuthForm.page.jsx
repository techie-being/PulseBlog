import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../redux/slices/authSlice";
import InputBox from "../components/input.component";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import googleIcon from "../imgs/google.png";

const UserAuthForm = ({ type }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { loading, error, isLoggedIn } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    if (isLoggedIn) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e) => {
        // Clear any previous Redux errors when the user starts typing again
        if (error) dispatch(loginFailure(null)); 
        
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Basic Field Validation using Redux
        if (!formData.email || !formData.password) {
            return dispatch(loginFailure("Email and password are required."));
        }
        if (type === "sign-up" && !formData.username) {
            return dispatch(loginFailure("Username is required."));
        }

        // 2. Strict Password Validation (ONLY for Sign-Up) using Regex
        if (type === "sign-up") {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
            
            if (!passwordRegex.test(formData.password)) {
                return dispatch(loginFailure("Password must be at least 8 characters long and include an uppercase letter, a number, and a special character."));
            }
        }

        // If all checks pass, start the API call
        dispatch(loginStart());

        try {
            const endpoint = type === "sign-in" ? "/users/Login" : "/users/register";
            const res = await axiosInstance.post(endpoint, formData);
            
            const userData = res.data.data?.user || res.data.data;
            
            dispatch(loginSuccess(userData));

            const isNewUser = userData?.isNewUser ?? true;
            
            // We keep the toast here just for the final success celebration
            toast.success(type === "sign-in" ? "Welcome back!" : "Account created!");
            navigate(isNewUser && type === "sign-up" ? "/onboarding" : "/");
            
        } catch (err) {
            const message = err?.response?.data?.message || "Something went wrong";
            dispatch(loginFailure(message));
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL;
    };

    return (
        <section className="h-cover flex items-center justify-center">
            <Toaster />
            <form className="w-full max-w-[350px]" onSubmit={handleSubmit}>
                <h1 className="text-4xl font-gelasio capitalize text-center mb-10">
                    {type === "sign-in" ? "Welcome Back" : "Join Us Today"}
                </h1>

                {type !== "sign-in" && (
                    <InputBox
                        name="username"
                        type="text"
                        placeholder="Username"
                        icon="fi-rr-circle-user"
                        value={formData.username}
                        onChange={handleChange}
                    />
                )}

                <InputBox
                    name="email"
                    type="email"
                    placeholder="E-mail"
                    icon="fi-rr-envelope"
                    value={formData.email}
                    onChange={handleChange}
                />

                <InputBox
                    name="password"
                    type="password"
                    placeholder="Password"
                    icon="fi-rr-key"
                    value={formData.password}
                    onChange={handleChange}
                />

                {/* Redux Error Display Area */}
                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center font-medium bg-red-50 p-2 rounded-md">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-dark centre mt-1 center w-[30%] disabled:opacity-50"
                >
                    {loading ? "Please wait..." : type.replace("-", " ")}
                </button>

                <div className="relative w-full flex items-center gap-2 my-6 opacity-10 uppercase text-black font-bold">
                    <hr className="w-1/2 border-black" />
                    <p>or</p>
                    <hr className="w-1/2 border-black" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="btn-dark flex items-center justify-center gap-4 w-[75%] center"
                >
                    <img src={googleIcon} className="w-5" alt="Google" />
                    Continue with Google
                </button>

                {type === "sign-in" ? (
                    <p className="mt-6 text-dark-grey text-l text-center">
                        Don't have an account?
                        <Link to="/signup" className="underline text-black ml-1">
                            Join us today
                        </Link>
                    </p>
                ) : (
                    <p className="mt-4 text-dark-grey text-l text-center">
                        Already a member?
                        <Link to="/signin" className="underline text-black ml-1">
                            Sign in here
                        </Link>
                    </p>
                )}
            </form>
        </section>
    );
};

export default UserAuthForm;