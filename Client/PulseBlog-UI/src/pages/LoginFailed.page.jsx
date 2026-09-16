import { Link, useSearchParams } from "react-router-dom";

const LoginFailed = () => {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get("error") || "We couldn't sign you in with Google. Please try again.";

  return (
    <section className="h-cover flex flex-col items-center justify-center p-4">
      <div className="w-[90%] sm:w-[80%] max-w-[420px] bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-grey shadow-sm text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          <i className="fi fi-rr-cross-circle" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold font-gelasio text-gray-900 dark:text-white mb-2">
          Authentication Failed
        </h1>

        {/* Dynamic Error Message */}
        <p className="text-xs sm:text-sm text-dark-grey leading-relaxed mb-6">
          {errorMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/signin"
            className="btn-dark w-full py-3 rounded-full text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <i className="fi fi-rr-refresh" /> Try Sign In Again
          </Link>

          <Link
            to="/"
            className="btn-light w-full py-2.5 rounded-full text-xs sm:text-sm font-medium bg-grey/60 hover:bg-grey transition-colors text-dark-grey hover:text-black dark:hover:text-white"
          >
            Back to Home
          </Link>
        </div>

        {/* Support Link */}
        <p className="mt-6 text-xs text-dark-grey">
          Need assistance?{" "}
          <Link to="/help" className="underline text-black dark:text-white hover:text-purple transition-colors">
            Contact Support
          </Link>
        </p>
      </div>
    </section>
  );
};

export default LoginFailed;