import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import PostCard from "../components/PostCard.component"; // Assuming you want to show their posts

const ProfilePage = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // To check if the logged-in user is viewing their own profile
    const { user: currentUser } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                // Matches the backend route: /profile-details/:username
                const res = await axiosInstance.get(`/users/profile-details/${username}`);
                
                // Adjust this depending on your exact backend response structure
                setProfile(res.data.data); 
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
            <div className="max-w-3xl mx-auto py-10 animate-pulse flex flex-col items-center">
                <div className="w-32 h-32 bg-grey rounded-full mb-6" />
                <div className="h-6 w-48 bg-grey rounded mb-2" />
                <div className="h-4 w-32 bg-grey rounded" />
            </div>
        );
    }

    if (!profile) {
        return (
            <section className="text-center py-24">
                <p className="text-xl text-dark-grey">User not found.</p>
                <Link to="/" className="btn-dark mt-6 inline-block">Go Home</Link>
            </section>
        );
    }

    const isMyProfile = currentUser?.username === profile.username;

    return (
        <section className="max-w-4xl mx-auto py-10">
            {/* Profile Header */}
            <div className="flex flex-col items-center border-b border-grey pb-10 mb-10">
                <img 
                    src={profile.avatar || "/default-avatar.png"} // Fallback if no avatar
                    alt={profile.username}
                    className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <h1 className="text-3xl font-bold font-gelasio capitalize">{profile.fullname || profile.username}</h1>
                <p className="text-dark-grey text-lg mt-1">@{profile.username}</p>
                
                {profile.bio && (
                    <p className="text-center text-dark-grey mt-4 max-w-lg">{profile.bio}</p>
                )}

                {/* If it's their own profile, show an Edit button */}
                {isMyProfile && (
                    <Link to="/settings/edit-profile" className="btn-light mt-6">
                        Edit Profile
                    </Link>
                )}
            </div>

            {/* User's Posts (Optional: If your backend sends their posts with the profile) */}
            <div>
                <h2 className="text-xl font-bold mb-6">Posts by {profile.username}</h2>
                {profile.posts && profile.posts.length > 0 ? (
                    profile.posts.map((post, i) => (
                        <PostCard key={post._id} post={post} index={i} />
                    ))
                ) : (
                    <p className="text-dark-grey text-center">This user hasn't published any posts yet.</p>
                )}
            </div>
        </section>
    );
};

export default ProfilePage;