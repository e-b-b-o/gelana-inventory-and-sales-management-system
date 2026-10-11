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

// Employees (own sales) and owners (all/filtered) can view sales history
router.get(
  "/",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  SalesController.getSales
);

// Employees (own sale) and owners (any sale) can view sale details
router.get(
  "/:id",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  SalesController.getSaleById
);

// Only owners can void a completed sale
router.post(
  "/:id/void",
  authenticate,
  authorizeRole(["OWNER"]),
  SalesController.voidSale
);

// Amend / correct a sale (note / reasons)
router.post(
  "/:id/corrections",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  SalesController.correctSale
);

// View sale corrections history
router.get(
  "/:id/corrections",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  SalesController.getSaleCorrections
);

export const salesRoutes = router;


