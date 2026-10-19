import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as argon2 from "argon2";
import { loginSchema } from "./schema.js";
import { authenticateUser } from "./service.js";
import { createUserSchema } from "../users/schema.js";
import { ChangePasswordSchema, CreateAccountRequestSchema } from "../settings/schema.js";
import { db } from "../../config/database.js";
import { users, branches, auditLogs, products } from "../../database/schema/index.js";
import { eq, and } from "drizzle-orm";
import { SalesService } from "../sales/service.js";
import { ClosingService } from "../closing/service.js";
import { TransfersService } from "../transfers/service.js";
import { ReportsService } from "../reports/service.js";
import { SettingsService } from "../settings/service.js";
import { errorHandler } from "../../middleware/errorHandler.js";

describe("Phase 4: Security Audit, Input Validation & Regression Verification", () => {
  beforeAll(async () => {
    const defaultHash = await argon2.hash("password123");
    for (const email of [
      "owner@gelana.com",
      "downtown@gelana.com",
      "employee@gelana.com",
      "warehouse@gelana.com",
    ]) {
      await db.update(users).set({ passwordHash: defaultHash }).where(eq(users.email, email));
    }
  });

  afterAll(async () => {
    const defaultHash = await argon2.hash("password123");
    for (const email of [
      "owner@gelana.com",
      "downtown@gelana.com",
      "employee@gelana.com",
      "warehouse@gelana.com",
    ]) {
      await db.update(users).set({ passwordHash: defaultHash }).where(eq(users.email, email));
    }
  });
  describe("1. Email Validation & Normalization", () => {
    it("accepts valid standard email address in loginSchema", () => {
      const result = loginSchema.safeParse({
        email: "owner@gelana.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("owner@gelana.com");
      }
    });

    it("normalizes email with leading/trailing whitespace and uppercase characters", () => {
      const result = loginSchema.safeParse({
        email: "   Owner@Gelana.COM   ",
        password: "password123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("owner@gelana.com");
      }
    });

    it("rejects empty email field when required", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects email with missing local part", () => {
      const result = loginSchema.safeParse({
        email: "@gelana.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects email with missing domain", () => {
      const result = loginSchema.safeParse({
        email: "owner@",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects email with malformed separators or repeated @ characters", () => {
      const result = loginSchema.safeParse({
        email: "owner@@gelana.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects email exceeding maximum allowed length of 255 characters", () => {
      const longEmail = `${"a".repeat(250)}@gelana.com`;
      const result = loginSchema.safeParse({
        email: longEmail,
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("too long"))).toBe(true);
      }
    });

    it("validates proposed email in CreateAccountRequestSchema", () => {
      const valid = CreateAccountRequestSchema.safeParse({
        type: "EMAIL_CHANGE",
        proposedEmail: "  New.Email@Gelana.com  ",
        reason: "Role transfer",
      });
      expect(valid.success).toBe(true);
      if (valid.success) {
        expect(valid.data.proposedEmail).toBe("new.email@gelana.com");
      }

      const invalid = CreateAccountRequestSchema.safeParse({
        type: "EMAIL_CHANGE",
        proposedEmail: "not-an-email",
      });
      expect(invalid.success).toBe(false);
    });
  });

  describe("2. Password Validation Policy & DoS Protection", () => {
    it("rejects empty or missing password", () => {
      const missing = createUserSchema.safeParse({
        name: "Test User",
        email: "test@gelana.com",
        role: "OWNER",
      });
      expect(missing.success).toBe(false);

      const empty = createUserSchema.safeParse({
        name: "Test User",
        email: "test@gelana.com",
        password: "",
        role: "OWNER",
      });
      expect(empty.success).toBe(false);
    });

    it("rejects password containing only whitespace", () => {
      const result = createUserSchema.safeParse({
        name: "Test User",
        email: "test@gelana.com",
        password: "       ",
        role: "OWNER",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("whitespace"))).toBe(true);
      }
    });

    it("rejects password shorter than minimum permitted length of 6 characters", () => {
      const result = createUserSchema.safeParse({
        name: "Test User",
        email: "test@gelana.com",
        password: "12345",
        role: "OWNER",
      });
      expect(result.success).toBe(false);
    });

    it("accepts password at minimum permitted length of 6 characters", () => {
      const result = createUserSchema.safeParse({
        name: "Test User",
        email: "test@gelana.com",
        password: "123456",
        role: "OWNER",
      });
      expect(result.success).toBe(true);
    });

    it("rejects password exceeding maximum 128 characters to protect against Argon2 DoS", () => {
      const longPassword = "A".repeat(129);
      const result = createUserSchema.safeParse({
        name: "Test User",
        email: "test@gelana.com",
        password: longPassword,
        role: "OWNER",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message.includes("128"))).toBe(true);
      }
    });

    it("accepts passwords containing diverse special characters", () => {
      const result = createUserSchema.safeParse({
        name: "Test User",
        email: "test@gelana.com",
        password: "P@ssw0rd!#%^&*()-_+=",
        role: "OWNER",
      });
      expect(result.success).toBe(true);
    });

    it("enforces same password length & whitespace rules in ChangePasswordSchema", () => {
      const whitespaceOnly = ChangePasswordSchema.safeParse({
        currentPassword: "password123",
        newPassword: "      ",
      });
      expect(whitespaceOnly.success).toBe(false);

      const tooLong = ChangePasswordSchema.safeParse({
        currentPassword: "password123",
        newPassword: "X".repeat(129),
      });
      expect(tooLong.success).toBe(false);

      const validChange = ChangePasswordSchema.safeParse({
        currentPassword: "password123",
        newPassword: "newSecurePassword123!",
      });
      expect(validChange.success).toBe(true);
    });
  });

  describe("3. Login & Authentication Security", () => {
    it("successfully authenticates all fixed manual-test accounts", async () => {
      const testAccounts = [
        "owner@gelana.com",
        "downtown@gelana.com",
        "employee@gelana.com",
        "warehouse@gelana.com",
      ];

      for (const email of testAccounts) {
        const user = await authenticateUser({
          email,
          password: "password123",
        });
        expect(user).toBeTruthy();
        expect(user.email).toBe(email);
        expect((user as any).passwordHash).toBeUndefined();
      }
    });

    it("rejects incorrect password with generic error message", async () => {
      await expect(
        authenticateUser({
          email: "owner@gelana.com",
          password: "wrongPassword123",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("rejects non-existent email with identical generic error message (anti-enumeration)", async () => {
      await expect(
        authenticateUser({
          email: "nonexistent.user@gelana.com",
          password: "password123",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("never exposes plain-text passwords or hashes in authenticateUser response", async () => {
      const user = await authenticateUser({
        email: "owner@gelana.com",
        password: "password123",
      });
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("role");
      expect((user as any).password).toBeUndefined();
      expect((user as any).passwordHash).toBeUndefined();
    });
  });

  describe("4. Owner/Employee Permissions & Strict Branch Isolation", () => {
    it("prohibits employee from recording sales for another branch", async () => {
      const [employee] = await db
        .select()
        .from(users)
        .where(eq(users.email, "downtown@gelana.com"))
        .limit(1);
      expect(employee).toBeTruthy();
      expect(employee!.branchId).toBeTruthy();

      const [otherBranch] = await db
        .select()
        .from(branches)
        .where(eq(branches.name, "Warehouse Branch"))
        .limit(1);
      expect(otherBranch).toBeTruthy();

      await expect(
        SalesService.createSale(
          {
            branchId: otherBranch!.id,
            items: [],
            payments: [],
          },
          {
            id: employee!.id,
            role: employee!.role,
            branchId: employee!.branchId,
          }
        )
      ).rejects.toThrow(/permission to record sales for another branch/i);
    });

    it("prohibits employee from submitting daily closing for another branch", async () => {
      const [employee] = await db
        .select()
        .from(users)
        .where(eq(users.email, "downtown@gelana.com"))
        .limit(1);

      const [otherBranch] = await db
        .select()
        .from(branches)
        .where(eq(branches.name, "Warehouse Branch"))
        .limit(1);

      await expect(
        ClosingService.submitClosing(
          {
            branchId: otherBranch!.id,
            date: "2026-10-19",
            actualCash: 0,
            allSalesRecorded: true,
          },
          {
            id: employee!.id,
            role: "EMPLOYEE",
            branchId: employee!.branchId,
          }
        )
      ).rejects.toThrow(/Access denied: Employees can only submit for their assigned branch/i);
    });

    it("prohibits employee from requesting transfer not involving their assigned branch", async () => {
      const [employee] = await db
        .select()
        .from(users)
        .where(eq(users.email, "downtown@gelana.com"))
        .limit(1);

      const allBranches = await db.select().from(branches).limit(3);
      const foreignBranches = allBranches.filter((b) => b.id !== employee!.branchId);
      const [sampleProduct] = await db.select().from(products).limit(1);

      if (foreignBranches.length >= 2 && sampleProduct) {
        await expect(
          TransfersService.createTransfer(
            {
              sourceBranchId: foreignBranches[0]!.id,
              destinationBranchId: foreignBranches[1]!.id,
              items: [{ productId: sampleProduct.id, requestedQuantity: 5 }],
            },
            {
              id: employee!.id,
              role: "EMPLOYEE",
              branchId: employee!.branchId,
            }
          )
        ).rejects.toThrow(/You can only request transfers where your assigned branch is the destination or source/i);
      }
    });

    it("prohibits employee from accessing another branch's sales report", async () => {
      const [employee] = await db
        .select()
        .from(users)
        .where(eq(users.email, "downtown@gelana.com"))
        .limit(1);

      const [otherBranch] = await db
        .select()
        .from(branches)
        .where(eq(branches.name, "Warehouse Branch"))
        .limit(1);

      await expect(
        ReportsService.getSalesReport(
          {
            branchId: otherBranch!.id,
          },
          {
            id: employee!.id,
            role: "EMPLOYEE",
            branchId: employee!.branchId,
          }
        )
      ).rejects.toThrow(/You do not have permission to access another branch's reports/i);
    });

    it("strips WAC and valuation for employee in inventory report", async () => {
      const [employee] = await db
        .select()
        .from(users)
        .where(eq(users.email, "downtown@gelana.com"))
        .limit(1);

      const report = await ReportsService.getInventoryReport(
        {
          branchId: employee!.branchId!,
          view: "balances",
        },
        {
          id: employee!.id,
          role: "EMPLOYEE",
          branchId: employee!.branchId,
        }
      );

      expect(report).toBeTruthy();
      expect((report as any).summary.totalValuation).toBeNull();
      for (const item of (report as any).records) {
        expect(item.wac).toBeNull();
        expect(item.valuation).toBeNull();
      }
    });
  });

  describe("5. Password Privacy in Audit Records", () => {
    it("does not store plain-text temporary password in audit_logs during password reset approval", async () => {
      const [owner] = await db
        .select()
        .from(users)
        .where(eq(users.email, "owner@gelana.com"))
        .limit(1);

      const [sampleBranch] = await db.select().from(branches).limit(1);

      // Create a dedicated isolated test employee
      const [testUser] = await db
        .insert(users)
        .values({
          name: "Temp Security Audit User",
          email: "temp.security.test@gelana.com",
          passwordHash: await argon2.hash("tempInitialPass123!"),
          role: "EMPLOYEE",
          branchId: sampleBranch!.id,
        })
        .returning();

      // Create a password reset request
      const req = await SettingsService.createAccountRequest(
        testUser!.id,
        { id: testUser!.id, name: testUser!.name, role: "EMPLOYEE" },
        {
          type: "PASSWORD_RESET",
          reason: "Security audit verification test",
        }
      );

      expect(req).toBeTruthy();

      // Owner approves request
      const decided = await SettingsService.decideAccountRequest(
        owner!.id,
        { id: owner!.id, name: owner!.name, role: "OWNER" },
        req!.id,
        {
          status: "APPROVED",
          decisionNotes: "Approved during Phase 4 verification",
        }
      );

      expect(decided).toBeTruthy();

      // Check the completion audit log entry for this request
      const [auditEntry] = await db
        .select()
        .from(auditLogs)
        .where(
          and(
            eq(auditLogs.entityId, req!.id),
            eq(auditLogs.action, "ACCOUNT_REQUEST_COMPLETED")
          )
        )
        .limit(1);

      expect(auditEntry).toBeTruthy();
      // Ensure the audit entry reason NEVER contains the generated password
      expect(auditEntry!.reason).not.toContain("Gelana");
      expect(auditEntry!.reason).toBe(
        "Password reset request approved and temporary credentials issued to user"
      );

      // Clean up test fixture
      await db.delete(auditLogs).where(eq(auditLogs.entityId, req!.id));
      await db.delete(users).where(eq(users.id, testUser!.id));
    });
  });

  describe("6. Error Handler & PostgreSQL Constraint Mapping", () => {
    it("maps 23505 unique constraint violation to HTTP 409 CONFLICT", () => {
      let responseStatus = 0;
      let responseBody: any = null;

      const mockRes: any = {
        status(code: number) {
          responseStatus = code;
          return this;
        },
        json(body: any) {
          responseBody = body;
          return this;
        },
      };

      const pgUniqueError: any = new Error("duplicate key value violates unique constraint");
      pgUniqueError.code = "23505";
      pgUniqueError.detail = "Key (email)=(duplicate@gelana.com) already exists.";

      errorHandler(pgUniqueError, {} as any, mockRes, (() => {}) as any);

      expect(responseStatus).toBe(409);
      expect(responseBody?.error?.code).toBe("CONFLICT");
      expect(responseBody?.error?.message).toContain("Unique constraint conflict");
    });

    it("maps 23503 foreign key violation to HTTP 400 FOREIGN_KEY_VIOLATION", () => {
      let responseStatus = 0;
      let responseBody: any = null;

      const mockRes: any = {
        status(code: number) {
          responseStatus = code;
          return this;
        },
        json(body: any) {
          responseBody = body;
          return this;
        },
      };

      const pgFkError: any = new Error("violates foreign key constraint");
      pgFkError.code = "23503";

      errorHandler(pgFkError, {} as any, mockRes, (() => {}) as any);

      expect(responseStatus).toBe(400);
      expect(responseBody?.error?.code).toBe("FOREIGN_KEY_VIOLATION");
    });
  });
});
