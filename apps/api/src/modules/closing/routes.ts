import { Router } from "express";
import { ClosingController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

const router = Router();

// All closing endpoints require authentication
router.use(authenticate);

// Current closing
router.get("/current", ClosingController.getCurrentClosing);

// Submit closing (Employee or Owner for branch)
router.post("/submit", ClosingController.submitClosing);

// Closing history
router.get("/history", ClosingController.getClosingHistory);

// Get specific closing details
router.get("/:id", ClosingController.getClosingById);

// Owner review actions
router.post("/:id/approve", authorizeRole(["OWNER"]), ClosingController.approveClosing);
router.post("/:id/reject", authorizeRole(["OWNER"]), ClosingController.rejectClosing);

export const closingRouter = router;
