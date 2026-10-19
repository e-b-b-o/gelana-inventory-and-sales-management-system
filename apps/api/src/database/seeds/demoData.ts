import { sql, eq } from "drizzle-orm";
import { db } from "../../config/database.js";
import { SEED_IDS } from "./index.js";
import {
  sales,
  saleItems,
  salePayments,
  salesReturns,
  salesReturnItems,
  transfers,
  transferItems,
  transferEvents,
  dailyClosings,
  dailyClosingPayments,
  inventoryMovements,
  inventoryBalances,
  notifications,
  auditLogs,
} from "../schema/index.js";

export const DEMO_IDS = {
  sales: {
    s1: "00000000-0000-4000-9000-000000000101",
    s2: "00000000-0000-4000-9000-000000000102",
    s3: "00000000-0000-4000-9000-000000000103",
    s4: "00000000-0000-4000-9000-000000000104",
    s5: "00000000-0000-4000-9000-000000000105",
    s6: "00000000-0000-4000-9000-000000000106",
    s7: "00000000-0000-4000-9000-000000000107",
    s8: "00000000-0000-4000-9000-000000000108",
    s9: "00000000-0000-4000-9000-000000000109",
    s10: "00000000-0000-4000-9000-000000000110",
    s11: "00000000-0000-4000-9000-000000000111",
    s12: "00000000-0000-4000-9000-000000000112",
  },
  returns: {
    r1: "00000000-0000-4000-9000-000000000201",
    r2: "00000000-0000-4000-9000-000000000202",
  },
  transfers: {
    t1: "00000000-0000-4000-9000-000000000301",
    t2: "00000000-0000-4000-9000-000000000302",
    t3: "00000000-0000-4000-9000-000000000303",
    t4: "00000000-0000-4000-9000-000000000304",
  },
  closings: {
    c1: "00000000-0000-4000-9000-000000000401",
    c2: "00000000-0000-4000-9000-000000000402",
    c3: "00000000-0000-4000-9000-000000000403",
    c4: "00000000-0000-4000-9000-000000000404",
  },
};

