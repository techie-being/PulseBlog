import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";

const ResetPassword = () => {
    // Grabs the :token from the URL
    const { token } = useParams(); 
    const navigate = useNavigate();
    
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic frontend validation
        if (!password || password.length < 6) {
            return toast.error("Password must be at least 6 characters long");
        }

        setLoading(true);
        try {
            // PATCH request exactly as defined in your user.routes.js
            const res = await axiosInstance.patch(`/users/reset-password/${token}`, { password });
            toast.success(res.data.message || "Password reset successfully!");
            
            // Wait 2 seconds so the user can read the success message, then redirect
            setTimeout(() => {
                navigate("/signin");
            }, 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reset password. Link might be expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="h-cover flex items-center justify-center">
            <Toaster />
            <form onSubmit={handleSubmit} className="w-[80%] max-w-[400px]">
                <h1 className="text-4xl font-gelasio capitalize text-center mb-8">
                    Reset Password
                </h1>
                <p className="text-dark-grey text-center mb-6">
                    Enter your new password below. Make sure it's strong!
                </p>
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-box mb-4"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn-dark center mt-4 w-full"
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </section>
    );
};

export default ResetPassword;