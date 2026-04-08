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

router.route("/ai-summary").get(verifyJwt,generateAiSummary);
router.route("/asset-generator").get(verifyJwt,assetGenerator);
router.route("/simplify").get(verifyJwt,simplifyText);
router.route("/polished-draft").get(verifyJwt,polishDraft);

export {router}