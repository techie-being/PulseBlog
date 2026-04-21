import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your registered email");

        setLoading(true);
        try {
            const res = await axiosInstance.post("/users/forgot-password", { email });
            toast.success(res.data.message || "Reset link sent to your email!");
            setEmail(""); // Clear the input after success
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="h-cover flex items-center justify-center">
            <Toaster />
            <form onSubmit={handleSubmit} className="w-[80%] max-w-[400px]">
                <h1 className="text-4xl font-gelasio capitalize text-center mb-8">
                    Forgot Password
                </h1>
                <p className="text-dark-grey text-center mb-6">
                    Enter your registered email and we'll send you a secure link to reset your password.
                </p>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-box mb-4"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="btn-dark center mt-4 w-full"
                    disabled={loading}
                >
                    {loading ? "Sending Link..." : "Send Reset Link"}
                </button>
                <div className="mt-6 text-dark-grey text-center">
                    Remembered your password?{" "}
                    <Link to="/signin" className="underline text-black text-xl ml-1">
                        Sign in
                    </Link>
                </div>
            </form>
        </section>
    );
};

export default ForgotPassword;