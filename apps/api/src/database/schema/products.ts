import {
  numeric,
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  pgSequence,
  text
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { categories } from "./categories.js";
import { productUnits } from "./productUnits.js";
import { inventoryBalances } from "./inventoryBalances.js";
import { inventoryMovements } from "./inventoryMovements.js";

export const productSkuSeq = pgSequence("product_sku_seq", { startWith: 1, increment: 1 });

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  brand: varchar("brand", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 1024 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  units: many(productUnits),
  inventoryBalances: many(inventoryBalances),
  inventoryMovements: many(inventoryMovements),
}));
