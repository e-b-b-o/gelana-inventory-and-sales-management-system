import * as argon2 from "argon2";
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/database.js";
import { users, branches, branchAssignments } from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import { CreateUserInput, UpdateUserInput, UpdateUserStatusInput, ReassignBranchInput } from "./schema.js";

export async function getUserForSession(id: string) {
  const found = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      role: users.role,
      branchId: users.branchId,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
    
  return found[0] || null;
}

export async function getUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      branchId: users.branchId,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}

export async function createUser(data: CreateUserInput, assignedByUserId: string) {
  // Check if email exists
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new AppError("Email is already in use", 400, "VALIDATION_ERROR");
  }

  const passwordHash = await argon2.hash(data.password);

  return await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
        branchId: data.branchId || null,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branchId: users.branchId,
        isActive: users.isActive,
      });

    if (newUser?.branchId) {
      await tx.insert(branchAssignments).values({
        userId: newUser.id,
        branchId: newUser.branchId,
        assignedBy: assignedByUserId,
      });
    }

    return newUser;
  });
}

export async function updateUser(id: string, data: UpdateUserInput) {
  // Check if email exists for another user
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length > 0 && existingUser[0]!.id !== id) {
    throw new AppError("Email is already in use", 400, "VALIDATION_ERROR");
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      name: data.name,
      email: data.email,
      role: data.role,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      branchId: users.branchId,
      isActive: users.isActive,
    });

  if (!updatedUser) {
    throw new AppError("User not found", 404, "NOT_FOUND_ERROR");
  }

  return updatedUser;
}

export async function updateUserStatus(id: string, data: UpdateUserStatusInput) {
  const [updatedUser] = await db
    .update(users)
    .set({
      isActive: data.isActive,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      branchId: users.branchId,
      isActive: users.isActive,
    });

  if (!updatedUser) {
    throw new AppError("User not found", 404, "NOT_FOUND_ERROR");
  }

  return updatedUser;
}

import { and, isNull } from "drizzle-orm";

export async function reassignEmployeeBranch(
  userId: string,
  assignedBy: string,
  data: ReassignBranchInput
) {
  return await db.transaction(async (tx) => {
    // 1. Get user
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) throw new AppError("User not found", 404, "NOT_FOUND_ERROR");
    if (user.branchId === data.newBranchId) {
      throw new AppError("Employee is already assigned to this branch", 400, "VALIDATION_ERROR");
    }

    // 2. Get target branch
    const [branch] = await tx.select().from(branches).where(eq(branches.id, data.newBranchId)).limit(1);
    if (!branch) throw new AppError("Branch not found", 404, "NOT_FOUND_ERROR");
    if (!branch.isActive) throw new AppError("Cannot reassign to an inactive branch", 400, "VALIDATION_ERROR");

    const now = new Date().toISOString();

    // 3. Close current assignment
    await tx.update(branchAssignments)
      .set({ endDate: now })
      .where(and(eq(branchAssignments.userId, userId), isNull(branchAssignments.endDate)));

    // 4. Create new assignment
    await tx.insert(branchAssignments).values({
      userId,
      branchId: data.newBranchId,
      assignedBy,
      reason: data.reason || null,
      startDate: now,
    });

    // 5. Update user
    await tx.update(users)
      .set({ branchId: data.newBranchId, updatedAt: now })
      .where(eq(users.id, userId));

    return { success: true };
  });
}

export async function getEmployeeBranchAssignments(userId: string) {
  return db
    .select({
      id: branchAssignments.id,
      branchId: branchAssignments.branchId,
      branchName: branches.name,
      assignedBy: branchAssignments.assignedBy,
      assignedByName: users.name,
      startDate: branchAssignments.startDate,
      endDate: branchAssignments.endDate,
      reason: branchAssignments.reason,
    })
    .from(branchAssignments)
    .innerJoin(branches, eq(branchAssignments.branchId, branches.id))
    .innerJoin(users, eq(branchAssignments.assignedBy, users.id))
    .where(eq(branchAssignments.userId, userId))
    .orderBy(desc(branchAssignments.startDate));
}

