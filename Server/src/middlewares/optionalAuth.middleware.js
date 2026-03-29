import {User} from "../models/user.models.js";
import jwt from "jsonwebtoken";

const getOptionalUser = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        console.log("TOKEN FOUND:", token ? "YES" : "NO");
        if (!token) {
            return next(); 
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
       
        if (user) {
            req.user = user; // Attach the user if found
        }
        
        next();
    } catch (error) {
        console.log("JWT VERIFICATION ERROR:", error.message);
        // If the token is expired or malformed, we still let them through as a guest
        next();
    }
};
export {getOptionalUser}