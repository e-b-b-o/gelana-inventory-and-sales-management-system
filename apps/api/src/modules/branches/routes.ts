import { Router } from "express";
import { getBranches, addBranch, editBranch, changeBranchStatus } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

export const branchesRouter = Router();

branchesRouter.use(authenticate);

// Everyone authenticated can view branches (needed for employee form)
branchesRouter.get("/", getBranches);

// Only OWNER can manage branches
branchesRouter.post("/", authorizeRole(["OWNER"]), addBranch);
branchesRouter.put("/:id", authorizeRole(["OWNER"]), editBranch);
branchesRouter.patch("/:id/status", authorizeRole(["OWNER"]), changeBranchStatus);
