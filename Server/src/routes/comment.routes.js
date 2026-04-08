import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    userComment,
    deleteComment,
    updateComment,
    getPostComments
}
from "../controllers/comment.controller.js";

const router = Router()

router.route("/comment/:postId").post(verifyJwt,userComment)
router.route("/delete-comment/:commentId").post(verifyJwt,deleteComment)
router.route("/update-comment/:commentId").patch(verifyJwt,updateComment)
router.route("/get-comments/:postId").post(verifyJwt,getPostComments)

export {router}