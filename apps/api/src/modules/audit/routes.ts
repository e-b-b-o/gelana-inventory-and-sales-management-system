import { Router } from "express";
import { AuditController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";

export const auditRouter = Router();

auditRouter.use(authenticate);

auditRouter.get("/", AuditController.getAuditLogs);
auditRouter.get("/:id", AuditController.getAuditLogById);
