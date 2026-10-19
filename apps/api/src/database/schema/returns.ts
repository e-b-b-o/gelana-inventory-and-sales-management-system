import { pgTable, uuid, varchar, timestamp, numeric, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches.js";
import { users } from "./users.js";
import { products } from "./products.js";
import { productUnits } from "./productUnits.js";
import { paymentMethods } from "./paymentMethods.js";
import { sales, saleItems } from "./sales.js";
import { pgSequence } from "drizzle-orm/pg-core";

export const returnNumberSeq = pgSequence("return_number_seq", { startWith: 1, increment: 1 });

export const salesReturns = pgTable("sales_returns", {
  id: uuid("id").primaryKey().defaultRandom(),
  returnNumber: varchar("return_number", { length: 50 }).notNull().unique(), // e.g. RET-000001
  saleId: uuid("sale_id").references(() => sales.id, { onDelete: "set null" }), // Nullable for owner unlinked return
  branchId: uuid("branch_id").notNull().references(() => branches.id),
  createdById: uuid("created_by_id").notNull().references(() => users.id),
  returnedAt: timestamp("returned_at", { mode: "string" }).notNull().defaultNow(),
  refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  refundPaymentMethodId: uuid("refund_payment_method_id").notNull().references(() => paymentMethods.id),
  status: varchar("status", { length: 50 }).notNull().default("COMPLETED"),
  reason: varchar("reason", { length: 255 }).notNull(),
  isUnlinked: boolean("is_unlinked").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => [
  index("sales_returns_branch_returned_at_idx").on(table.branchId, table.returnedAt),
  index("sales_returns_sale_id_idx").on(table.saleId),
]);

export const salesReturnItems = pgTable("sales_return_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  returnId: uuid("return_id").notNull().references(() => salesReturns.id, { onDelete: "cascade" }),
  saleItemId: uuid("sale_item_id").references(() => saleItems.id, { onDelete: "set null" }), // Nullable for unlinked return
  productId: uuid("product_id").notNull().references(() => products.id),
  unitId: uuid("unit_id").notNull().references(() => productUnits.id),
  enteredQuantity: integer("entered_quantity").notNull(),
  baseQuantity: integer("base_quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  condition: varchar("condition", { length: 20 }).notNull(), // SELLABLE or DAMAGED
  refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }).notNull().default("0"),
}, (table) => [
  index("sales_return_items_return_id_idx").on(table.returnId),
  index("sales_return_items_sale_item_id_idx").on(table.saleItemId),
]);

export const salesReturnsRelations = relations(salesReturns, ({ one, many }) => ({
  sale: one(sales, {
    fields: [salesReturns.saleId],
    references: [sales.id],
  }),
  branch: one(branches, {
    fields: [salesReturns.branchId],
    references: [branches.id],
  }),
  createdBy: one(users, {
    fields: [salesReturns.createdById],
    references: [users.id],
  }),
  refundPaymentMethod: one(paymentMethods, {
    fields: [salesReturns.refundPaymentMethodId],
    references: [paymentMethods.id],
  }),
  items: many(salesReturnItems),
}));

export const salesReturnItemsRelations = relations(salesReturnItems, ({ one }) => ({
  return: one(salesReturns, {
    fields: [salesReturnItems.returnId],
    references: [salesReturns.id],
  }),
  saleItem: one(saleItems, {
    fields: [salesReturnItems.saleItemId],
    references: [saleItems.id],
  }),
  product: one(products, {
    fields: [salesReturnItems.productId],
    references: [products.id],
  }),
  unit: one(productUnits, {
    fields: [salesReturnItems.unitId],
    references: [productUnits.id],
  }),
}));
