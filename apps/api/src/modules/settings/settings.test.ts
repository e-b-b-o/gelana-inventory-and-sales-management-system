import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SettingsService } from "./service.js";
import { db } from "../../config/database.js";
import { users, branches, accountRequests, auditLogs, notifications } from "../../database/schema/index.js";
import { eq, and } from "drizzle-orm";
import * as argon2 from "argon2";
import crypto from "crypto";

describe("Milestone 11 — Settings & Account Requests Service", () => {
  let ownerId: string;
  let employeeId: string;
  let branchId: string;
  let ownerEmail: string;
  let employeeEmail: string;

  beforeEach(async () => {
    ownerId = crypto.randomUUID();
    employeeId = crypto.randomUUID();
    branchId = crypto.randomUUID();
    ownerEmail = `owner-${ownerId.substring(0, 6)}@test.com`;
    employeeEmail = `emp-${employeeId.substring(0, 6)}@test.com`;

    const initialPasswordHash = await argon2.hash("oldPassword123!");

    await db.insert(branches).values({
      id: branchId,
      name: "Settings Test Branch",
      code: `ST-${branchId.substring(0, 4)}`,
    });

    await db.insert(users).values([
      {
        id: ownerId,
        email: ownerEmail,
        passwordHash: initialPasswordHash,
        name: "Initial Owner Name",
        role: "OWNER",
      },
      {
        id: employeeId,
        email: employeeEmail,
        passwordHash: initialPasswordHash,
        name: "Initial Employee Name",
        role: "EMPLOYEE",
        branchId,
      },
    ]);
  });

  afterEach(async () => {
    await db.delete(notifications).where(eq(notifications.userId, ownerId));
    await db.delete(notifications).where(eq(notifications.userId, employeeId));
    await db.delete(accountRequests).where(eq(accountRequests.userId, employeeId));
    await db.delete(auditLogs).where(eq(auditLogs.actorId, ownerId));
    await db.delete(auditLogs).where(eq(auditLogs.actorId, employeeId));
    await db.delete(users).where(eq(users.id, employeeId));
    await db.delete(users).where(eq(users.id, ownerId));
    await db.delete(branches).where(eq(branches.id, branchId));
  });

  it("retrieves current saved profile with branch details and non-sensitive fields", async () => {
    const profile = await SettingsService.getProfile(employeeId);
    expect(profile.id).toBe(employeeId);
    expect(profile.name).toBe("Initial Employee Name");
    expect(profile.email).toBe(employeeEmail);
    expect(profile.role).toBe("EMPLOYEE");
    expect(profile.branchId).toBe(branchId);
    expect(profile.branchName).toBe("Settings Test Branch");
    expect(profile.isActive).toBe(true);
    expect((profile as any).passwordHash).toBeUndefined();

    // Owner profile shows All Branches (Owner)
    const ownerProfile = await SettingsService.getProfile(ownerId);
    expect(ownerProfile.role).toBe("OWNER");
    expect(ownerProfile.branchName).toBe("All Branches (Owner)");
  });

  it("updates user display name, persists changes, and logs an audit record", async () => {
    const updated = await SettingsService.updateProfile(
      employeeId,
      { id: employeeId, role: "EMPLOYEE", name: "Initial Employee Name" },
      { name: "Updated Employee Name" }
    );

    expect(updated.name).toBe("Updated Employee Name");
    expect(updated.branchName).toBe("Settings Test Branch");

    // Verify DB
    const [dbUser] = await db.select().from(users).where(eq(users.id, employeeId));
    expect(dbUser!.name).toBe("Updated Employee Name");

    // Verify Audit
    const [audit] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.actorId, employeeId))
      .orderBy(eq(auditLogs.action, "PROFILE_UPDATED"));
    expect(audit).toBeTruthy();
    expect(audit!.action).toBe("PROFILE_UPDATED");
  });

  it("changes password with current password verification and argon2 hashing", async () => {
    // 1. Invalid current password fails
    await expect(
      SettingsService.changePassword(
        ownerId,
        { id: ownerId, role: "OWNER" },
        { currentPassword: "wrongPassword", newPassword: "newSecurePassword99!" }
      )
    ).rejects.toThrow("Current password is incorrect");

    // 2. Valid current password succeeds
    const result = await SettingsService.changePassword(
      ownerId,
      { id: ownerId, role: "OWNER" },
      { currentPassword: "oldPassword123!", newPassword: "newSecurePassword99!" }
    );
    expect(result.message).toContain("successfully");

    // 3. New password verifies against DB hash
    const [ownerRecord] = await db.select().from(users).where(eq(users.id, ownerId));
    const isNewValid = await argon2.verify(ownerRecord!.passwordHash, "newSecurePassword99!");
    expect(isNewValid).toBe(true);
  });

  it("manages employee account requests lifecycle: submit, duplicate block, owner approval, and email update", async () => {
    const newProposedEmail = `new-email-${employeeId.substring(0, 6)}@test.com`;

    // 1. Submit email change request
    const req = await SettingsService.createAccountRequest(
      employeeId,
      { id: employeeId, name: "Initial Employee Name", role: "EMPLOYEE" },
      {
        type: "EMAIL_CHANGE",
        proposedEmail: newProposedEmail,
        reason: "Corporate email rebranding",
      }
    );
    expect(req).toBeTruthy();
    expect(req!.id).toBeTruthy();
    expect(req!.status).toBe("PENDING");

    // 2. Duplicate pending request of same type is blocked
    await expect(
      SettingsService.createAccountRequest(
        employeeId,
        { id: employeeId, name: "Initial Employee Name", role: "EMPLOYEE" },
        {
          type: "EMAIL_CHANGE",
          proposedEmail: "another@test.com",
        }
      )
    ).rejects.toThrow(/already have a pending/);

    // 3. Owner retrieves requests
    const allRequests = await SettingsService.getAllAccountRequests({ status: "PENDING" });
    const found = allRequests.find((r) => r.id === req!.id);
    expect(found).toBeTruthy();
    expect(found?.userEmail).toBe(employeeEmail);

    // 4. Owner approves request
    const decided = await SettingsService.decideAccountRequest(
      ownerId,
      { id: ownerId, name: "Initial Owner Name", role: "OWNER" },
      req!.id,
      {
        status: "APPROVED",
        decisionNotes: "Approved by Owner after review",
      }
    );
    expect(decided).toBeTruthy();
    expect(decided!.status).toBe("COMPLETED");

    // 5. Verification: user's email was updated in the users table
    const [updatedUser] = await db.select().from(users).where(eq(users.id, employeeId));
    expect(updatedUser!.email).toBe(newProposedEmail.toLowerCase());

    // 6. Verification: employee received notification of the outcome
    const notifs = await db.select().from(notifications).where(eq(notifications.userId, employeeId));
    expect(notifs.some((n) => n.type === "ACCOUNT_REQUEST_DECIDED")).toBe(true);
  });

  it("handles employee password reset request without exposing or accepting proposed passwords", async () => {
    // Submit password reset request (never accepts proposed password!)
    const req = await SettingsService.createAccountRequest(
      employeeId,
      { id: employeeId, name: "Initial Employee Name", role: "EMPLOYEE" },
      {
        type: "PASSWORD_RESET",
        reason: "Lost access to authenticator / password forgotten",
      }
    );

    expect(req).toBeTruthy();
    expect(req!.payload).toBeNull();

    // Owner approves request -> generates secure temporary credentials in decision notes
    const decided = await SettingsService.decideAccountRequest(
      ownerId,
      { id: ownerId, name: "Initial Owner Name", role: "OWNER" },
      req!.id,
      {
        status: "APPROVED",
        decisionNotes: "Reset authorized for employee",
      }
    );

    expect(decided).toBeTruthy();
    expect(decided!.status).toBe("COMPLETED");
    expect(decided!.decisionNotes).toContain("Temporary credentials generated");

    // Employee notified
    const [notif] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.entityId, req!.id), eq(notifications.userId, employeeId)));
    expect(notif!.type).toBe("ACCOUNT_REQUEST_DECIDED");
  });
});
