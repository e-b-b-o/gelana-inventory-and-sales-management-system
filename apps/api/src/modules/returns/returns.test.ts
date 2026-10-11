import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ReturnsService } from "./service.js";
import { SalesService } from "../sales/service.js";
import { db } from "../../config/database.js";
import {
  users,
  branches,
  categories,
  products,
  productUnits,
  inventoryBalances,
  paymentMethods,
  sales,
  saleItems,
  salePayments,
  salesReturns,
  salesReturnItems,
  saleCorrections,
  inventoryMovements,
} from "../../database/schema/index.js";
import { productPrices } from "../../database/schema/productPrices.js";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

describe("ReturnsService and Void/Correction Workflow", () => {
  let branchId: string;
  let categoryId: string;
  let productId: string;
  let unitId: string;
  let ownerId: string;
  let employeeId: string;
  let paymentMethodId: string;

  beforeEach(async () => {
    branchId = crypto.randomUUID();
    categoryId = crypto.randomUUID();
    productId = crypto.randomUUID();
    unitId = crypto.randomUUID();
    ownerId = crypto.randomUUID();
    employeeId = crypto.randomUUID();
    paymentMethodId = crypto.randomUUID();

    await db.insert(branches).values({
      id: branchId,
      name: "Return Test Branch",
      code: `RT-${branchId.substring(0, 4)}`,
    });

    // Owner user
    await db.insert(users).values({
      id: ownerId,
      email: `${ownerId}@test.com`,
      passwordHash: "hash",
      name: "Test Owner",
      role: "OWNER",
    });

    // Employee user
    await db.insert(users).values({
      id: employeeId,
      email: `${employeeId}@test.com`,
      passwordHash: "hash",
      name: "Test Employee",
      role: "EMPLOYEE",
      branchId,
    });


    await db.insert(categories).values({
      id: categoryId,
      name: `Return Cat ${categoryId}`,
    });

    await db.insert(products).values({
      id: productId,
      name: "Return Product",
      sku: `SKU-${productId.substring(0, 8)}`,
      categoryId,
    });

    await db.insert(productUnits).values({
      id: unitId,
      productId,
      name: "Piece",
      isBase: true,
    });

    await db.insert(inventoryBalances).values({
      branchId,
      productId,
      availableQuantity: 50,
      damagedQuantity: 0,
      inTransitQuantity: 0,
      minimumStockQuantity: 5,
      wac: "10.00",
    });

    await db.insert(productPrices).values({
      productUnitId: unitId,
      sellingPrice: "20.00",
    });

    await db.insert(paymentMethods).values({
      id: paymentMethodId,
      name: `Cash ${paymentMethodId.substring(0, 4)}`,
      isActive: true,
    });
  });

  afterEach(async () => {
    // Clean up in reverse dependency order
    await db.delete(salesReturnItems).where(
      sql`return_id IN (SELECT id FROM sales_returns WHERE branch_id = ${branchId})`
    );
    await db.delete(salesReturns).where(eq(salesReturns.branchId, branchId));
    await db.delete(saleCorrections).where(
      sql`sale_id IN (SELECT id FROM sales WHERE branch_id = ${branchId})`
    );
    await db.delete(salePayments).where(
      sql`sale_id IN (SELECT id FROM sales WHERE branch_id = ${branchId})`
    );
    await db.delete(saleItems).where(
      sql`sale_id IN (SELECT id FROM sales WHERE branch_id = ${branchId})`
    );
    await db.delete(sales).where(eq(sales.branchId, branchId));
    await db.delete(inventoryMovements).where(eq(inventoryMovements.branchId, branchId));
    await db.delete(inventoryBalances).where(eq(inventoryBalances.branchId, branchId));
    await db.delete(productPrices).where(eq(productPrices.productUnitId, unitId));
    await db.delete(productUnits).where(eq(productUnits.productId, productId));
    await db.delete(products).where(eq(products.id, productId));
    await db.delete(categories).where(eq(categories.id, categoryId));
    await db.delete(paymentMethods).where(eq(paymentMethods.id, paymentMethodId));
    await db.delete(users).where(eq(users.id, employeeId));
    await db.delete(users).where(eq(users.id, ownerId));
    await db.delete(branches).where(eq(branches.id, branchId));
  });

  it("should process a SELLABLE return, restoring available stock and recording RETURN_GOOD movement", async () => {
    // 1. Create a sale of 5 items
    const sale = await SalesService.createSale(
      {
        branchId,
        items: [{ productId, unitId, quantity: 5, unitPrice: 20.0 }],
        payments: [{ paymentMethodId, amount: 100.0 }],
      },
      { id: ownerId, role: "OWNER" }
    );

    const [balAfterSale] = await db
      .select()
      .from(inventoryBalances)
      .where(sql`branch_id = ${branchId} AND product_id = ${productId}`);
    expect(balAfterSale!.availableQuantity).toBe(45); // 50 - 5 = 45

    const saleDetails = await SalesService.getSaleById(sale!.id, { id: ownerId, role: "OWNER" });
    const saleItemId = saleDetails.items[0]!.id;

    // 2. Return 2 items in SELLABLE condition
    const returnRecord = await ReturnsService.createReturn(
      {
        saleId: sale!.id,
        reason: "Customer changed mind",
        refundPaymentMethodId: paymentMethodId,
        items: [
          {
            saleItemId,
            productId,
            unitId,
            quantity: 2,
            condition: "SELLABLE",
          },
        ],
      },
      { id: employeeId, role: "EMPLOYEE", branchId }
    );

    expect(returnRecord.returnNumber).toMatch(/^RET-\d{6}$/);
    expect(Number(returnRecord.refundAmount)).toBe(40.0);

    // 3. Verify stock restored to available
    const [balAfterReturn] = await db
      .select()
      .from(inventoryBalances)
      .where(sql`branch_id = ${branchId} AND product_id = ${productId}`);
    expect(balAfterReturn!.availableQuantity).toBe(47); // 45 + 2 = 47
    expect(balAfterReturn!.damagedQuantity).toBe(0);

    // 4. Verify inventory movement created
    const movements = await db
      .select()
      .from(inventoryMovements)
      .where(sql`reference_id = ${returnRecord.id}`);
    expect(movements.length).toBe(1);
    expect(movements[0]!.movementType).toBe("RETURN_GOOD");
    expect(movements[0]!.quantity).toBe(2);
  });

  it("should process a DAMAGED return, routing to damaged bucket without affecting sellable available", async () => {
    // 1. Create a sale of 3 items
    const sale = await SalesService.createSale(
      {
        branchId,
        items: [{ productId, unitId, quantity: 3, unitPrice: 20.0 }],
        payments: [{ paymentMethodId, amount: 60.0 }],
      },
      { id: ownerId, role: "OWNER" }
    );

    const saleDetails = await SalesService.getSaleById(sale!.id, { id: ownerId, role: "OWNER" });
    const saleItemId = saleDetails.items[0]!.id;

    // 2. Return 1 item as DAMAGED
    const returnRecord = await ReturnsService.createReturn(
      {
        saleId: sale!.id,
        reason: "Defective item",
        refundPaymentMethodId: paymentMethodId,
        items: [
          {
            saleItemId,
            productId,
            unitId,
            quantity: 1,
            condition: "DAMAGED",
          },
        ],
      },
      { id: employeeId, role: "EMPLOYEE", branchId }
    );

    const [balance] = await db
      .select()
      .from(inventoryBalances)
      .where(sql`branch_id = ${branchId} AND product_id = ${productId}`);

    expect(balance!.availableQuantity).toBe(47); // 50 - 3 = 47 (remains unchanged)
    expect(balance!.damagedQuantity).toBe(1); // Routed to damaged bucket

    const movements = await db
      .select()
      .from(inventoryMovements)
      .where(sql`reference_id = ${returnRecord.id}`);
    expect(movements.length).toBe(1);
    expect(movements[0]!.movementType).toBe("RETURN_DAMAGED");
  });


  it("should reject return quantity exceeding remaining returnable quantity", async () => {
    // Sale of 2 items
    const sale = await SalesService.createSale(
      {
        branchId,
        items: [{ productId, unitId, quantity: 2, unitPrice: 20.0 }],
        payments: [{ paymentMethodId, amount: 40.0 }],
      },
      { id: ownerId, role: "OWNER" }
    );

    const saleDetails = await SalesService.getSaleById(sale!.id, { id: ownerId, role: "OWNER" });
    const saleItemId = saleDetails.items[0]!.id;

    // First return: 1 item
    await ReturnsService.createReturn(
      {
        saleId: sale!.id,
        reason: "First return",
        refundPaymentMethodId: paymentMethodId,
        items: [
          {
            saleItemId,
            productId,
            unitId,
            quantity: 1,
            condition: "SELLABLE",
          },
        ],
      },
      { id: ownerId, role: "OWNER" }
    );

    // Second return attempting 2 items (only 1 remaining)
    await expect(
      ReturnsService.createReturn(
        {
          saleId: sale!.id,
          reason: "Excess return",
          refundPaymentMethodId: paymentMethodId,
          items: [
            {
              saleItemId,
              productId,
              unitId,
              quantity: 2,
              condition: "SELLABLE",
            },
          ],
        },
        { id: ownerId, role: "OWNER" }
      )
    ).rejects.toThrow("remaining returnable for this item");
  });

  it("should enforce owner-only restriction on unlinked returns", async () => {
    // Employee attempting unlinked return
    await expect(
      ReturnsService.createReturn(
        {
          reason: "Lost receipt return attempt",
          refundPaymentMethodId: paymentMethodId,
          items: [
            {
              productId,
              unitId,
              quantity: 1,
              condition: "SELLABLE",
              unitPrice: 20.0,
            },
          ],
        },
        { id: employeeId, role: "EMPLOYEE", branchId }
      )
    ).rejects.toThrow("Only owners can authorize returns without an original sale");

    // Owner attempting unlinked return -> succeeds
    const ownerReturn = await ReturnsService.createReturn(
      {
        branchId,
        reason: "Owner approved without receipt",
        refundPaymentMethodId: paymentMethodId,
        items: [
          {
            productId,
            unitId,
            quantity: 1,
            condition: "SELLABLE",
            unitPrice: 20.0,
          },
        ],
      },
      { id: ownerId, role: "OWNER", branchId }
    );

    expect(ownerReturn.isUnlinked).toBe(true);
    expect(ownerReturn.saleId).toBeNull();
  });

  it("should prevent voiding a sale that has returns recorded against it", async () => {
    const sale = await SalesService.createSale(
      {
        branchId,
        items: [{ productId, unitId, quantity: 2, unitPrice: 20.0 }],
        payments: [{ paymentMethodId, amount: 40.0 }],
      },
      { id: ownerId, role: "OWNER" }
    );

    const saleDetails = await SalesService.getSaleById(sale!.id, { id: ownerId, role: "OWNER" });
    const saleItemId = saleDetails.items[0]!.id;

    // Process a return
    await ReturnsService.createReturn(
      {
        saleId: sale!.id,
        reason: "Return before void attempt",
        refundPaymentMethodId: paymentMethodId,
        items: [
          {
            saleItemId,
            productId,
            unitId,
            quantity: 1,
            condition: "SELLABLE",
          },
        ],
      },
      { id: ownerId, role: "OWNER" }
    );

    // Attempting to void sale
    await expect(
      SalesService.voidSale(sale!.id, { reason: "Mistake sale" }, { id: ownerId, role: "OWNER" })
    ).rejects.toThrow("Cannot void a sale that has returns recorded against it");
  });

  it("should allow Owner to void a sale, reversing inventory via ADJUSTMENT and rejecting subsequent voids", async () => {
    // 1. Create a sale
    const sale = await SalesService.createSale(
      {
        branchId,
        items: [{ productId, unitId, quantity: 4, unitPrice: 20.0 }],
        payments: [{ paymentMethodId, amount: 80.0 }],
      },
      { id: ownerId, role: "OWNER" }
    );

    const [balAfterSale] = await db
      .select()
      .from(inventoryBalances)
      .where(sql`branch_id = ${branchId} AND product_id = ${productId}`);
    expect(balAfterSale!.availableQuantity).toBe(46); // 50 - 4 = 46

    // 2. Void sale as employee -> forbidden
    await expect(
      SalesService.voidSale(
        sale!.id,
        { reason: "Employee void attempt" },
        { id: employeeId, role: "EMPLOYEE", branchId }
      )
    ).rejects.toThrow("Only owners are permitted to void sales");

    // 3. Void sale as Owner
    const voidResult = await SalesService.voidSale(
      sale!.id,
      { reason: "Customer card declined post-transaction" },
      { id: ownerId, role: "OWNER" }
    );
    expect(voidResult.success).toBe(true);

    // 4. Verify stock reversed to 50
    const [balAfterVoid] = await db
      .select()
      .from(inventoryBalances)
      .where(sql`branch_id = ${branchId} AND product_id = ${productId}`);
    expect(balAfterVoid!.availableQuantity).toBe(50);

    // 5. Verify sale status updated to VOIDED
    const updatedSale = await SalesService.getSaleById(sale!.id, { id: ownerId, role: "OWNER" });
    expect(updatedSale.status).toBe("VOIDED");
    expect(updatedSale.corrections.length).toBe(1);
    expect(updatedSale.corrections[0]!.correctionType).toBe("VOID");

    // 6. Attempting to void again throws 400
    await expect(
      SalesService.voidSale(
        sale!.id,
        { reason: "Duplicate void" },
        { id: ownerId, role: "OWNER" }
      )
    ).rejects.toThrow("Sale is already voided");

    // 7. Attempting to return against voided sale throws 400
    await expect(
      ReturnsService.createReturn(
        {
          saleId: sale!.id,
          reason: "Return against voided",
          refundPaymentMethodId: paymentMethodId,
          items: [
            {
              saleItemId: updatedSale.items[0]!.id,
              productId,
              unitId,
              quantity: 1,
              condition: "SELLABLE",
            },
          ],
        },
        { id: ownerId, role: "OWNER" }
      )
    ).rejects.toThrow("Cannot process return for a voided sale");
  });

  it("should succeed when an authenticated Owner creates a linked return with auth middleware session shape (userId)", async () => {
    // 1. Create a sale
    const sale = await SalesService.createSale(
      {
        branchId,
        items: [{ productId, unitId, quantity: 2, unitPrice: 20.0 }],
        payments: [{ paymentMethodId, amount: 40.0 }],
      },
      { id: ownerId, role: "OWNER" }
    );

    const saleDetails = await SalesService.getSaleById(sale!.id, { id: ownerId, role: "OWNER" });
    const saleItemId = saleDetails.items[0]!.id;

    // 2. Process return with user object containing only userId (reproducing auth middleware session)
    const ownerReturn = await ReturnsService.createReturn(
      {
        saleId: sale!.id,
        reason: "Owner linked return with auth token session",
        refundPaymentMethodId: paymentMethodId,
        items: [
          {
            saleItemId,
            productId,
            unitId,
            quantity: 1,
            condition: "SELLABLE",
          },
        ],
      },
      { userId: ownerId, role: "OWNER", branchId: null }
    );

    expect(ownerReturn.id).toBeDefined();
    expect(ownerReturn.createdById).toBe(ownerId);
    expect(ownerReturn.returnNumber).toMatch(/^RET-\d{6}$/);

    const [bal] = await db
      .select()
      .from(inventoryBalances)
      .where(sql`branch_id = ${branchId} AND product_id = ${productId}`);
    expect(bal!.availableQuantity).toBe(49); // 50 - 2 + 1 = 49
  });

  it("should rollback all database writes if a return mutation fails midway", async () => {
    const sale = await SalesService.createSale(
      {
        branchId,
        items: [{ productId, unitId, quantity: 2, unitPrice: 20.0 }],
        payments: [{ paymentMethodId, amount: 40.0 }],
      },
      { id: ownerId, role: "OWNER" }
    );

    const saleDetails = await SalesService.getSaleById(sale!.id, { id: ownerId, role: "OWNER" });
    const saleItemId = saleDetails.items[0]!.id;

    const initialReturnsCount = (await db.select().from(salesReturns)).length;
    const initialMovementsCount = (await db.select().from(inventoryMovements)).length;

    // Attempt return with an invalid/excess quantity (will fail validation midway)
    await expect(
      ReturnsService.createReturn(
        {
          saleId: sale!.id,
          reason: "Failing return",
          refundPaymentMethodId: paymentMethodId,
          items: [
            {
              saleItemId,
              productId,
              unitId,
              quantity: 999, // Exceeds returnable!
              condition: "SELLABLE",
            },
          ],
        },
        { userId: ownerId, role: "OWNER" }
      )
    ).rejects.toThrow();

    const postReturnsCount = (await db.select().from(salesReturns)).length;
    const postMovementsCount = (await db.select().from(inventoryMovements)).length;

    expect(postReturnsCount).toBe(initialReturnsCount);
    expect(postMovementsCount).toBe(initialMovementsCount);
  });
});

