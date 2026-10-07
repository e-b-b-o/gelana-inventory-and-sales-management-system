import { describe, it, expect } from "vitest";
import { createBranchSchema } from "./schema.js";

describe("Branches Validation Schema", () => {
  it("should accept valid branch input with address and phone", () => {
    const input = {
      name: "Main Branch",
      code: "MAIN",
      address: "Downtown Addis",
      phoneNumber: "0911234567",
    };
    const result = createBranchSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("should accept valid branch input without optional fields", () => {
    const input = {
      name: "Branch 2",
      code: "BR2",
    };
    const result = createBranchSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("should reject branch input with too short name", () => {
    const input = {
      name: "B",
      code: "B",
    };
    const result = createBranchSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Name must be at least 2 characters");
    }
  });

  it("should reject branch input without required code", () => {
    const input = {
      name: "Branch X",
    };
    const result = createBranchSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]).toBeDefined();
    }
  });
});
