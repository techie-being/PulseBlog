import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import { User } from "../models/user.models.js";
import { cloudinaryUploader } from "../utils/Cloudinary.js";
import { generateEmbedding } from "../utils/Embedding.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import {sendEmail} from "../utils/sendEmail.js";

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
};

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    //increment existing tokenVersion for new login
    //and automatically makes previous token invalid
    user.tokenVersion += 1;
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Actual error", error);
    throw new Apierror(500, "something went wrong while generating tokens");
  }
};

const registerUser = Asynchandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new Apierror(400, "All fields are required");
  }

  const userExisted = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExisted) {
    throw new Apierror(409, "User with email or username already exists");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });

  // --- NEW LOGIC START ---
  // 1. Generate tokens for the new user so they are logged in immediately
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  // 2. Cookie options are defined globally at the top
  // --- NEW LOGIC END ---

  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new Apierror(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .cookie("accessToken", accessToken, options) // Now accessToken is defined!
    .cookie("refreshToken", refreshToken, options) // Now refreshToken is defined!
    .json(
      new Apiresponse(
        201, 
        { user: createdUser, accessToken, refreshToken }, 
        "User created and logged in successfully"
      )
    );
});

const setupAccount = Asynchandler(async (req, res) => {
  // 1. Retrieve files AND text fields
  const { fullname } = req.body; // Correctly extract the string
  
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // 2. Validation
  if (!fullname || fullname.trim() === "") {
    throw new Apierror(400, "Full name is required");
  }

  if (!avatarLocalPath) {
    throw new Apierror(400, "Avatar file is required to complete setup");
  }

  // 3. Upload to Cloudinary
  const avatar = await cloudinaryUploader(avatarLocalPath);
  
  if (!avatar) {
    throw new Apierror(500, "Error while uploading avatar");
  }

  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await cloudinaryUploader(coverImageLocalPath);
  }

  // 4. Update the User in MongoDB
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname, // Now this is a clean string
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        isProfileComplete: true,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new Apierror(404, "User not found");
  }

  // 5. Return success
  return res
    .status(200)
    .json(new Apiresponse(200, user, "Account setup completed successfully"));
});

const userLogin = Asynchandler(async (req, res) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => field?.trim() === "")) {
    throw new Apierror(400, "All fields are mandatory");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new Apierror(404, "User does not exist");
  }

  const verifyPassword = await user.isPasswordCorrect(password);

  if (!verifyPassword) {
    throw new Apierror(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new Apiresponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User LoggedIn successfully",
      ),
    );
});

const forgotPassword = Asynchandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new Apierror(400, "Please provide a registered email");
  }

  // 1. Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new Apierror(404, "No account found with that email");
  }

  // 2. Create Reset Token
  const resetToken = crypto.randomBytes(20).toString("hex");
  console.log("resetToken:",resetToken);

  // 3. Hash token and save to DB
  user.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    
  user.forgotPasswordTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 Mins

  await user.save({ validateBeforeSave: false });

  // 4. Send Email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const message = `You requested a password reset. Click the link to reset your password: \n\n ${resetUrl} \n\n If you didn't request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    return res
      .status(200)
      .json(new Apiresponse(200, {}, "Reset link sent to email"));

  } catch (error) {
    // If email fails, clean up the fields in DB
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    throw new Apierror(500, "Email could not be sent. Try again later.");
  }
});

const resetPassword = Asynchandler(async (req, res) => {
  const { token } = req.params;
  if(!token){
    throw new Apierror(404,"reset-token is required")
  }
  const { password } = req.body;

  if(!password){
    throw new Apierror(404,"reset-token is required")
  }
  // 1. Hash the incoming token to compare with DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // 2. Find user with valid token and check expiry
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new Apierror(400, "Token is invalid or has expired");
  }

  // 3. Set new password and clear token fields
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  await user.save();

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "Password reset successfully! Login now."));
});

const userLogout = Asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
      $inc: {
        tokenVersion: 1,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "user logged out successfully"));
});

const refreshToken = Asynchandler(async (req, res) => {
  // 1. Extraction (Added .trim() to prevent malformed errors from hidden spaces)
  const incomingRefreshToken = (
    req.cookies?.refreshToken || req.body.refreshToken
  )?.trim();

  if (!incomingRefreshToken) {
    throw new Apierror(401, "Refresh token is missing");
  }

  try {
    console.log(
      "SECRET CHECK:",
      process.env.REFRESH_TOKEN_SECRET ? "Exists" : "MISSING!",
    );
    console.log("TOKEN STRING:", incomingRefreshToken);

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new Apierror(404, "User not found");
    }

    // 3. Database Sync Check
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new Apierror(401, "Refresh token is expired or used");
    }

    // 4. Token Rotation
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );

    // 5. Response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new Apiresponse(200, { accessToken, refreshToken }, "Tokens refreshed"),
      );
  } catch (error) {
    // 6. Critical: This sends the error back to Postman
    throw new Apierror(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = Asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new Apiresponse(200, req.user, "User is currently loggedIn"));
});

