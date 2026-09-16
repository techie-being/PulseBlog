// components/Redirect.signin.jsx
import { Link } from "react-router-dom";

const RedirectToSignin = ({ timeLeft }) => {
  return (
    <div className="sticky top-0 z-50 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-4 py-3 text-center">
      <p className="text-sm font-medium text-amber-800 ">
        🔒 You will be redirected to sign in in{" "}
        <span className="font-bold font-mono text-base underline">{timeLeft}s</span>.{" "}
        <Link to="/signin" className="underline font-bold hover:opacity-80 ml-1">
          Sign in now
        </Link>
      </p>
    </div>
  );
};

export default RedirectToSignin;