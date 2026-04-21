import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  polishDraft,
  simplifyText,
  assetGenerator,
  generateAiSummary,
}
from "../controllers/ai.controller.js";

const router = Router()

router.route("/ai-summary").post(verifyJwt,generateAiSummary);
router.route("/asset-generator").post(verifyJwt,assetGenerator);
router.route("/simplify").post(verifyJwt,simplifyText);
router.route("/polished-draft").post(verifyJwt,polishDraft);

export {router}