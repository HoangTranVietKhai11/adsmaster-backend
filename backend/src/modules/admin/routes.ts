import { Router } from "express";
import * as controller from "./controller";
import { authenticate, authorize } from "../../middlewares/auth";

const router = Router();
router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/stats", controller.getAdminStats);
router.get("/users", controller.listUsers);
router.put("/users/:id", controller.updateUser);
router.delete("/users/:id", controller.deleteUser);
router.get("/courses", controller.listCourses);
router.post("/courses", controller.createCourse);
router.put("/courses/:id", controller.updateCourse);
router.delete("/courses/:id", controller.deleteCourse);
router.get("/payments", controller.listPayments);
router.get("/affiliates", controller.listAffiliates);
router.put("/affiliates/:id/approve", controller.approveAffiliate);

export default router;
