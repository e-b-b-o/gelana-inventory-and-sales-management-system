import { pgTable, uuid, varchar, timestamp, numeric, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches.js";
import { suppliers } from "./suppliers.js";
import { users } from "./users.js";
import { products } from "./products.js";
import { pgSequence } from "drizzle-orm/pg-core";

export const receivingNumberSeq = pgSequence("receiving_number_seq", { startWith: 1, increment: 1 });

export const receivings = pgTable("receivings", {
  id: uuid("id").primaryKey().defaultRandom(),
  receivingNumber: varchar("receiving_number", { length: 50 }).notNull().unique(), // e.g. REC-000001
  branchId: uuid("branch_id").notNull().references(() => branches.id),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  totalCost: numeric("total_cost", { precision: 12, scale: 2 }).notNull(),
  receivedById: uuid("received_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => [
  index("receivings_branch_created_idx").on(table.branchId, table.createdAt),
  index("receivings_supplier_id_idx").on(table.supplierId),
]);

export const receivingItems = pgTable("receiving_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  receivingId: uuid("receiving_id").notNull().references(() => receivings.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
}, (table) => [
  index("receiving_items_receiving_id_idx").on(table.receivingId),
  index("receiving_items_product_id_idx").on(table.productId),
]);

export const receivingsRelations = relations(receivings, ({ one, many }) => ({
  branch: one(branches, {
    fields: [receivings.branchId],
    references: [branches.id],
  }),
  supplier: one(suppliers, {
    fields: [receivings.supplierId],
    references: [suppliers.id],
  }),
  receivedBy: one(users, {
    fields: [receivings.receivedById],
    references: [users.id],
  }),
  items: many(receivingItems),
}));

export const receivingItemsRelations = relations(receivingItems, ({ one }) => ({
  receiving: one(receivings, {
    fields: [receivingItems.receivingId],
    references: [receivings.id],
  }),
  product: one(products, {
    fields: [receivingItems.productId],
    references: [products.id],
  }),
}));
