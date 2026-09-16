import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";

const ProfilePage = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redux auth context
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/users/profile-details/${username}`);
        setProfile(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 animate-pulse flex flex-col items-center">
        <div className="w-32 h-32 bg-slate-200 rounded-full mb-6" />
        <div className="h-6 w-48 bg-slate-200 rounded mb-3" />
        <div className="h-4 w-32 bg-slate-200 rounded mb-4" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>
    );
  }

  if (!profile) {
    return (
      <section className="text-center py-24 px-4">
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">User Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">
            The user profile you are searching for does not exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            Go Home
          </Link>
        </div>
      </section>
    );
  }

  const isMyProfile = currentUser?.username === profile.username;

  return (
    <section className="max-w-2xl mx-auto py-12 px-4">
      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <img
            src={
              profile.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`
            }
            alt={profile.username}
            className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 shadow-sm"
          />
        </div>

        {/* User Info */}
        <h1 className="text-3xl font-extrabold text-slate-900 capitalize">
          {profile.fullname || profile.username}
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1">
          @{profile.username}
        </p>

        {profile.bio && (
          <p className="text-slate-700 text-sm sm:text-base mt-4 max-w-lg leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Owner Settings Action */}
        {isMyProfile && (
          <Link
            to="/settings"
            className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-95 border border-slate-200"
          >
            Edit Profile
          </Link>
        )}
      </div>
    </section>
  );
};

export default ProfilePage;