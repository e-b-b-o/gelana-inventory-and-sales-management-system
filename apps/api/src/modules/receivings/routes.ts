import { Router } from "express";
import { ReceivingsController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

export const receivingsRouter = Router();

// Only OWNER can create and view receivings
receivingsRouter.post("/", authenticate, authorizeRole(["OWNER"]), ReceivingsController.createReceiving);
receivingsRouter.get("/", authenticate, authorizeRole(["OWNER"]), ReceivingsController.getReceivings);
receivingsRouter.get("/:id", authenticate, authorizeRole(["OWNER"]), ReceivingsController.getReceivingDetails);
