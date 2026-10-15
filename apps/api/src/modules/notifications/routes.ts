import { Router } from "express";
import { NotificationController } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get("/", NotificationController.getNotifications);
notificationsRouter.get("/unread-count", NotificationController.getUnreadCount);
notificationsRouter.get("/preferences", NotificationController.getPreferences);
notificationsRouter.put("/preferences", NotificationController.updatePreferences);
notificationsRouter.post("/mark-all-read", NotificationController.markAllAsRead);
notificationsRouter.patch("/:id/read", NotificationController.markAsRead);
