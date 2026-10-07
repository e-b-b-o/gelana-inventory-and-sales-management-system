import { Router } from "express";
import { listUsers, createNewUser, editUser, changeUserStatus, getBranchAssignments, reassignBranch } from "./controller.js";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRole } from "../../middleware/authorize.js";

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.use(authorizeRole(["OWNER"]));

usersRouter.get("/", listUsers);
usersRouter.post("/", createNewUser);
usersRouter.put("/:id", editUser);
usersRouter.patch("/:id/status", changeUserStatus);
usersRouter.get("/:id/branch-assignments", getBranchAssignments);
usersRouter.post("/:id/branch-assignments", reassignBranch);
