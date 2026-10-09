import * as argon2 from "argon2";
import { sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import { 
  branches, users, categories, products, productUnits, 
  productUnitConversions, productPrices, inventoryBalances 
} from "../schema/index.js";

async function seed() {
  console.log("Seeding Database");

  console.log("Truncating existing data...");
  await db.execute(sql`
    TRUNCATE TABLE 
      branches, users, branch_assignments, categories, products, 
      product_units, product_unit_conversions, product_prices, suppliers, 
      payment_methods, receivings, receiving_items, inventory_balances, 
      inventory_movements, sales, sale_items, sale_payments 
    CASCADE;
  `);

  console.log("Seeding Branches");
  const branchData = [
    { name: "Main Branch", code: "BRANCH-MAIN" },
    { name: "Downtown Branch", code: "BRANCH-DT" },
    { name: "Warehouse", code: "BRANCH-WH" },
  ];
  const insertedBranches = await db.insert(branches).values(branchData).returning();

  console.log("Seeding Development Users");
  const rawPassword = "password123";
  const passwordHash = await argon2.hash(rawPassword);

  // Development Owner
  await db.insert(users).values({
    name: "Development Owner",
    email: "owner@dev.local",
    passwordHash,
    role: "OWNER",
    isActive: true,
  });

  // Development Employee
  const employeeBranch = insertedBranches[0];
  if (employeeBranch) {
    await db.insert(users).values({
      name: "Development Employee",
      email: "employee@dev.local",
      passwordHash,
      role: "EMPLOYEE",
      branchId: employeeBranch.id,
      isActive: true,
    });
  }

  console.log("Seeding Categories");
  const insertedCategories = await db.insert(categories).values([
    { name: "Electronics" },
    { name: "Furniture" },
    { name: "Office Supplies" },
  ]).returning();

  const catElec = insertedCategories[0];
  const catFurn = insertedCategories[1];
  const catOff = insertedCategories[2];

  if (!catElec || !catFurn || !catOff) throw new Error("Failed to insert categories");

  console.log("Seeding Products");
  const productData = [
    { sku: "SKU-ELEC-1", name: "Laptop", categoryId: catElec.id },
    { sku: "SKU-ELEC-2", name: "Monitor", categoryId: catElec.id },
    { sku: "SKU-FURN-1", name: "Office Chair", categoryId: catFurn.id },
    { sku: "SKU-FURN-2", name: "Standing Desk", categoryId: catFurn.id },
    { sku: "SKU-OFF-1", name: "Notebook", categoryId: catOff.id },
    { sku: "SKU-OFF-2", name: "Pen Set", categoryId: catOff.id },
  ];
  const insertedProducts = await db.insert(products).values(productData).returning();

  console.log("Seeding Units and Prices");
  const productPricesData = [];
  const productUnitConversionsData = [];
  const inventoryBalancesData = [];

  const prices = ["1000.00", "500.00", "150.00", "300.00", "5.00", "2.00"];

  for (const [index, product] of insertedProducts.entries()) {
    const insertedUnits = await db.insert(productUnits).values([
      { productId: product.id, name: "Piece", isBase: true }
    ]).returning();
    const baseUnit = insertedUnits[0];
    
    if (!baseUnit) continue;

    productUnitConversionsData.push({
      productUnitId: baseUnit.id,
      conversionQuantity: "1.0000"
    });

    const price = prices[index];
    if (price) {
      productPricesData.push({
        productUnitId: baseUnit.id,
        sellingPrice: price
      });

      // Inventory balances for each branch
      for (const branch of insertedBranches) {
        inventoryBalancesData.push({
          branchId: branch.id,
          productId: product.id,
          availableQuantity: 100 + (index * 10), // e.g., 100, 110, 120...
          wac: (parseFloat(price) * 0.7).toFixed(2), // 70% of selling price as cost
        });
      }
    }
  }

  await db.insert(productUnitConversions).values(productUnitConversionsData);
  await db.insert(productPrices).values(productPricesData);
  await db.insert(inventoryBalances).values(inventoryBalancesData);

  console.log("Seeding Payment Methods");
  const { paymentMethods } = await import("../schema/paymentMethods.js");
  await db.insert(paymentMethods).values([
    { name: "Cash", isActive: true },
    { name: "Credit Card", isActive: true },
    { name: "Bank Transfer", isActive: true },
  ]);

  console.log("Seeding complete. Use password 'password123' for all development users.");
  process.exit(0);
}

seed().catch((err) => {
  console.log("Seeding failed", err);
  process.exit(1);
});
