import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    // If already logged in (e.g. user navigated here manually), just redirect
    if (isLoggedIn) {
      navigate("/", { replace: true });
      return;
    }

    const syncUser = async () => {
      try {
        // The cookies were set by the backend redirect.
        // We call /current-user to get the user object and store it in Redux.
        const res = await axiosInstance.get("/users/current-user");
        const user = res.data.data;

        dispatch(loginSuccess(user));

        // If brand new user, go to onboarding; otherwise go home
        if (user?.isNewUser) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Google login sync failed:", err);
        navigate("/login-failed", { replace: true });
      }
    };

    syncUser();
  }, [dispatch, isLoggedIn, navigate]);

  return (
    <section className="h-cover flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-purple border-t-transparent rounded-full animate-spin" />
      <p className="text-dark-grey">Signing you in with Google...</p>
    </section>
  );
};

export default LoginSuccess;