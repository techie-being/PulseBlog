import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";

const UserAuthForm = ({ type }) => {
    return (
        <section className="h-cover flex items-center justify-center">
            <form className="w-full max-w-[350px]">
                <h1 className="text text-4xl font-gelasio capitalize text-center mb-10">
                    {type == "sign-in" ? "Welcome Back" : "Join Us Today"}
                </h1>
                {
                    type != "sign-in" ?
                        <InputBox
                            name="fullname"
                            type="text"
                            placeholder="Full Name"
                            icon="fi-rr-circle-user"
                        />
                        : ""
                }
                <InputBox
                    name="email"
                    type="email"
                    placeholder="E-mail"
                    icon="fi-rr-envelope"
                />
                <InputBox
                    name="password"
                    type="password"
                    placeholder="Password"
                    icon="fi-rr-key"
                />
                <button
                    className="btn-dark centre mt-1 center w-[30%]  "
                    type="submit"
                >
                    {type.replace("-", " ")}
                </button>
                <div className="relative w-full flex item-center gap-2 my-6 opacity-10 uppercase text-black font-bold">
                    <hr className="w-1/2 border-black" />
                    <p>or</p>
                    <hr className="w-1/2 border-black" />
                </div>
                <button className="btn-dark flex items-center justify-center gap-4 w-[75%] center">
                    <img src={googleIcon} className="w-5" />
                    continue with google
                </button>

                {
                    type == "sign-in" ?
                        <p className="mt-6 text-dark-grey text-l text-center">
                            Don't have an account?
                            <Link to="/signup" className="underline text-black text-l ml-1">
                                Join us today
                            </Link>
                        </p>
                        :
                        <p className="mt-4 text-dark-grey text-l text-center">
                            Already a member ?
                            <Link to="/signin" className="underline text-black text-l ml-1">
                                Sign in here
                            </Link>
                        </p>


                }


            </form>
        </section>
    )
}
export default UserAuthForm;