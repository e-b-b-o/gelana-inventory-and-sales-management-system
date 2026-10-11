import { pgTable, uuid, varchar, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches.js";
import { users } from "./users.js";
import { products } from "./products.js";
import { productUnits } from "./productUnits.js";
import { paymentMethods } from "./paymentMethods.js";
import { salesReturns } from "./returns.js";
import { saleCorrections } from "./saleCorrections.js";
import { pgSequence } from "drizzle-orm/pg-core";

export const saleNumberSeq = pgSequence("sale_number_seq", { startWith: 1, increment: 1 });

export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleNumber: varchar("sale_number", { length: 50 }).notNull().unique(), // e.g. SAL-000001
  idempotencyKey: varchar("idempotency_key", { length: 100 }).unique(), // For safe retries
  branchId: uuid("branch_id").notNull().references(() => branches.id),
  createdById: uuid("created_by_id").notNull().references(() => users.id),
  soldAt: timestamp("sold_at", { mode: "string" }).notNull().defaultNow(), // Actual sale time
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  saleDiscount: numeric("sale_discount", { precision: 12, scale: 2 }).notNull().default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 50 }).notNull().default("COMPLETED"), // COMPLETED, VOIDED
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(), // System entry time
});

export const saleItems = pgTable("sale_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  unitId: uuid("unit_id").notNull().references(() => productUnits.id), // The unit originally selected
  enteredQuantity: integer("entered_quantity").notNull(),
  baseQuantity: integer("base_quantity").notNull(), // normalized for inventory deduction
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(), // Per entered unit
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(), // Snapshot of WAC
  lineDiscount: numeric("line_discount", { precision: 12, scale: 2 }).notNull().default("0"),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(), // (enteredQty * unitPrice) - lineDiscount
  apportionedSaleDiscount: numeric("apportioned_sale_discount", { precision: 12, scale: 2 }).notNull().default("0"), // Allocated portion of sale-level discount
});

export const salePayments = pgTable("sale_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
  paymentMethodId: uuid("payment_method_id").notNull().references(() => paymentMethods.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const salesRelations = relations(sales, ({ one, many }) => ({
  branch: one(branches, {
    fields: [sales.branchId],
    references: [branches.id],
  }),
  createdBy: one(users, {
    fields: [sales.createdById],
    references: [users.id],
  }),
  items: many(saleItems),
  payments: many(salePayments),
  returns: many(salesReturns),
  corrections: many(saleCorrections),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
  unit: one(productUnits, {
    fields: [saleItems.unitId],
    references: [productUnits.id],
  }),
}));

export const salePaymentsRelations = relations(salePayments, ({ one }) => ({
  sale: one(sales, {
    fields: [salePayments.saleId],
    references: [sales.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [salePayments.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));
