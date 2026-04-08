import { Router } from "express";
import { 
    createPost, 
    getAllPost, 
    getPostById, 
    deletePost, 
    updatePost, 
    getPostByAuthor, 
    togglePostStatus, 
    searchPostsDiscovery, 
    viewsCount 
} from "../controllers/post.controller.js"; // Adjust path as needed
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getOptionalUser } from "../middlewares/optionalAuth.middleware.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

// --- 1. POST CREATION ---
// Handles multiple image uploads (max 5)
router.route("/create-post").post(
    verifyJwt,
    upload.fields([
        {
            name: "mediaImage",
            maxCount: 5
        }
    ]),
    createPost
);

// --- 2. DISCOVERY & LISTING ---
// Public or Optional User routes
router.route("/get-all-posts").get(getOptionalUser, getAllPost);
router.route("/search-post").get(searchPostsDiscovery);
router.route("/get-post-by-author/:userId").get(getOptionalUser, getPostByAuthor);

// --- 3. SPECIFIC POST ACCESS ---
// Fetching by ID and tracking views
router.route("/get-post/:postId").get(getOptionalUser, getPostById);
router.route("/views/:postId").get(viewsCount);

// --- 4. POST MANAGEMENT ---
// These strictly require verifyJwt for ownership/security
router.route("/delete-post/:postId").delete(verifyJwt, deletePost);

router.route("/update-post/:postId").patch(
    verifyJwt,
    upload.single(
        "mediaImage"
    ),
    updatePost
);

router.route("/post-toggle-status/:postId").patch(verifyJwt, togglePostStatus);

export {router};