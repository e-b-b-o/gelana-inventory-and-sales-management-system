import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AuditService } from "./service.js";
import { db } from "../../config/database.js";
import { users, branches, auditLogs } from "../../database/schema/index.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

describe("Milestone 11 — Audit Log Service", () => {
  let ownerId: string;
  let employeeId: string;
  let branchAId: string;
  let branchBId: string;

  beforeEach(async () => {
    ownerId = crypto.randomUUID();
    employeeId = crypto.randomUUID();
    branchAId = crypto.randomUUID();
    branchBId = crypto.randomUUID();

    await db.insert(branches).values([
      { id: branchAId, name: "Audit Branch A", code: `AA-${branchAId.substring(0, 4)}` },
      { id: branchBId, name: "Audit Branch B", code: `AB-${branchBId.substring(0, 4)}` },
    ]);

    await db.insert(users).values([
      {
        id: ownerId,
        email: `owner-${ownerId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Audit Owner",
        role: "OWNER",
      },
      {
        id: employeeId,
        email: `emp-${employeeId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Audit Employee",
        role: "EMPLOYEE",
        branchId: branchAId,
      },
    ]);
  });

  afterEach(async () => {
    await db.delete(auditLogs).where(eq(auditLogs.actorId, ownerId));
    await db.delete(auditLogs).where(eq(auditLogs.actorId, employeeId));
    await db.delete(users).where(eq(users.id, employeeId));
    await db.delete(users).where(eq(users.id, ownerId));
    await db.delete(branches).where(eq(branches.id, branchAId));
    await db.delete(branches).where(eq(branches.id, branchBId));
  });

  it("records audit logs accurately and automatically sanitizes sensitive fields from metadata", async () => {
    const record = await AuditService.recordAudit({
      actorId: ownerId,
      actorName: "Audit Owner",
      actorRole: "OWNER",
      action: "USER_UPDATED",
      category: "USERS",
      entityType: "user",
      entityId: employeeId,
      branchId: branchAId,
      reason: "Promoted employee",
      metadata: {
        role: "EMPLOYEE",
        password: "secret_password_123",
        passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$abc",
        token: "jwt_bearer_token",
        allowedField: "safe value",
      },
    });

    expect(record.id).toBeTruthy();
    expect(record.action).toBe("USER_UPDATED");
    expect(record.reason).toBe("Promoted employee");

    // Critical security check: sensitive keys must be completely removed
    const meta = record.metadata as any;
    expect(meta.allowedField).toBe("safe value");
    expect(meta.password).toBeUndefined();
    expect(meta.passwordHash).toBeUndefined();
    expect(meta.token).toBeUndefined();
  });

  it("supports comprehensive search, category filtering, and pagination for Owner", async () => {
    await AuditService.recordAudit({
      actorId: ownerId,
      actorName: "Audit Owner",
      actorRole: "OWNER",
      action: "STOCK_ADJUSTED",
      category: "INVENTORY",
      entityType: "inventory_movement",
      branchId: branchAId,
      reason: "Physical count recount correction",
    });

    await AuditService.recordAudit({
      actorId: ownerId,
      actorName: "Audit Owner",
      actorRole: "OWNER",
      action: "TRANSFER_APPROVED",
      category: "TRANSFERS",
      entityType: "transfer",
      branchId: branchBId,
      reason: "Approved emergency shipment",
    });

    const ownerUser = { id: ownerId, role: "OWNER" };

    // Filter by category
    const invResults = await AuditService.getAuditLogs(ownerUser, {
      category: "INVENTORY",
      page: 1,
      limit: 10,
    });
    expect(invResults.logs.some((l) => l.action === "STOCK_ADJUSTED")).toBe(true);
    expect(invResults.logs.every((l) => l.category === "INVENTORY")).toBe(true);

    // Search query
    const searchResults = await AuditService.getAuditLogs(ownerUser, {
      search: "recount correction",
      page: 1,
      limit: 10,
    });
    expect(searchResults.logs.length).toBeGreaterThanOrEqual(1);
    expect(searchResults.logs[0]!.reason).toContain("recount correction");
  });

  it("enforces role and branch security: employees cannot view unrestricted or sensitive audit history", async () => {
    // 1. Audit event at branch A (INVENTORY)
    await AuditService.recordAudit({
      actorId: employeeId,
      actorName: "Audit Employee",
      actorRole: "EMPLOYEE",
      action: "STOCK_ADJUSTED",
      category: "INVENTORY",
      entityType: "inventory_movement",
      branchId: branchAId,
      reason: "Routine recount",
    });

    // 2. Audit event at branch B (TRANSFERS)
    await AuditService.recordAudit({
      actorId: ownerId,
      actorName: "Audit Owner",
      actorRole: "OWNER",
      action: "TRANSFER_APPROVED",
      category: "TRANSFERS",
      entityType: "transfer",
      branchId: branchBId,
      reason: "Branch B only",
    });

    // 3. Sensitive audit event at branch A (AUTH / PASSWORD_CHANGED)
    await AuditService.recordAudit({
      actorId: ownerId,
      actorName: "Audit Owner",
      actorRole: "OWNER",
      action: "PASSWORD_CHANGED",
      category: "AUTH",
      entityType: "user",
      branchId: branchAId,
    });

    const employeeUser = { id: employeeId, role: "EMPLOYEE", branchId: branchAId };

    const employeeLogs = await AuditService.getAuditLogs(employeeUser, { page: 1, limit: 20 });

    // Employee must only see their assigned branch
    expect(employeeLogs.logs.every((l) => l.branchId === branchAId)).toBe(true);
    expect(employeeLogs.logs.some((l) => l.branchId === branchBId)).toBe(false);

    // Employee must NOT see sensitive AUTH or USERS category records
    expect(employeeLogs.logs.some((l) => l.category === "AUTH")).toBe(false);
  });
});
