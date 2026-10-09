import { Router } from "express";
import { SalesController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

const router = Router();

// Only employees and owners can create sales.
router.post(
  "/",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  SalesController.createSale
);

export const salesRoutes = router;
