import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    bio: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync state with Redux user state when component mounts or user updates
  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user?.fullname || "",
        email: user?.email || "",
        bio: user?.bio || "",
      });
      setAvatarPreview(user?.avatar || "");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      return toast.error("Image size must be under 500KB");
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullname.trim()) {
      return toast.error("Full name cannot be empty");
    }

    setLoading(true);

    const data = new FormData();
    data.append("fullname", formData.fullname);
    data.append("email", formData.email);
    data.append("bio", formData.bio);
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }

    try {
      const res = await axiosInstance.patch("/users/update-account", data);

      toast.success("Profile updated successfully! ✨");

      const updatedUserData = res.data?.data || res.data;
      dispatch(loginSuccess(updatedUserData));
      setAvatarFile(null);
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto py-12 px-4">
      <Toaster position="top-center" />

      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Update your public profile details and avatar image
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-sm transition-all duration-300">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
            <div className="relative group w-36 h-36 rounded-full overflow-hidden border-4 border-slate-100 shadow-md transition-all duration-300 group-hover:shadow-indigo-500/20">
              <img
                src={
                  avatarPreview ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${
                    formData.fullname || "User"
                  }`
                }
                alt="avatar preview"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Overlay on hover */}
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-[2px] text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleAvatarChange}
                  accept="image/*"
                />
                <i className="fi fi-rr-camera text-2xl mb-1 drop-shadow-sm" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Change
                </span>
              </label>
            </div>

            <p className="text-xs text-slate-500 font-semibold tracking-wide">
              Click photo to edit
            </p>
          </div>

          {/* Info Form Section */}
          <form className="flex-1 space-y-6 w-full" onSubmit={handleSubmit}>
            
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative flex items-center">
                <i className="fi fi-rr-user absolute left-4 text-slate-400 text-base pointer-events-none z-10" />
                <input
                  name="fullname"
                  type="text"
                  value={formData.fullname}
                  placeholder="Full Name"
                  onChange={handleChange}
                  disabled={loading}
                  className="profile-input w-full pl-11 pr-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
            </div>

            {/* Email Address Input (Disabled / Locked) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative flex items-center">
                <i className="fi fi-rr-envelope absolute left-4 text-slate-400 text-base pointer-events-none z-10" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  placeholder="Email"
                  disabled={true}
                  className="profile-input w-full pl-11 pr-4 py-3 rounded-xl text-sm font-semibold outline-none transition-all border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed shadow-sm"
                />
              </div>
            </div>

            {/* Bio Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Bio
                </label>
                <span
                  className={`text-xs font-semibold ${
                    formData.bio.length >= 140
                      ? "text-rose-500"
                      : "text-slate-400"
                  }`}
                >
                  {formData.bio.length}/150
                </span>
              </div>
              <textarea
                name="bio"
                maxLength={150}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell readers a bit about yourself..."
                disabled={loading}
                className="profile-input w-full p-4 rounded-xl text-sm font-semibold outline-none transition-all border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900 shadow-sm min-h-[120px] resize-none disabled:bg-slate-100"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fi fi-rr-spinner animate-spin text-base" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;