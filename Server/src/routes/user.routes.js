import { Router } from "express";
import {registerUser,userLogin,userLogout,
getCurrentUser,} from "../controllers/user.controller.js"
import {upload} from  "../middlewares/multer.middlewares.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()
//first User-Routes
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
router.route("/Logout").post(verifyJwt,userLogout);
router.route("/current-user").get(verifyJwt,getCurrentUser);



router.route("google")





export{router}