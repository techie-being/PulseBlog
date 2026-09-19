import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const INTEREST_OPTIONS = [
  "Technology",
  "Programming",
  "AI & Machine Learning",
  "Web Development",
  "Design",
  "Science",
  "Business",
  "Finance",
  "Health & Wellness",
  "Travel",
  "Gaming",
  "Environment",
];

const MIN_SELECTION = 3;

const OnboardingPage = () => {
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState(user?.interests || []);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect unauthorized users
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  // Redirect users who have already finished onboarding
  if (user && !user.isNewUser) {
    return <Navigate to="/" replace />;
  }

  const toggleInterest = (interest) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  };

  const handleSubmit = async (interestsToSave = selected) => {
    if (interestsToSave.length < MIN_SELECTION) {
      return toast.error(`Please select at least ${MIN_SELECTION} interests`);
    }

    setLoading(true);
    try {
      const response = await axiosInstance.patch("/users/complete-onboarding", {
        interests: interestsToSave,
      });

      const updatedUserData = response.data?.data;

      // Sync Redux state
      dispatch(
        updateUser({
          ...updatedUserData,
          isNewUser: false,
        }),
      );

      toast.success("Welcome to PulseBlog!");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Onboarding submission error:", err);
      toast.error(err?.response?.data?.message || "Failed to update interests");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.patch("/users/skip-onboarding");

      const updatedUserData = response.data?.data;

      dispatch(
        updateUser({
          ...updatedUserData,
          isNewUser: false,
        }),
      );

      toast.success("Welcome to PulseBlog!");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Skip onboarding error:", err);
      toast.error(err?.response?.data?.message || "Failed to skip onboarding");
    } finally {
      setLoading(false);
    }
  };

  const remainingNeeded = Math.max(0, MIN_SELECTION - selected.length);

  return (
    <section className="h-cover flex items-center justify-center px-4 py-10">
      <Toaster position="top-center" />
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-grey/80 p-6 sm:p-10 rounded-3xl shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-gelasio font-bold text-gray-900 dark:text-white mb-2">
            What are you interested in?
          </h1>
          <p className="text-sm sm:text-base text-dark-grey">
            Choose at least {MIN_SELECTION} topics to personalize your reading
            feed.
          </p>
        </div>

        {/* Interests Grid */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center mb-8 max-h-[360px] overflow-y-auto p-2 no-scrollbar">
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = selected.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                  isSelected
                    ? "bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 scale-105 shadow-md"
                    : "bg-indigo-50/70 text-indigo-900 border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-200 dark:border-indigo-900/50 dark:hover:bg-indigo-900/60"
                }`}
              >
                {isSelected && <i className="fi fi-rr-check mr-1.5 text-xs" />}
                {interest}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="text-center space-y-4 border-t border-grey/60 pt-6">
          <p className="text-xs sm:text-sm font-medium text-dark-grey">
            {selected.length >= MIN_SELECTION ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 font-semibold">
                <i className="fi fi-rr-checkbox" /> {selected.length} topics
                selected
              </span>
            ) : (
              <span>
                Select {remainingNeeded} more topic
                {remainingNeeded > 1 ? "s" : ""} to continue
              </span>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => handleSubmit(selected)}
              disabled={loading || selected.length < MIN_SELECTION}
              className="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <i className="fi fi-rr-spinner animate-spin" /> Saving...
                </>
              ) : (
                "Continue to PulseBlog"
              )}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnboardingPage;
