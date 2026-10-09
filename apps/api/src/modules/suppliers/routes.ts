import { Router } from "express";
import { SuppliersController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

const router = Router();
const controller = new SuppliersController();

// All routes require authentication
router.use(authenticate);

// List suppliers (accessible by OWNER and EMPLOYEE)
router.get("/", controller.getSuppliers.bind(controller));

// Write operations (accessible by OWNER only)
router.post("/", authorizeRole(["OWNER"]), controller.createSupplier.bind(controller));
router.put("/:id", authorizeRole(["OWNER"]), controller.updateSupplier.bind(controller));
router.patch("/:id/status", authorizeRole(["OWNER"]), controller.toggleSupplierStatus.bind(controller));

export const suppliersRouter = router;
