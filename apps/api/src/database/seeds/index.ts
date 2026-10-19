import * as argon2 from "argon2";
import { sql } from "drizzle-orm";
import { db } from "../../config/database.js";

import { 
  branches, users, categories, products, productUnits, 
  productUnitConversions, productPrices, inventoryBalances,
  paymentMethods, suppliers
} from "../schema/index.js";

// Canonical deterministic UUIDs for development baseline
export const SEED_IDS = {
  branches: {
    main: "00000000-0000-4000-8000-000000000101",
    downtown: "00000000-0000-4000-8000-000000000102",
    warehouse: "00000000-0000-4000-8000-000000000103",
  },
  categories: {
    writing: "00000000-0000-4000-8000-000000000201",
    paper: "00000000-0000-4000-8000-000000000202",
    office: "00000000-0000-4000-8000-000000000203",
  },
  products: {
    notebook: "00000000-0000-4000-8000-000000000301",
    pen: "00000000-0000-4000-8000-000000000302",
    pencil: "00000000-0000-4000-8000-000000000303",
    paper: "00000000-0000-4000-8000-000000000304",
    folder: "00000000-0000-4000-8000-000000000305",
    marker: "00000000-0000-4000-8000-000000000306",
  },
  units: {
    notebookBase: "00000000-0000-4000-8000-000000000401",
    notebookPack: "00000000-0000-4000-8000-000000000402",
    penBase: "00000000-0000-4000-8000-000000000403",
    penBox: "00000000-0000-4000-8000-000000000404",
    pencilBase: "00000000-0000-4000-8000-000000000405",
    pencilBox: "00000000-0000-4000-8000-000000000406",
    paperBase: "00000000-0000-4000-8000-000000000407",
    paperCarton: "00000000-0000-4000-8000-000000000408",
    folderBase: "00000000-0000-4000-8000-000000000409",
    folderPack: "00000000-0000-4000-8000-000000000410",
    markerBase: "00000000-0000-4000-8000-000000000411",
    markerPack: "00000000-0000-4000-8000-000000000412",
  },
  users: {
    ownerGelana: "00000000-0000-4000-8000-000000000501",
    ownerDev: "00000000-0000-4000-8000-000000000502",
    employeeGelana: "00000000-0000-4000-8000-000000000503",
    employeeDev: "00000000-0000-4000-8000-000000000504",
    downtownGelana: "00000000-0000-4000-8000-000000000505",
    warehouseGelana: "00000000-0000-4000-8000-000000000506",
  },
  paymentMethods: {
    cash: "00000000-0000-4000-8000-000000000601",
    card: "00000000-0000-4000-8000-000000000602",
    bank: "00000000-0000-4000-8000-000000000603",
    telebirr: "00000000-0000-4000-8000-000000000604",
  },
  suppliers: {
    wholesale: "00000000-0000-4000-8000-000000000701",
    paperMills: "00000000-0000-4000-8000-000000000702",
  }
};

