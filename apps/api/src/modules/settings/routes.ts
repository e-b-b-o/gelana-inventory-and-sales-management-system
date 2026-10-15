import { Router } from "express";
import { SettingsController } from "./controller.js";
import { NotificationController } from "../notifications/controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

export const settingsRouter = Router();

settingsRouter.use(authenticate);

// Self-service profile routes
settingsRouter.get("/profile", SettingsController.getProfile);
settingsRouter.put("/profile", SettingsController.updateProfile);
settingsRouter.patch("/profile", SettingsController.updateProfile);

// Password change (supports PUT and POST aliases)
settingsRouter.put("/password", SettingsController.changePassword);
settingsRouter.post("/password", SettingsController.changePassword);
settingsRouter.post("/security/change-password", SettingsController.changePassword);

// Employee account-change requests
settingsRouter.post("/account-requests", SettingsController.createAccountRequest);
settingsRouter.get("/account-requests/my", SettingsController.getMyAccountRequests);
settingsRouter.get("/account-requests", SettingsController.getAllAccountRequests);

// Owner request management
settingsRouter.patch(
  "/account-requests/:id/decision",
  authorizeRole(["OWNER"]),
  SettingsController.decideAccountRequest
);
settingsRouter.post(
  "/account-requests/:id/decision",
  authorizeRole(["OWNER"]),
  SettingsController.decideAccountRequest
);

// Notification preferences aliases on settings router
settingsRouter.get("/notification-preferences", NotificationController.getPreferences);
settingsRouter.put("/notification-preferences", NotificationController.updatePreferences);
