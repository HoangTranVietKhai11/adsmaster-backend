import { Router } from "express";
import * as controller from "./controller";
import { authenticate } from "../../middlewares/auth";

const router = Router();

router.get("/", authenticate, controller.listCourses);
router.get("/:id", authenticate, controller.getCourse);
router.post("/:id/enroll", authenticate, controller.enroll);
router.put("/lessons/:lessonId/progress", authenticate, controller.updateProgress);
router.get("/my/enrollments", authenticate, controller.getMyEnrollments);

export default router;
