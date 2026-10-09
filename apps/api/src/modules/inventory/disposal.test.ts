import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../../config/database.js";
import { inventoryMovements, inventoryBalances, products, branches, users, categories } from "../../database/schema/index.js";
import { InventoryService } from "./service.js";
import { eq, and } from "drizzle-orm";

describe("Inventory - Disposal", () => {
  let testBranchId: string;
  let testProductId: string;
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

    const [product] = await db.insert(products).values({
      name: "Test Product",
      sku: "TEST-SKU-" + uniqueSuffix,
      categoryId: testCategoryId,
    }).returning();
    testProductId = product!.id;

    // We manually simulate a returned damaged item to seed the database
    // Usually this comes from Milestone 7 (Sales Returns)
    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "RETURN_DAMAGED",
      quantity: 5,
      unitCost: 10,
      createdById: testUserId,
    });
  });

  afterEach(async () => {
    await db.delete(inventoryMovements);
    await db.delete(inventoryBalances);
    await db.delete(products).where(eq(products.categoryId, testCategoryId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(branches).where(eq(branches.id, testBranchId));
  });

  it("should successfully dispose of damaged stock and reduce damagedQuantity", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    const movement = await InventoryService.createDisposal({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 2,
      reason: "Expired stock",
    }, ownerUser);

    expect(movement).toBeDefined();
    expect(movement.movementType).toBe("DISPOSAL");
    expect(movement.quantity).toBe(-2);
    expect(movement.reason).toBe("Expired stock");
    expect(Number(movement.unitCost)).toBe(0);

    const balance = await db.select().from(inventoryBalances)
      .where(and(eq(inventoryBalances.productId, testProductId), eq(inventoryBalances.branchId, testBranchId)));
    
    expect(balance[0]!.damagedQuantity).toBe(3); // 5 - 2
    expect(balance[0]!.availableQuantity).toBe(0); // unaltered
  });

  it("should throw an error if attempting to dispose more than damagedQuantity", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    await expect(InventoryService.createDisposal({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 6, // only 5 available
      reason: "Expired stock",
    }, ownerUser)).rejects.toThrow("Insufficient damaged inventory to dispose");
  });

  it("should throw 403 Forbidden for EMPLOYEE role", async () => {
    const employeeUser = { id: testUserId, role: "EMPLOYEE", branchId: testBranchId };

    await expect(InventoryService.createDisposal({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 2,
      reason: "Expired stock",
    }, employeeUser)).rejects.toThrow("Forbidden: Only owners can dispose of stock");
  });

  it("should throw an error if there is no damaged stock bucket for the product at all", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    // New product without any balances
    const uniqueSuffix = crypto.randomUUID();
    const [newProduct] = await db.insert(products).values({
      name: "New Product",
      sku: "TEST-SKU-NEW-" + uniqueSuffix,
      categoryId: testCategoryId,
    }).returning();

    await expect(InventoryService.createDisposal({
      branchId: testBranchId,
      productId: newProduct!.id,
      quantity: 1,
      reason: "Broken on arrival",
    }, ownerUser)).rejects.toThrow("Insufficient damaged inventory to dispose");
  });
});
