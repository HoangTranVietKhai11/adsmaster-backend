import { Router } from "express";
import * as controller from "./controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.get("/dashboard", authenticate, controller.getAffiliateDashboard);
router.post("/join", authenticate, controller.joinAffiliateProgram);
router.get("/referrals", authenticate, controller.getMyReferrals);
router.post("/track/:code", controller.trackReferral);

export default router;
