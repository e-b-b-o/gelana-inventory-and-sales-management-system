import { pgTable, uuid, varchar, integer, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches.js";
import { products } from "./products.js";
import { users } from "./users.js";
import { pgSequence } from "drizzle-orm/pg-core";

export const transactionIdSeq = pgSequence("transaction_id_seq", { startWith: 1, increment: 1 });

export const movementTypeEnum = pgEnum("movement_type", [
  "OPENING_STOCK",
  "SALE",
  "RECEIVING",
  "ADJUSTMENT",
  "TRANSFER_OUT",
  "TRANSFER_IN",
  "RETURN_GOOD",
  "RETURN_DAMAGED",
  "DISPOSAL",
  "TRANSFER_DAMAGED",
]);

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: varchar("transaction_id", { length: 50 }),
  branchId: uuid("branch_id").notNull().references(() => branches.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  movementType: movementTypeEnum("movement_type").notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
  referenceId: uuid("reference_id"),
  reason: varchar("reason", { length: 255 }),
  createdById: uuid("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  branch: one(branches, {
    fields: [inventoryMovements.branchId],
    references: [branches.id],
  }),
  product: one(products, {
    fields: [inventoryMovements.productId],
    references: [products.id],
  }),
  createdBy: one(users, {
    fields: [inventoryMovements.createdById],
    references: [users.id],
  }),
}));
