import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../../config/database.js";
import { inventoryMovements, inventoryBalances, products, branches, users, categories } from "../../database/schema/index.js";
import { InventoryService } from "./service.js";
import { eq } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";

describe("Inventory - Opening Stock", () => {
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
  });

  afterEach(async () => {
    await db.delete(inventoryMovements);
    await db.delete(inventoryBalances);
    await db.delete(products).where(eq(products.id, testProductId));
    await db.delete(categories).where(eq(categories.id, testCategoryId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(branches).where(eq(branches.id, testBranchId));
  });

  it("should allow OWNER to record opening stock successfully", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    const result = await InventoryService.createOpeningStock({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 50,
      unitCost: 15.5
    }, ownerUser);

    expect(result).toBeDefined();
    expect(result.movementType).toBe("OPENING_STOCK");
    expect(result.quantity).toBe(50);
    expect(result.unitCost).toBe("15.50");

    // Verify DB
    const balances = await db.select().from(inventoryBalances).where(eq(inventoryBalances.productId, testProductId));
    expect(balances).toHaveLength(1);
    expect(balances[0]!.availableQuantity).toBe(50);
    expect(balances[0]!.wac).toBe("15.50");
  });

  it("should throw 403 Forbidden for EMPLOYEE trying to record opening stock", async () => {
    const employeeUser = { id: testUserId, role: "EMPLOYEE", branchId: testBranchId };

    await expect(InventoryService.createOpeningStock({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 50,
      unitCost: 15.5
    }, employeeUser)).rejects.toThrow("Forbidden: Only owners can record opening stock");
  });

  it("should enforce the one-time opening stock rule per product and branch (409 Conflict)", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    // First time should succeed
    await InventoryService.createOpeningStock({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 50,
      unitCost: 15.5
    }, ownerUser);

    // Second time should fail
    await expect(InventoryService.createOpeningStock({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 25,
      unitCost: 20
    }, ownerUser)).rejects.toThrow("Opening stock has already been recorded for this product and branch");
  });

  it("should allow opening stock for the same product in a DIFFERENT branch", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    const uniqueSuffix2 = crypto.randomUUID();
    const [branch2] = await db.insert(branches).values({
      name: "Test Branch 2 " + uniqueSuffix2,
      code: "TB2-" + uniqueSuffix2,
    }).returning();

    // Branch 1
    await InventoryService.createOpeningStock({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 50,
      unitCost: 15.5
    }, ownerUser);

    // Branch 2
    const result2 = await InventoryService.createOpeningStock({
      branchId: branch2!.id,
      productId: testProductId,
      quantity: 100,
      unitCost: 12
    }, ownerUser);

    expect(result2).toBeDefined();

    await db.delete(inventoryMovements).where(eq(inventoryMovements.branchId, branch2!.id));
    await db.delete(inventoryBalances).where(eq(inventoryBalances.branchId, branch2!.id));
    await db.delete(branches).where(eq(branches.id, branch2!.id));
  });

  it("should reject zero or negative unit cost", async () => {
    const ownerUser = { id: testUserId, role: "OWNER" };

    // Zero cost
    await expect(InventoryService.createOpeningStock({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 50,
      unitCost: 0
    }, ownerUser)).rejects.toThrow();

    // Negative cost
    await expect(InventoryService.createOpeningStock({
      branchId: testBranchId,
      productId: testProductId,
      quantity: 50,
      unitCost: -10
    }, ownerUser)).rejects.toThrow();

    // Verify DB remains clean (no movement recorded)
    const movements = await db.select().from(inventoryMovements).where(eq(inventoryMovements.productId, testProductId));
    expect(movements).toHaveLength(0);
    const balances = await db.select().from(inventoryBalances).where(eq(inventoryBalances.productId, testProductId));
    expect(balances).toHaveLength(0);
  });
});
