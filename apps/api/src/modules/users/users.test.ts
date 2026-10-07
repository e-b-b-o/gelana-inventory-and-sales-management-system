import { describe, it, expect } from "vitest";
import { createUserSchema } from "./schema.js";

describe("Users Validation Schema", () => {
  it("should accept valid OWNER input", () => {
    const input = {
      name: "Owner User",
      email: "owner@test.com",
      password: "password123",
      role: "OWNER",
      branchId: null,
    };
    const result = createUserSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("should accept valid EMPLOYEE input with branchId", () => {
    const input = {
      name: "Employee User",
      email: "employee@test.com",
      password: "password123",
      role: "EMPLOYEE",
      branchId: "550e8400-e29b-41d4-a716-446655440000",
    };
    const result = createUserSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("should reject EMPLOYEE input without branchId", () => {
    const input = {
      name: "Employee User",
      email: "employee@test.com",
      password: "password123",
      role: "EMPLOYEE",
      branchId: null,
    };
    const result = createUserSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Branch assignment is required for employees");
    }
  });

  it("should reject invalid email format", () => {
    const input = {
      name: "User",
      email: "invalid-email",
      password: "password123",
      role: "OWNER",
    };
    const result = createUserSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Invalid email format");
    }
  });
});

import { reassignBranchSchema } from "./schema.js";

describe("Reassign Branch Schema", () => {
  it("should accept valid reassign branch input", () => {
    const input = {
      newBranchId: "550e8400-e29b-41d4-a716-446655440000",
      reason: "Moving to downtown",
    };
    const result = reassignBranchSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("should reject invalid new branch id", () => {
    const input = {
      newBranchId: "invalid-uuid",
    };
    const result = reassignBranchSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
