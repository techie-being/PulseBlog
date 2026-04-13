import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import HomePage from "./pages/Home.page";
import WritePage from "./pages/Write.page";
import PostDetail from "./pages/PostDetail.page";

const App = () => {
    return (
        <>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Navbar />}>
                    <Route index element={<HomePage />} />
                    <Route path="signin"       element={<UserAuthForm type="sign-in" />} />
                    <Route path="signup"       element={<UserAuthForm type="sign-up" />} />
                    <Route path="write"        element={<WritePage />} />
                    <Route path="post/:postId" element={<PostDetail />} />
                </Route>
            </Routes>
        </>
    );
};

export default App;