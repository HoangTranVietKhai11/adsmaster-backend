import { Router } from "express";
import * as controller from "./controller";
import { authLimiter } from "../../middlewares/rateLimiter";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.post("/register", authLimiter, controller.register);
router.post("/login", authLimiter, controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.getMe);
router.put("/me", authenticate, controller.updateMe);

export default router;
