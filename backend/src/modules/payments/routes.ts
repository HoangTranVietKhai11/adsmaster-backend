import { Router } from "express";
import * as controller from "./controller";
import { authenticate } from "../../middlewares/auth";
import express from "express";

const router = Router();

router.get("/plans", controller.getPlans);
router.post("/subscribe", authenticate, controller.subscribe);
router.post("/cancel", authenticate, controller.cancelSubscription);
router.post("/upgrade", authenticate, controller.upgradePlan);
router.get("/billing-history", authenticate, controller.getBillingHistory);
router.post("/webhook", express.raw({ type: "application/json" }), controller.handleWebhook);

export default router;
