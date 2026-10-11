import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../../config/database.js";
import { inventoryMovements, inventoryBalances, products, branches, users, categories } from "../../database/schema/index.js";
import { InventoryService } from "./service.js";
import { eq, and } from "drizzle-orm";

describe("Inventory - Stocktake", () => {
  let testBranchId: string;
  let testProductId1: string;
  let testProductId2: string;
  let testUserId: string;
  let testCategoryId: string;

  beforeEach(async () => {
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

    const [product1] = await db.insert(products).values({
      name: "Test Product 1",
      sku: "TEST-SKU-1-" + uniqueSuffix,
      categoryId: testCategoryId,
    }).returning();
    testProductId1 = product1!.id;

    const [product2] = await db.insert(products).values({
      name: "Test Product 2",
      sku: "TEST-SKU-2-" + uniqueSuffix,
      categoryId: testCategoryId,
    }).returning();
    testProductId2 = product2!.id;

    // Initial stock for product 1 -> 100 units
    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId1,
      movementType: "OPENING_STOCK",
      quantity: 100,
      unitCost: 10,
      createdById: testUserId,
    });
    
    // Initial stock for product 2 -> 50 units
    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId2,
      movementType: "OPENING_STOCK",
      quantity: 50,
      unitCost: 20,
      createdById: testUserId,
    });
  });

  afterEach(async () => {
    await db.delete(inventoryMovements).where(eq(inventoryMovements.branchId, testBranchId));
    await db.delete(inventoryBalances).where(eq(inventoryBalances.branchId, testBranchId));
    await db.delete(products).where(eq(products.categoryId, testCategoryId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(branches).where(eq(branches.id, testBranchId));
  });


  it("should create correct adjustment movements for variances", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    // Let's verify the balance exists first
    const p1BalanceBefore = await db.select().from(inventoryBalances)
      .where(and(eq(inventoryBalances.productId, testProductId1), eq(inventoryBalances.branchId, testBranchId)));
    console.log("P1 BALANCE BEFORE:", p1BalanceBefore);

    // Stocktake: 
    // Product 1: physical = 105 (system is 100, variance = +5)
    // Product 2: physical = 40 (system is 50, variance = -10)
    const result = await InventoryService.submitStocktake({
      branchId: testBranchId,
      items: [
        { productId: testProductId1, physicalCount: 105 },
        { productId: testProductId2, physicalCount: 40 },
      ],
      reason: "Monthly audit",
    }, ownerUser);

    expect(result).toHaveLength(2);
    
    const p1Movement = result.find(m => m.productId === testProductId1);
    expect(p1Movement).toBeDefined();
    expect(p1Movement!.movementType).toBe("ADJUSTMENT");
    expect(p1Movement!.quantity).toBe(5);
    expect(p1Movement!.reason).toBe("Stocktake Variance: Monthly audit");

    const p2Movement = result.find(m => m.productId === testProductId2);
    expect(p2Movement).toBeDefined();
    expect(p2Movement!.movementType).toBe("ADJUSTMENT");
    expect(p2Movement!.quantity).toBe(-10);

    // Verify balances
    const p1Balance = await db.select().from(inventoryBalances)
      .where(and(eq(inventoryBalances.productId, testProductId1), eq(inventoryBalances.branchId, testBranchId)));
    expect(p1Balance[0]!.availableQuantity).toBe(105);
    expect(p1Balance[0]!.wac).toBe("10.00"); // Cost unchanged

    const p2Balance = await db.select().from(inventoryBalances)
      .where(and(eq(inventoryBalances.productId, testProductId2), eq(inventoryBalances.branchId, testBranchId)));
    expect(p2Balance[0]!.availableQuantity).toBe(40);
  });

  it("should NOT create a movement if physical count equals system count", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    const result = await InventoryService.submitStocktake({
      branchId: testBranchId,
      items: [
        { productId: testProductId1, physicalCount: 100 }, // system is 100
      ]
    }, ownerUser);

    expect(result).toHaveLength(0);

    const movements = await db.select().from(inventoryMovements).where(eq(inventoryMovements.movementType, "ADJUSTMENT"));
    expect(movements).toHaveLength(0);
  });

  it("should throw 403 Forbidden for EMPLOYEE trying to submit stocktake", async () => {
    const employeeUser = { id: testUserId, role: "EMPLOYEE", branchId: testBranchId };

    await expect(InventoryService.submitStocktake({
      branchId: testBranchId,
      items: [
        { productId: testProductId1, physicalCount: 100 },
      ]
    }, employeeUser)).rejects.toThrow("Forbidden: Only owners can perform stocktakes");
  });

  it("should enforce insufficient stock boundaries for stocktake that drives balance negative", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    // Wait, physicalCount is strictly >= 0 via Zod schema, so it can never result in negative available inventory.
    // However, if the Zod schema is bypassed (e.g. at the service layer directly), test it:
    await expect(InventoryService.submitStocktake({
      branchId: testBranchId,
      items: [
        { productId: testProductId1, physicalCount: -5 }, // trying to set balance to -5
      ]
    }, ownerUser)).rejects.toThrow("Insufficient available inventory");
  });

  it("should initialize stock if product had no prior balance", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };
    
    const uniqueSuffix = crypto.randomUUID();
    const [newProduct] = await db.insert(products).values({
      name: "New Product",
      sku: "TEST-SKU-NEW-" + uniqueSuffix,
      categoryId: testCategoryId,
    }).returning();

    const result = await InventoryService.submitStocktake({
      branchId: testBranchId,
      items: [
        { productId: newProduct!.id, physicalCount: 15 },
      ]
    }, ownerUser);

    expect(result).toHaveLength(1);
    expect(result[0]!.quantity).toBe(15);
    expect(Number(result[0]!.unitCost)).toBe(0); // Adjustments have no cost

    const balance = await db.select().from(inventoryBalances).where(eq(inventoryBalances.productId, newProduct!.id));
    expect(balance).toHaveLength(1);
    expect(balance[0]!.availableQuantity).toBe(15);
  });
});
