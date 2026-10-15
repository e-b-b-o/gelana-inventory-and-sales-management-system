import * as argon2 from "argon2";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import { accountRequests, branches, users } from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import { AuditService } from "../audit/service.js";
import { NotificationService } from "../notifications/service.js";
import {
  ChangePasswordInput,
  CreateAccountRequestInput,
  DecideAccountRequestInput,
  UpdateProfileInput,
} from "./schema.js";

export class SettingsService {
  /**
   * Get the current user's profile with branch details
   */
  static async getProfile(userId: string) {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        branchId: users.branchId,
        branchName: branches.name,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(branches, eq(users.branchId, branches.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branchName: user.branchName || (user.role === "OWNER" ? "All Branches (Owner)" : null),
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Update the user's own display name
   */
  static async updateProfile(userId: string, actor: any, input: UpdateProfileInput) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    const previousName = user.name;
    const [updated] = await db
      .update(users)
      .set({
        name: input.name,
        updatedAt: sql`NOW()`,
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    // Audit the profile update
    await AuditService.recordAudit({
      actorId: user.id,
      actorName: updated.name,
      actorRole: user.role,
      action: "PROFILE_UPDATED",
      category: "USERS",
      entityType: "user",
      entityId: user.id,
      branchId: user.branchId || undefined,
      metadata: {
        previousName,
        newName: updated.name,
      },
    });

    // Fetch branch name for consistent response
    let branchName: string | null = null;
    if (updated.branchId) {
      const [branch] = await db.select({ name: branches.name }).from(branches).where(eq(branches.id, updated.branchId)).limit(1);
      branchName = branch?.name || null;
    } else if (updated.role === "OWNER") {
      branchName = "All Branches (Owner)";
    }

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      branchId: updated.branchId,
      branchName,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Authenticated password change for user
   */
  static async changePassword(userId: string, actor: any, input: ChangePasswordInput) {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    const isCurrentValid = await argon2.verify(user.passwordHash, input.currentPassword);
    if (!isCurrentValid) {
      throw new AppError("Current password is incorrect", 400, "INVALID_PASSWORD");
    }

    const newHash = await argon2.hash(input.newPassword);
    await db
      .update(users)
      .set({
        passwordHash: newHash,
        updatedAt: sql`NOW()`,
      })
      .where(eq(users.id, userId));

    // Audit password change (safe: no passwords logged!)
    await AuditService.recordAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "PASSWORD_CHANGED",
      category: "AUTH",
      entityType: "user",
      entityId: user.id,
      branchId: user.branchId || undefined,
      metadata: {
        reason: "User self-service password update",
      },
    });

    return { message: "Password updated successfully" };
  }

  /**
   * Employee creates an account-change request
   */
  static async createAccountRequest(userId: string, actor: any, input: CreateAccountRequestInput) {
    // 1. Verify user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    // 2. Prevent duplicate pending requests of the same type
    const [existingPending] = await db
      .select()
      .from(accountRequests)
      .where(
        and(
          eq(accountRequests.userId, userId),
          eq(accountRequests.type, input.type),
          eq(accountRequests.status, "PENDING")
        )
      )
      .limit(1);

    if (existingPending) {
      throw new AppError(
        `You already have a pending ${input.type.replace(/_/g, " ").toLowerCase()} request awaiting review`,
        400,
        "DUPLICATE_REQUEST"
      );
    }

    // 3. For email changes, ensure proposed email is not already taken
    if (input.type === "EMAIL_CHANGE" && input.proposedEmail) {
      const [emailInUse] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.proposedEmail.toLowerCase()))
        .limit(1);

      if (emailInUse) {
        throw new AppError("The proposed email address is already registered to another account", 400, "EMAIL_EXISTS");
      }
    }

    const payload = input.type === "EMAIL_CHANGE" ? { proposedEmail: input.proposedEmail?.toLowerCase() } : null;

    const [created] = await db
      .insert(accountRequests)
      .values({
        userId,
        type: input.type,
        status: "PENDING",
        payload,
        reason: input.reason,
      })
      .returning();

    if (!created) {
      throw new AppError("Failed to create account request", 500);
    }

    // 4. Audit request submission
    await AuditService.recordAudit({
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      action: "ACCOUNT_REQUEST_CREATED",
      category: "USERS",
      entityType: "account_request",
      entityId: created.id,
      branchId: user.branchId || undefined,
      reason: input.reason,
      metadata: {
        requestType: input.type,
        payload,
      },
    });

    // 5. Notify system Owner
    await NotificationService.notifyOwner({
      title: "New Account Change Request",
      message: `${user.name} submitted a request: ${input.type.replace(/_/g, " ")}`,
      type: "ACCOUNT_REQUEST_SUBMITTED",
      priority: "IMPORTANT",
      entityType: "account_request",
      entityId: created.id,
      link: "/settings",
      metadata: {
        requesterName: user.name,
        requestType: input.type,
      },
    });

    return created;
  }

  /**
   * Get requests submitted by the current user
   */
  static async getMyAccountRequests(userId: string) {
    const list = await db
      .select()
      .from(accountRequests)
      .where(eq(accountRequests.userId, userId))
      .orderBy(desc(accountRequests.createdAt));

    return list;
  }

  /**
   * Owner: get all employee account requests with requester user metadata
   */
  static async getAllAccountRequests(query?: { status?: string | undefined }) {
    const conditions = query?.status ? [eq(accountRequests.status, query.status as any)] : [];

    const list = await db
      .select({
        id: accountRequests.id,
        userId: accountRequests.userId,
        type: accountRequests.type,
        status: accountRequests.status,
        payload: accountRequests.payload,
        reason: accountRequests.reason,
        decisionNotes: accountRequests.decisionNotes,
        reviewedBy: accountRequests.reviewedBy,
        reviewedAt: accountRequests.reviewedAt,
        createdAt: accountRequests.createdAt,
        updatedAt: accountRequests.updatedAt,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
        branchId: users.branchId,
        branchName: branches.name,
      })
      .from(accountRequests)
      .innerJoin(users, eq(accountRequests.userId, users.id))
      .leftJoin(branches, eq(users.branchId, branches.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(accountRequests.createdAt));

    return list;
  }

  /**
   * Owner: approve or reject an employee's account change request
   */
  static async decideAccountRequest(
    ownerId: string,
    ownerActor: any,
    requestId: string,
    decision: DecideAccountRequestInput
  ) {
    const [request] = await db
      .select()
      .from(accountRequests)
      .where(eq(accountRequests.id, requestId))
      .limit(1);

    if (!request) {
      throw new AppError("Account request not found", 404, "NOT_FOUND");
    }

    if (request.status !== "PENDING") {
      throw new AppError(`Cannot decide a request that is already ${request.status}`, 400, "INVALID_STATE");
    }

    const [requester] = await db.select().from(users).where(eq(users.id, request.userId)).limit(1);
    if (!requester) {
      throw new AppError("Requester user not found", 404, "NOT_FOUND");
    }

    let nextStatus: "APPROVED" | "REJECTED" | "COMPLETED" = decision.status;
    let decisionNotes = decision.decisionNotes || "";

    if (decision.status === "APPROVED") {
      // Execute the requested change safely
      if (request.type === "EMAIL_CHANGE") {
        const payload = request.payload as { proposedEmail?: string } | null;
        const proposedEmail = payload?.proposedEmail;
        if (!proposedEmail) {
          throw new AppError("Proposed email is missing in the request payload", 400, "INVALID_PAYLOAD");
        }

        // Verify proposed email is still available
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, proposedEmail.toLowerCase()))
          .limit(1);

        if (existing && existing.id !== requester.id) {
          throw new AppError("Proposed email is already in use by another account", 400, "EMAIL_EXISTS");
        }

        await db
          .update(users)
          .set({
            email: proposedEmail.toLowerCase(),
            updatedAt: sql`NOW()`,
          })
          .where(eq(users.id, requester.id));

        nextStatus = "COMPLETED";
      } else if (request.type === "PASSWORD_RESET") {
        // Reset password to a secure temporary password
        const tempPassword = `Gelana${Math.floor(100000 + Math.random() * 900000)}!`;
        const tempHash = await argon2.hash(tempPassword);

        await db
          .update(users)
          .set({
            passwordHash: tempHash,
            updatedAt: sql`NOW()`,
          })
          .where(eq(users.id, requester.id));

        decisionNotes = decisionNotes
          ? `${decisionNotes} | Temporary credentials generated: ${tempPassword}`
          : `Temporary credentials generated: ${tempPassword}. Please log in and change your password.`;

        nextStatus = "COMPLETED";
      } else {
        nextStatus = "COMPLETED";
      }
    }

    const [updated] = await db
      .update(accountRequests)
      .set({
        status: nextStatus,
        decisionNotes,
        reviewedBy: ownerId,
        reviewedAt: sql`NOW()`,
        updatedAt: sql`NOW()`,
      })
      .where(eq(accountRequests.id, requestId))
      .returning();

    // Audit the decision
    await AuditService.recordAudit({
      actorId: ownerId,
      actorName: ownerActor.name,
      actorRole: ownerActor.role,
      action: `ACCOUNT_REQUEST_${nextStatus}`,
      category: "USERS",
      entityType: "account_request",
      entityId: request.id,
      branchId: requester.branchId || undefined,
      reason: decisionNotes,
      metadata: {
        requesterId: requester.id,
        requesterName: requester.name,
        requestType: request.type,
        decision: nextStatus,
      },
    });

    // Notify the requester of the decision outcome
    await NotificationService.createNotification({
      recipientUserId: requester.id,
      title: "Account Request Update",
      message:
        nextStatus === "COMPLETED"
          ? `Your ${request.type.replace(/_/g, " ")} request has been approved and completed.`
          : `Your ${request.type.replace(/_/g, " ")} request was rejected.`,
      type: "ACCOUNT_REQUEST_DECIDED",
      priority: "IMPORTANT",
      entityType: "account_request",
      entityId: request.id,
      link: "/settings",
      metadata: {
        status: nextStatus,
        notes: decisionNotes,
      },
    });

    return updated;
  }
}
