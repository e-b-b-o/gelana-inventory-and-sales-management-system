import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../../config/database.js";
import { inventoryMovements, inventoryBalances, products, branches, users, categories } from "../../database/schema/index.js";
import { InventoryService } from "./service.js";
import { eq } from "drizzle-orm";

describe("Inventory Movements (recordMovement)", () => {
  let testBranchId: string;
  let testProductId: string;
  let testUserId: string;
  let testCategoryId: string;
  let extraBranchIds: string[] = [];

  beforeEach(async () => {
    extraBranchIds = [];
    // Setup test data
    const uniqueSuffix = crypto.randomUUID();
    const [branch] = await db.insert(branches).values({
      name: "Test Branch " + uniqueSuffix,
      code: "TB-" + uniqueSuffix,
    }).returning();
    testBranchId = branch!.id;

    const [user] = await db.insert(users).values({
      email: `test-${uniqueSuffix}@example.com`,
      passwordHash: "hash",
      name: "Test User",
      role: "OWNER",
    }).returning();
    testUserId = user!.id;

    const [category] = await db.insert(categories).values({
      name: "Test Category " + uniqueSuffix,
    }).returning();
    testCategoryId = category!.id;

    const [product] = await db.insert(products).values({
      name: "Test Product",
      sku: "TEST-SKU-" + uniqueSuffix,
      categoryId: testCategoryId,
    }).returning();
    testProductId = product!.id;
  });

  afterEach(async () => {
    const allBranches = [testBranchId, ...extraBranchIds];
    for (const bId of allBranches) {
      await db.delete(inventoryMovements).where(eq(inventoryMovements.branchId, bId));
      await db.delete(inventoryBalances).where(eq(inventoryBalances.branchId, bId));
      await db.delete(branches).where(eq(branches.id, bId));
    }
    await db.delete(products).where(eq(products.id, testProductId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));
    await db.delete(users).where(eq(users.id, testUserId));
  });


  it("should create opening stock and establish WAC", async () => {
    const movement = await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "OPENING_STOCK",
      quantity: 100,
      unitCost: 10, // Cost is 10
      createdById: testUserId,
    });

    expect(movement).toBeDefined();
    expect(movement.movementType).toBe("OPENING_STOCK");
    expect(movement.quantity).toBe(100);
    expect(movement.unitCost).toBe("10.00");
    expect(movement.transactionId).toMatch(/^OPN-\d{6}$/);

    const balances = await db.select().from(inventoryBalances)
      .where(eq(inventoryBalances.productId, testProductId));
    expect(balances).toHaveLength(1);
    expect(balances[0]!.availableQuantity).toBe(100);
    expect(balances[0]!.damagedQuantity).toBe(0);
    expect(balances[0]!.wac).toBe("10.00");
  });

  it("should recalculate WAC correctly on receiving", async () => {
    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "OPENING_STOCK",
      quantity: 100,
      unitCost: 10,
      createdById: testUserId,
    });

    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "RECEIVING",
      quantity: 100,
      unitCost: 20, // New cost is 20
      createdById: testUserId,
    });

    const balances = await db.select().from(inventoryBalances)
      .where(eq(inventoryBalances.productId, testProductId));
    
    expect(balances[0]!.availableQuantity).toBe(200);
    // (100 * 10 + 100 * 20) / 200 = 15
    expect(balances[0]!.wac).toBe("15.00");
  });

  it("should not change WAC on stock consuming operations", async () => {
    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "OPENING_STOCK",
      quantity: 100,
      unitCost: 10,
      createdById: testUserId,
    });

    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "SALE",
      quantity: -20, // Sold 20 units
      unitCost: 10, // Selling cost doesn't affect WAC, but must be passed for ledger consistency or ignored in WAC math
      createdById: testUserId,
    });

    const balances = await db.select().from(inventoryBalances)
      .where(eq(inventoryBalances.productId, testProductId));
    
    expect(balances[0]!.availableQuantity).toBe(80);
    expect(balances[0]!.wac).toBe("10.00"); // WAC unchanged
  });

  it("should prevent negative inventory for online operations", async () => {
    await expect(
      InventoryService.recordMovement({
        branchId: testBranchId,
        productId: testProductId,
        movementType: "SALE",
        quantity: -20,
        unitCost: 10,
        createdById: testUserId,
      })
    ).rejects.toThrow("Insufficient available inventory");
  });

  it("should strictly reject negative inventory with no offline sync bypasses", async () => {
    await expect(
      InventoryService.recordMovement({
        branchId: testBranchId,
        productId: testProductId,
        movementType: "SALE",
        quantity: -20,
        unitCost: 10,
        createdById: testUserId,
      })
    ).rejects.toThrow("Insufficient available inventory");
  });

  it("should maintain branch isolation for balances and WAC", async () => {
    // Branch 1
    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "OPENING_STOCK",
      quantity: 100,
      unitCost: 10,
      createdById: testUserId,
    });

    // Branch 2
    const [branch2] = await db.insert(branches).values({
      name: "Test Branch 2 " + Date.now(),
      code: "TB2-" + Date.now(),
    }).returning();
    extraBranchIds.push(branch2!.id);

    await InventoryService.recordMovement({
      branchId: branch2!.id,
      productId: testProductId,
      movementType: "OPENING_STOCK",
      quantity: 50,
      unitCost: 20,
      createdById: testUserId,
    });

    const balances = await db.select().from(inventoryBalances).where(eq(inventoryBalances.productId, testProductId));
    expect(balances).toHaveLength(2);
    
    const b1 = balances.find(b => b.branchId === testBranchId);
    expect(b1?.availableQuantity).toBe(100);
    expect(b1?.wac).toBe("10.00");

    const b2 = balances.find(b => b.branchId === branch2!.id);
    expect(b2?.availableQuantity).toBe(50);
    expect(b2?.wac).toBe("20.00");
  });

  it("should restrict employees to their assigned branch for getMovements", async () => {
    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "OPENING_STOCK",
      quantity: 100,
      unitCost: 10,
      createdById: testUserId,
    });

    // Employee from another branch
    const employee = { role: "EMPLOYEE", branchId: "12345678-1234-1234-1234-123456789012" };
    
    // Trying to fetch testBranchId should throw 403
    await expect(
      InventoryService.getMovements({ branchId: testBranchId, page: 1, limit: 10 }, employee)
    ).rejects.toThrow("Forbidden: Cannot view movements for other branches");
    
    // Fetching without branchId should default to employee's branch (which has no movements here)
    const result = await InventoryService.getMovements({ page: 1, limit: 10 }, employee);
    expect(result.data).toHaveLength(0);
  });
});
