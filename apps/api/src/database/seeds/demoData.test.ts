import { describe, it, expect, beforeAll } from "vitest";
import { db } from "../../config/database.js";
import { seedDatabase, SEED_IDS } from "./index.js";
import { seedDemoData, DEMO_IDS } from "./demoData.js";
import {
  sales,
  saleItems,
  salePayments,
  salesReturns,
  transfers,
  dailyClosings,
  users,
} from "../schema/index.js";
import { inArray } from "drizzle-orm";

describe("Demo Data Seeding & Idempotency", () => {
  beforeAll(async () => {
    // Ensure base master data exists
    await seedDatabase({ reset: true });
  });

  it("blocks demo seeding if NODE_ENV is set to production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      await expect(seedDemoData()).rejects.toThrow("DEMO SEEDING BLOCKED");
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it("seeds demo business data with multi-month coverage and valid relationships", async () => {
    const result = await seedDemoData();
    expect(result.success).toBe(true);

    // 1. Verify Sales
    const allDemoSales = await db
      .select()
      .from(sales)
      .where(inArray(sales.id, Object.values(DEMO_IDS.sales)));

    expect(allDemoSales.length).toBe(12);

    // Verify date coverage spanning August, September, October 2026
    const months = new Set(allDemoSales.map((s) => s.soldAt.slice(0, 7)));
    expect(months.has("2026-08")).toBe(true);
    expect(months.has("2026-09")).toBe(true);
    expect(months.has("2026-10")).toBe(true);

    // Verify multi-branch distribution
    const branchIds = new Set(allDemoSales.map((s) => s.branchId));
    expect(branchIds.has(SEED_IDS.branches.main)).toBe(true);
    expect(branchIds.has(SEED_IDS.branches.downtown)).toBe(true);

    // 2. Verify Returns
    const allDemoReturns = await db
      .select()
      .from(salesReturns)
      .where(inArray(salesReturns.id, Object.values(DEMO_IDS.returns)));

    expect(allDemoReturns.length).toBe(2);

    // 3. Verify Transfers across states
    const allDemoTransfers = await db
      .select()
      .from(transfers)
      .where(inArray(transfers.id, Object.values(DEMO_IDS.transfers)));

    expect(allDemoTransfers.length).toBe(4);
    const statuses = new Set(allDemoTransfers.map((t) => t.status));
    expect(statuses.has("COMPLETED")).toBe(true);
    expect(statuses.has("DISPATCHED")).toBe(true);
    expect(statuses.has("REQUESTED")).toBe(true);
    expect(statuses.has("DISCREPANCY")).toBe(true);

    // 4. Verify Daily Closings
    const allDemoClosings = await db
      .select()
      .from(dailyClosings)
      .where(inArray(dailyClosings.id, Object.values(DEMO_IDS.closings)));

    expect(allDemoClosings.length).toBe(4);
    for (const c of allDemoClosings) {
      expect(c.status).toBe("APPROVED");
      expect(Number(c.totalSalesAmount)).toBeGreaterThan(0);
    }
  });

  it("is strictly idempotent: running seedDemoData again does not duplicate or multiply records", async () => {
    const salesBefore = await db.select().from(sales);
    const itemsBefore = await db.select().from(saleItems);
    const paymentsBefore = await db.select().from(salePayments);
    const returnsBefore = await db.select().from(salesReturns);
    const transfersBefore = await db.select().from(transfers);
    const closingsBefore = await db.select().from(dailyClosings);

    // Run seeder a second time
    const secondRun = await seedDemoData();
    expect(secondRun.success).toBe(true);
    expect(secondRun.details.sales).toBe(0); // 0 new sales inserted

    const salesAfter = await db.select().from(sales);
    const itemsAfter = await db.select().from(saleItems);
    const paymentsAfter = await db.select().from(salePayments);
    const returnsAfter = await db.select().from(salesReturns);
    const transfersAfter = await db.select().from(transfers);
    const closingsAfter = await db.select().from(dailyClosings);

    expect(salesAfter.length).toBe(salesBefore.length);
    expect(itemsAfter.length).toBe(itemsBefore.length);
    expect(paymentsAfter.length).toBe(paymentsBefore.length);
    expect(returnsAfter.length).toBe(returnsBefore.length);
    expect(transfersAfter.length).toBe(transfersBefore.length);
    expect(closingsAfter.length).toBe(closingsBefore.length);
  });

  it("preserves fixed test accounts, branches, and credentials intact", async () => {
    const fixedUsers = await db.select().from(users);
    const emails = fixedUsers.map((u) => u.email).sort();
    expect(emails).toContain("owner@gelana.com");
    expect(emails).toContain("employee@gelana.com");
    expect(emails).toContain("downtown@gelana.com");
    expect(emails).toContain("warehouse@gelana.com");
  });
});
