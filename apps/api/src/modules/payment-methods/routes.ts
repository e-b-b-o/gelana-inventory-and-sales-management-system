import { Router } from "express";
import { PaymentMethodsController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

const router = Router();
const controller = new PaymentMethodsController();

// All routes require authentication
router.use(authenticate);

// List methods (accessible by OWNER and EMPLOYEE)
router.get("/", controller.getPaymentMethods.bind(controller));

// Write operations (accessible by OWNER only)
router.post("/", authorizeRole(["OWNER"]), controller.createPaymentMethod.bind(controller));
router.put("/:id", authorizeRole(["OWNER"]), controller.updatePaymentMethod.bind(controller));
router.patch("/:id/status", authorizeRole(["OWNER"]), controller.togglePaymentMethodStatus.bind(controller));

export const paymentMethodsRouter = router;
