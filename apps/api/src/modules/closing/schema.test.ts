import { describe, it, expect } from "vitest";
import {
  submitClosingSchema,
  approveClosingSchema,
  rejectClosingSchema,
  getClosingHistoryQuerySchema,
  getCurrentClosingQuerySchema,
} from "./schema.js";

describe("Daily Closing Schema Validations", () => {
  describe("submitClosingSchema", () => {
    it("should accept valid numeric actualCash", () => {
      const parsed = submitClosingSchema.safeParse({
        date: "2026-10-14",
        actualCash: 500,
        discrepancyReason: "Balanced",
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.actualCash).toBe(500);
      }
    });

    it("should parse and transform string actualCash", () => {
      const parsed = submitClosingSchema.safeParse({
        date: "2026-10-14",
        actualCash: "1250.50",
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.actualCash).toBe(1250.5);
      }
    });

    it("should reject negative actualCash", () => {
      const parsed = submitClosingSchema.safeParse({
        date: "2026-10-14",
        actualCash: -50,
      });
      expect(parsed.success).toBe(false);
    });

    it("should reject invalid non-date format", () => {
      const parsed = submitClosingSchema.safeParse({
        date: "invalid-date",
        actualCash: 100,
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe("approveClosingSchema", () => {
    it("should accept valid approval notes", () => {
      const parsed = approveClosingSchema.safeParse({ notes: "All verified" });
      expect(parsed.success).toBe(true);
    });
  });

  describe("rejectClosingSchema", () => {
    it("should require reason for rejection", () => {
      const empty = rejectClosingSchema.safeParse({ reason: "" });
      expect(empty.success).toBe(false);

      const valid = rejectClosingSchema.safeParse({ reason: "Drawer 1 was not reconciled." });
      expect(valid.success).toBe(true);
    });
  });

  describe("getClosingHistoryQuerySchema", () => {
    it("should apply default page and limit", () => {
      const parsed = getClosingHistoryQuerySchema.safeParse({});
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.page).toBe(1);
        expect(parsed.data.limit).toBe(20);
      }
    });

    it("should coerce page and limit from query strings", () => {
      const parsed = getClosingHistoryQuerySchema.safeParse({
        page: "3",
        limit: "50",
        status: "APPROVED",
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.page).toBe(3);
        expect(parsed.data.limit).toBe(50);
        expect(parsed.data.status).toBe("APPROVED");
      }
    });
  });

  describe("getCurrentClosingQuerySchema", () => {
    it("should validate optional branchId and date", () => {
      const valid = getCurrentClosingQuerySchema.safeParse({
        branchId: "00000000-0000-4000-8000-000000000101",
        date: "2026-10-14",
      });
      expect(valid.success).toBe(true);
    });
  });
});
