import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getUsers, createUser, updateUser, updateUserStatus, reassignEmployeeBranch, getEmployeeBranchAssignments } from "./service.js";
import { createUserSchema, updateUserSchema, updateUserStatusSchema, reassignBranchSchema } from "./schema.js";
import { AppError } from "../../utils/errors.js";

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const allUsers = await getUsers();
  res.json({ data: allUsers });
});

export const createNewUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  // Use (req.user as any).userId as the assigner
  const user = await createUser(parsed.data, (req.user as any).userId);
  res.status(201).json({ message: "User created successfully", data: user });
});

export const editUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateUserSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const user = await updateUser(req.params.id as string, parsed.data);
  res.json({ message: "User updated successfully", data: user });
});

export const changeUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateUserStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const user = await updateUserStatus(req.params.id as string, parsed.data);
  res.json({ message: "User status updated successfully", data: user });
});

export const getBranchAssignments = asyncHandler(async (req: Request, res: Response) => {
  const assignments = await getEmployeeBranchAssignments(req.params.id as string);
  res.json({ data: assignments });
});

export const reassignBranch = asyncHandler(async (req: Request, res: Response) => {
  const parsed = reassignBranchSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  await reassignEmployeeBranch(req.params.id as string, (req.user as any).userId, parsed.data);
  res.json({ message: "Branch reassigned successfully" });
});
