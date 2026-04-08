import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

//to get user subscribe status
router.route("/subscribe-status").patch(verifyJwt,toggleSubscription);

export {router}