import { eq, desc, ilike } from "drizzle-orm";
import { db } from "../../config/database.js";
import { categories } from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import { CreateCategoryInput, UpdateCategoryInput, UpdateCategoryStatusInput } from "./schema.js";

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      isActive: categories.isActive,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .orderBy(desc(categories.createdAt));
}

export async function createCategory(data: CreateCategoryInput) {
  // Case-insensitive uniqueness check
  const existingCategory = await db
    .select({ id: categories.id })
    .from(categories)
    .where(ilike(categories.name, data.name))
    .limit(1);

  if (existingCategory.length > 0) {
    throw new AppError("Category name already exists", 400, "VALIDATION_ERROR");
  }

  const [newCategory] = await db
    .insert(categories)
    .values({
      name: data.name,
    })
    .returning({
      id: categories.id,
      name: categories.name,
      isActive: categories.isActive,
    });

  return newCategory;
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  // Case-insensitive uniqueness check, excluding self
  const existingCategory = await db
    .select({ id: categories.id })
    .from(categories)
    .where(ilike(categories.name, data.name))
    .limit(1);

  if (existingCategory.length > 0 && existingCategory[0]!.id !== id) {
    throw new AppError("Category name already exists", 400, "VALIDATION_ERROR");
  }

  const [updatedCategory] = await db
    .update(categories)
    .set({
      name: data.name,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(categories.id, id))
    .returning({
      id: categories.id,
      name: categories.name,
      isActive: categories.isActive,
    });

  if (!updatedCategory) {
    throw new AppError("Category not found", 404, "NOT_FOUND_ERROR");
  }

  return updatedCategory;
}

export async function updateCategoryStatus(id: string, data: UpdateCategoryStatusInput) {
  const [updatedCategory] = await db
    .update(categories)
    .set({
      isActive: data.isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(categories.id, id))
    .returning({
      id: categories.id,
      name: categories.name,
      isActive: categories.isActive,
    });

  if (!updatedCategory) {
    throw new AppError("Category not found", 404, "NOT_FOUND_ERROR");
  }

  return updatedCategory;
}
