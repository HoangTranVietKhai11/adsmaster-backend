import { Router } from "express";
import * as controller from "./controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.get("/dashboard", authenticate, controller.getDashboard);
router.get("/reports", authenticate, controller.listReports);
router.post("/reports", authenticate, controller.generateReport);
router.get("/metrics/:adId", authenticate, controller.getAdMetrics);
router.post("/metrics", authenticate, controller.ingestMetrics);
router.get("/top-ads", authenticate, controller.getTopAds);

export default router;
