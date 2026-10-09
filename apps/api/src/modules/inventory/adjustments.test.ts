import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../../config/database.js";
import { inventoryMovements, inventoryBalances, products, branches, users, categories } from "../../database/schema/index.js";
import { InventoryService } from "./service.js";
import { eq } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";

describe("Inventory - Adjustments", () => {
  let testBranchId: string;
  let testProductId: string;
  let testUserId: string;
  let testCategoryId: string;

  beforeEach(async () => {
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

    // Give some initial stock via recordMovement (mocking receiving or opening stock)
    await InventoryService.recordMovement({
      branchId: testBranchId,
      productId: testProductId,
      movementType: "OPENING_STOCK",
      quantity: 100,
      unitCost: 10.5,
      createdById: testUserId,
    });
  });

  afterEach(async () => {
    await db.delete(inventoryMovements);
    await db.delete(inventoryBalances);
    await db.delete(products).where(eq(products.id, testProductId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(branches).where(eq(branches.id, testBranchId));
  });

  it("should allow OWNER to make a positive adjustment", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    const result = await InventoryService.createAdjustment({
      branchId: testBranchId,
      productId: testProductId,
      quantityDelta: 5,
      reason: "Found extra stock",
    }, ownerUser);

    expect(result).toBeDefined();
    expect(result.movementType).toBe("ADJUSTMENT");
    expect(result.quantity).toBe(5);
    expect(result.reason).toBe("Found extra stock");

    // Verify DB Balances
    const balances = await db.select().from(inventoryBalances).where(eq(inventoryBalances.productId, testProductId));
    expect(balances).toHaveLength(1);
    expect(balances[0]!.availableQuantity).toBe(105);
    // WAC should be unchanged from 10.5
    expect(balances[0]!.wac).toBe("10.50");
  });

  it("should allow OWNER to make a negative adjustment", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    const result = await InventoryService.createAdjustment({
      branchId: testBranchId,
      productId: testProductId,
      quantityDelta: -10,
      reason: "Lost stock",
    }, ownerUser);

    expect(result).toBeDefined();
    expect(result.movementType).toBe("ADJUSTMENT");
    expect(result.quantity).toBe(-10);
    expect(result.reason).toBe("Lost stock");

    // Verify DB Balances
    const balances = await db.select().from(inventoryBalances).where(eq(inventoryBalances.productId, testProductId));
    expect(balances).toHaveLength(1);
    expect(balances[0]!.availableQuantity).toBe(90);
    expect(balances[0]!.wac).toBe("10.50");
  });

  it("should throw 403 Forbidden for EMPLOYEE trying to adjust stock", async () => {
    const employeeUser = { id: testUserId, role: "EMPLOYEE", branchId: testBranchId };

    await expect(InventoryService.createAdjustment({
      branchId: testBranchId,
      productId: testProductId,
      quantityDelta: -5,
      reason: "Lost stock",
    }, employeeUser)).rejects.toThrow("Forbidden: Only owners can record stock adjustments");
  });

  it("should reject zero quantity adjustment", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    await expect(InventoryService.createAdjustment({
      branchId: testBranchId,
      productId: testProductId,
      quantityDelta: 0,
      reason: "Zero stock",
    }, ownerUser)).rejects.toThrow("Adjustment quantity cannot be zero");
  });

  it("should enforce insufficient stock boundary for negative adjustment", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    await expect(InventoryService.createAdjustment({
      branchId: testBranchId,
      productId: testProductId,
      quantityDelta: -105, // Only 100 available
      reason: "Lost a lot of stock",
    }, ownerUser)).rejects.toThrow("Insufficient available inventory");
  });
});
