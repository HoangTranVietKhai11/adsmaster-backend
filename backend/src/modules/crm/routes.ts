import { Router } from "express";
import * as controller from "./controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.get("/", authenticate, controller.listLeads);
router.post("/", authenticate, controller.createLead);
router.get("/:id", authenticate, controller.getLead);
router.put("/:id", authenticate, controller.updateLead);
router.delete("/:id", authenticate, controller.deleteLead);
router.post("/:id/interactions", authenticate, controller.addInteraction);
router.get("/:id/interactions", authenticate, controller.getInteractions);

export default router;
