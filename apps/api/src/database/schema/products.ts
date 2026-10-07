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
import { categories } from "./categories.js";

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
