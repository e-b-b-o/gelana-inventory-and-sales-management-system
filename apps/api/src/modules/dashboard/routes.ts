import { Router } from "express";
import { DashboardController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

const router = Router();

// Dashboard routes require authentication
router.use(authenticate);

// Owner Dashboard: strictly restricted to OWNER role
router.get("/owner", authorizeRole(["OWNER"]), DashboardController.getOwnerDashboard);

// Employee Dashboard: accessible by EMPLOYEE and OWNER
router.get("/employee", DashboardController.getEmployeeDashboard);

export const dashboardRouter = router;
