import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getAllBranches, createBranch, updateBranch, updateBranchStatus } from "./service.js";
import { createBranchSchema, updateBranchSchema, updateBranchStatusSchema } from "./schema.js";
import { AppError } from "../../utils/errors.js";

export const getBranches = asyncHandler(async (req: Request, res: Response) => {
  const branches = await getAllBranches();
  res.json({ data: branches });
});

export const addBranch = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createBranchSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const branch = await createBranch(parsed.data);
  res.status(201).json({ message: "Branch created successfully", data: branch });
});

export const editBranch = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateBranchSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const branch = await updateBranch(req.params.id as string, parsed.data);
  res.json({ message: "Branch updated successfully", data: branch });
});

export const changeBranchStatus = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateBranchStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const branch = await updateBranchStatus(req.params.id as string, parsed.data);
  res.json({ message: "Branch status updated successfully", data: branch });
});