const changePassword = Asynchandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if ([oldPassword, newPassword].some((field) => field?.trim() === "")) {
    throw new Apierror(402, "All fields are necessary");
  }

  //this may be frontend logic or we need it even here
  else if (oldPassword === newPassword) {
    throw new Apierror(402, "old and new Passwords are same ");
  }

  const user = await User.findById(req.user?._id);

  const verifyPassword = await user.isPasswordCorrect(oldPassword);

  if (!verifyPassword) {
    throw new Apierror(402, "Password does not match");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "Password changed successfully"));
});

const updateAccountDetails = Asynchandler(async (req, res) => {
  const { email, fullname, bio } = req.body;

  if (!email || !fullname) {
    throw new Apierror(400, "Email and Full name are required");
  }

  const updateFields = {
    email,
    fullname,
    bio,
  };

  // Check for avatar upload
  const avatarLocalPath = req.file?.path;
  if (avatarLocalPath) {
    const avatar = await cloudinaryUploader(avatarLocalPath);
    if (!avatar || !avatar.url) {
      throw new Apierror(500, "Error while uploading new avatar");
    }
    updateFields.avatar = avatar.url;
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: updateFields,
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new Apiresponse(200, user, "Profile updated successfully"));
});

const updateAvatar = Asynchandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new Apierror(404, "avatar path not found");
  }

  const avatar = await cloudinaryUploader(avatarLocalPath);

  if (!avatar || !avatar.url) {
    throw new Apierror(500, "error while uploading avatar on cloud");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  );
  return res
    .status(200)
    .json(new Apiresponse(200, user, "User avatar is updated successfully"));
});

const updateCoverImage = Asynchandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new Apierror(404, "avatar path not found");
  }

  const coverImage = await cloudinaryUploader(coverImageLocalPath);

  if (!coverImage.url) {
    throw new Apierror(
      500,
      "Internal error while uploading coverImage on cloud",
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  );
  return res
    .status(200)
    .json(
      new Apiresponse(200, user, "User coverImage is updated successfully"),
    );
});

const userProfileDetails = Asynchandler(async (req, res) => {
  const { username } = req.params;
  
  const loggedInUserId = req.user?._id 
        ? new mongoose.Types.ObjectId(req.user._id) 
        : null;

  if (!username?.trim()) {
    throw new Apierror(404, "username cannot be empty");
  }

  const Profle = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [loggedInUserId, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
        isOwner: {
          $eq: ["$_id", loggedInUserId],
        },
      },
    },
    {
      $project: {
        username: 1,
        //these will only show count to see a list od subscribers we
        //can have to declare another controller that will fetch limited users at a time
        //we have to use subpipelines.
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,

        fullname: {
          $cond: {
            if: {
              $or: [
                { $eq: ["$fullname", ""] },
                { $eq: ["$fullname", null] },
                { $eq: [{ $type: "$fullname" }, "missing"] },
              ],
            },
            then: "$username",
            else: "$fullname",
          },
        },

        email: {
          $cond: ["$isOwner", "$email", "$$REMOVE"],
        },
      },
    },
  ]);

  if (!Profle?.length) {
    throw new Apierror(404, "Creator does not exist");
  }

  return res
    .status(200)
    .json(new Apiresponse(200, Profle[0], "user fetched successfully"));
});

//new user cold start
const completeOnboarding = Asynchandler(async (req, res) => {
  const { interests } = req.body;

  if (!interests || !Array.isArray(interests) || interests.length === 0) {
    throw new Apierror(400, "Please select at least one interest");
  }

  const interestString = interests.join(" ");

  const currentVector = await generateEmbedding(interestString);

  if (!currentVector) {
    throw new Apierror(500, "Failed to generate interest profile. Try again.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        userInterest: currentVector,
        isNewUser: false,
        // Best practice: Save the text tags too for filtering later
        explicitPreferences: interests,
      },
    },
    { new: true },
  );

  if (!updatedUser) {
    throw new Apierror(404, "User profile not found");
  }

  return res.status(200).json(
    new Apiresponse(200, { isNewUser: updatedUser.isNewUser }, "User preference and vector profile stored successfully")
  );
});

export {
  registerUser,
  setupAccount,
  userLogin,
  forgotPassword,
  resetPassword,
  userLogout,
  getCurrentUser,
  refreshToken,
  changePassword,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  userProfileDetails,
  generateAccessAndRefreshToken,
  completeOnboarding,
};
