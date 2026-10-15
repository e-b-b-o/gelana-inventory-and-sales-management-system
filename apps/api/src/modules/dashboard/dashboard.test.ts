import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DashboardService } from "./service.js";
import { db } from "../../config/database.js";
import {
  users,
  branches,
  categories,
  products,
  productUnits,
  productPrices,
  inventoryBalances,
  paymentMethods,
  sales,
  saleItems,
  salePayments,
  transfers,
  transferItems,
  dailyClosings,
} from "../../database/schema/index.js";
import { sql } from "drizzle-orm";
import crypto from "crypto";

describe("Milestone 10 — Dashboard Service (Slices 10.1 & 10.2)", () => {
  let branchAId: string;
  let branchBId: string;
  let ownerId: string;
  let employeeAId: string;
  let employeeBId: string;
  let categoryId: string;
  let product1Id: string;
  let product2Id: string;
  let unit1Id: string;
  let unit2Id: string;
  let cashMethodId: string;

  let ownerUser: any;
  let employeeAUser: any;
  let employeeBUser: any;

  beforeEach(async () => {
    branchAId = crypto.randomUUID();
    branchBId = crypto.randomUUID();
    ownerId = crypto.randomUUID();
    employeeAId = crypto.randomUUID();
    employeeBId = crypto.randomUUID();
    categoryId = crypto.randomUUID();
    product1Id = crypto.randomUUID();
    product2Id = crypto.randomUUID();
    unit1Id = crypto.randomUUID();
    unit2Id = crypto.randomUUID();
    cashMethodId = crypto.randomUUID();

    // 1. Create Branches
    await db.insert(branches).values([
      { id: branchAId, name: "Dashboard Test Branch A", code: `DA-${branchAId.substring(0, 4)}`, isActive: true },
      { id: branchBId, name: "Dashboard Test Branch B", code: `DB-${branchBId.substring(0, 4)}`, isActive: true },
    ]);

    // 2. Create Users
    await db.insert(users).values([
      {
        id: ownerId,
        email: `owner-${ownerId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Dashboard Test Owner",
        role: "OWNER",
      },
      {
        id: employeeAId,
        email: `empA-${employeeAId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Dashboard Test Employee A",
        role: "EMPLOYEE",
        branchId: branchAId,
      },
      {
        id: employeeBId,
        email: `empB-${employeeBId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Dashboard Test Employee B",
        role: "EMPLOYEE",
        branchId: branchBId,
      },
    ]);

    ownerUser = { id: ownerId, role: "OWNER", branchId: null };
    employeeAUser = { id: employeeAId, role: "EMPLOYEE", branchId: branchAId };
    employeeBUser = { id: employeeBId, role: "EMPLOYEE", branchId: branchBId };

    // 3. Category & Products
    await db.insert(categories).values({
      id: categoryId,
      name: `Dash Cat ${categoryId.substring(0, 6)}`,
      isActive: true,
    });

    await db.insert(products).values([
      {
        id: product1Id,
        name: "Notebook A5",
        sku: `NB-${product1Id.substring(0, 6)}`,
        categoryId,
        isActive: true,
      },
      {
        id: product2Id,
        name: "Ballpoint Pen Blue",
        sku: `BP-${product2Id.substring(0, 6)}`,
        categoryId,
        isActive: true,
      },
    ]);

    await db.insert(productUnits).values([
      { id: unit1Id, productId: product1Id, name: "Piece", isBase: true, isActive: true },
      { id: unit2Id, productId: product2Id, name: "Piece", isBase: true, isActive: true },
    ]);

    await db.insert(paymentMethods).values({
      id: cashMethodId,
      name: `Cash ${cashMethodId.substring(0, 4)}`,
      isActive: true,
    });

    // 4. Balances:
    // Branch A: Product 1 has 5 units (min 10 -> LOW STOCK), WAC = 50.00
    // Branch A: Product 2 has 0 units (min 5 -> OUT OF STOCK), WAC = 20.00
    // Valuation for Branch A = 5 * 50 = 250.00
    await db.insert(inventoryBalances).values([
      {
        branchId: branchAId,
        productId: product1Id,
        availableQuantity: 5,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        minimumStockQuantity: 10,
        wac: "50.00",
      },
      {
        branchId: branchAId,
        productId: product2Id,
        availableQuantity: 0,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        minimumStockQuantity: 5,
        wac: "20.00",
      },
    ]);
  });

  afterEach(async () => {
    // Clean up test data
    await db.delete(dailyClosings).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(transferItems).where(
      sql`transfer_id IN (SELECT id FROM transfers WHERE source_branch_id IN (${branchAId}, ${branchBId}) OR destination_branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(transfers).where(sql`source_branch_id IN (${branchAId}, ${branchBId}) OR destination_branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(salePayments).where(
      sql`sale_id IN (SELECT id FROM sales WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(saleItems).where(
      sql`sale_id IN (SELECT id FROM sales WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(sales).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(inventoryBalances).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(productPrices).where(sql`product_unit_id IN (${unit1Id}, ${unit2Id})`);
    await db.delete(productUnits).where(sql`product_id IN (${product1Id}, ${product2Id})`);
    await db.delete(products).where(sql`id IN (${product1Id}, ${product2Id})`);
    await db.delete(categories).where(sql`id = ${categoryId}`);
    await db.delete(paymentMethods).where(sql`id = ${cashMethodId}`);
    await db.delete(users).where(sql`id IN (${ownerId}, ${employeeAId}, ${employeeBId})`);
    await db.delete(branches).where(sql`id IN (${branchAId}, ${branchBId})`);
  });

  describe("Slice 10.1 — Owner Dashboard", () => {
    it("calculates accurate KPIs and inventory valuation from persisted data", async () => {
      // Create completed sales today for Branch A
      const saleId = crypto.randomUUID();
      await db.insert(sales).values({
        id: saleId,
        saleNumber: `SAL-${saleId.substring(0, 6)}`,
        branchId: branchAId,
        createdById: employeeAId,
        soldAt: new Date().toISOString(),
        subtotal: "500.00",
        saleDiscount: "0.00",
        grandTotal: "500.00",
        status: "COMPLETED",
      });

      const res = await DashboardService.getOwnerDashboard({
        branchId: branchAId,
        trendRange: "today",
      });

      expect(res.branchId).toBe(branchAId);
      expect(res.branchName).toBe("Dashboard Test Branch A");
      expect(res.kpis.todaySales).toBe(500.0);
      expect(res.kpis.todayTransactions).toBe(1);
      // 5 units * 50.00 WAC = 250.00
      expect(res.kpis.inventoryValuation).toBe(250.0);
      expect(res.kpis.lowStockCount).toBe(1);
      expect(res.kpis.outOfStockCount).toBe(1);
    });

    it("flags daily closing discrepancies and pending transfers in actionRequired", async () => {
      // 1. Insert a submitted closing with variance
      const closingId = crypto.randomUUID();
      await db.insert(dailyClosings).values({
        id: closingId,
        closingNumber: `CLS-${closingId.substring(0, 6)}`,
        branchId: branchAId,
        closingDate: "2026-10-15",
        status: "SUBMITTED",
        expectedCash: "1000.00",
        actualCash: "900.00",
        cashDifference: "-100.00",
        discrepancyReason: "Shortage of 100 ETB",
      });

      // 2. Insert a pending transfer request
      const transferId = crypto.randomUUID();
      await db.insert(transfers).values({
        id: transferId,
        transferNumber: `TRF-${transferId.substring(0, 6)}`,
        sourceBranchId: branchAId,
        destinationBranchId: branchBId,
        status: "REQUESTED",
        createdById: employeeAId,
      });

      await db.insert(transferItems).values({
        id: crypto.randomUUID(),
        transferId,
        productId: product1Id,
        requestedQuantity: 2,
      });

      const res = await DashboardService.getOwnerDashboard({
        branchId: branchAId,
        trendRange: "today",
      });

      expect(res.actionRequired.closingDiscrepancy.count).toBeGreaterThanOrEqual(1);
      const disc = res.actionRequired.closingDiscrepancy.items.find((i) => i.closingId === closingId);
      expect(disc).toBeDefined();
      expect(disc?.cashDifference).toBe(-100);

      expect(res.actionRequired.transferApprovals.count).toBeGreaterThanOrEqual(1);
      const trf = res.actionRequired.transferApprovals.items.find((i) => i.transferId === transferId);
      expect(trf).toBeDefined();
      expect(trf?.itemsCount).toBe(1);
    });

    it("supports multi-branch overview and sales trend intervals", async () => {
      const res = await DashboardService.getOwnerDashboard({
        trendRange: "7days",
      });

      expect(res.branchName).toBe("All Branches");
      expect(res.branchPerformance.length).toBeGreaterThanOrEqual(2);
      expect(res.salesTrend.range).toBe("7days");
      expect(res.salesTrend.intervals.length).toBe(7);
    });
  });

  describe("Slice 10.2 — Employee Dashboard", () => {
    it("scopes employee dashboard strictly to employee's assigned branch", async () => {
      // Sale by employee A in branch A
      const sale1Id = crypto.randomUUID();
      await db.insert(sales).values({
        id: sale1Id,
        saleNumber: `SAL-${sale1Id.substring(0, 6)}`,
        branchId: branchAId,
        createdById: employeeAId,
        soldAt: new Date().toISOString(),
        grandTotal: "350.00",
        status: "COMPLETED",
      });

      // Another sale in branch A by someone else
      const sale2Id = crypto.randomUUID();
      await db.insert(sales).values({
        id: sale2Id,
        saleNumber: `SAL-${sale2Id.substring(0, 6)}`,
        branchId: branchAId,
        createdById: ownerId,
        soldAt: new Date().toISOString(),
        grandTotal: "150.00",
        status: "COMPLETED",
      });

      const res = await DashboardService.getEmployeeDashboard({}, employeeAUser);

      expect(res.branchId).toBe(branchAId);
      expect(res.branchName).toBe("Dashboard Test Branch A");
      // Branch total: 350 + 150 = 500
      expect(res.kpis.todayBranchSales).toBe(500.0);
      expect(res.kpis.todayBranchTransactions).toBe(2);
      // Own total: 350
      expect(res.kpis.todayOwnSales).toBe(350.0);
      expect(res.kpis.todayOwnTransactions).toBe(1);
      // Stock alerts
      expect(res.kpis.lowStockCount).toBe(1);
      expect(res.kpis.outOfStockCount).toBe(1);
      expect(res.stockAlerts.length).toBe(2);
    });

    it("strictly prevents employees from requesting another branch dashboard", async () => {
      await expect(
        DashboardService.getEmployeeDashboard({ branchId: branchBId }, employeeAUser)
      ).rejects.toThrow("You do not have permission to access another branch's dashboard");
    });

    it("strictly omits owner financial fields (purchase cost, wac, valuation) from employee payload", async () => {
      const res = (await DashboardService.getEmployeeDashboard({}, employeeAUser)) as any;

      expect(res.inventoryValuation).toBeUndefined();
      expect(res.kpis.inventoryValuation).toBeUndefined();
      expect(res.grossProfit).toBeUndefined();
      expect(res.wac).toBeUndefined();

      for (const alert of res.stockAlerts) {
        expect((alert as any).wac).toBeUndefined();
        expect((alert as any).unitCost).toBeUndefined();
        expect((alert as any).purchasePrice).toBeUndefined();
      }
    });

    it("displays closing status and dispatched inbound transfers", async () => {
      // Create dispatched transfer from Branch B to Branch A
      const transferId = crypto.randomUUID();
      await db.insert(transfers).values({
        id: transferId,
        transferNumber: `TRF-${transferId.substring(0, 6)}`,
        sourceBranchId: branchBId,
        destinationBranchId: branchAId,
        status: "DISPATCHED",
        createdById: employeeBId,
        dispatchedById: employeeBId,
        dispatchedAt: new Date().toISOString(),
      });

      await db.insert(transferItems).values({
        id: crypto.randomUUID(),
        transferId,
        productId: product1Id,
        requestedQuantity: 5,
        dispatchedQuantity: 5,
      });

      const res = await DashboardService.getEmployeeDashboard({}, employeeAUser);

      expect(res.pendingTransfers.inboundDispatchedCount).toBe(1);
      expect(res.pendingTransfers.items[0]?.transferNumber).toBe(`TRF-${transferId.substring(0, 6)}`);
      expect(res.dailyClosing.status).toBe("NOT_SUBMITTED");
    });

    it("allows Owner to preview employee dashboard for any branch and isolates Employee B to Branch B", async () => {
      const resOwner = await DashboardService.getEmployeeDashboard({ branchId: branchAId }, ownerUser);
      expect(resOwner.branchId).toBe(branchAId);
      expect(resOwner.branchName).toBe("Dashboard Test Branch A");

      const resB = await DashboardService.getEmployeeDashboard({}, employeeBUser);
      expect(resB.branchId).toBe(branchBId);
      expect(resB.branchName).toBe("Dashboard Test Branch B");
    });
  });
});
