import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SalesService } from "./service.js";
import { db } from "../../config/database.js";
import { users, branches, categories, products, productUnits, inventoryBalances, paymentMethods, sales, saleItems, salePayments, inventoryMovements, saleCorrections } from "../../database/schema/index.js";

import { productPrices } from "../../database/schema/productPrices.js";
import { eq, and, sql } from "drizzle-orm";
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

  let extraProductIds: string[] = [];
  let extraUnitIds: string[] = [];
  let extraUserIds: string[] = [];
  let extraBranchIds: string[] = [];
  let extraPaymentMethodIds: string[] = [];

  afterEach(async () => {
    const allBranchIds = [branchId, ...extraBranchIds].filter(Boolean);
    for (const bId of allBranchIds) {
      await db.delete(saleCorrections).where(sql`sale_id IN (SELECT id FROM sales WHERE branch_id = ${bId})`);
      await db.delete(salePayments).where(sql`sale_id IN (SELECT id FROM sales WHERE branch_id = ${bId})`);
      await db.delete(saleItems).where(sql`sale_id IN (SELECT id FROM sales WHERE branch_id = ${bId})`);
      await db.delete(sales).where(eq(sales.branchId, bId));
      await db.delete(inventoryMovements).where(eq(inventoryMovements.branchId, bId));
      await db.delete(inventoryBalances).where(eq(inventoryBalances.branchId, bId));
    }


    if (unitId) {
      await db.delete(productPrices).where(eq(productPrices.productUnitId, unitId));
    }
    for (const eUnitId of extraUnitIds) {
      await db.delete(productPrices).where(eq(productPrices.productUnitId, eUnitId));
    }

    if (unitId) {
      await db.delete(productUnits).where(eq(productUnits.id, unitId));
    }
    for (const eUnitId of extraUnitIds) {
      await db.delete(productUnits).where(eq(productUnits.id, eUnitId));
    }
    extraUnitIds = [];

    if (productId) {
      await db.delete(products).where(eq(products.id, productId));
    }
    for (const eProdId of extraProductIds) {
      await db.delete(products).where(eq(products.id, eProdId));
    }
    extraProductIds = [];

    if (userId) {
      await db.delete(users).where(eq(users.id, userId));
    }
    for (const eUid of extraUserIds) {
      await db.delete(users).where(eq(users.id, eUid));
    }
    extraUserIds = [];

    if (categoryId) {
      await db.delete(categories).where(eq(categories.id, categoryId));
    }
    if (paymentMethodId) {
      await db.delete(paymentMethods).where(eq(paymentMethods.id, paymentMethodId));
    }
    for (const pmId of extraPaymentMethodIds) {
      await db.delete(paymentMethods).where(eq(paymentMethods.id, pmId));
    }
    extraPaymentMethodIds = [];

    for (const bId of allBranchIds) {
      await db.delete(branches).where(eq(branches.id, bId));
    }
    extraBranchIds = [];
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

    // Idempotency check with matching payload
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
    }, { id: userId, role: "OWNER" })).rejects.toThrow("Payment total (40.00) does not match sale grand total (50.00)");
  });

  it("should apply valid line-item discount and persist historical snapshots", async () => {
    const idempotencyKey = crypto.randomUUID();

    const sale = await SalesService.createSale({
      branchId,
      idempotencyKey,
      items: [
        {
          productId,
          unitId,
          quantity: 5, // 5 * 10 = 50 gross
          unitPrice: 10.00,
          lineDiscount: 5.00, // 45 net
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 45.00,
        }
      ]
    }, { id: userId, role: "OWNER" });

    expect(sale!.subtotal).toBe("50.00");
    expect(sale!.saleDiscount).toBe("0.00");
    expect(sale!.grandTotal).toBe("45.00");

    const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale!.id));
    expect(items.length).toBe(1);
    expect(items[0]!.unitPrice).toBe("10.00");
    expect(items[0]!.lineDiscount).toBe("5.00");
    expect(items[0]!.lineTotal).toBe("45.00");
    expect(items[0]!.apportionedSaleDiscount).toBe("0.00");
    expect(items[0]!.unitCost).toBe("5.00"); // snapshot of WAC
  });

  it("should apply valid sale-level discount and proportional allocation across items", async () => {
    // Create second product
    const prod2Id = crypto.randomUUID();
    const unit2Id = crypto.randomUUID();
    extraProductIds.push(prod2Id);
    extraUnitIds.push(unit2Id);

    await db.insert(products).values({
      id: prod2Id,
      name: "Second Product",
      sku: `SKU-${prod2Id.substring(0, 8)}`,
      categoryId,
    });
    await db.insert(productUnits).values({
      id: unit2Id,
      productId: prod2Id,
      name: "Piece",
      isBase: true,
    });
    await db.insert(productPrices).values({
      productUnitId: unit2Id,
      sellingPrice: "10.00",
    });
    await db.insert(inventoryBalances).values({
      branchId,
      productId: prod2Id,
      availableQuantity: 50,
      damagedQuantity: 0,
      inTransitQuantity: 0,
      minimumStockQuantity: 5,
      wac: "4.00",
    });

    const idempotencyKey = crypto.randomUUID();

    // 5 * 10 = 50 for item 1, 5 * 10 = 50 for item 2 -> Subtotal 100
    // Sale discount 10.00 -> Grand Total 90.00 (allocated 5.00 each)
    const sale = await SalesService.createSale({
      branchId,
      idempotencyKey,
      saleDiscount: 10.00,
      items: [
        {
          productId,
          unitId,
          quantity: 5,
          unitPrice: 10.00,
        },
        {
          productId: prod2Id,
          unitId: unit2Id,
          quantity: 5,
          unitPrice: 10.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 90.00,
        }
      ]
    }, { id: userId, role: "OWNER" });

    expect(sale!.subtotal).toBe("100.00");
    expect(sale!.saleDiscount).toBe("10.00");
    expect(sale!.grandTotal).toBe("90.00");

    const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale!.id));
    expect(items.length).toBe(2);
    expect(items[0]!.apportionedSaleDiscount).toBe("5.00");
    expect(items[1]!.apportionedSaleDiscount).toBe("5.00");
  });

  it("should assign rounding remainder of sale discount to line with highest net amount", async () => {
    // Create second product with different quantity
    const prod2Id = crypto.randomUUID();
    const unit2Id = crypto.randomUUID();
    extraProductIds.push(prod2Id);
    extraUnitIds.push(unit2Id);

    await db.insert(products).values({
      id: prod2Id,
      name: "Higher Value Product",
      sku: `SKU-${prod2Id.substring(0, 8)}`,
      categoryId,
    });
    await db.insert(productUnits).values({
      id: unit2Id,
      productId: prod2Id,
      name: "Piece",
      isBase: true,
    });
    await db.insert(productPrices).values({
      productUnitId: unit2Id,
      sellingPrice: "10.00",
    });
    await db.insert(inventoryBalances).values({
      branchId,
      productId: prod2Id,
      availableQuantity: 50,
      damagedQuantity: 0,
      inTransitQuantity: 0,
      minimumStockQuantity: 5,
      wac: "4.00",
    });

    const idempotencyKey = crypto.randomUUID();

    // Item 1: 3 @ 10 = 30.00
    // Item 2: 7 @ 10 = 70.00
    // Total eligible: 100.00
    // Sale discount: 10.01
    // Item 1 raw: 10.01 * 0.30 = 3.003 -> 3.00
    // Item 2 raw: 10.01 * 0.70 = 7.007 -> 7.00
    // Remainder: 10.01 - 10.00 = 0.01
    // Highest net amount is Item 2 (70.00), so Item 2 receives 7.00 + 0.01 = 7.01
    const sale = await SalesService.createSale({
      branchId,
      idempotencyKey,
      saleDiscount: 10.01,
      items: [
        {
          productId,
          unitId,
          quantity: 3,
          unitPrice: 10.00,
        },
        {
          productId: prod2Id,
          unitId: unit2Id,
          quantity: 7,
          unitPrice: 10.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 89.99,
        }
      ]
    }, { id: userId, role: "OWNER" });

    expect(sale!.grandTotal).toBe("89.99");
    const items = await db.select().from(saleItems).where(eq(saleItems.saleId, sale!.id));
    const item1 = items.find(i => i.productId === productId);
    const item2 = items.find(i => i.productId === prod2Id);
    expect(item1!.apportionedSaleDiscount).toBe("3.00");
    expect(item2!.apportionedSaleDiscount).toBe("7.01");
  });

  it("should reject employee attempting line-item or sale-level discounts", async () => {
    const employeeId = crypto.randomUUID();
    extraUserIds.push(employeeId);
    await db.insert(users).values({
      id: employeeId,
      email: `${employeeId}@test.com`,
      passwordHash: "hash",
      name: "Test Employee",
      role: "EMPLOYEE",
      branchId,
    });

    // Employee attempting line discount
    await expect(SalesService.createSale({
      branchId,
      items: [
        {
          productId,
          unitId,
          quantity: 2,
          unitPrice: 10.00,
          lineDiscount: 2.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 18.00,
        }
      ]
    }, { id: employeeId, role: "EMPLOYEE", branchId })).rejects.toThrow("Only owners can apply discounts");

    // Employee attempting sale-level discount
    await expect(SalesService.createSale({
      branchId,
      saleDiscount: 5.00,
      items: [
        {
          productId,
          unitId,
          quantity: 2,
          unitPrice: 10.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 15.00,
        }
      ]
    }, { id: employeeId, role: "EMPLOYEE", branchId })).rejects.toThrow("Only owners can apply discounts");
  });

  it("should allow employee to complete sale with zero discounts", async () => {
    const employeeId = crypto.randomUUID();
    extraUserIds.push(employeeId);
    await db.insert(users).values({
      id: employeeId,
      email: `${employeeId}@test.com`,
      passwordHash: "hash",
      name: "Test Employee",
      role: "EMPLOYEE",
      branchId,
    });

    const sale = await SalesService.createSale({
      branchId,
      saleDiscount: 0,
      items: [
        {
          productId,
          unitId,
          quantity: 2,
          unitPrice: 10.00,
          lineDiscount: 0,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 20.00,
        }
      ]
    }, { id: employeeId, role: "EMPLOYEE", branchId });

    expect(sale!.grandTotal).toBe("20.00");
  });

  it("should reject negative or excessive discounts", async () => {
    // Negative line discount
    await expect(SalesService.createSale({
      branchId,
      items: [
        {
          productId,
          unitId,
          quantity: 2,
          unitPrice: 10.00,
          lineDiscount: -5.00,
        }
      ],
      payments: [{ paymentMethodId, amount: 25.00 }]
    }, { id: userId, role: "OWNER" })).rejects.toThrow();

    // Excessive line discount
    await expect(SalesService.createSale({
      branchId,
      items: [
        {
          productId,
          unitId,
          quantity: 2, // 20.00 gross
          unitPrice: 10.00,
          lineDiscount: 25.00,
        }
      ],
      payments: [{ paymentMethodId, amount: 0 }]
    }, { id: userId, role: "OWNER" })).rejects.toThrow("Line discount (25) cannot exceed gross line amount (20)");

    // Excessive sale discount
    await expect(SalesService.createSale({
      branchId,
      saleDiscount: 50.00,
      items: [
        {
          productId,
          unitId,
          quantity: 2, // 20.00 gross
          unitPrice: 10.00,
        }
      ],
      payments: [{ paymentMethodId, amount: 0 }]
    }, { id: userId, role: "OWNER" })).rejects.toThrow("Sale discount (50) cannot exceed eligible sale amount (20)");
  });

  it("should reject reused idempotency key with mismatched payload", async () => {
    const idempotencyKey = crypto.randomUUID();

    await SalesService.createSale({
      branchId,
      idempotencyKey,
      items: [
        {
          productId,
          unitId,
          quantity: 2,
          unitPrice: 10.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 20.00,
        }
      ]
    }, { id: userId, role: "OWNER" });

    // Call again with same key but different quantity (3 instead of 2)
    await expect(SalesService.createSale({
      branchId,
      idempotencyKey,
      items: [
        {
          productId,
          unitId,
          quantity: 3,
          unitPrice: 10.00,
        }
      ],
      payments: [
        {
          paymentMethodId,
          amount: 30.00,
        }
      ]
    }, { id: userId, role: "OWNER" })).rejects.toThrow("Idempotency key already used with different payload");
  });

  describe("Sales History (Slice 6.2)", () => {
    it("should list sales with pagination, items, payments, and relations for owner", async () => {
      // Create a sale
      const sale = await SalesService.createSale({
        branchId,
        items: [
          {
            productId,
            unitId,
            quantity: 3,
            unitPrice: 10.00,
            lineDiscount: 2.00,
          }
        ],
        payments: [
          {
            paymentMethodId,
            amount: 28.00,
          }
        ],
        saleDiscount: 0,
      }, { id: userId, role: "OWNER" });

      const result = await SalesService.getSales({ page: 1, limit: 10 }, { id: userId, role: "OWNER" });
      expect(result.data.length).toBeGreaterThanOrEqual(1);
      expect(result.meta.total).toBeGreaterThanOrEqual(1);

      const found = result.data.find(s => s.id === sale!.id);
      expect(found).toBeDefined();
      expect(found?.saleNumber).toBe(sale!.saleNumber);
      expect(found?.grandTotal).toBe("28.00");
      expect(found?.branch?.name).toBe("Test Sales Branch");
      expect(found?.createdBy?.name).toBe("Test User");
      expect(found?.items.length).toBe(1);
      expect(found?.payments.length).toBe(1);
    });

    it("should filter sales by branchId for owner", async () => {
      // Create second branch
      const branch2Id = crypto.randomUUID();
      extraBranchIds.push(branch2Id);
      await db.insert(branches).values({
        id: branch2Id,
        name: "Second Test Branch",
        code: `TB-${branch2Id.substring(0, 4)}`,
      });
      await db.insert(inventoryBalances).values({
        branchId: branch2Id,
        productId,
        availableQuantity: 50,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        minimumStockQuantity: 5,
        wac: "5.00",
      });

      // Sale at branch 1
      const sale1 = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: userId, role: "OWNER" });

      // Sale at branch 2
      const sale2 = await SalesService.createSale({
        branchId: branch2Id,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: userId, role: "OWNER" });

      const resBranch1 = await SalesService.getSales({ branchId }, { id: userId, role: "OWNER" });
      expect(resBranch1.data.some(s => s.id === sale1!.id)).toBe(true);
      expect(resBranch1.data.some(s => s.id === sale2!.id)).toBe(false);

      const resBranch2 = await SalesService.getSales({ branchId: branch2Id }, { id: userId, role: "OWNER" });
      expect(resBranch2.data.some(s => s.id === sale2!.id)).toBe(true);
      expect(resBranch2.data.some(s => s.id === sale1!.id)).toBe(false);
    });

    it("should filter sales by search (saleNumber)", async () => {
      const sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: userId, role: "OWNER" });

      const res = await SalesService.getSales({ search: sale!.saleNumber }, { id: userId, role: "OWNER" });
      expect(res.data.length).toBe(1);
      expect(res.data[0]?.id).toBe(sale!.id);

      const emptyRes = await SalesService.getSales({ search: "SAL-NONEXISTENT-999" }, { id: userId, role: "OWNER" });
      expect(emptyRes.data.length).toBe(0);
      expect(emptyRes.meta.total).toBe(0);
    });

    it("should restrict employee strictly to their own sales and assigned branch", async () => {
      const emp1Id = crypto.randomUUID();
      const emp2Id = crypto.randomUUID();
      extraUserIds.push(emp1Id, emp2Id);

      await db.insert(users).values({
        id: emp1Id,
        email: `${emp1Id}@test.com`,
        passwordHash: "hash",
        name: "Employee One",
        role: "EMPLOYEE",
        branchId,
      });

      await db.insert(users).values({
        id: emp2Id,
        email: `${emp2Id}@test.com`,
        passwordHash: "hash",
        name: "Employee Two",
        role: "EMPLOYEE",
        branchId,
      });

      // Sale created by Owner
      const ownerSale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: userId, role: "OWNER" });

      // Sale created by Employee 1
      const emp1Sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: emp1Id, role: "EMPLOYEE", branchId });

      // Sale created by Employee 2
      const emp2Sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: emp2Id, role: "EMPLOYEE", branchId });

      // Query as Employee 1
      const emp1History = await SalesService.getSales({}, { id: emp1Id, role: "EMPLOYEE", branchId });
      expect(emp1History.data.some(s => s.id === emp1Sale!.id)).toBe(true);
      expect(emp1History.data.some(s => s.id === ownerSale!.id)).toBe(false);
      expect(emp1History.data.some(s => s.id === emp2Sale!.id)).toBe(false);

      // Attempt by Employee 1 to pass employeeId: emp2Id in query -> MUST be ignored and scoped to emp1
      const manipulatedHistory = await SalesService.getSales(
        { employeeId: emp2Id },
        { id: emp1Id, role: "EMPLOYEE", branchId }
      );
      expect(manipulatedHistory.data.some(s => s.id === emp2Sale!.id)).toBe(false);
      expect(manipulatedHistory.data.every(s => s.createdById === emp1Id)).toBe(true);
    });
  });

  describe("Slice 6.3 - Sale Details (getSaleById)", () => {
    it("should allow Owner to view full sale details with relations, items, split payments, and unitCost", async () => {
      const pm2Id = crypto.randomUUID();
      extraPaymentMethodIds.push(pm2Id);
      await db.insert(paymentMethods).values({
        id: pm2Id,
        name: `Card ${pm2Id.substring(0, 4)}`,
        isActive: true,
      });

      const sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 2, unitPrice: 10.00, lineDiscount: 2.00 }],
        saleDiscount: 1.00,
        payments: [
          { paymentMethodId, amount: 10.00 },
          { paymentMethodId: pm2Id, amount: 7.00 },
        ],
      }, { id: userId, role: "OWNER" });

      const details = await SalesService.getSaleById(sale!.id, { id: userId, role: "OWNER" });

      expect(details).toBeDefined();
      expect(details.id).toBe(sale!.id);
      expect(details.saleNumber).toBe(sale!.saleNumber);
      expect(details.branch).toBeDefined();
      expect(details.branch.id).toBe(branchId);
      expect(details.createdBy).toBeDefined();
      expect(details.createdBy.id).toBe(userId);
      expect(details.items).toHaveLength(1);
      const firstItem = details.items[0]!;
      expect(firstItem.product.id).toBe(productId);
      expect(firstItem.unit.id).toBe(unitId);
      expect(Number(firstItem.unitPrice)).toBe(10);
      expect(Number(firstItem.lineDiscount)).toBe(2);
      expect(Number(firstItem.lineTotal)).toBe(18); // (2 * 10) - 2 = 18
      expect(Number(firstItem.apportionedSaleDiscount)).toBe(1);
      expect(firstItem.unitCost).toBeDefined(); // Owner sees WAC snapshot
      expect(Number(firstItem.unitCost)).toBe(5);
      expect(Number(details.subtotal)).toBe(20);
      expect(Number(details.saleDiscount)).toBe(1);
      expect(Number(details.grandTotal)).toBe(17);
      expect(details.payments).toHaveLength(2);
    });

    it("should allow lookup by saleNumber", async () => {
      const sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: userId, role: "OWNER" });

      const details = await SalesService.getSaleById(sale!.saleNumber, { id: userId, role: "OWNER" });
      expect(details.id).toBe(sale!.id);
      expect(details.saleNumber).toBe(sale!.saleNumber);
    });

    it("should allow Employee to view their own sale, but strip unitCost (WAC snapshot)", async () => {
      const empId = crypto.randomUUID();
      extraUserIds.push(empId);
      await db.insert(users).values({
        id: empId,
        email: `${empId}@test.com`,
        passwordHash: "hash",
        name: "Sale Employee",
        role: "EMPLOYEE",
        branchId,
      });

      const sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: empId, role: "EMPLOYEE", branchId });

      const details = await SalesService.getSaleById(sale!.id, { id: empId, role: "EMPLOYEE", branchId });
      expect(details.id).toBe(sale!.id);
      expect(details.items[0]).toBeDefined();
      expect(details.items[0]?.unitCost).toBeNull(); // Nullified for employee
    });

    it("should reject Employee attempting to access another user's sale with 403", async () => {
      const emp1Id = crypto.randomUUID();
      const emp2Id = crypto.randomUUID();
      extraUserIds.push(emp1Id, emp2Id);

      await db.insert(users).values({
        id: emp1Id,
        email: `${emp1Id}@test.com`,
        passwordHash: "hash",
        name: "Employee A",
        role: "EMPLOYEE",
        branchId,
      });

      await db.insert(users).values({
        id: emp2Id,
        email: `${emp2Id}@test.com`,
        passwordHash: "hash",
        name: "Employee B",
        role: "EMPLOYEE",
        branchId,
      });

      const sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: emp1Id, role: "EMPLOYEE", branchId });

      // Employee B tries to inspect Employee A's sale
      await expect(
        SalesService.getSaleById(sale!.id, { id: emp2Id, role: "EMPLOYEE", branchId })
      ).rejects.toThrow("Not authorized to view this sale");
    });

    it("should reject Employee attempting to access a sale from another branch with 403", async () => {
      const otherBranchId = crypto.randomUUID();
      extraBranchIds.push(otherBranchId);

      await db.insert(branches).values({
        id: otherBranchId,
        name: "Other Test Branch",
        code: `OTB-${otherBranchId.substring(0, 4)}`,
      });

      await db.insert(inventoryBalances).values({
        branchId: otherBranchId,
        productId,
        availableQuantity: 50,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        minimumStockQuantity: 5,
        wac: "5.00",
      });

      const empId = crypto.randomUUID();
      extraUserIds.push(empId);

      await db.insert(users).values({
        id: empId,
        email: `${empId}@test.com`,
        passwordHash: "hash",
        name: "Branch 1 Employee",
        role: "EMPLOYEE",
        branchId, // Assigned to branch 1
      });

      // Sale created in otherBranch
      const sale = await SalesService.createSale({
        branchId: otherBranchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: userId, role: "OWNER" });

      await expect(
        SalesService.getSaleById(sale!.id, { id: empId, role: "EMPLOYEE", branchId })
      ).rejects.toThrow("Not authorized to view this sale");
    });

    it("should throw 404 for nonexistent sale", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        SalesService.getSaleById(nonExistentId, { id: userId, role: "OWNER" })
      ).rejects.toThrow("Sale not found");
    });

    it("should be a pure read operation and not mutate inventory or sales", async () => {
      const sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 2, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 20.00 }],
      }, { id: userId, role: "OWNER" });

      const [balanceBefore] = await db.select().from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, branchId), eq(inventoryBalances.productId, productId)));

      // Inspect details multiple times
      await SalesService.getSaleById(sale!.id, { id: userId, role: "OWNER" });
      await SalesService.getSaleById(sale!.id, { id: userId, role: "OWNER" });

      const [balanceAfter] = await db.select().from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, branchId), eq(inventoryBalances.productId, productId)));

      expect(balanceAfter!.availableQuantity).toBe(balanceBefore!.availableQuantity);
    });
  });

  describe("Slice 7.3 - Sale Corrections", () => {
    it("should allow Owner to add a note/correction to a sale", async () => {
      const sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: userId, role: "OWNER" });

      const correction = await SalesService.correctSale(
        sale!.id,
        { reason: "Customer requested note addition", note: "Customer loyalty member" },
        { id: userId, role: "OWNER" }
      );

      expect(correction!.correctionType).toBe("EDIT_NOTE");
      expect(correction!.reason).toBe("Customer requested note addition");

      const corrections = await SalesService.getSaleCorrections(sale!.id, { id: userId, role: "OWNER" });
      expect(corrections.length).toBe(1);
      expect(corrections[0]!.reason).toBe("Customer requested note addition");

    });

    it("should prevent corrections on a voided sale", async () => {
      const sale = await SalesService.createSale({
        branchId,
        items: [{ productId, unitId, quantity: 1, unitPrice: 10.00 }],
        payments: [{ paymentMethodId, amount: 10.00 }],
      }, { id: userId, role: "OWNER" });

      await SalesService.voidSale(sale!.id, { reason: "Mistake sale" }, { id: userId, role: "OWNER" });

      await expect(
        SalesService.correctSale(
          sale!.id,
          { reason: "Attempt note on voided" },
          { id: userId, role: "OWNER" }
        )
      ).rejects.toThrow("Cannot amend a voided sale");
    });
  });
});



