import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    likedPost,
    getLikedList,
    unlikePost,
    likedStatus
}
from "../controllers/like.controller.js"
const router = Router();

router.route("/post-liked/:postId").patch(verifyJwt,likedPost)
router.route("/post-liked-list/:postId").get(verifyJwt,getLikedList)
router.route("/unlike-post/:postId").patch(verifyJwt,unlikePost)
router.route("/post-like-status/:postId").get(verifyJwt,likedStatus)


export {router}