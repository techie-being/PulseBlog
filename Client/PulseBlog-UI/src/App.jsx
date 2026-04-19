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


const App = () => {
    return (
        <>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Navbar />}>
                    <Route index element={<HomePage />} />
                    <Route path="signin"       element={<UserAuthForm type="sign-in" />} />
                    <Route path="signup"       element={<UserAuthForm type="sign-up" />} />
                    
                    {/* Both routes render the same component */}
                    <Route path="write"        element={<WritePage />} />
                    <Route path="edit/:postId" element={<WritePage />} />
                    
                    <Route path="post/:postId" element={<PostDetail />} />
                    <Route path="dashboard"    element={<DashboardPage />} />
                    <Route path="/user/:username" element={<ProfilePage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="onboarding" element={<OnboardingPage />} />
                </Route>
            </Routes>
        </>
    );
};

export default App;