export async function seedDatabase(options: { reset?: boolean } = { reset: true }) {
  console.log("Starting Gelana Stationery Seed Process...");

  if (options.reset) {
    console.log("Resetting database tables...");
    await db.execute(sql`
      TRUNCATE TABLE 
        branches, users, branch_assignments, categories, products, 
        product_units, product_unit_conversions, product_prices, suppliers, 
        payment_methods, receivings, receiving_items, inventory_balances, 
        inventory_movements, sales, sale_items, sale_payments,
        daily_closings, daily_closing_payments, daily_closing_events
      CASCADE;
    `);
  }

  // 1. Branches (Exactly 3)
  console.log("Seeding 3 Branches...");
  const branchData = [
    {
      id: SEED_IDS.branches.main,
      name: "Main Branch",
      code: "BRANCH-MAIN",
      address: "Bole Road, Addis Ababa",
      phoneNumber: "+251911111111",
      isActive: true,
    },
    {
      id: SEED_IDS.branches.downtown,
      name: "Downtown Branch",
      code: "BRANCH-DT",
      address: "Piazza, Addis Ababa",
      phoneNumber: "+251911222222",
      isActive: true,
    },
    {
      id: SEED_IDS.branches.warehouse,
      name: "Warehouse Branch",
      code: "BRANCH-WH",
      address: "Kality Industrial Zone, Addis Ababa",
      phoneNumber: "+251911333333",
      isActive: true,
    },
  ];

  for (const b of branchData) {
    await db.insert(branches)
      .values(b)
      .onConflictDoUpdate({
        target: branches.code,
        set: { name: b.name, address: b.address, phoneNumber: b.phoneNumber, isActive: b.isActive }
      });
  }

  // 2. Categories (Exactly 3)
  console.log("Seeding 3 Stationery Categories...");
  const categoryData = [
    { id: SEED_IDS.categories.writing, name: "Writing Supplies", isActive: true },
    { id: SEED_IDS.categories.paper, name: "Paper Products", isActive: true },
    { id: SEED_IDS.categories.office, name: "Office Supplies", isActive: true },
  ];

  for (const c of categoryData) {
    await db.insert(categories)
      .values(c)
      .onConflictDoUpdate({
        target: categories.name,
        set: { isActive: c.isActive }
      });
  }

  // 3. Products (Exactly 6)
  console.log("Seeding 6 Stationery Products...");
  const productDefinitions = [
    {
      id: SEED_IDS.products.notebook,
      name: "Hardcover Notebook",
      sku: "STN-NOTE-01",
      categoryId: SEED_IDS.categories.paper,
      baseUnit: { id: SEED_IDS.units.notebookBase, name: "Piece", price: "120.00", cost: "75.00" },
      alternateUnit: { id: SEED_IDS.units.notebookPack, name: "Pack (6 Pcs)", price: "680.00", conversion: "6.0000" },
      balances: { main: 80, downtown: 45, warehouse: 300 }
    },
    {
      id: SEED_IDS.products.pen,
      name: "Ballpoint Pen (Blue)",
      sku: "STN-PEN-01",
      categoryId: SEED_IDS.categories.writing,
      baseUnit: { id: SEED_IDS.units.penBase, name: "Piece", price: "25.00", cost: "15.00" },
      alternateUnit: { id: SEED_IDS.units.penBox, name: "Box (50 Pcs)", price: "1150.00", conversion: "50.0000" },
      balances: { main: 150, downtown: 90, warehouse: 600 }
    },
    {
      id: SEED_IDS.products.pencil,
      name: "HB Wooden Pencil",
      sku: "STN-PENCIL-01",
      categoryId: SEED_IDS.categories.writing,
      baseUnit: { id: SEED_IDS.units.pencilBase, name: "Piece", price: "10.00", cost: "6.00" },
      alternateUnit: { id: SEED_IDS.units.pencilBox, name: "Box (12 Pcs)", price: "100.00", conversion: "12.0000" },
      balances: { main: 120, downtown: 70, warehouse: 500 }
    },
    {
      id: SEED_IDS.products.paper,
      name: "A4 Printer Paper (500 Sheets)",
      sku: "STN-PAPER-01",
      categoryId: SEED_IDS.categories.paper,
      baseUnit: { id: SEED_IDS.units.paperBase, name: "Ream", price: "450.00", cost: "300.00" },
      alternateUnit: { id: SEED_IDS.units.paperCarton, name: "Carton (5 Reams)", price: "2150.00", conversion: "5.0000" },
      balances: { main: 60, downtown: 35, warehouse: 250 }
    },
    {
      id: SEED_IDS.products.folder,
      name: "Document Folder",
      sku: "STN-FOLDER-01",
      categoryId: SEED_IDS.categories.office,
      baseUnit: { id: SEED_IDS.units.folderBase, name: "Piece", price: "80.00", cost: "45.00" },
      alternateUnit: { id: SEED_IDS.units.folderPack, name: "Pack (10 Pcs)", price: "720.00", conversion: "10.0000" },
      balances: { main: 70, downtown: 40, warehouse: 200 }
    },
    {
      id: SEED_IDS.products.marker,
      name: "Permanent Marker (Black)",
      sku: "STN-MARKER-01",
      categoryId: SEED_IDS.categories.writing,
      baseUnit: { id: SEED_IDS.units.markerBase, name: "Piece", price: "60.00", cost: "35.00" },
      alternateUnit: { id: SEED_IDS.units.markerPack, name: "Pack (4 Pcs)", price: "220.00", conversion: "4.0000" },
      balances: { main: 90, downtown: 50, warehouse: 350 }
    },
  ];

  for (const p of productDefinitions) {
    await db.insert(products)
      .values({
        id: p.id,
        name: p.name,
        sku: p.sku,
        categoryId: p.categoryId,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: products.sku,
        set: { name: p.name, categoryId: p.categoryId, isActive: true }
      });

    // Base Unit
    await db.insert(productUnits)
      .values({
        id: p.baseUnit.id,
        productId: p.id,
        name: p.baseUnit.name,
        isBase: true,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [productUnits.productId, productUnits.name],
        set: { isBase: true, isActive: true }
      });

    // Base Unit Conversion
    await db.insert(productUnitConversions)
      .values({
        productUnitId: p.baseUnit.id,
        conversionQuantity: "1.0000",
      })
      .onConflictDoNothing();

    // Base Unit Price
    await db.insert(productPrices)
      .values({
        productUnitId: p.baseUnit.id,
        sellingPrice: p.baseUnit.price,
      })
      .onConflictDoNothing();

    // Alternate Unit
    if (p.alternateUnit) {
      await db.insert(productUnits)
        .values({
          id: p.alternateUnit.id,
          productId: p.id,
          name: p.alternateUnit.name,
          isBase: false,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: [productUnits.productId, productUnits.name],
          set: { isBase: false, isActive: true }
        });

      await db.insert(productUnitConversions)
        .values({
          productUnitId: p.alternateUnit.id,
          conversionQuantity: p.alternateUnit.conversion,
        })
        .onConflictDoNothing();

      await db.insert(productPrices)
        .values({
          productUnitId: p.alternateUnit.id,
          sellingPrice: p.alternateUnit.price,
        })
        .onConflictDoNothing();
    }

    // Branch Inventory Balances
    const branchStockMap: [string, number][] = [
      [SEED_IDS.branches.main, p.balances.main],
      [SEED_IDS.branches.downtown, p.balances.downtown],
      [SEED_IDS.branches.warehouse, p.balances.warehouse],
    ];

    for (const [branchId, qty] of branchStockMap) {
      await db.insert(inventoryBalances)
        .values({
          branchId,
          productId: p.id,
          availableQuantity: qty,
          damagedQuantity: 0,
          inTransitQuantity: 0,
          minimumStockQuantity: 10,
          wac: p.baseUnit.cost,
        })
        .onConflictDoUpdate({
          target: [inventoryBalances.branchId, inventoryBalances.productId],
          set: { availableQuantity: qty, wac: p.baseUnit.cost }
        });
    }
  }

  // 4. Test Accounts
  console.log("Seeding Test Accounts...");
  const passwordHash = await argon2.hash("password123");

  const userData = [
    {
      id: SEED_IDS.users.ownerGelana,
      name: "Gelana Owner",
      email: "owner@gelana.com",
      passwordHash,
      role: "OWNER" as const,
      branchId: null,
      isActive: true,
    },
    {
      id: SEED_IDS.users.ownerDev,
      name: "Development Owner",
      email: "owner@dev.local",
      passwordHash,
      role: "OWNER" as const,
      branchId: null,
      isActive: true,
    },
    {
      id: SEED_IDS.users.employeeGelana,
      name: "Gelana Employee",
      email: "employee@gelana.com",
      passwordHash,
      role: "EMPLOYEE" as const,
      branchId: SEED_IDS.branches.main,
      isActive: true,
    },
    {
      id: SEED_IDS.users.employeeDev,
      name: "Development Employee",
      email: "employee@dev.local",
      passwordHash,
      role: "EMPLOYEE" as const,
      branchId: SEED_IDS.branches.main,
      isActive: true,
    },
    {
      id: SEED_IDS.users.downtownGelana,
      name: "Downtown Employee",
      email: "downtown@gelana.com",
      passwordHash,
      role: "EMPLOYEE" as const,
      branchId: SEED_IDS.branches.downtown,
      isActive: true,
    },
    {
      id: SEED_IDS.users.warehouseGelana,
      name: "Warehouse Employee",
      email: "warehouse@gelana.com",
      passwordHash,
      role: "EMPLOYEE" as const,
      branchId: SEED_IDS.branches.warehouse,
      isActive: true,
    },
  ];

  for (const u of userData) {
    await db.insert(users)
      .values(u)
      .onConflictDoUpdate({
        target: users.email,
        set: { name: u.name, passwordHash: u.passwordHash, role: u.role, branchId: u.branchId, isActive: u.isActive }
      });
  }

  // 5. Payment Methods
  console.log("Seeding Payment Methods...");
  const pmData = [
    { id: SEED_IDS.paymentMethods.cash, name: "Cash", isActive: true },
    { id: SEED_IDS.paymentMethods.card, name: "Credit Card", isActive: true },
    { id: SEED_IDS.paymentMethods.bank, name: "Bank Transfer", isActive: true },
    { id: SEED_IDS.paymentMethods.telebirr, name: "Telebirr", isActive: true },
  ];

  for (const pm of pmData) {
    await db.insert(paymentMethods)
      .values(pm)
      .onConflictDoUpdate({
        target: paymentMethods.id,
        set: { name: pm.name, isActive: pm.isActive }
      });
  }

  // 6. Suppliers
  console.log("Seeding Suppliers...");
  const supplierData = [
    {
      id: SEED_IDS.suppliers.wholesale,
      name: "Addis Stationery Wholesale",
      phone: "+251911001122",
      address: "Mercato, Addis Ababa",
      contactPerson: "Abebe Kebede",
      isActive: true,
    },
    {
      id: SEED_IDS.suppliers.paperMills,
      name: "National Paper Mills",
      phone: "+251911334455",
      address: "Wonji Road, Adama",
      contactPerson: "Almaz Tesfaye",
      isActive: true,
    },
  ];

  for (const s of supplierData) {
    await db.insert(suppliers)
      .values(s)
      .onConflictDoUpdate({
        target: suppliers.id,
        set: { name: s.name, phone: s.phone, address: s.address, contactPerson: s.contactPerson, isActive: s.isActive }
      });
  }



  console.log("Seeding completed successfully!");
  console.log("Canonical Development Dataset Established:");
  console.log("- 3 Branches: Main Branch, Downtown Branch, Warehouse Branch");
  console.log("- 3 Categories: Writing Supplies, Paper Products, Office Supplies");
  console.log("- 6 Products: Hardcover Notebook, Ballpoint Pen, HB Wooden Pencil, A4 Printer Paper, Document Folder, Permanent Marker");
  console.log("- Test accounts password: 'password123' (owner@gelana.com, employee@gelana.com, owner@dev.local, employee@dev.local)");
}

// Auto-run if executed as CLI entry point
const isDirectCli = import.meta.url === `file://${process.argv[1]}`;
if (isDirectCli) {
  seedDatabase({ reset: true })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
