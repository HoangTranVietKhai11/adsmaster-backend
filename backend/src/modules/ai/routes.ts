import { Router } from "express";
import * as controller from "./controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

// ─── OpenAI/Gemini Powered (requires API key) ─────────────────────────────────
router.post("/generate-ad", authenticate, controller.generateAd);
router.post("/analyze-audience", authenticate, controller.analyzeAudience);

// ─── Pure TypeScript Analytics (no API key needed) ────────────────────────────
router.post("/analyze-metrics", authenticate, controller.analyzeMetrics);
router.post("/predict-performance", authenticate, controller.predictPerformance);

// ─── Recommendations DB ───────────────────────────────────────────────────────
router.get("/recommendations", authenticate, controller.getRecommendations);
router.put("/recommendations/:id/read", authenticate, controller.markRecommendationRead);

export default router;
