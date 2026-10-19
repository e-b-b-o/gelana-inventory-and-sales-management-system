import { pgTable, uuid, varchar, boolean, timestamp, numeric, uniqueIndex, index } from "drizzle-orm/pg-core";
import { products } from "./products.js";
import { productPrices } from "./productPrices.js";
import { relations } from "drizzle-orm";

export const productUnits = pgTable("product_units", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id),
  name: varchar("name", { length: 255 }).notNull(),
  isBase: boolean("is_base").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    productNameUnique: uniqueIndex("product_units_product_id_name_idx").on(table.productId, table.name),
  };
});

export const productUnitConversions = pgTable("product_unit_conversions", {
  id: uuid("id").primaryKey().defaultRandom(),
  productUnitId: uuid("product_unit_id").notNull().references(() => productUnits.id),
  conversionQuantity: numeric("conversion_quantity", { precision: 15, scale: 4 }).notNull(),
  effectiveFrom: timestamp("effective_from", { mode: "string" }).notNull().defaultNow(),
  effectiveUntil: timestamp("effective_until", { mode: "string" }),
}, (table) => [
  index("product_unit_conversions_unit_id_idx").on(table.productUnitId),
]);

export const productUnitsRelations = relations(productUnits, ({ one, many }) => ({
  product: one(products, {
    fields: [productUnits.productId],
    references: [products.id],
  }),
  conversions: many(productUnitConversions),
  prices: many(productPrices),
}));

export const productUnitConversionsRelations = relations(productUnitConversions, ({ one }) => ({
  productUnit: one(productUnits, {
    fields: [productUnitConversions.productUnitId],
    references: [productUnits.id],
  }),
}));
