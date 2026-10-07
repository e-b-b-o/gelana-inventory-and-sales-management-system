import { describe, it, expect } from "vitest";
import { createCategorySchema, updateCategorySchema, updateCategoryStatusSchema } from "./schema.js";

describe("Categories Validation Schema", () => {
  describe("createCategorySchema", () => {
    it("should accept valid category name", () => {
      const result = createCategorySchema.safeParse({ name: "Writing" });
      expect(result.success).toBe(true);
    });

    it("should reject empty category name", () => {
      const result = createCategorySchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("should reject whitespace-only category name", () => {
      const result = createCategorySchema.safeParse({ name: "   " });
      expect(result.success).toBe(false);
    });

    it("should reject excessively long category name", () => {
      const longName = "A".repeat(101);
      const result = createCategorySchema.safeParse({ name: longName });
      expect(result.success).toBe(false);
    });
  });

  describe("updateCategorySchema", () => {
    it("should accept valid category name", () => {
      const result = updateCategorySchema.safeParse({ name: "Updated Writing" });
      expect(result.success).toBe(true);
    });
  });

  describe("updateCategoryStatusSchema", () => {
    it("should accept valid boolean", () => {
      const result = updateCategoryStatusSchema.safeParse({ isActive: false });
      expect(result.success).toBe(true);
    });

    it("should reject non-boolean status", () => {
      const result = updateCategoryStatusSchema.safeParse({ isActive: "true" });
      expect(result.success).toBe(false);
    });
  });
});
