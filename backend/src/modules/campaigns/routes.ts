import { Router } from "express";
import * as controller from "./controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();

// Campaigns
router.get("/", authenticate, controller.listCampaigns);
router.post("/", authenticate, controller.createCampaign);
router.get("/:id", authenticate, controller.getCampaign);
router.put("/:id", authenticate, controller.updateCampaign);
router.delete("/:id", authenticate, controller.deleteCampaign);

// Ad Sets
router.post("/:campaignId/adsets", authenticate, controller.createAdSet);
router.put("/:campaignId/adsets/:adSetId", authenticate, controller.updateAdSet);
router.delete("/:campaignId/adsets/:adSetId", authenticate, controller.deleteAdSet);

// Ads
router.post("/:campaignId/adsets/:adSetId/ads", authenticate, controller.createAd);
router.put("/:campaignId/adsets/:adSetId/ads/:adId", authenticate, controller.updateAd);
router.delete("/:campaignId/adsets/:adSetId/ads/:adId", authenticate, controller.deleteAd);

export default router;
