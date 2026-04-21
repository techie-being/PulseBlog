import { Link } from "react-router-dom";

const LoginFailed = () => {
  return (
    <section className="h-cover flex flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold font-gelasio">Google Login Failed</h1>
      <p className="text-dark-grey">We couldn't sign you in with Google. Please try again.</p>
      <Link to="/signin" className="btn-dark mt-4">
        Back to Sign In
      </Link>
    </section>
  );
};

export default LoginFailed;