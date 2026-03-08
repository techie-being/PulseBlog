import { Asynchandler } from "../utils/Asynchandler.js";
import { Apierror } from "../utils/Apierror.js";
import { Apiresponse } from "../utils/Apiresponse.js";
import {User} from "../models/user.models.js";
import {cloudinaryUploader} from "../utils/Cloudinary.js";


const options = {
    httpOnly:true,
    secure:true,
}


const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId);
        //increment existing tokenVersion for new login
        //and automatically makes previous token invalid 
        user.tokenVersion += 1;
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken};
    } 
    catch (error) {
        console.error("Actual error",error);
        throw new Apierror(500,"something went wrong while generating tokens")
    }
}

const registerUser = Asynchandler(async (req, res) => {
    const { username, email, password } = req.body;

    // 1. Validate inputs
    if ([username, email, password].some((field) => field?.trim() === "")) {
        throw new Apierror(400, "All fields are required"); // Changed to 400 (Bad Request)
    }

    // 2. Check if user already exists
    const userExisted = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (userExisted) {
        throw new Apierror(409, "User with email or username already exists"); // Changed to 409 (Conflict)
    }

    // 3. Handle Avatar (Required)
    const avatarFilepath = req.files?.avatar?.[0]?.path; // Safely chain the array index

    if (!avatarFilepath) {
        throw new Apierror(400, "Avatar file is required");
    }
    
    const avatar = await cloudinaryUploader(avatarFilepath);
    
    if (!avatar) {
        throw new Apierror(500, "Avatar failed to upload to Cloudinary");
    }

    // 4. Handle Cover Image (Optional)
    let coverImageFilePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageFilePath = req.files.coverImage[0].path;
    }

    let coverImage = null; 
    if (coverImageFilePath) {
        // FIX: Pass the correct file path here!
        coverImage = await cloudinaryUploader(coverImageFilePath); 
        
        if (!coverImage) {
            throw new Apierror(500, "Cover image failed to upload to Cloudinary");
        }
    }

    // 5. Create the user in MongoDB
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        coverImage: coverImage?.url || "", 
        avatar: avatar.url,
    });

    // 6. Fetch the user back to confirm creation and remove sensitive data
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" 
    );

    if (!createdUser) {
        throw new Apierror(500, "Something went wrong while registering the user");
    }

    // 7. Send success response
    return res
        .status(201)
        .json(
            new Apiresponse(201, "User created successfully", createdUser) 
        );
});

const userLogin = Asynchandler(async (req,res) => {
    const {username,password} = req.body

    if(
        [username,password].some((field) => field?.trim() === "")
    ){
        throw new Apierror(400,"All fields are mandatory");
    }

    const user = await User.findOne({username});

    if(!user){
        throw new Apierror(404,"User does not exist")
    }

    const verifyPassword = await user.isPasswordCorrect(password);

    if(!verifyPassword){
        throw new Apierror(401,"Invalid user credentials");
    }

    const {accessToken,refreshToken} =  await generateAccessAndRefreshToken(user._id);
    
    const loggedUser = await User.findById(user._id)
    .select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json( 
        new Apiresponse(
            200,
            {
                user:loggedUser,
                accessToken,
                refreshToken
            },
            "User LoggedIn successfully"
        )
    )
});

const userLogout = Asynchandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined,
            },
            $inc: {
                tokenVersion: 1 
            }
        },
        {
            new:true
        },
    )

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new Apiresponse(200,{},"user logged out successfully")
    )
})

const refreshToken = Asynchandler(async (req,res) => {
    

})

const getCurrentUser = Asynchandler(async (req,res)=>{
    return res
    .status(200)
    .json(
        
        new Apiresponse(200,req.user,"User is currently loggedIn")
    )

})

export {
    registerUser
    ,userLogin,
    userLogout,
    getCurrentUser,
    refreshToken,
};