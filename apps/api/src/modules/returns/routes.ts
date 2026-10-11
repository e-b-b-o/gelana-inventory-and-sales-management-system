import { Router } from "express";
import { ReturnsController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

const router = Router();

// Create a return (Owners can create unlinked or linked; Employees can create linked in assigned branch)
router.post(
  "/",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  ReturnsController.createReturn
);

// List returns
router.get(
  "/",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  ReturnsController.getReturns
);

// Get single return details
router.get(
  "/:id",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  ReturnsController.getReturnById
);

export const returnsRouter = router;
