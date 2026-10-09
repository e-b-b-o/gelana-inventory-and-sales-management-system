import { pgTable, uuid, numeric, timestamp } from "drizzle-orm/pg-core";
import { productUnits } from "./productUnits.js";
import { relations } from "drizzle-orm";

export const productPrices = pgTable("product_prices", {
  id: uuid("id").primaryKey().defaultRandom(),
  productUnitId: uuid("product_unit_id").notNull().references(() => productUnits.id),
  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull(),
  effectiveFrom: timestamp("effective_from", { mode: "string" }).notNull().defaultNow(),
  effectiveUntil: timestamp("effective_until", { mode: "string" }),
});

export const productPricesRelations = relations(productPrices, ({ one }) => ({
  productUnit: one(productUnits, {
    fields: [productPrices.productUnitId],
    references: [productUnits.id],
  }),
}));
