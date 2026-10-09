import { pgTable, uuid, integer, timestamp, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches.js";
import { products } from "./products.js";

export const inventoryBalances = pgTable("inventory_balances", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id").notNull().references(() => branches.id),
  productId: uuid("product_id").notNull().references(() => products.id),
  availableQuantity: integer("available_quantity").notNull().default(0),
  damagedQuantity: integer("damaged_quantity").notNull().default(0),
  inTransitQuantity: integer("in_transit_quantity").notNull().default(0),
  minimumStockQuantity: integer("minimum_stock_quantity").notNull().default(0),
  wac: numeric("wac", { precision: 12, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    branchProductUnique: uniqueIndex("inventory_balances_branch_id_product_id_idx").on(table.branchId, table.productId),
  };
});

export const inventoryBalancesRelations = relations(inventoryBalances, ({ one }) => ({
  branch: one(branches, {
    fields: [inventoryBalances.branchId],
    references: [branches.id],
  }),
  product: one(products, {
    fields: [inventoryBalances.productId],
    references: [products.id],
  }),
}));
