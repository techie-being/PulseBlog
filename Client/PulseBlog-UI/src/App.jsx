import { Route, Routes } from "react-router-dom";
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

// --- NEW AUTH PAGES ---
import ForgotPassword from "./pages/ForgotPassword.page";
import ResetPassword from "./pages/ResetPassword.page";
import LoginSuccess from "./pages/LoginSuccess.page";
import LoginFailed from "./pages/LoginFailed.page";

const App = () => {
    return (
        <>
            <Toaster position="top-right" />
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
                    <Route path="login-failed"  element={<LoginFailed />} />
                    
                    {/* Editor / Content Creation */}
                    <Route path="write"        element={<WritePage />} />
                    <Route path="edit/:postId" element={<WritePage />} />
                    
                    {/* Content Viewing & User Data */}
                    <Route path="post/:postId" element={<PostDetail />} />
                    <Route path="dashboard"    element={<DashboardPage />} />
                    <Route path="/user/:username" element={<ProfilePage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </>
    );
};

export default App;