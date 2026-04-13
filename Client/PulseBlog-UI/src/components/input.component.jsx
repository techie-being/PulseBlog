import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon, onChange }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    return (
        <div className="relative w-full mb-4">
            <input
                name={name}
                type={type === "password" ? (passwordVisible ? "text" : "password") : type}
                placeholder={placeholder}
                value={value}
                id={id}
                onChange={onChange}
                className="input-box"
            />
            <i className={"fi " + icon + " input-icon"} />
            {type === "password" && (
                <i
                    className={"fi fi-rr-eye" + (!passwordVisible ? "-crossed" : "") + " input-icon left-auto right-4 cursor-pointer"}
                    onClick={() => setPasswordVisible((c) => !c)}
                />
            )}
        </div>
    );
};

export default InputBox;