import { Router } from "express";
import { ReportsController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

const router = Router();

// Reports require authentication
router.use(authenticate);

// Slice 10.3 — Sales report (Owner has business-wide access; Employee has strictly branch-scoped access)
router.get("/sales", ReportsController.getSalesReport);

// Slice 10.4 — Inventory report (Owner has business-wide access; Employee has strictly branch-scoped access & stripped financials)
router.get("/inventory", ReportsController.getInventoryReport);

// Slice 10.5 — Profit report (Strictly restricted to OWNER role)
router.get("/profit", authorizeRole(["OWNER"]), ReportsController.getProfitReport);

// Slice 10.6 — Closing report (Owner has business-wide access; Employee has strictly branch-scoped access)
router.get("/closing", ReportsController.getClosingReport);

export const reportsRouter = router;
