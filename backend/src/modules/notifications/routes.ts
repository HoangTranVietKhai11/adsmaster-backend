import { Router } from "express";
import * as controller from "./controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.get("/", authenticate, controller.listNotifications);
router.put("/:id/read", authenticate, controller.markRead);
router.put("/read-all", authenticate, controller.markAllRead);

export default router;
