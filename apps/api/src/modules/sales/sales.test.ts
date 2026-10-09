import { describe, it, expect, beforeEach } from "vitest";
import { SalesService } from "./service.js";
import { db } from "../../config/database.js";
import { users, branches, categories, products, productUnits, inventoryBalances, paymentMethods } from "../../database/schema/index.js";
import crypto from "crypto";

describe("SalesService", () => {
  let branchId: string;
  let categoryId: string;
  let productId: string;
  let unitId: string;
  let userId: string;
  let paymentMethodId: string;

  beforeEach(async () => {
    branchId = crypto.randomUUID();
    categoryId = crypto.randomUUID();
    productId = crypto.randomUUID();
    userId = crypto.randomUUID();
    unitId = crypto.randomUUID();
    paymentMethodId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email: `${userId}@test.com`,
      passwordHash: "hash",
      name: "Test User",
      role: "OWNER",
    });

    await db.insert(branches).values({
      id: branchId,
      name: "Test Sales Branch",
      code: `TB-${branchId.substring(0, 4)}`,
    });

    await db.insert(categories).values({
      id: categoryId,
      name: `Test Category ${categoryId}`,
    });

    await db.insert(products).values({
      id: productId,
      name: "Test Product",
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
      availableQuantity: 100,
      damagedQuantity: 0,
      inTransitQuantity: 0,
      minimumStockQuantity: 10,
      wac: "5.00",
    });

    const { productPrices } = await import("../../database/schema/productPrices.js");
    await db.insert(productPrices).values({
      productUnitId: unitId,
      sellingPrice: "10.00",
    });

    await db.insert(paymentMethods).values({
      id: paymentMethodId,
      name: `Test Cash ${paymentMethodId.substring(0, 4)}`,
      isActive: true,
    });
  });

  it("should create a sale successfully and deduct inventory", async () => {
    const idempotencyKey = crypto.randomUUID();

    const sale = await SalesService.createSale({
      branchId,
      idempotencyKey,
      items: [
        {
          productId,
          unitId,
          quantity: 5,
          unitPrice: 10.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 50.00,
        }
      ]
    }, { id: userId, role: "OWNER" });

    expect(sale!.id).toBeDefined();
    expect(sale!.grandTotal).toBe("50.00");

    // Idempotency check
    const sale2 = await SalesService.createSale({
      branchId,
      idempotencyKey,
      items: [
        {
          productId,
          unitId,
          quantity: 5,
          unitPrice: 10.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 50.00,
        }
      ]
    }, { id: userId, role: "OWNER" });

    expect(sale2!.id).toBe(sale!.id);

    // Verify inventory deduction
    const balance = await db.query.inventoryBalances.findFirst({
      where: (balances, { eq, and }) => and(eq(balances.branchId, branchId), eq(balances.productId, productId))
    });
    expect(balance?.availableQuantity).toBe(95);
  });

  it("should fail if stock is insufficient", async () => {
    const idempotencyKey = crypto.randomUUID();
    await expect(SalesService.createSale({
      branchId,
      idempotencyKey,
      items: [
        {
          productId,
          unitId,
          quantity: 200, // Only 100 available
          unitPrice: 10.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 2000.00,
        }
      ]
    }, { id: userId, role: "OWNER" })).rejects.toThrow("Insufficient stock");
  });

  it("should fail if payment total does not match sale total", async () => {
    const idempotencyKey = crypto.randomUUID();
    await expect(SalesService.createSale({
      branchId,
      idempotencyKey,
      items: [
        {
          productId,
          unitId,
          quantity: 5, 
          unitPrice: 10.00, // Total 50
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 40.00, // Wrong amount
        }
      ]
    }, { id: userId, role: "OWNER" })).rejects.toThrow("Payment total (40) does not match sale grand total (50)");
  });
});
