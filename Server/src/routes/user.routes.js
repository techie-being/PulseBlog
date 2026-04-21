import { Router } from "express";
import {
  registerUser,
  setupAccount,
  forgotPassword,
  resetPassword,
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
router.route("/register").post(registerUser);

// Step 2: Media upload (Requires being logged in)
router.route("/setup-account").patch(
  verifyJwt, 
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  setupAccount
);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);
router.route("/Login").post(userLogin);
router.route("/Logout").post(verifyJwt, userLogout);
router.route("/refresh-token").post(refreshToken);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/change-password").patch(verifyJwt,changePassword)
router.route("/update-account").patch(verifyJwt, upload.single("avatar"), updateAccountDetails);
router.route("/update-avatar").patch(verifyJwt,upload.single("avatar"),updateAvatar)
router.route("/update-coverImage").patch(verifyJwt,upload.single("coverImage"),updateCoverImage)
//search profile
router.route("/profile-details/:username").get(getOptionalUser,userProfileDetails )
router.route("/complete-onboarding").patch(verifyJwt,completeOnboarding)





// Social Auth routes
router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"], // Must be exactly 'scope'
    prompt: "select_account"
  })
);

// Route Google redirects back to
router.route("/google/callback").get(
  passport.authenticate("google", { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login-failed` 
  }),
  async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login-failed`);
      }

      // Generate your system's custom JWTs
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

      const options = {
        httpOnly: true,
        // Set secure to true only in production (HTTPS)
        secure: process.env.NODE_ENV === "production", 
        sameSite: "Lax"
      };

      // Send cookies and redirect to frontend
      res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect(`${process.env.FRONTEND_URL}/login-success`);

    } 

    catch (error) {
      console.error("Callback Error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login-failed`);
    }
  }
);

export { router };
