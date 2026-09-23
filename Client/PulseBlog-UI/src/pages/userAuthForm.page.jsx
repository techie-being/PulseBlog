import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../redux/slices/authSlice";
import InputBox from "../components/input.component";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
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

    // CHANGE 1: Prevent automatic redirect to "/" if the user is in the middle of signing up
    if (isLoggedIn && type !== "sign-up") {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e) => {
        if (error) dispatch(loginFailure(null)); 
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation logic
        if (!formData.email || !formData.password) {
            return dispatch(loginFailure("Email and password are required."));
        }
        if (type === "sign-up" && !formData.username) {
            return dispatch(loginFailure("Username is required."));
        }

        if (type === "sign-up") {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                return dispatch(loginFailure("Password must be at least 8 characters long and include an uppercase letter, a number, and a special character."));
            }
        }

        dispatch(loginStart());

        try {
            const endpoint = type === "sign-in" ? "/users/Login" : "/users/register";
            const res = await axiosInstance.post(endpoint, formData);
            
            const userData = res.data.data?.user || res.data.data;
            
            dispatch(loginSuccess(userData));

            toast.success(type === "sign-in" ? "Welcome back!" : "Account created!");

            // CHANGE 2: Explicitly redirect to /onboarding for sign-up, otherwise root
            if (type === "sign-up") {
                navigate("/onboarding");
            } else {
                navigate("/");
            }
            
        } catch (err) {
            const message = err?.response?.data?.message || "Something went wrong";
            dispatch(loginFailure(message));
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL;
    };

    return (
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 py-12 bg-white transition-colors duration-200">
        

        {/* Card Container - Light Slate Fill matching Palette */}
        <div className="w-full max-w-md bg-slate-50/80 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow transition-shadow">
          <h1 className="font-gelasio text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 tracking-tight capitalize">
            {type === "sign-in" ? "Welcome Back" : "Join Us Today"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {type === "sign-in" && (
              <div className="flex justify-end pt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-4 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            {error && (
              <p className="text-red-600 text-xs sm:text-sm text-center font-medium bg-red-50 border border-red-200/60 p-2.5 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 mt-2 inline-flex items-center justify-center gap-2 px-6 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-sm capitalize"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Please wait...</span>
                </>
              ) : (
                <span>{type.replace("-", " ")}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-slate-50 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 absolute">
              or
            </span>
          </div>

          {/* Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className="w-full h-11 sm:h-12 flex items-center justify-center gap-3 px-6 text-sm font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100/80 rounded-xl transition-all duration-150 active:scale-[0.98] shadow-2xs"
          >
            <img src={googleIcon} className="w-5 h-5 object-contain" alt="Google" />
            <span>Continue with Google</span>
          </button>

          {/* Footer Back Link */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 text-center">
            {type === "sign-in" ? (
              <p className="text-xs sm:text-sm text-slate-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-slate-900 hover:underline underline-offset-4 transition-colors ml-1"
                >
                  Join us today
                </Link>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-600">
                Already a member?{" "}
                <Link
                  to="/signin"
                  className="font-semibold text-slate-900 hover:underline underline-offset-4 transition-colors ml-1"
                >
                  Sign in here
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>
    );
};

export default UserAuthForm;