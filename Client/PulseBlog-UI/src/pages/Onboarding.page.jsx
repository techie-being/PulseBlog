import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const INTEREST_OPTIONS = [
    "Technology", "Programming", "AI & Machine Learning", "Web Development",
    "Design", "Science", "Business", "Finance", "Health & Wellness",
    "Travel", "Food", "Art & Culture", "Sports", "Gaming", "Music",
    "Books & Literature", "Philosophy", "Politics", "Environment", "Education"
];

const OnboardingPage = () => {
    // 1. Grab isLoggedIn from Redux
    const { isLoggedIn } = useSelector((state) => state.auth);

    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 2. Zero-Overhead Protection: Kick unauthorized users back to sign-in instantly
    if (!isLoggedIn) {
        return <Navigate to="/signin" replace />;
    }

    const toggleInterest = (interest) => {
        setSelected((prev) =>
            prev.includes(interest)
                ? prev.filter((i) => i !== interest)
                : [...prev, interest]
        );
    };

    const handleSubmit = async () => {
        if (selected.length < 3) return toast.error("Please select at least 3 interests");
        
        setLoading(true);
        try {
            await axiosInstance.patch("/users/complete-onboarding", { interests: selected });
            dispatch(updateUser({ isNewUser: false }));
            toast.success("Welcome to PulseBlog!");
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="h-cover flex items-center justify-center">
            <Toaster />
            <div className="w-full max-w-2xl">
                <h1 className="text-4xl font-gelasio font-bold text-center mb-3">
                    What are you interested in?
                </h1>
                <p className="text-dark-grey text-center mb-8">
                    Select at least 3 topics to personalize your feed.
                </p>

                <div className="flex flex-wrap gap-3 justify-center mb-10">
                    {INTEREST_OPTIONS.map((interest) => (
                        <button
                            key={interest}
                            onClick={() => toggleInterest(interest)}
                            className={`tag cursor-pointer transition ${
                                selected.includes(interest)
                                    ? "bg-black text-white"
                                    : "bg-grey text-black hover:bg-black/10"
                            }`}
                        >
                            {interest}
                        </button>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-sm text-dark-grey mb-4">
                        {selected.length} selected
                    </p>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || selected.length < 3}
                        className="btn-dark px-10 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Continue to PulseBlog"}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default OnboardingPage;