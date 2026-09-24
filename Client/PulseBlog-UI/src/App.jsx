import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import HomePage from "./pages/Home.page";
import WritePage from "./pages/Write.page";
import PostDetail from "./pages/PostDetail.page";
import DashboardPage from "./pages/Dashboard.page";
import ProfilePage from "./pages/Profile.page";
import SearchPage from "./pages/Search.page";
import OnboardingPage from "./pages/Onboarding.page";
import SettingsPage from "./pages/Settings.page";
import EditProfilePage from "./pages/editProfilePage";

import ForgotPassword from "./pages/ForgotPassword.page";
import ResetPassword from "./pages/ResetPassword.page";
import LoginSuccess from "./pages/LoginSuccess.page";
import LoginFailed from "./pages/LoginFailed.page";

import {
  loginSuccess,
  logout,
  authInitialized,
} from "./redux/slices/authSlice";

import axiosInstance from "./api/axiosInstance";

const App = () => {
  const dispatch = useDispatch();

  const isAuthInitialized = useSelector((state) => state.auth.authInitialized);

  useEffect(() => {
    console.log("🔥 App auth useEffect RUNNING");

    const initializeAuth = async () => {
      try {
        console.log("🔥 Calling current-user...");

        const res = await axiosInstance.get("/users/current-user");

        const user = res.data.data;

        dispatch(loginSuccess(user));

        console.log("Redux loginSuccess dispatched");
      } catch (error) {
        if (error.response?.status === 401) {
          console.log("🔥 Current-user 401 — user is not logged in");
          dispatch(logout());
        }

        if (error.response?.status === 500) {
          console.log("🔥 Internal server error", error);
        }
      } finally {
        console.log("🔥 Authentication check finished");
        dispatch(authInitialized());
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="font-gelasio text-4xl font-bold text-black">
          PulseBlog
        </h1>

        <div className="mt-6 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>

        <p className="mt-4 text-sm text-gray-500">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <>
      {/* Global Toast Container */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          success: {
            duration: 2500,
          },
          error: {
            duration: 3500,
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />

          {/* Standard Auth */}
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />

          {/* Password Recovery */}
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />

          {/* Google Auth Redirects */}
          <Route path="login-success" element={<LoginSuccess />} />
          <Route path="login-failed" element={<LoginFailed />} />

          {/* Editor / Content Creation */}
          <Route path="write" element={<WritePage />} />
          <Route path="edit/:postId" element={<WritePage />} />

          {/* Content Viewing & User Data */}
          <Route path="post/:postId" element={<PostDetail />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="/user/:username" element={<ProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
