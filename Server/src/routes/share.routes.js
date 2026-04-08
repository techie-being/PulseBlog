import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    sharePost
}
from "../controllers/share.controller.js";

const router = Router()

router.route("/share-post/:postId").get(verifyJwt,sharePost)

export {router}