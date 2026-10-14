import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";
import { TransfersController } from "./controller.js";

const router = Router();

// Create transfer request: Owner or Employee (employee must involve assigned branch)
router.post(
  "/",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  TransfersController.createTransfer
);

// List transfers: Owner sees all, Employee sees assigned branch
router.get(
  "/",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  TransfersController.getTransfers
);

// Get single transfer details: Owner or scoped Employee
router.get(
  "/:id",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  TransfersController.getTransferById
);

// Approve transfer: strictly OWNER only
router.post(
  "/:id/approve",
  authenticate,
  authorizeRole(["OWNER"]),
  TransfersController.approveTransfer
);

// Reject transfer: strictly OWNER only
router.post(
  "/:id/reject",
  authenticate,
  authorizeRole(["OWNER"]),
  TransfersController.rejectTransfer
);

// Dispatch transfer: strictly OWNER only
router.post(
  "/:id/dispatch",
  authenticate,
  authorizeRole(["OWNER"]),
  TransfersController.dispatchTransfer
);

// Receive transfer: Owner or authorized Employee of destination branch
router.post(
  "/:id/receive",
  authenticate,
  authorizeRole(["OWNER", "EMPLOYEE"]),
  TransfersController.receiveTransfer
);

// Resolve discrepancy: strictly OWNER only
router.post(
  "/:id/resolve-discrepancy",
  authenticate,
  authorizeRole(["OWNER"]),
  TransfersController.resolveDiscrepancy
);

export const transfersRouter = router;

