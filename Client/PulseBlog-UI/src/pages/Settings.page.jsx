import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";

const SettingsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        bio: user?.bio || "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosInstance.patch("/users/update-account", formData);
            // Assuming the backend returns the updated user in res.data.data
            // If it doesn't, we might need to fetch getCurrentUser again
            toast.success("Profile updated!");
            
            // Re-fetch user to update Redux state
            const userRes = await axiosInstance.get("/users/current-user");
            dispatch(loginSuccess(userRes.data.data));
            
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append("avatar", file);

        try {
            toast.loading("Uploading avatar...", { id: "avatar-upload" });
            const res = await axiosInstance.patch("/users/update-avatar", data);
            toast.success("Avatar updated!", { id: "avatar-upload" });
            
            // Update local state
            const userRes = await axiosInstance.get("/users/current-user");
            dispatch(loginSuccess(userRes.data.data));
        } catch (err) {
            toast.error("Failed to upload avatar", { id: "avatar-upload" });
        }
    };

    return (
        <section className="max-w-2xl mx-auto py-10">
            <Toaster />
            <h1 className="text-3xl font-bold mb-10">Account Settings</h1>

            <div className="flex flex-col md:flex-row gap-10">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group w-32 h-32">
                        <img 
                            src={user?.avatar || "/default-avatar.png"} 
                            alt="avatar" 
                            className="w-32 h-32 rounded-full object-cover border-2 border-grey"
                        />
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                            <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                            <i className="fi fi-rr-camera text-2xl" />
                        </label>
                    </div>
                    <p className="text-sm text-dark-grey font-medium">Click to change avatar</p>
                </div>

                {/* Info Section */}
                <form className="flex-1" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-dark-grey ml-1">Full Name</label>
                            <InputBox 
                                name="fullname"
                                type="text"
                                value={formData.fullname}
                                placeholder="Full Name"
                                icon="fi-rr-user"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-dark-grey ml-1">Email Address</label>
                            <InputBox 
                                name="email"
                                type="email"
                                value={formData.email}
                                placeholder="Email"
                                icon="fi-rr-envelope"
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-dark-grey ml-1">Bio</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell readers about yourself..."
                                className="w-full bg-grey rounded-lg p-4 outline-none border border-transparent focus:border-black min-h-[120px] resize-none"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn-dark mt-6 px-10 w-full md:w-auto"
                        >
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default SettingsPage;
