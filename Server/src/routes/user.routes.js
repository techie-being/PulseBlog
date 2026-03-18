import { Router } from "express";
import {
  registerUser,
  userLogin,
  userLogout,
  getCurrentUser,
  generateAccessAndRefreshToken,
  refreshToken,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();

//first User-Routes
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/Login").post(userLogin);
router.route("/Logout").post(verifyJwt, userLogout);
router.route("/current-user").get(verifyJwt, getCurrentUser);

// Social Auth routes
router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.route("/google/callback").get(
  passport.authenticate("google", {
    session: false,
  }),

  async (req, res) => {
    try {
      const user = req.user;

      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id,
      );

      const options = {
        httpOnly: true,
        secure: true,
      };

      res.cookie("accessToken", accessToken, options);
      res.cookie("refreshToken", refreshToken, options);

      res.redirect(`http://localhost:3000/login-success`);
    } 
    catch (error) {
      res.redirect(`http://localhost:3000/login-failed`);
    }
  },
);

export { router };
