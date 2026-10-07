import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getCategories, createCategory, updateCategory, updateCategoryStatus } from "./service.js";
import { createCategorySchema, updateCategorySchema, updateCategoryStatusSchema } from "./schema.js";
import { AppError } from "../../utils/errors.js";

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const allCategories = await getCategories();
  res.json({ data: allCategories });
});

export const createNewCategory = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const category = await createCategory(parsed.data);
  res.status(201).json({ message: "Category created successfully", data: category });
});

export const editCategory = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const category = await updateCategory(req.params.id as string, parsed.data);
  res.json({ message: "Category updated successfully", data: category });
});

export const changeCategoryStatus = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateCategoryStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Invalid input", 400, "VALIDATION_ERROR", parsed.error.format());
  }

  const category = await updateCategoryStatus(req.params.id as string, parsed.data);
  res.json({ message: "Category status updated successfully", data: category });
});
