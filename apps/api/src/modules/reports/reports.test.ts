import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ReportsService } from "./service.js";
import { db } from "../../config/database.js";
import {
  users,
  branches,
  categories,
  products,
  productUnits,
  productPrices,
  paymentMethods,
  sales,
  saleItems,
  salePayments,
  salesReturns,
  salesReturnItems,
  inventoryBalances,
  inventoryMovements,
  transfers,
  transferItems,
  dailyClosings,
  dailyClosingPayments,
  dailyClosingEvents,
} from "../../database/schema/index.js";
import { sql } from "drizzle-orm";
import crypto from "crypto";

describe("Milestone 10 — Sales Reports Service (Slice 10.3)", () => {
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
  let bankMethodId: string;

  let ownerUser: any;
  let employeeAUser: any;

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
    bankMethodId = crypto.randomUUID();

    // 1. Branches
    await db.insert(branches).values([
      { id: branchAId, name: "Report Test Branch A", code: `RA-${branchAId.substring(0, 4)}`, isActive: true },
      { id: branchBId, name: "Report Test Branch B", code: `RB-${branchBId.substring(0, 4)}`, isActive: true },
    ]);

    // 2. Users
    await db.insert(users).values([
      {
        id: ownerId,
        email: `owner-${ownerId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Report Test Owner",
        role: "OWNER",
      },
      {
        id: employeeAId,
        email: `empA-${employeeAId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Report Test Employee A",
        role: "EMPLOYEE",
        branchId: branchAId,
      },
      {
        id: employeeBId,
        email: `empB-${employeeBId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Report Test Employee B",
        role: "EMPLOYEE",
        branchId: branchBId,
      },
    ]);

    ownerUser = { id: ownerId, role: "OWNER", branchId: null };
    employeeAUser = { id: employeeAId, role: "EMPLOYEE", branchId: branchAId };

    // 3. Category & Products
    await db.insert(categories).values({
      id: categoryId,
      name: `Report Cat ${categoryId.substring(0, 6)}`,
      isActive: true,
    });

    await db.insert(products).values([
      {
        id: product1Id,
        name: "Double A A4 Paper",
        sku: `P1-${product1Id.substring(0, 6)}`,
        categoryId,
        isActive: true,
      },
      {
        id: product2Id,
        name: "Bic Cristal Pen",
        sku: `P2-${product2Id.substring(0, 6)}`,
        categoryId,
        isActive: true,
      },
    ]);

    await db.insert(productUnits).values([
      { id: unit1Id, productId: product1Id, name: "Ream", isBase: true, isActive: true },
      { id: unit2Id, productId: product2Id, name: "Piece", isBase: true, isActive: true },
    ]);

    await db.insert(paymentMethods).values([
      { id: cashMethodId, name: `Cash ${cashMethodId.substring(0, 4)}`, isActive: true },
      { id: bankMethodId, name: `Bank ${bankMethodId.substring(0, 4)}`, isActive: true },
    ]);
  });

  afterEach(async () => {
    // Cleanup
    await db.delete(dailyClosingEvents).where(
      sql`closing_id IN (SELECT id FROM daily_closings WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(dailyClosingPayments).where(
      sql`closing_id IN (SELECT id FROM daily_closings WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(dailyClosings).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(transferItems).where(
      sql`transfer_id IN (SELECT id FROM transfers WHERE source_branch_id IN (${branchAId}, ${branchBId}) OR destination_branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(transfers).where(
      sql`source_branch_id IN (${branchAId}, ${branchBId}) OR destination_branch_id IN (${branchAId}, ${branchBId})`
    );
    await db.delete(inventoryMovements).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(inventoryBalances).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(salesReturnItems).where(
      sql`return_id IN (SELECT id FROM sales_returns WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(salesReturns).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(salePayments).where(
      sql`sale_id IN (SELECT id FROM sales WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(saleItems).where(
      sql`sale_id IN (SELECT id FROM sales WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(sales).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(productPrices).where(sql`product_unit_id IN (${unit1Id}, ${unit2Id})`);
    await db.delete(productUnits).where(sql`product_id IN (${product1Id}, ${product2Id})`);
    await db.delete(products).where(sql`id IN (${product1Id}, ${product2Id})`);
    await db.delete(categories).where(sql`id = ${categoryId}`);
    await db.delete(paymentMethods).where(sql`id IN (${cashMethodId}, ${bankMethodId})`);
    await db.delete(users).where(sql`id IN (${ownerId}, ${employeeAId}, ${employeeBId})`);
    await db.delete(branches).where(sql`id IN (${branchAId}, ${branchBId})`);
  });

  it("calculates total sales, transactions count, and excludes voided sales", async () => {
    // Completed Sale 1 in Branch A: 1000.00 (Cash 1000.00, 2 reams of Product 1)
    const sale1Id = crypto.randomUUID();
    await db.insert(sales).values({
      id: sale1Id,
      saleNumber: `SAL-${sale1Id.substring(0, 6)}`,
      branchId: branchAId,
      createdById: employeeAId,
      soldAt: "2026-10-10T10:00:00.000Z",
      grandTotal: "1000.00",
      status: "COMPLETED",
    });
    await db.insert(saleItems).values({
      id: crypto.randomUUID(),
      saleId: sale1Id,
      productId: product1Id,
      unitId: unit1Id,
      enteredQuantity: 2,
      baseQuantity: 2,
      unitPrice: "500.00",
      unitCost: "350.00",
      lineTotal: "1000.00",
    });
    await db.insert(salePayments).values({
      id: crypto.randomUUID(),
      saleId: sale1Id,
      paymentMethodId: cashMethodId,
      amount: "1000.00",
    });

    // Voided Sale in Branch A: 800.00 (MUST NOT BE COUNTED)
    const voidSaleId = crypto.randomUUID();
    await db.insert(sales).values({
      id: voidSaleId,
      saleNumber: `SAL-${voidSaleId.substring(0, 6)}`,
      branchId: branchAId,
      createdById: employeeAId,
      soldAt: "2026-10-10T11:00:00.000Z",
      grandTotal: "800.00",
      status: "VOIDED",
    });

    // Completed Sale 2 in Branch B: 500.00 (Bank 500.00, 10 pcs of Product 2)
    const sale2Id = crypto.randomUUID();
    await db.insert(sales).values({
      id: sale2Id,
      saleNumber: `SAL-${sale2Id.substring(0, 6)}`,
      branchId: branchBId,
      createdById: employeeBId,
      soldAt: "2026-10-10T12:00:00.000Z",
      grandTotal: "500.00",
      status: "COMPLETED",
    });
    await db.insert(saleItems).values({
      id: crypto.randomUUID(),
      saleId: sale2Id,
      productId: product2Id,
      unitId: unit2Id,
      enteredQuantity: 10,
      baseQuantity: 10,
      unitPrice: "50.00",
      unitCost: "30.00",
      lineTotal: "500.00",
    });
    await db.insert(salePayments).values({
      id: crypto.randomUUID(),
      saleId: sale2Id,
      paymentMethodId: bankMethodId,
      amount: "500.00",
    });

    // Query for Owner across all branches for 2026-10-10
    const report = await ReportsService.getSalesReport(
      {
        startDate: "2026-10-10",
        endDate: "2026-10-10",
        breakdown: "day",
      },
      ownerUser
    );

    // Total sales: 1000 + 500 = 1500 (voided sale excluded)
    expect(report.summary.totalSales).toBe(1500.0);
    expect(report.summary.totalTransactions).toBe(2);
    expect(report.summary.averageSale).toBe(750.0);
    expect(report.summary.totalUnitsSold).toBe(12);

    // Top product: Product 1 (Double A A4 Paper) with 1000.00 revenue
    expect(report.summary.topProduct?.productId).toBe(product1Id);
    expect(report.summary.topProduct?.totalRevenue).toBe(1000.0);
  });

  it("deducts sales returns from gross sales and reflects payment method refunds", async () => {
    // 1. Completed Sale: 2000.00 Cash
    const saleId = crypto.randomUUID();
    await db.insert(sales).values({
      id: saleId,
      saleNumber: `SAL-${saleId.substring(0, 6)}`,
      branchId: branchAId,
      createdById: employeeAId,
      soldAt: "2026-10-12T09:00:00.000Z",
      grandTotal: "2000.00",
      status: "COMPLETED",
    });
    await db.insert(salePayments).values({
      id: crypto.randomUUID(),
      saleId,
      paymentMethodId: cashMethodId,
      amount: "2000.00",
    });

    // 2. Completed Return: 400.00 Cash Refund
    const returnId = crypto.randomUUID();
    await db.insert(salesReturns).values({
      id: returnId,
      returnNumber: `RET-${returnId.substring(0, 6)}`,
      saleId,
      branchId: branchAId,
      createdById: employeeAId,
      returnedAt: "2026-10-12T14:00:00.000Z",
      refundAmount: "400.00",
      refundPaymentMethodId: cashMethodId,
      status: "COMPLETED",
      reason: "Defective item",
    });

    const report = await ReportsService.getSalesReport(
      {
        startDate: "2026-10-12",
        endDate: "2026-10-12",
        branchId: branchAId,
      },
      ownerUser
    );

    expect(report.summary.grossSales).toBe(2000.0);
    expect(report.summary.totalReturns).toBe(400.0);
    expect(report.summary.totalSales).toBe(1600.0);

    const cashPm = report.paymentMethodBreakdown.find((p) => p.paymentMethodId === cashMethodId);
    expect(cashPm?.receivedAmount).toBe(2000.0);
    expect(cashPm?.refundedAmount).toBe(400.0);
    expect(cashPm?.netAmount).toBe(1600.0);
  });

  it("strictly scopes employee to their assigned branch and prevents unauthorized branch access", async () => {
    // Employee A attempts to query Branch B
    await expect(
      ReportsService.getSalesReport(
        {
          startDate: "2026-10-01",
          endDate: "2026-10-31",
          branchId: branchBId,
        },
        employeeAUser
      )
    ).rejects.toThrow("You do not have permission to access another branch's reports");
  });

  it("omits purchase cost, wac, and profit from report payload", async () => {
    const report = (await ReportsService.getSalesReport(
      {
        startDate: "2026-10-01",
        endDate: "2026-10-31",
      },
      employeeAUser
    )) as any;

    expect(report.summary.grossProfit).toBeUndefined();
    expect(report.summary.wac).toBeUndefined();
    expect(report.summary.costOfGoodsSold).toBeUndefined();

    for (const rec of report.detailedRecords) {
      expect((rec as any).unitCost).toBeUndefined();
      expect((rec as any).wac).toBeUndefined();
      expect((rec as any).profit).toBeUndefined();
    }
  });

  it("supports different breakdown options: day, branch, employee, product, payment_method", async () => {
    // Completed sale in Branch A
    const saleId = crypto.randomUUID();
    await db.insert(sales).values({
      id: saleId,
      saleNumber: `SAL-${saleId.substring(0, 6)}`,
      branchId: branchAId,
      createdById: employeeAId,
      soldAt: "2026-10-14T10:00:00.000Z",
      grandTotal: "600.00",
      status: "COMPLETED",
    });
    await db.insert(saleItems).values({
      id: crypto.randomUUID(),
      saleId,
      productId: product1Id,
      unitId: unit1Id,
      enteredQuantity: 1,
      baseQuantity: 1,
      unitPrice: "600.00",
      unitCost: "400.00",
      lineTotal: "600.00",
    });
    await db.insert(salePayments).values({
      id: crypto.randomUUID(),
      saleId,
      paymentMethodId: cashMethodId,
      amount: "600.00",
    });

    // Test product breakdown
    const productReport = await ReportsService.getSalesReport(
      {
        startDate: "2026-10-14",
        endDate: "2026-10-14",
        breakdown: "product",
      },
      ownerUser
    );
    expect(productReport.breakdownType).toBe("product");
    expect(productReport.detailedRecords.length).toBeGreaterThanOrEqual(1);
    expect(productReport.detailedRecords[0].productId).toBe(product1Id);

    // Test employee breakdown
    const employeeReport = await ReportsService.getSalesReport(
      {
        startDate: "2026-10-14",
        endDate: "2026-10-14",
        breakdown: "employee",
      },
      ownerUser
    );
    expect(employeeReport.breakdownType).toBe("employee");
    expect(employeeReport.detailedRecords[0].employeeId).toBe(employeeAId);

    // Test payment method breakdown
    const pmReport = await ReportsService.getSalesReport(
      {
        startDate: "2026-10-14",
        endDate: "2026-10-14",
        breakdown: "payment_method",
      },
      ownerUser
    );
    expect(pmReport.breakdownType).toBe("payment_method");
    const cashRec = pmReport.detailedRecords.find((r) => r.paymentMethodId === cashMethodId);
    expect(cashRec?.totalAmount).toBe(600.0);
  });
});

describe("Milestone 10 — Inventory Reports Service (Slice 10.4)", () => {
  let branchAId: string;
  let branchBId: string;
  let ownerId: string;
  let employeeAId: string;
  let categoryId: string;
  let product1Id: string;
  let product2Id: string;

  let ownerUser: any;
  let employeeAUser: any;

  beforeEach(async () => {
    branchAId = crypto.randomUUID();
    branchBId = crypto.randomUUID();
    ownerId = crypto.randomUUID();
    employeeAId = crypto.randomUUID();
    categoryId = crypto.randomUUID();
    product1Id = crypto.randomUUID();
    product2Id = crypto.randomUUID();

    await db.insert(branches).values([
      { id: branchAId, name: "Inv Test Branch A", code: `IA-${branchAId.substring(0, 4)}`, isActive: true },
      { id: branchBId, name: "Inv Test Branch B", code: `IB-${branchBId.substring(0, 4)}`, isActive: true },
    ]);

    await db.insert(users).values([
      { id: ownerId, email: `owner-${ownerId.substring(0, 6)}@test.com`, passwordHash: "h", name: "Inv Owner", role: "OWNER" },
      { id: employeeAId, email: `empA-${employeeAId.substring(0, 6)}@test.com`, passwordHash: "h", name: "Inv Emp A", role: "EMPLOYEE", branchId: branchAId },
    ]);

    ownerUser = { id: ownerId, role: "OWNER", branchId: null };
    employeeAUser = { id: employeeAId, role: "EMPLOYEE", branchId: branchAId };

    await db.insert(categories).values({ id: categoryId, name: `Inv Cat ${categoryId.substring(0, 4)}`, isActive: true });

    await db.insert(products).values([
      { id: product1Id, name: "Paper Reams", sku: `INV-P1-${product1Id.substring(0, 4)}`, categoryId, isActive: true },
      { id: product2Id, name: "Pens Box", sku: `INV-P2-${product2Id.substring(0, 4)}`, categoryId, isActive: true },
    ]);

    // Balances:
    // Product 1 at Branch A: available 50, minimum 10, wac 100.00 (In Stock)
    // Product 2 at Branch A: available 5, minimum 10, wac 20.00 (Low Stock)
    // Product 1 at Branch B: available 0, minimum 15, wac 95.00 (Out of Stock)
    await db.insert(inventoryBalances).values([
      {
        id: crypto.randomUUID(),
        branchId: branchAId,
        productId: product1Id,
        availableQuantity: 50,
        damagedQuantity: 2,
        inTransitQuantity: 5,
        minimumStockQuantity: 10,
        wac: "100.00",
      },
      {
        id: crypto.randomUUID(),
        branchId: branchAId,
        productId: product2Id,
        availableQuantity: 5,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        minimumStockQuantity: 10,
        wac: "20.00",
      },
      {
        id: crypto.randomUUID(),
        branchId: branchBId,
        productId: product1Id,
        availableQuantity: 0,
        damagedQuantity: 1,
        inTransitQuantity: 0,
        minimumStockQuantity: 15,
        wac: "95.00",
      },
    ]);
  });

  afterEach(async () => {
    await db.delete(inventoryBalances).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(products).where(sql`id IN (${product1Id}, ${product2Id})`);
    await db.delete(categories).where(sql`id = ${categoryId}`);
    await db.delete(users).where(sql`id IN (${ownerId}, ${employeeAId})`);
    await db.delete(branches).where(sql`id IN (${branchAId}, ${branchBId})`);
  });

  it("Owner receives business-wide inventory stock counts, valuation at WAC, and low/out stock alerts", async () => {
    const report = await ReportsService.getInventoryReport({ view: "balances", categoryId }, ownerUser);

    expect(report.view).toBe("balances");
    expect(report.summary.totalStock).toBe(55);
    expect(report.summary.totalDamaged).toBe(3);
    expect(report.summary.inTransitTotal).toBe(5);
    expect(report.summary.lowStockCount).toBe(1);
    expect(report.summary.outOfStockCount).toBe(1);
    expect(report.summary.totalValuation).toBe(5100.0);

    const records = report.records as any[];
    const p1BranchA = records.find((r) => r.branchId === branchAId && r.productId === product1Id);
    expect(p1BranchA?.wac).toBe(100.0);
    expect(p1BranchA?.valuation).toBe(5000.0);
    expect(p1BranchA?.stockStatus).toBe("IN_STOCK");
  });

  it("Employee receives branch-scoped inventory and WAC/valuation are strictly stripped (null)", async () => {
    const report = await ReportsService.getInventoryReport({ view: "balances" }, employeeAUser);

    expect(report.summary.totalValuation).toBeNull();
    const records = report.records as any[];
    expect(records.every((r) => r.branchId === branchAId)).toBe(true);

    for (const rec of records) {
      expect(rec.wac).toBeNull();
      expect(rec.valuation).toBeNull();
    }

    await expect(
      ReportsService.getInventoryReport({ branchId: branchBId }, employeeAUser)
    ).rejects.toThrow("You do not have permission to access another branch's reports");
  });

  it("filters inventory balances by stock status (low, out, in_stock)", async () => {
    const lowReport = await ReportsService.getInventoryReport(
      { view: "balances", stockStatus: "low", branchId: branchAId },
      ownerUser
    );
    const lowRecords = lowReport.records as any[];
    expect(lowRecords.length).toBe(1);
    expect(lowRecords[0]?.productId).toBe(product2Id);
    expect(lowRecords[0]?.stockStatus).toBe("LOW_STOCK");

    const outReport = await ReportsService.getInventoryReport(
      { view: "balances", stockStatus: "out" },
      ownerUser
    );
    const outRecords = outReport.records as any[];
    expect(outRecords.length).toBe(1);
    expect(outRecords[0]?.stockStatus).toBe("OUT_OF_STOCK");
  });
});

describe("Milestone 10 — Profit Reports Service (Slice 10.5)", () => {
  let branchId: string;
  let ownerId: string;
  let employeeId: string;
  let categoryId: string;
  let productId: string;
  let unitId: string;
  let cashMethodId: string;

  let ownerUser: any;
  let employeeUser: any;

  beforeEach(async () => {
    branchId = crypto.randomUUID();
    ownerId = crypto.randomUUID();
    employeeId = crypto.randomUUID();
    categoryId = crypto.randomUUID();
    productId = crypto.randomUUID();
    unitId = crypto.randomUUID();
    cashMethodId = crypto.randomUUID();

    await db.insert(branches).values({ id: branchId, name: "Profit Branch", code: `PB-${branchId.substring(0, 4)}`, isActive: true });
    await db.insert(users).values([
      { id: ownerId, email: `owner-${ownerId.substring(0, 6)}@test.com`, passwordHash: "h", name: "Profit Owner", role: "OWNER" },
      { id: employeeId, email: `emp-${employeeId.substring(0, 6)}@test.com`, passwordHash: "h", name: "Profit Emp", role: "EMPLOYEE", branchId },
    ]);

    ownerUser = { id: ownerId, role: "OWNER", branchId: null };
    employeeUser = { id: employeeId, role: "EMPLOYEE", branchId };

    await db.insert(categories).values({ id: categoryId, name: "Profit Category", isActive: true });
    await db.insert(products).values({ id: productId, name: "Profit Item", sku: `P-${productId.substring(0, 4)}`, categoryId, isActive: true });
    await db.insert(productUnits).values({ id: unitId, productId, name: "Piece", isBase: true, isActive: true });
    await db.insert(paymentMethods).values({ id: cashMethodId, name: `Cash ${cashMethodId.substring(0, 4)}`, isActive: true });
  });

  afterEach(async () => {
    await db.delete(salesReturnItems).where(
      sql`return_id IN (SELECT id FROM sales_returns WHERE branch_id = ${branchId})`
    );
    await db.delete(salesReturns).where(sql`branch_id = ${branchId}`);
    await db.delete(saleItems).where(
      sql`sale_id IN (SELECT id FROM sales WHERE branch_id = ${branchId})`
    );
    await db.delete(sales).where(sql`branch_id = ${branchId}`);
    await db.delete(productUnits).where(sql`product_id = ${productId}`);
    await db.delete(products).where(sql`id = ${productId}`);
    await db.delete(categories).where(sql`id = ${categoryId}`);
    await db.delete(paymentMethods).where(sql`id = ${cashMethodId}`);
    await db.delete(users).where(sql`id IN (${ownerId}, ${employeeId})`);
    await db.delete(branches).where(sql`id = ${branchId}`);
  });

  it("Employees are rejected from accessing profit reports with 403 Forbidden", async () => {
    await expect(
      ReportsService.getProfitReport({}, employeeUser)
    ).rejects.toThrow("Profit reports are strictly accessible to the business owner only");
  });

  it("calculates accurate revenue, COGS, gross profit, and margin % with returns deducted", async () => {
    const saleId = crypto.randomUUID();
    const saleItemId = crypto.randomUUID();
    await db.insert(sales).values({
      id: saleId,
      saleNumber: `SAL-${saleId.substring(0, 6)}`,
      branchId,
      createdById: employeeId,
      soldAt: "2026-10-15T10:00:00.000Z",
      grandTotal: "500.00",
      status: "COMPLETED",
    });
    await db.insert(saleItems).values({
      id: saleItemId,
      saleId,
      productId,
      unitId,
      enteredQuantity: 10,
      baseQuantity: 10,
      unitPrice: "50.00",
      unitCost: "30.00",
      lineTotal: "500.00",
      apportionedSaleDiscount: "0.00",
    });

    const returnId = crypto.randomUUID();
    await db.insert(salesReturns).values({
      id: returnId,
      returnNumber: `RET-${returnId.substring(0, 6)}`,
      saleId,
      branchId,
      createdById: employeeId,
      returnedAt: "2026-10-15T14:00:00.000Z",
      refundAmount: "100.00",
      refundPaymentMethodId: cashMethodId,
      status: "COMPLETED",
      reason: "Customer changed mind",
    });
    await db.insert(salesReturnItems).values({
      id: crypto.randomUUID(),
      returnId,
      saleItemId,
      productId,
      unitId,
      enteredQuantity: 2,
      baseQuantity: 2,
      unitPrice: "50.00",
      condition: "SELLABLE",
      refundAmount: "100.00",
    });

    const report = await ReportsService.getProfitReport(
      { branchId, startDate: "2026-10-15", endDate: "2026-10-15" },
      ownerUser
    );

    expect(report.summary.grossRevenue).toBe(500.0);
    expect(report.summary.returnsAmount).toBe(100.0);
    expect(report.summary.netRevenue).toBe(400.0);
    expect(report.summary.grossCogs).toBe(300.0);
    expect(report.summary.returnCogsAdjustment).toBe(60.0);
    expect(report.summary.netCogs).toBe(240.0);
    expect(report.summary.grossProfit).toBe(160.0);
    expect(report.summary.profitMargin).toBe(40.0);
  });
});

describe("Milestone 10 — Closing Reports Service (Slice 10.6)", () => {
  let branchAId: string;
  let branchBId: string;
  let ownerId: string;
  let employeeAId: string;
  let cashMethodId: string;

  let ownerUser: any;
  let employeeAUser: any;

  beforeEach(async () => {
    branchAId = crypto.randomUUID();
    branchBId = crypto.randomUUID();
    ownerId = crypto.randomUUID();
    employeeAId = crypto.randomUUID();
    cashMethodId = crypto.randomUUID();

    await db.insert(branches).values([
      { id: branchAId, name: "Closing Branch A", code: `CA-${branchAId.substring(0, 4)}`, isActive: true },
      { id: branchBId, name: "Closing Branch B", code: `CB-${branchBId.substring(0, 4)}`, isActive: true },
    ]);

    await db.insert(users).values([
      { id: ownerId, email: `owner-${ownerId.substring(0, 6)}@test.com`, passwordHash: "h", name: "Closing Owner", role: "OWNER" },
      { id: employeeAId, email: `empA-${employeeAId.substring(0, 6)}@test.com`, passwordHash: "h", name: "Closing Emp A", role: "EMPLOYEE", branchId: branchAId },
    ]);

    ownerUser = { id: ownerId, role: "OWNER", branchId: null };
    employeeAUser = { id: employeeAId, role: "EMPLOYEE", branchId: branchAId };

    await db.insert(paymentMethods).values({ id: cashMethodId, name: `Cash ${cashMethodId.substring(0, 4)}`, isActive: true });

    const closing1Id = crypto.randomUUID();
    await db.insert(dailyClosings).values({
      id: closing1Id,
      closingNumber: `CLS-${closing1Id.substring(0, 6)}`,
      branchId: branchAId,
      closingDate: "2026-10-15",
      status: "APPROVED",
      totalSalesAmount: "1000.00",
      totalReturnsAmount: "0.00",
      netSalesAmount: "1000.00",
      salesCount: 5,
      expectedCash: "1000.00",
      actualCash: "950.00",
      cashDifference: "-50.00",
      discrepancyReason: "Short cash register count",
      submittedById: employeeAId,
      reviewedById: ownerId,
    });
    await db.insert(dailyClosingPayments).values({
      id: crypto.randomUUID(),
      closingId: closing1Id,
      paymentMethodId: cashMethodId,
      paymentMethodName: `Cash ${cashMethodId.substring(0, 4)}`,
      receivedAmount: "1000.00",
      refundedAmount: "0.00",
      netAmount: "1000.00",
      transactionCount: 5,
    });
    await db.insert(dailyClosingEvents).values({
      id: crypto.randomUUID(),
      closingId: closing1Id,
      eventType: "APPROVED",
      actorId: ownerId,
      actorRole: "OWNER",
      expectedCash: "1000.00",
      actualCash: "950.00",
      cashDifference: "-50.00",
      notes: "Approved with discrepancy noted",
    });
  });

  afterEach(async () => {
    await db.delete(dailyClosingEvents).where(
      sql`closing_id IN (SELECT id FROM daily_closings WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(dailyClosingPayments).where(
      sql`closing_id IN (SELECT id FROM daily_closings WHERE branch_id IN (${branchAId}, ${branchBId}))`
    );
    await db.delete(dailyClosings).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(paymentMethods).where(sql`id = ${cashMethodId}`);
    await db.delete(users).where(sql`id IN (${ownerId}, ${employeeAId})`);
    await db.delete(branches).where(sql`id IN (${branchAId}, ${branchBId})`);
  });

  it("calculates closing reconciliation, variance, and payment allocations", async () => {
    const report = await ReportsService.getClosingReport(
      { startDate: "2026-10-15", endDate: "2026-10-15" },
      ownerUser
    );

    expect(report.summary.totalClosings).toBe(1);
    expect(report.summary.approvedClosings).toBe(1);
    expect(report.summary.totalExpectedCash).toBe(1000.0);
    expect(report.summary.totalActualCash).toBe(950.0);
    expect(report.summary.netCashDiscrepancy).toBe(-50.0);
    expect(report.summary.discrepantClosingsCount).toBe(1);

    expect(report.records[0]!.discrepancyReason).toBe("Short cash register count");
    expect(report.records[0]!.events.length).toBe(1);
    expect(report.records[0]!.events[0]!.eventType).toBe("APPROVED");
  });

  it("enforces branch scoping for employees on closing reports", async () => {
    const report = await ReportsService.getClosingReport(
      { startDate: "2026-10-15", endDate: "2026-10-15" },
      employeeAUser
    );
    expect(report.records.every((r) => r.branchId === branchAId)).toBe(true);

    await expect(
      ReportsService.getClosingReport({ branchId: branchBId }, employeeAUser)
    ).rejects.toThrow("You do not have permission to access another branch's reports");
  });
});
