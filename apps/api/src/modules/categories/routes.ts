import { Router } from "express";
import { listCategories, createNewCategory, editCategory, changeCategoryStatus } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

export const categoriesRouter = Router();

// All routes require authentication
categoriesRouter.use(authenticate);

// Employees and Owners can list categories
categoriesRouter.get("/", listCategories);

// Only Owners can mutate categories
categoriesRouter.post("/", authorizeRole(["OWNER"]), createNewCategory);
categoriesRouter.put("/:id", authorizeRole(["OWNER"]), editCategory);
categoriesRouter.patch("/:id/status", authorizeRole(["OWNER"]), changeCategoryStatus);
