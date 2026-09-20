
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const EditProfilePage = () => {
  const navigate = useNavigate();

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------------- PROFILE DETAILS ----------------

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    bio: "",
  });

  // ---------------- IMAGES ----------------

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  // ---------------- FETCH CURRENT USER ----------------

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get("/users/current-user");

        const user = res.data?.data || res.data;

        setFormData({
          fullname: user?.fullname || "",
          email: user?.email || "",
          bio: user?.bio || "",
        });

        setAvatarPreview(
          user?.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`
        );

        setCoverPreview(
          user?.coverImage ||
            "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80"
        );
      } catch (err) {
        console.error("Failed to load profile:", err);

        toast.error(
          err?.response?.data?.message ||
            "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // ---------------- INPUT CHANGE ----------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------- AVATAR CHANGE ----------------

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatar(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  // ---------------- COVER CHANGE ----------------

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setCoverImage(file);

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  // ---------------- SAVE PROFILE ----------------

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!formData.fullname.trim()) {
      return toast.error("Full name is required");
    }

    if (!formData.email.trim()) {
      return toast.error("Email is required");
    }

    setSaving(true);

    try {
      // ==================================================
      // 1. UPDATE FULL NAME, EMAIL AND BIO
      // ==================================================

      await axiosInstance.patch("/users/update-account", {
        fullname: formData.fullname,
        email: formData.email,
        bio: formData.bio,
      });

      // ==================================================
      // 2. UPDATE AVATAR
      // ==================================================

      if (avatar) {
        const avatarData = new FormData();

        avatarData.append("avatar", avatar);

        await axiosInstance.patch(
          "/users/update-avatar",
          avatarData
        );
      }

      // ==================================================
      // 3. UPDATE COVER IMAGE
      // ==================================================

      if (coverImage) {
        const coverData = new FormData();

        coverData.append("coverImage", coverImage);

        await axiosInstance.patch(
          "/users/update-coverImage",
          coverData
        );
      }

      toast.success("Profile updated successfully");

      // Go back to profile after successful update
      setTimeout(() => {
        navigate(-1);
      }, 700);
    } catch (err) {
      console.error("Update profile error:", err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- LOADING UI ----------------

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto py-8 sm:py-12 px-3 sm:px-4">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
          {/* Cover skeleton */}
          <div className="h-40 sm:h-52 md:h-60 bg-slate-200" />

          <div className="px-5 sm:px-8 pb-8">
            {/* Avatar skeleton */}
            <div className="-mt-14 sm:-mt-16">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-300 border-4 border-white" />
            </div>

            {/* Inputs skeleton */}
            <div className="mt-8 space-y-5">
              <div className="h-12 bg-slate-200 rounded-xl" />
              <div className="h-12 bg-slate-200 rounded-xl" />
              <div className="h-32 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ---------------- PAGE ----------------

  return (
    <section className="max-w-3xl mx-auto py-6 sm:py-10 px-3 sm:px-4">
      <Toaster position="top-center" />

      <form
        onSubmit={handleSaveProfile}
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="px-5 sm:px-8 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Edit Profile
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Update your profile information
            </p>
          </div>

          <Link
            to="/"
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </Link>
        </div>

        {/* ==================================================
            COVER IMAGE
        ================================================== */}

        <div className="relative">
          <div className="h-40 sm:h-52 md:h-60 bg-slate-100 overflow-hidden">
            <img
              src={coverPreview}
              alt="Profile cover"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={saving}
            className="
              absolute
              right-3 sm:right-5
              bottom-3 sm:bottom-5
              inline-flex items-center justify-center gap-2
              px-3 sm:px-4
              py-2
              bg-black/70
              hover:bg-black/80
              text-white
              text-xs sm:text-sm
              font-semibold
              rounded-xl
              backdrop-blur-sm
              transition-all
              active:scale-95
              disabled:opacity-50
            "
          >
            <i className="fi fi-rr-camera" />
            <span>Change Cover</span>
          </button>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        {/* ==================================================
            PROFILE CONTENT
        ================================================== */}

        <div className="px-5 sm:px-8 pb-8">
          {/* ================= AVATAR ================= */}

          <div className="-mt-14 sm:-mt-16 relative w-fit">
            <img
              src={avatarPreview}
              alt="Profile avatar"
              className="
                w-28 h-28
                sm:w-32 sm:h-32
                rounded-full
                object-cover
                border-4 border-white
                shadow-md
                bg-white
              "
            />

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={saving}
              aria-label="Change avatar"
              className="
                absolute
                bottom-1
                right-1
                w-9 h-9
                rounded-full
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                flex items-center justify-center
                border-2 border-white
                shadow-md
                transition-all
                active:scale-95
                disabled:opacity-50
              "
            >
              <i className="fi fi-rr-camera text-sm" />
            </button>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* ================= FORM FIELDS ================= */}

          <div className="mt-8 space-y-5">
            {/* Full Name */}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                disabled={saving}
                placeholder="Enter your full name"
                className="
                  w-full
                  px-4 py-3
                  rounded-xl
                  border border-slate-300
                  bg-white
                  text-slate-900
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  focus:border-indigo-600
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:bg-slate-100
                "
              />
            </div>

            {/* Email */}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={saving}
                placeholder="Enter your email"
                className="
                  w-full
                  px-4 py-3
                  rounded-xl
                  border border-slate-300
                  bg-white
                  text-slate-900
                  text-sm
                  font-medium
                  outline-none
                  transition-all
                  focus:border-indigo-600
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:bg-slate-100
                "
              />
            </div>

            {/* Bio */}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Bio
              </label>

              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={saving}
                rows={5}
                maxLength={500}
                placeholder="Tell people a little about yourself..."
                className="
                  w-full
                  px-4 py-3
                  rounded-xl
                  border border-slate-300
                  bg-white
                  text-slate-900
                  text-sm
                  font-medium
                  outline-none
                  resize-none
                  transition-all
                  focus:border-indigo-600
                  focus:ring-2
                  focus:ring-indigo-500/20
                  disabled:bg-slate-100
                "
              />

              <p className="text-xs text-slate-400 mt-1 text-right">
                {formData.bio.length}/500
              </p>
            </div>
          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="
                w-full sm:w-auto
                px-6 py-3
                bg-slate-100
                hover:bg-slate-200
                text-slate-700
                font-semibold
                text-sm
                rounded-xl
                transition-all
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                w-full sm:w-auto
                px-7 py-3
                bg-indigo-600
                hover:bg-indigo-700
                disabled:bg-slate-300
                text-white
                font-bold
                text-sm
                rounded-xl
                shadow-md
                transition-all
                active:scale-95
                flex items-center justify-center gap-2
              "
            >
              {saving ? (
                <>
                  <i className="fi fi-rr-spinner animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fi fi-rr-check" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default EditProfilePage;

