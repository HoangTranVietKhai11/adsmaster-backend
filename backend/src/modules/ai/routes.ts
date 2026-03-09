import { Router } from "express";
import * as controller from "./controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.post("/generate-ad", authenticate, controller.generateAd);
router.post("/analyze-audience", authenticate, controller.analyzeAudience);
router.get("/recommendations", authenticate, controller.getRecommendations);
router.put("/recommendations/:id/read", authenticate, controller.markRecommendationRead);

export default router;
