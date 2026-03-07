import { Router } from "express";
import {registerUser,userLogin,logoutUser} from "../controllers/user.controllers.js"
import {upload} from  "../middlewares/multer.middlewares.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()
//firstRoute
router.route("/register").post(
    upload.fields(
        [
            {
                name:"avatar",
                maxCount:1
            },
            {
                name:"coverImage",
                maxCount:1
            }
        ]
    ),
    registerUser
);

router.route("/Login").post(userLogin);
router.route("/Logout").post(verifyJwt,logoutUser);




export{router}