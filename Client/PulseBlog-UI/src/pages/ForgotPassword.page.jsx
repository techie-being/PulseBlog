import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
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
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 py-12 bg-white transition-colors duration-200">
        
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
          {/* Subtle Icon Badge */}
          <div className="w-12 h-12 rounded-full bg-slate-50/80 text-slate-800 border border-slate-200 flex items-center justify-center mx-auto mb-5 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Heading & Subtitle */}
          <h1 className="font-gelasio text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-2 tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-slate-600 text-sm text-center mb-8 leading-relaxed">
            Enter your registered email and we'll send you a secure link to reset your password.
          </p>

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 mt-2 inline-flex items-center justify-center gap-2 px-6 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Remembered your password?{" "}
              <Link 
                to="/signin" 
                className="font-semibold text-slate-900 hover:underline underline-offset-4 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    );
};

export default ForgotPassword;