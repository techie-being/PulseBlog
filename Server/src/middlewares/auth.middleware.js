import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import {User} from "../models/user.models.js";
import jwt from "jsonwebtoken";

const verifyJwt = Asynchandler(async (req, res, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new Apierror(401, "Unauthorized request");
        }

        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new Apierror(401, "Invalid Access Token");
        }

        //if current token version not matched with previous token verion then
        //previous user will be logged out
        if (decodedToken.tokenVersion !== user.tokenVersion) {
            throw new Apierror(401, "Session expired. Someone else logged in.");
        }

        //temporary user object just o get user._id of that user ans passed this to 
        // logout controller for removing its token from db
        req.user = user; 
        
        next(); 
    } 
    catch (error) {
        throw new Apierror(401, error?.message || "Invalid access token");
    }
});
export {verifyJwt}