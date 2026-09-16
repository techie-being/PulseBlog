import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { loginSuccess } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { isLoggedIn } = useSelector((state) => state.auth);

  // Prevents double-execution in React 18 Strict Mode
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // If user is already authenticated, redirect immediately
    if (isLoggedIn) {
      navigate("/", { replace: true });
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const syncUser = async () => {
      try {
        // Optional: Extract token or accessToken from URL if backend uses query params
        const token = searchParams.get("token") || searchParams.get("accessToken");
        if (token) {
          localStorage.setItem("token", token);
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        // Fetch user details (works via HTTP-only cookie or set Authorization header)
        const res = await axiosInstance.get("/users/current-user");
        const user = res.data?.data;

        if (!user) {
          throw new Error("User data not found in response");
        }

        dispatch(loginSuccess(user));
        toast.success(`Welcome back, ${user?.personal_info?.fullname || user?.username || "User"}!`);

        // Route user based on onboarding status
        if (user?.isNewUser) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Google login sync failed:", err);
        toast.error(err?.response?.data?.message || "Failed to authenticate session.");
        navigate("/login-failed", { replace: true });
      }
    };

    syncUser();
  }, [dispatch, isLoggedIn, navigate, searchParams]);

  return (
    <section className="h-cover flex flex-col items-center justify-center gap-4 p-4 text-center">
      <Toaster />
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple/20 border-t-purple rounded-full animate-spin" />
        <i className="fi fi-rr-user absolute text-purple text-sm" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold font-gelasio text-gray-900 dark:text-white">
          Authenticating...
        </h2>
        <p className="text-xs sm:text-sm text-dark-grey">
          Securing your session and setting up your workspace.
        </p>
      </div>
    </section>
  );
};

export default LoginSuccess;