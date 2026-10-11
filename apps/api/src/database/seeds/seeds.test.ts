import { describe, it, expect, beforeAll } from "vitest";
import { db } from "../../config/database.js";
import { branches, categories, products, users, inventoryBalances, productUnits } from "../schema/index.js";
import { seedDatabase, SEED_IDS } from "./index.js";


describe("Database Seeding Baseline & Idempotency", () => {
  beforeAll(async () => {
    // Run initial seed
    await seedDatabase({ reset: true });
  });

  it("seeds exactly 3 branches with expected codes and names", async () => {
    const allBranches = await db.select().from(branches);
    expect(allBranches).toHaveLength(3);

    const codes = allBranches.map(b => b.code).sort();
    expect(codes).toEqual(["BRANCH-DT", "BRANCH-MAIN", "BRANCH-WH"]);

    const names = allBranches.map(b => b.name).sort();
    expect(names).toEqual(["Downtown Branch", "Main Branch", "Warehouse Branch"]);
  });

  it("seeds exactly 3 stationery categories", async () => {
    const allCategories = await db.select().from(categories);
    expect(allCategories).toHaveLength(3);

    const names = allCategories.map(c => c.name).sort();
    expect(names).toEqual(["Office Supplies", "Paper Products", "Writing Supplies"]);
  });

  it("seeds exactly 6 realistic stationery products with correct category relationships", async () => {
    const allProducts = await db.select().from(products);
    expect(allProducts).toHaveLength(6);

    const expectedSkus = [
      "STN-FOLDER-01",
      "STN-MARKER-01",
      "STN-NOTE-01",
      "STN-PAPER-01",
      "STN-PEN-01",
      "STN-PENCIL-01"
    ];
    const skus = allProducts.map(p => p.sku).sort();
    expect(skus).toEqual(expectedSkus);


    // Verify all products link to one of the 3 stationery categories
    const validCategoryIds = Object.values(SEED_IDS.categories);
    for (const p of allProducts) {
      expect(validCategoryIds).toContain(p.categoryId);
    }
  });

  it("seeds base units and prices for each product", async () => {
    const allUnits = await db.select().from(productUnits);
    const baseUnits = allUnits.filter(u => u.isBase);
    expect(baseUnits).toHaveLength(6);

    // Verify all 6 products have a base unit
    const productIdsWithBase = baseUnits.map(u => u.productId).sort();
    const allProductIds = Object.values(SEED_IDS.products).sort();
    expect(productIdsWithBase).toEqual(allProductIds);
  });

  it("seeds inventory balances for all 6 products across all 3 branches", async () => {
    const balances = await db.select().from(inventoryBalances);
    // 6 products * 3 branches = 18 balance records
    expect(balances).toHaveLength(18);

    for (const b of balances) {
      expect(b.availableQuantity).toBeGreaterThan(0);
      expect(Number(b.wac)).toBeGreaterThan(0);
    }
  });

  it("preserves required owner and employee test accounts and branch assignments", async () => {
    const allUsers = await db.select().from(users);
    
    // Check owner accounts
    const ownerGelana = allUsers.find(u => u.email === "owner@gelana.com");
    expect(ownerGelana).toBeDefined();
    expect(ownerGelana?.role).toBe("OWNER");
    expect(ownerGelana?.isActive).toBe(true);

    const ownerDev = allUsers.find(u => u.email === "owner@dev.local");
    expect(ownerDev).toBeDefined();
    expect(ownerDev?.role).toBe("OWNER");

    // Check employee accounts with valid Main Branch assignment
    const empGelana = allUsers.find(u => u.email === "employee@gelana.com");
    expect(empGelana).toBeDefined();
    expect(empGelana?.role).toBe("EMPLOYEE");
    expect(empGelana?.branchId).toBe(SEED_IDS.branches.main);
    expect(empGelana?.isActive).toBe(true);

    const empDev = allUsers.find(u => u.email === "employee@dev.local");
    expect(empDev).toBeDefined();
    expect(empDev?.role).toBe("EMPLOYEE");
    expect(empDev?.branchId).toBe(SEED_IDS.branches.main);
  });

  it("is idempotent: running seed again does not duplicate or multiply records", async () => {
    // Run seed again without reset (simulating repeated seeding / idempotent run)
    await seedDatabase({ reset: false });

    const branchesAfter = await db.select().from(branches);
    expect(branchesAfter).toHaveLength(3);

    const categoriesAfter = await db.select().from(categories);
    expect(categoriesAfter).toHaveLength(3);

    const productsAfter = await db.select().from(products);
    expect(productsAfter).toHaveLength(6);

    const balancesAfter = await db.select().from(inventoryBalances);
    expect(balancesAfter).toHaveLength(18);
  });
});
