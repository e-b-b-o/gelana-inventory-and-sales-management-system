import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { InventoryController } from "./controller.js";
import { authorizeRole } from "../../middleware/authorize.js";

export const inventoryRouter = Router();

// Apply auth middleware to all inventory routes
inventoryRouter.use(authenticate);

inventoryRouter.get("/balances", InventoryController.getBalances);

// Shells for future slices
inventoryRouter.get("/movements", InventoryController.getMovements);
inventoryRouter.post("/opening-stock", authorizeRole(["OWNER"]), InventoryController.createOpeningStock);
inventoryRouter.post("/adjustments", authorizeRole(["OWNER"]), InventoryController.createAdjustment);
inventoryRouter.post("/stocktake", authorizeRole(["OWNER"]), InventoryController.submitStocktake);
inventoryRouter.post("/disposal", authorizeRole(["OWNER"]), InventoryController.createDisposal);
