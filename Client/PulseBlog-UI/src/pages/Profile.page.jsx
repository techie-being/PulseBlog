import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";

// Dedicated Loading Skeleton Component
const ProfileSkeleton = () => (
  <section className="max-w-4xl mx-auto py-6 sm:py-10 px-4">
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-44 sm:h-60 md:h-72 bg-slate-200" />
      <div className="px-6 sm:px-10 pb-8">
        <div className="-mt-16 sm:-mt-20 flex justify-between items-end">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-300 border-4 border-white shadow-md" />
          <div className="h-10 w-28 bg-slate-200 rounded-xl hidden sm:block" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-7 w-52 bg-slate-200 rounded-md" />
          <div className="h-4 w-32 bg-slate-200 rounded-md" />
          <div className="h-16 w-full max-w-xl bg-slate-200 rounded-lg mt-4" />
        </div>
      </div>
    </div>
  </section>
);

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/users/profile-details/${username}`
        );
        if (isMounted) {
          setProfile(res.data?.data || res.data);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (username) fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <i className="fi fi-rr-user-cross text-xl leading-none" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            User Not Found
          </h2>
          <p className="text-slate-500 text-sm mt-2 mb-6 leading-relaxed">
            The profile for <span className="font-semibold text-slate-700">@{username}</span> could not be found or has been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm active:scale-[0.98]"
          >
            Return to Dashboard
          </Link>
        </div>
      </section>
    );
  }

  const isMyProfile = currentUser?.username === profile.username;

  const avatarUrl =
    profile.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      profile.username
    )}&backgroundColor=0284c7,4f46e5,7c3aed`;

  const coverUrl =
    profile.coverImage ||
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80";

  return (
    <section className="max-w-4xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Cover Header */}
        <div className="relative w-full h-44 sm:h-60 md:h-72 bg-slate-900">
          <img
            src={coverUrl}
            alt={`${profile.username}'s cover`}
            className="w-full h-full object-cover opacity-90"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Profile Details Container */}
        <div className="px-5 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
            
            {/* Avatar */}
            <div className="relative self-center sm:self-auto">
              <img
                src={avatarUrl}
                alt={profile.username}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white shadow-md bg-white ring-1 ring-slate-900/5"
                onError={(e) => {
                  e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    profile.username
                  )}`;
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center sm:justify-end gap-2.5">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm rounded-xl border border-slate-200/80 transition-all active:scale-95"
                title="Share profile"
              >
                <i className={`fi ${copied ? "fi-rr-check text-emerald-600" : "fi-rr-share"} text-sm leading-none`} />
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>

              {isMyProfile && (
                <Link
                  to="/edit-profile"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition-all shadow-sm active:scale-95"
                >
                  <i className="fi fi-rr-pencil text-sm leading-none" />
                  <span>Edit Profile</span>
                </Link>
              )}
            </div>
          </div>

          {/* User Meta Information */}
          <div className="text-center sm:text-left space-y-3 border-b border-slate-100 pb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight capitalize break-words">
                {profile.fullname || profile.username}
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-0.5">
                @{profile.username}
              </p>
            </div>

            {profile.bio && (
              <p className="text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed whitespace-pre-wrap break-words pt-1">
                {profile.bio}
              </p>
            )}
          </div>

          {/* ================= PROFILE DETAILS COMING SOON ================= */}
          <div className="pt-8">
            <div className="p-8 sm:p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200/60 flex items-center justify-center text-slate-400 mb-4">
                <i className="fi fi-rr-time-fast text-xl leading-none" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">
                Profile Details Coming Soon
              </h3>
              <p className="text-slate-500 text-sm mt-1 max-w-md leading-relaxed">
                Additional user details, activity feeds, and statistics will be available here shortly.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProfilePage;