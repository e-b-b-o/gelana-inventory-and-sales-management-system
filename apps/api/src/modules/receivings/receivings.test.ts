import { describe, it, expect, beforeEach } from "vitest";
import { ReceivingsService } from "./service.js";
import { db } from "../../config/database.js";
import { users, branches, suppliers, products, categories, inventoryBalances, inventoryMovements } from "../../database/schema/index.js";
import { receivings, receivingItems } from "../../database/schema/receivings.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

describe("ReceivingsService", () => {
  let branchId: string;
  let supplierId: string;
  let categoryId: string;
  let productId: string;
  let userId: string;

  beforeEach(async () => {
    // Generate UUIDs
    branchId = crypto.randomUUID();
    supplierId = crypto.randomUUID();
    categoryId = crypto.randomUUID();
    productId = crypto.randomUUID();
    userId = crypto.randomUUID();

    // Setup foreign key dependencies
    await db.insert(users).values({
      id: userId,
      email: `${userId}@test.com`,
      passwordHash: "hash",
      name: "Test User",
      role: "OWNER",
    });

    await db.insert(branches).values({
      id: branchId,
      name: "Test Branch",
      code: `TB-${branchId.substring(0, 4)}`,
    });

    await db.insert(suppliers).values({
      id: supplierId,
      name: "Test Supplier",
    });

    await db.insert(categories).values({
      id: categoryId,
      name: `Test Category ${categoryId}`,
    });

    await db.insert(products).values({
      id: productId,
      name: "Test Product",
      sku: `TEST-SKU-${productId.substring(0, 8)}`,
      categoryId: categoryId,
    });
  });

  it("should create receiving, items, and update inventory WAC", async () => {
    // 1. Setup initial inventory balance with WAC 0
    await db.insert(inventoryBalances).values({
      branchId,
      productId,
      availableQuantity: 0,
      damagedQuantity: 0,
      inTransitQuantity: 0,
      wac: "0.00",
    });

    // 2. Perform Receiving
    const receiving = await ReceivingsService.createReceiving({
      branchId,
      supplierId,
      invoiceNumber: "INV-123",
      items: [
        {
          productId,
          quantity: 100,
          unitCost: 15.00,
        }
      ]
    }, userId);

    expect(receiving!.id).toBeDefined();
    expect(receiving!.totalCost).toBe("1500.00");
    expect(receiving!.invoiceNumber).toBe("INV-123");

    // 3. Verify Inventory Balance and WAC
    const balance = await db.query.inventoryBalances.findFirst({
      where: (ib, { and, eq }) => and(
        eq(ib.branchId, branchId),
        eq(ib.productId, productId)
      )
    });

    expect(balance?.availableQuantity).toBe(100);
    expect(Number(balance?.wac)).toBe(15.00); // 0 -> 15.00

    // 4. Perform second receiving with different cost
    await ReceivingsService.createReceiving({
      branchId,
      supplierId,
      items: [
        {
          productId,
          quantity: 50,
          unitCost: 18.00, // Higher cost
        }
      ]
    }, userId);

    // 5. Verify New WAC
    const updatedBalance = await db.query.inventoryBalances.findFirst({
      where: (ib, { and, eq }) => and(
        eq(ib.branchId, branchId),
        eq(ib.productId, productId)
      )
    });

    expect(updatedBalance?.availableQuantity).toBe(150);
    // WAC Formula: ((100 * 15) + (50 * 18)) / 150 = (1500 + 900) / 150 = 2400 / 150 = 16.00
    expect(Number(updatedBalance?.wac)).toBe(16.00);

    // 6. Verify Ledger Movements
    const movements = await db.query.inventoryMovements.findMany({
      where: eq(inventoryMovements.productId, productId),
    });

    expect(movements.length).toBe(2);
    expect(movements[0]!.movementType).toBe("RECEIVING");
    expect(movements[1]!.movementType).toBe("RECEIVING");
  });

  it("should fail if no items provided", async () => {
    await expect(ReceivingsService.createReceiving({
      branchId,
      supplierId,
      items: []
    }, userId)).rejects.toThrow("Receiving must contain at least one item");
  });

  it("should list receivings with pagination and filters", async () => {
    // Create first receiving
    await ReceivingsService.createReceiving({
      branchId,
      supplierId,
      items: [{ productId, quantity: 10, unitCost: 5.0 }]
    }, userId);

    // Create second receiving for different branch
    const branch2Id = crypto.randomUUID();
    await db.insert(branches).values({
      id: branch2Id,
      name: "Branch 2",
      code: `B2-${branch2Id.substring(0, 4)}`,
    });

    await ReceivingsService.createReceiving({
      branchId: branch2Id,
      supplierId,
      items: [{ productId, quantity: 20, unitCost: 5.0 }]
    }, userId);

    const all = await ReceivingsService.getReceivings({ page: 1, limit: 10, supplierId });
    expect(all.data.length).toBe(2);
    expect(all.meta.total).toBe(2);

    const filtered = await ReceivingsService.getReceivings({ page: 1, limit: 10, branchId, supplierId });
    expect(filtered.data.length).toBe(1);
    expect(filtered.data[0]!.branchId).toBe(branchId);
    expect(filtered.meta.total).toBe(1);
  });

  it("should return receiving details by id", async () => {
    const receiving = await ReceivingsService.createReceiving({
      branchId,
      supplierId,
      items: [{ productId, quantity: 10, unitCost: 5.0 }]
    }, userId);

    const details = await ReceivingsService.getReceivingDetails(receiving!.id);
    expect(details.id).toBe(receiving!.id);
    expect(details.supplier.name).toBe("Test Supplier");
    expect(details.items.length).toBe(1);
    expect(details.items[0]!.product.name).toBe("Test Product");
    expect(Number(details.items[0]!.quantity)).toBe(10);
  });

  it("should fail for nonexistent receiving details", async () => {
    await expect(ReceivingsService.getReceivingDetails(crypto.randomUUID())).rejects.toThrow("Receiving not found");
  });
});
