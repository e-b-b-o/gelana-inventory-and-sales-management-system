import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SalesService } from "./service.js";
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
  inventoryMovements,
} from "../../database/schema/index.js";
import { productPrices } from "../../database/schema/productPrices.js";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

describe("Sales Concurrency and Race Condition Safety", () => {
  let branchId: string;
  let categoryId: string;
  let productIdA: string;
  let productIdB: string;
  let unitIdA: string;
  let unitIdB: string;
  let userId: string;
  let paymentMethodId: string;

  beforeEach(async () => {
    branchId = crypto.randomUUID();
    categoryId = crypto.randomUUID();
    productIdA = crypto.randomUUID();
    productIdB = crypto.randomUUID();
    userId = crypto.randomUUID();
    unitIdA = crypto.randomUUID();
    unitIdB = crypto.randomUUID();
    paymentMethodId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email: `${userId}@test.com`,
      passwordHash: "hash",
      name: "Concurrency Test User",
      role: "OWNER",
    });

    await db.insert(branches).values({
      id: branchId,
      name: "Concurrency Test Branch",
      code: `CB-${branchId.substring(0, 4)}`,
    });

    await db.insert(categories).values({
      id: categoryId,
      name: `Category ${categoryId}`,
    });

    await db.insert(products).values([
      {
        id: productIdA,
        name: "Test Product A",
        sku: `SKU-A-${productIdA.substring(0, 8)}`,
        categoryId,
      },
      {
        id: productIdB,
        name: "Test Product B",
        sku: `SKU-B-${productIdB.substring(0, 8)}`,
        categoryId,
      },
    ]);

    await db.insert(productUnits).values([
      {
        id: unitIdA,
        productId: productIdA,
        name: "Piece",
        isBase: true,
      },
      {
        id: unitIdB,
        productId: productIdB,
        name: "Piece",
        isBase: true,
      },
    ]);

    await db.insert(productPrices).values([
      {
        productUnitId: unitIdA,
        sellingPrice: "20.00",
        effectiveFrom: new Date().toISOString(),
      },
      {
        productUnitId: unitIdB,
        sellingPrice: "30.00",
        effectiveFrom: new Date().toISOString(),
      },
    ]);

    const [insertedPm] = await db.insert(paymentMethods).values({
      name: `Cash-${paymentMethodId.substring(0, 6)}`,
      details: "Cash payment",
      isActive: true,
    }).returning();
    paymentMethodId = insertedPm!.id;
  });

  afterEach(async () => {
    await db.delete(salePayments).where(eq(salePayments.paymentMethodId, paymentMethodId));
    await db.delete(saleItems).where(eq(saleItems.productId, productIdA));
    await db.delete(saleItems).where(eq(saleItems.productId, productIdB));
    await db.delete(sales).where(eq(sales.branchId, branchId));
    await db.delete(inventoryMovements).where(eq(inventoryMovements.branchId, branchId));
    await db.delete(inventoryBalances).where(eq(inventoryBalances.branchId, branchId));
    await db.delete(productPrices).where(eq(productPrices.productUnitId, unitIdA));
    await db.delete(productPrices).where(eq(productPrices.productUnitId, unitIdB));
    await db.delete(productUnits).where(eq(productUnits.id, unitIdA));
    await db.delete(productUnits).where(eq(productUnits.id, unitIdB));
    await db.delete(products).where(eq(products.id, productIdA));
    await db.delete(products).where(eq(products.id, productIdB));
    await db.delete(categories).where(eq(categories.id, categoryId));
    await db.delete(branches).where(eq(branches.id, branchId));
    await db.delete(users).where(eq(users.id, userId));
    await db.delete(paymentMethods).where(eq(paymentMethods.id, paymentMethodId));
  });

  it("prevents overselling under high concurrency and prevents negative inventory", async () => {
    // Start with strictly 10 units available
    await db.insert(inventoryBalances).values({
      branchId,
      productId: productIdA,
      availableQuantity: 10,
      damagedQuantity: 0,
      inTransitQuantity: 0,
      minimumStockQuantity: 2,
      wac: "10.00",
    });

    // 5 concurrent sales requests each attempting to buy 3 units
    // Total requested: 15 units. Available: 10 units.
    // Exactly 3 requests must succeed (9 units sold, 1 left).
    // Exactly 2 requests must be rejected with 400 Insufficient stock.
    const saleRequests = Array.from({ length: 5 }).map(() =>
      SalesService.createSale(
        {
          branchId,
          items: [
            {
              productId: productIdA,
              unitId: unitIdA,
              quantity: 3,
              unitPrice: 20.0,
            },
          ],
          payments: [
            {
              paymentMethodId,
              amount: 60.0,
            },
          ],
        },
        {
          id: userId,
          role: "OWNER",
          branchId,
        }
      )
    );

    const results = await Promise.allSettled(saleRequests);

    const succeeded = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    expect(succeeded.length).toBe(3);
    expect(failed.length).toBe(2);

    for (const f of failed) {
      if (f.status === "rejected") {
        expect(f.reason.message).toMatch(/insufficient stock/i);
      }
    }

    // Verify database inventory balance is exactly 1 and never negative
    const [finalBalance] = await db
      .select()
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.branchId, branchId),
          eq(inventoryBalances.productId, productIdA)
        )
      );

    expect(finalBalance!.availableQuantity).toBe(1);
    expect(finalBalance!.availableQuantity).toBeGreaterThanOrEqual(0);

    // Verify inventory movements count matches exactly 3 sales (each deducted 3 = 9 total)
    const movements = await db
      .select()
      .from(inventoryMovements)
      .where(
        and(
          eq(inventoryMovements.branchId, branchId),
          eq(inventoryMovements.productId, productIdA)
        )
      );

    expect(movements.length).toBe(3);
    const totalDeducted = movements.reduce((acc, m) => acc + m.quantity, 0);
    expect(totalDeducted).toBe(-9);
  });

  it("prevents deadlocks when concurrent sales lock multiple products in opposing order", async () => {
    // Both products start with 10 units
    await db.insert(inventoryBalances).values([
      {
        branchId,
        productId: productIdA,
        availableQuantity: 10,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        minimumStockQuantity: 1,
        wac: "10.00",
      },
      {
        branchId,
        productId: productIdB,
        availableQuantity: 10,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        minimumStockQuantity: 1,
        wac: "15.00",
      },
    ]);

    // Order 1: requests A then B
    const order1 = SalesService.createSale(
      {
        branchId,
        items: [
          { productId: productIdA, unitId: unitIdA, quantity: 2, unitPrice: 20.0 },
          { productId: productIdB, unitId: unitIdB, quantity: 2, unitPrice: 30.0 },
        ],
        payments: [
          { paymentMethodId, amount: 100.0 },
        ],
      },
      { id: userId, role: "OWNER", branchId }
    );

    // Order 2: requests B then A (opposing order)
    const order2 = SalesService.createSale(
      {
        branchId,
        items: [
          { productId: productIdB, unitId: unitIdB, quantity: 2, unitPrice: 30.0 },
          { productId: productIdA, unitId: unitIdA, quantity: 2, unitPrice: 20.0 },
        ],
        payments: [
          { paymentMethodId, amount: 100.0 },
        ],
      },
      { id: userId, role: "OWNER", branchId }
    );

    // Both should succeed without deadlock (40P01) because product IDs are sorted lexicographically
    const [res1, res2] = await Promise.all([order1, order2]);

    expect(res1.status).toBe("COMPLETED");
    expect(res2.status).toBe("COMPLETED");

    // Both products should have 6 units left (10 - 2 - 2 = 6)
    const [balA] = await db
      .select()
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.branchId, branchId),
          eq(inventoryBalances.productId, productIdA)
        )
      );
    const [balB] = await db
      .select()
      .from(inventoryBalances)
      .where(
        and(
          eq(inventoryBalances.branchId, branchId),
          eq(inventoryBalances.productId, productIdB)
        )
      );

    expect(balA!.availableQuantity).toBe(6);
    expect(balB!.availableQuantity).toBe(6);
  });
});
