import { Router } from "express";
import {
  registerUser,
  userLogin,
  userLogout,
  getCurrentUser,
  generateAccessAndRefreshToken,
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  refreshToken,
  userProfileDetails ,
  completeOnboarding
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getOptionalUser } from "../middlewares/optionalAuth.middleware.js";


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
router.route("/refresh-token").post(refreshToken);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/change-password").patch(verifyJwt,changePassword)
router.route("/update-account").patch(verifyJwt,updateAccountDetails)
router.route("/update-account").patch(verifyJwt,updateAccountDetails)
router.route("/update-avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)
router.route("/update-coverImage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)
//search profile
router.route("/profile-details/:username").get(getOptionalUser,userProfileDetails )
router.route("/complete-onboarding").patch(verifyJwt,completeOnboarding)





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