export async function seedDemoData(): Promise<{ success: boolean; message: string; details: Record<string, number> }> {
  console.log("Checking environment safety for demo data seeding...");

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "DEMO SEEDING BLOCKED: In production mode, seeding requires ALLOW_DEMO_SEED=true to confirm this is the designated portfolio demo database."
    );
  }

  console.log("Database target verified. Beginning idempotent demo dataset generation...");

  const counts = {
    sales: 0,
    returns: 0,
    transfers: 0,
    closings: 0,
    movements: 0,
    notifications: 0,
    auditLogs: 0,
  };

  // 1. Multi-Month & Current-Month Sales (August, September, October 2026)
  const demoSalesDefinitions = [
    // August 2026 (Month -2)
    {
      id: DEMO_IDS.sales.s1,
      saleNumber: "SAL-DEMO-001",
      branchId: SEED_IDS.branches.main,
      createdById: SEED_IDS.users.employeeGelana,
      soldAt: "2026-08-10 10:15:00",
      items: [
        {
          productId: SEED_IDS.products.notebook,
          unitId: SEED_IDS.units.notebookBase,
          qty: 5,
          unitPrice: "120.00",
          unitCost: "75.00",
          total: "600.00",
        },
        {
          productId: SEED_IDS.products.pen,
          unitId: SEED_IDS.units.penBase,
          qty: 10,
          unitPrice: "25.00",
          unitCost: "15.00",
          total: "250.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, amount: "850.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s2,
      saleNumber: "SAL-DEMO-002",
      branchId: SEED_IDS.branches.downtown,
      createdById: SEED_IDS.users.downtownGelana,
      soldAt: "2026-08-18 14:30:00",
      items: [
        {
          productId: SEED_IDS.products.paper,
          unitId: SEED_IDS.units.paperBase,
          qty: 2,
          unitPrice: "450.00",
          unitCost: "300.00",
          total: "900.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.telebirr, amount: "900.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s3,
      saleNumber: "SAL-DEMO-003",
      branchId: SEED_IDS.branches.main,
      createdById: SEED_IDS.users.employeeGelana,
      soldAt: "2026-08-25 16:45:00",
      items: [
        {
          productId: SEED_IDS.products.marker,
          unitId: SEED_IDS.units.markerPack,
          qty: 2,
          unitPrice: "220.00",
          unitCost: "140.00",
          total: "440.00",
        },
        {
          productId: SEED_IDS.products.pencil,
          unitId: SEED_IDS.units.pencilBox,
          qty: 3,
          unitPrice: "100.00",
          unitCost: "72.00",
          total: "300.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.bank, amount: "740.00" },
      ],
    },

    // September 2026 (Month -1)
    {
      id: DEMO_IDS.sales.s4,
      saleNumber: "SAL-DEMO-004",
      branchId: SEED_IDS.branches.main,
      createdById: SEED_IDS.users.employeeGelana,
      soldAt: "2026-09-05 11:00:00",
      items: [
        {
          productId: SEED_IDS.products.notebook,
          unitId: SEED_IDS.units.notebookPack,
          qty: 2,
          unitPrice: "680.00",
          unitCost: "450.00",
          total: "1360.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.card, amount: "1360.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s5,
      saleNumber: "SAL-DEMO-005",
      branchId: SEED_IDS.branches.downtown,
      createdById: SEED_IDS.users.downtownGelana,
      soldAt: "2026-09-15 13:20:00",
      items: [
        {
          productId: SEED_IDS.products.pen,
          unitId: SEED_IDS.units.penBox,
          qty: 1,
          unitPrice: "1150.00",
          unitCost: "750.00",
          total: "1150.00",
        },
        {
          productId: SEED_IDS.products.folder,
          unitId: SEED_IDS.units.folderBase,
          qty: 5,
          unitPrice: "80.00",
          unitCost: "45.00",
          total: "400.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.telebirr, amount: "1550.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s6,
      saleNumber: "SAL-DEMO-006",
      branchId: SEED_IDS.branches.main,
      createdById: SEED_IDS.users.employeeGelana,
      soldAt: "2026-09-22 15:10:00",
      items: [
        {
          productId: SEED_IDS.products.paper,
          unitId: SEED_IDS.units.paperCarton,
          qty: 1,
          unitPrice: "2150.00",
          unitCost: "1500.00",
          total: "2150.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.bank, amount: "2150.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s7,
      saleNumber: "SAL-DEMO-007",
      branchId: SEED_IDS.branches.downtown,
      createdById: SEED_IDS.users.downtownGelana,
      soldAt: "2026-09-29 17:00:00",
      items: [
        {
          productId: SEED_IDS.products.notebook,
          unitId: SEED_IDS.units.notebookBase,
          qty: 4,
          unitPrice: "120.00",
          unitCost: "75.00",
          total: "480.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, amount: "480.00" },
      ],
    },

    // October 2026 (Current Month - up to today Oct 19, 2026)
    {
      id: DEMO_IDS.sales.s8,
      saleNumber: "SAL-DEMO-008",
      branchId: SEED_IDS.branches.main,
      createdById: SEED_IDS.users.employeeGelana,
      soldAt: "2026-10-04 09:30:00",
      items: [
        {
          productId: SEED_IDS.products.folder,
          unitId: SEED_IDS.units.folderPack,
          qty: 2,
          unitPrice: "720.00",
          unitCost: "450.00",
          total: "1440.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, amount: "1440.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s9,
      saleNumber: "SAL-DEMO-009",
      branchId: SEED_IDS.branches.downtown,
      createdById: SEED_IDS.users.downtownGelana,
      soldAt: "2026-10-06 14:15:00",
      items: [
        {
          productId: SEED_IDS.products.pen,
          unitId: SEED_IDS.units.penBase,
          qty: 8,
          unitPrice: "25.00",
          unitCost: "15.00",
          total: "200.00",
        },
        {
          productId: SEED_IDS.products.notebook,
          unitId: SEED_IDS.units.notebookBase,
          qty: 3,
          unitPrice: "120.00",
          unitCost: "75.00",
          total: "360.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.telebirr, amount: "560.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s10,
      saleNumber: "SAL-DEMO-010",
      branchId: SEED_IDS.branches.main,
      createdById: SEED_IDS.users.employeeGelana,
      soldAt: "2026-10-08 11:45:00",
      items: [
        {
          productId: SEED_IDS.products.paper,
          unitId: SEED_IDS.units.paperBase,
          qty: 3,
          unitPrice: "450.00",
          unitCost: "300.00",
          total: "1350.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, amount: "1350.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s11,
      saleNumber: "SAL-DEMO-011",
      branchId: SEED_IDS.branches.downtown,
      createdById: SEED_IDS.users.downtownGelana,
      soldAt: "2026-10-18 16:30:00",
      items: [
        {
          productId: SEED_IDS.products.marker,
          unitId: SEED_IDS.units.markerBase,
          qty: 6,
          unitPrice: "60.00",
          unitCost: "35.00",
          total: "360.00",
        },
        {
          productId: SEED_IDS.products.notebook,
          unitId: SEED_IDS.units.notebookBase,
          qty: 2,
          unitPrice: "120.00",
          unitCost: "75.00",
          total: "240.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, amount: "300.00" },
        { methodId: SEED_IDS.paymentMethods.telebirr, amount: "300.00" },
      ],
    },
    {
      id: DEMO_IDS.sales.s12,
      saleNumber: "SAL-DEMO-012",
      branchId: SEED_IDS.branches.main,
      createdById: SEED_IDS.users.employeeGelana,
      soldAt: "2026-10-19 12:00:00",
      items: [
        {
          productId: SEED_IDS.products.notebook,
          unitId: SEED_IDS.units.notebookBase,
          qty: 2,
          unitPrice: "120.00",
          unitCost: "75.00",
          total: "240.00",
        },
      ],
      payments: [
        { methodId: SEED_IDS.paymentMethods.telebirr, amount: "240.00" },
      ],
    },
  ];

  for (const s of demoSalesDefinitions) {
    const existing = await db
      .select({ id: sales.id })
      .from(sales)
      .where(eq(sales.id, s.id))
      .limit(1);

    if (existing.length === 0) {
      const grandTotal = s.items.reduce((acc, i) => acc + Number(i.total), 0).toFixed(2);

      await db.insert(sales).values({
        id: s.id,
        saleNumber: s.saleNumber,
        branchId: s.branchId,
        createdById: s.createdById,
        soldAt: s.soldAt,
        subtotal: grandTotal,
        saleDiscount: "0.00",
        grandTotal,
        status: "COMPLETED",
        createdAt: s.soldAt,
      });

      for (const item of s.items) {
        await db.insert(saleItems).values({
          saleId: s.id,
          productId: item.productId,
          unitId: item.unitId,
          enteredQuantity: item.qty,
          baseQuantity: item.qty,
          unitPrice: item.unitPrice,
          unitCost: item.unitCost,
          lineDiscount: "0.00",
          lineTotal: item.total,
          apportionedSaleDiscount: "0.00",
        });

        // Associated SALE movement
        await db.insert(inventoryMovements).values({
          branchId: s.branchId,
          productId: item.productId,
          movementType: "SALE",
          quantity: -item.qty,
          unitCost: item.unitCost,
          referenceId: s.id,
          reason: `Demo Sale ${s.saleNumber}`,
          createdById: s.createdById,
          createdAt: s.soldAt,
        });
        counts.movements++;
      }

      for (const p of s.payments) {
        await db.insert(salePayments).values({
          saleId: s.id,
          paymentMethodId: p.methodId,
          amount: p.amount,
          createdAt: s.soldAt,
        });
      }

      counts.sales++;
    }
  }

  // 2. Returns (Linked to sales, Sellable and Damaged)
  const demoReturns = [
    {
      id: DEMO_IDS.returns.r1,
      returnNumber: "RET-DEMO-001",
      saleId: DEMO_IDS.sales.s1,
      branchId: SEED_IDS.branches.main,
      createdById: SEED_IDS.users.employeeGelana,
      returnedAt: "2026-10-08 15:30:00",
      refundAmount: "50.00",
      refundPaymentMethodId: SEED_IDS.paymentMethods.cash,
      reason: "Customer ordered wrong pen color (unopened)",
      productId: SEED_IDS.products.pen,
      unitId: SEED_IDS.units.penBase,
      qty: 2,
      unitPrice: "25.00",
      condition: "SELLABLE",
    },
    {
      id: DEMO_IDS.returns.r2,
      returnNumber: "RET-DEMO-002",
      saleId: DEMO_IDS.sales.s11,
      branchId: SEED_IDS.branches.downtown,
      createdById: SEED_IDS.users.downtownGelana,
      returnedAt: "2026-10-18 17:15:00",
      refundAmount: "120.00",
      refundPaymentMethodId: SEED_IDS.paymentMethods.cash,
      reason: "Torn cover page on notebook",
      productId: SEED_IDS.products.notebook,
      unitId: SEED_IDS.units.notebookBase,
      qty: 1,
      unitPrice: "120.00",
      condition: "DAMAGED",
    },
  ];

  for (const r of demoReturns) {
    const existing = await db
      .select({ id: salesReturns.id })
      .from(salesReturns)
      .where(eq(salesReturns.id, r.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(salesReturns).values({
        id: r.id,
        returnNumber: r.returnNumber,
        saleId: r.saleId,
        branchId: r.branchId,
        createdById: r.createdById,
        returnedAt: r.returnedAt,
        refundAmount: r.refundAmount,
        refundPaymentMethodId: r.refundPaymentMethodId,
        status: "COMPLETED",
        reason: r.reason,
        isUnlinked: false,
        createdAt: r.returnedAt,
      });

      await db.insert(salesReturnItems).values({
        returnId: r.id,
        productId: r.productId,
        unitId: r.unitId,
        enteredQuantity: r.qty,
        baseQuantity: r.qty,
        unitPrice: r.unitPrice,
        condition: r.condition,
        refundAmount: r.refundAmount,
      });

      await db.insert(inventoryMovements).values({
        branchId: r.branchId,
        productId: r.productId,
        movementType: r.condition === "SELLABLE" ? "RETURN_GOOD" : "RETURN_DAMAGED",
        quantity: r.qty,
        unitCost: "75.00",
        referenceId: r.id,
        reason: `Demo Return ${r.returnNumber}: ${r.reason}`,
        createdById: r.createdById,
        createdAt: r.returnedAt,
      });

      counts.returns++;
      counts.movements++;
    }
  }

  // 3. Transfers Across States (Completed, Dispatched/In-Transit, Requested, Discrepancy)
  const demoTransfers = [
    {
      id: DEMO_IDS.transfers.t1,
      transferNumber: "TRF-DEMO-001",
      sourceBranchId: SEED_IDS.branches.warehouse,
      destinationBranchId: SEED_IDS.branches.main,
      status: "COMPLETED",
      notes: "Routine branch replenishment",
      createdById: SEED_IDS.users.ownerGelana,
      approvedById: SEED_IDS.users.ownerGelana,
      dispatchedById: SEED_IDS.users.warehouseGelana,
      receivedById: SEED_IDS.users.employeeGelana,
      closedById: SEED_IDS.users.ownerGelana,
      createdAt: "2026-10-12 09:00:00",
      items: [
        {
          productId: SEED_IDS.products.notebook,
          unitId: SEED_IDS.units.notebookBase,
          requestedQty: 30,
          approvedQty: 30,
          dispatchedQty: 30,
          receivedQty: 30,
          damagedQty: 0,
        },
      ],
    },
    {
      id: DEMO_IDS.transfers.t2,
      transferNumber: "TRF-DEMO-002",
      sourceBranchId: SEED_IDS.branches.warehouse,
      destinationBranchId: SEED_IDS.branches.downtown,
      status: "DISPATCHED",
      notes: "Stock transfer in transit via delivery truck #04",
      createdById: SEED_IDS.users.ownerGelana,
      approvedById: SEED_IDS.users.ownerGelana,
      dispatchedById: SEED_IDS.users.warehouseGelana,
      createdAt: "2026-10-18 14:00:00",
      items: [
        {
          productId: SEED_IDS.products.pen,
          unitId: SEED_IDS.units.penBase,
          requestedQty: 50,
          approvedQty: 50,
          dispatchedQty: 50,
          receivedQty: 0,
          damagedQty: 0,
        },
      ],
    },
    {
      id: DEMO_IDS.transfers.t3,
      transferNumber: "TRF-DEMO-003",
      sourceBranchId: SEED_IDS.branches.main,
      destinationBranchId: SEED_IDS.branches.downtown,
      status: "REQUESTED",
      notes: "Downtown requested surplus A4 paper reams",
      createdById: SEED_IDS.users.downtownGelana,
      createdAt: "2026-10-19 09:30:00",
      items: [
        {
          productId: SEED_IDS.products.paper,
          unitId: SEED_IDS.units.paperBase,
          requestedQty: 10,
          approvedQty: null,
          dispatchedQty: null,
          receivedQty: 0,
          damagedQty: 0,
        },
      ],
    },
    {
      id: DEMO_IDS.transfers.t4,
      transferNumber: "TRF-DEMO-004",
      sourceBranchId: SEED_IDS.branches.warehouse,
      destinationBranchId: SEED_IDS.branches.main,
      status: "DISCREPANCY",
      hasDiscrepancy: true,
      notes: "Transfer shipment arrived with damaged items",
      createdById: SEED_IDS.users.ownerGelana,
      approvedById: SEED_IDS.users.ownerGelana,
      dispatchedById: SEED_IDS.users.warehouseGelana,
      receivedById: SEED_IDS.users.employeeGelana,
      createdAt: "2026-10-06 10:00:00",
      items: [
        {
          productId: SEED_IDS.products.marker,
          unitId: SEED_IDS.units.markerBase,
          requestedQty: 20,
          approvedQty: 20,
          dispatchedQty: 20,
          receivedQty: 18,
          damagedQty: 2,
          discrepancyReason: "2 markers arrived leaking/crushed during transit",
        },
      ],
    },
  ];

  for (const t of demoTransfers) {
    const existing = await db
      .select({ id: transfers.id })
      .from(transfers)
      .where(eq(transfers.id, t.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(transfers).values({
        id: t.id,
        transferNumber: t.transferNumber,
        sourceBranchId: t.sourceBranchId,
        destinationBranchId: t.destinationBranchId,
        status: t.status as any,
        hasDiscrepancy: t.hasDiscrepancy ?? false,
        notes: t.notes,
        createdById: t.createdById,
        approvedById: t.approvedById,
        approvedAt: t.approvedById ? t.createdAt : null,
        dispatchedById: t.dispatchedById,
        dispatchedAt: t.dispatchedById ? t.createdAt : null,
        receivedById: t.receivedById,
        receivedAt: t.receivedById ? t.createdAt : null,
        closedById: t.closedById,
        closedAt: t.closedById ? t.createdAt : null,
        createdAt: t.createdAt,
        updatedAt: t.createdAt,
      });

      for (const item of t.items) {
        await db.insert(transferItems).values({
          transferId: t.id,
          productId: item.productId,
          unitId: item.unitId,
          requestedQuantity: item.requestedQty,
          approvedQuantity: item.approvedQty,
          dispatchedQuantity: item.dispatchedQty,
          receivedQuantity: item.receivedQty,
          damagedQuantity: item.damagedQty,
          discrepancyReason: (item as { discrepancyReason?: string }).discrepancyReason || null,
          sourceUnitCost: "35.00",
          createdAt: t.createdAt,
        });
      }

      await db.insert(transferEvents).values({
        transferId: t.id,
        eventType: t.status,
        actorId: t.createdById,
        notes: t.notes,
        createdAt: t.createdAt,
      });

      // Update in-transit quantities if DISPATCHED
      if (t.status === "DISPATCHED") {
        for (const item of t.items) {
          if (item.dispatchedQty) {
            await db
              .update(inventoryBalances)
              .set({ inTransitQuantity: item.dispatchedQty })
              .where(
                sql`${inventoryBalances.branchId} = ${t.destinationBranchId} AND ${inventoryBalances.productId} = ${item.productId}`
              );
          }
        }
      }

      counts.transfers++;
    }
  }

  // 4. Daily Closings Across Dates & Branches (Approved, with Cash Breakdown)
  const demoClosings = [
    {
      id: DEMO_IDS.closings.c1,
      closingNumber: "CLS-DEMO-001",
      branchId: SEED_IDS.branches.main,
      closingDate: "2026-10-18",
      status: "APPROVED",
      totalSalesAmount: "3000.00",
      totalReturnsAmount: "0.00",
      netSalesAmount: "3000.00",
      salesCount: 8,
      expectedCash: "1500.00",
      actualCash: "1500.00",
      cashDifference: "0.00",
      submittedById: SEED_IDS.users.employeeGelana,
      submittedAt: "2026-10-18 19:30:00",
      reviewedById: SEED_IDS.users.ownerGelana,
      reviewedAt: "2026-10-18 20:00:00",
      reviewNotes: "Reconciled with register cash drawer. Approved.",
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, name: "Cash", amount: "1500.00" },
        { methodId: SEED_IDS.paymentMethods.telebirr, name: "Telebirr", amount: "1000.00" },
        { methodId: SEED_IDS.paymentMethods.bank, name: "CBE Bank Transfer", amount: "500.00" },
      ],
    },
    {
      id: DEMO_IDS.closings.c2,
      closingNumber: "CLS-DEMO-002",
      branchId: SEED_IDS.branches.downtown,
      closingDate: "2026-10-18",
      status: "APPROVED",
      totalSalesAmount: "1850.00",
      totalReturnsAmount: "120.00",
      netSalesAmount: "1730.00",
      salesCount: 5,
      expectedCash: "780.00",
      actualCash: "780.00",
      cashDifference: "0.00",
      submittedById: SEED_IDS.users.downtownGelana,
      submittedAt: "2026-10-18 18:45:00",
      reviewedById: SEED_IDS.users.ownerGelana,
      reviewedAt: "2026-10-18 20:15:00",
      reviewNotes: "Balanced. Approved.",
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, name: "Cash", amount: "780.00" },
        { methodId: SEED_IDS.paymentMethods.telebirr, name: "Telebirr", amount: "950.00" },
      ],
    },
    {
      id: DEMO_IDS.closings.c3,
      closingNumber: "CLS-DEMO-003",
      branchId: SEED_IDS.branches.main,
      closingDate: "2026-10-17",
      status: "APPROVED",
      totalSalesAmount: "2450.00",
      totalReturnsAmount: "0.00",
      netSalesAmount: "2450.00",
      salesCount: 6,
      expectedCash: "1200.00",
      actualCash: "1200.00",
      cashDifference: "0.00",
      submittedById: SEED_IDS.users.employeeGelana,
      submittedAt: "2026-10-17 19:15:00",
      reviewedById: SEED_IDS.users.ownerGelana,
      reviewedAt: "2026-10-17 20:00:00",
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, name: "Cash", amount: "1200.00" },
        { methodId: SEED_IDS.paymentMethods.bank, name: "CBE Bank Transfer", amount: "1250.00" },
      ],
    },
    {
      id: DEMO_IDS.closings.c4,
      closingNumber: "CLS-DEMO-004",
      branchId: SEED_IDS.branches.downtown,
      closingDate: "2026-09-29",
      status: "APPROVED",
      totalSalesAmount: "1920.00",
      totalReturnsAmount: "0.00",
      netSalesAmount: "1920.00",
      salesCount: 4,
      expectedCash: "1000.00",
      actualCash: "1000.00",
      cashDifference: "0.00",
      submittedById: SEED_IDS.users.downtownGelana,
      submittedAt: "2026-09-29 18:30:00",
      reviewedById: SEED_IDS.users.ownerGelana,
      reviewedAt: "2026-09-29 19:30:00",
      payments: [
        { methodId: SEED_IDS.paymentMethods.cash, name: "Cash", amount: "1000.00" },
        { methodId: SEED_IDS.paymentMethods.telebirr, name: "Telebirr", amount: "920.00" },
      ],
    },
  ];

  for (const c of demoClosings) {
    const existing = await db
      .select({ id: dailyClosings.id })
      .from(dailyClosings)
      .where(eq(dailyClosings.id, c.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(dailyClosings).values({
        id: c.id,
        closingNumber: c.closingNumber,
        branchId: c.branchId,
        closingDate: c.closingDate,
        status: c.status,
        totalSalesAmount: c.totalSalesAmount,
        totalReturnsAmount: c.totalReturnsAmount,
        netSalesAmount: c.netSalesAmount,
        salesCount: c.salesCount,
        expectedCash: c.expectedCash,
        actualCash: c.actualCash,
        cashDifference: c.cashDifference,
        submittedById: c.submittedById,
        submittedAt: c.submittedAt,
        reviewedById: c.reviewedById,
        reviewedAt: c.reviewedAt,
        reviewNotes: c.reviewNotes,
        revision: 1,
        createdAt: c.submittedAt,
        updatedAt: c.reviewedAt || c.submittedAt,
      });

      for (const p of c.payments) {
        await db.insert(dailyClosingPayments).values({
          closingId: c.id,
          paymentMethodId: p.methodId,
          paymentMethodName: p.name,
          receivedAmount: p.amount,
        });
      }

      counts.closings++;
    }
  }

  // 5. Notifications
  const demoNotifications = [
    {
      id: "00000000-0000-4000-9000-000000000501",
      userId: SEED_IDS.users.ownerGelana,
      title: "Low Stock Warning: Ballpoint Pen",
      message: "Downtown Branch stock is below minimum threshold (15 remaining).",
      type: "LOW_STOCK",
      priority: "IMPORTANT" as const,
      isRead: false,
      entityType: "product",
      entityId: SEED_IDS.products.pen,
      link: "/inventory",
      createdAt: "2026-10-19 08:00:00",
    },
    {
      id: "00000000-0000-4000-9000-000000000502",
      userId: SEED_IDS.users.downtownGelana,
      title: "Stock Transfer In Transit",
      message: "Transfer TRF-DEMO-002 was dispatched from Warehouse Branch.",
      type: "TRANSFER",
      priority: "INFORMATIONAL" as const,
      isRead: true,
      readAt: "2026-10-18 15:00:00",
      entityType: "transfer",
      entityId: DEMO_IDS.transfers.t2,
      link: `/transfers/${DEMO_IDS.transfers.t2}`,
      createdAt: "2026-10-18 14:05:00",
    },
    {
      id: "00000000-0000-4000-9000-000000000503",
      userId: SEED_IDS.users.employeeGelana,
      title: "Daily Closing Approved",
      message: "Daily Closing CLS-DEMO-001 for Main Branch has been approved by Owner.",
      type: "CLOSING",
      priority: "INFORMATIONAL" as const,
      isRead: true,
      readAt: "2026-10-18 20:30:00",
      entityType: "closing",
      entityId: DEMO_IDS.closings.c1,
      link: "/daily-closing/history",
      createdAt: "2026-10-18 20:01:00",
    },
  ];

  for (const n of demoNotifications) {
    const existing = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.id, n.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(notifications).values(n);
      counts.notifications++;
    }
  }

  // 6. Audit Logs
  const demoAuditLogs = [
    {
      id: "00000000-0000-4000-9000-000000000601",
      actorId: SEED_IDS.users.ownerGelana,
      actorName: "Dawit (Owner)",
      actorRole: "OWNER",
      action: "TRANSFER_APPROVED",
      category: "INVENTORY",
      entityType: "transfer",
      entityId: DEMO_IDS.transfers.t1,
      branchId: SEED_IDS.branches.warehouse,
      branchName: "Warehouse Branch",
      reason: "Approved stock transfer of 30 notebooks to Main Branch",
      metadata: { demo: true },
      createdAt: "2026-10-12 09:15:00",
    },
    {
      id: "00000000-0000-4000-9000-000000000602",
      actorId: SEED_IDS.users.ownerGelana,
      actorName: "Dawit (Owner)",
      actorRole: "OWNER",
      action: "CLOSING_APPROVED",
      category: "FINANCIAL",
      entityType: "daily_closing",
      entityId: DEMO_IDS.closings.c1,
      branchId: SEED_IDS.branches.main,
      branchName: "Main Branch",
      reason: "Approved EOD register closing CLS-DEMO-001",
      metadata: { demo: true },
      createdAt: "2026-10-18 20:00:00",
    },
  ];

  for (const a of demoAuditLogs) {
    const existing = await db
      .select({ id: auditLogs.id })
      .from(auditLogs)
      .where(eq(auditLogs.id, a.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(auditLogs).values(a);
      counts.auditLogs++;
    }
  }

  console.log("Demo dataset populated successfully:", counts);

  return {
    success: true,
    message: "Demo dataset populated safely and idempotently",
    details: counts,
  };
}
