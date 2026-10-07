import { db } from "../../config/database.js";
import { branches } from "../../database/schema/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";
import { z } from "zod";
import { updateBranchSchema } from "./schema.js";

export async function getAllBranches() {
  return db
    .select({
      id: branches.id,
      name: branches.name,
      code: branches.code,
      address: branches.address,
      phoneNumber: branches.phoneNumber,
      isActive: branches.isActive,
    })
    .from(branches);
}

export async function getBranchById(id: string) {
  const [branch] = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
  if (!branch) {
    throw new AppError("Branch not found", 404);
  }
  return branch;
}

export async function createBranch(data: { name: string; code: string; address?: string | null | undefined; phoneNumber?: string | null | undefined }) {
  // Check for unique code
  const existingBranch = await db
    .select()
    .from(branches)
    .where(eq(branches.code, data.code))
    .limit(1);

  if (existingBranch.length > 0) {
    throw new AppError("Branch code already in use", 400, "VALIDATION_ERROR");
  }

  const [branch] = await db
    .insert(branches)
    .values({
      name: data.name,
      code: data.code,
      address: data.address || null,
      phoneNumber: data.phoneNumber || null,
      isActive: true,
    })
    .returning();

  return branch;
}

export async function updateBranch(id: string, data: z.infer<typeof updateBranchSchema>) {
  // Check if branch exists
  await getBranchById(id);

  if (data.code) {
    const existingBranch = await db
      .select()
      .from(branches)
      .where(eq(branches.code, data.code))
      .limit(1);

    if (existingBranch.length > 0 && existingBranch[0]!.id !== id) {
      throw new AppError("Branch code already in use", 400, "VALIDATION_ERROR");
    }
  }

  const [updatedBranch] = await db
    .update(branches)
    .set({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(branches.id, id))
    .returning();

  return updatedBranch;
}

export async function updateBranchStatus(id: string, data: { isActive: boolean }) {
  await getBranchById(id);

  const [updatedBranch] = await db
    .update(branches)
    .set({
      isActive: data.isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(branches.id, id))
    .returning();

  return updatedBranch;
}
