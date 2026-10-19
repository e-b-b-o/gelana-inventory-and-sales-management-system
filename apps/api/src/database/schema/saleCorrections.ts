import { pgTable, uuid, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sales } from "./sales.js";
import { users } from "./users.js";

export const saleCorrections = pgTable("sale_corrections", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),
  correctionType: varchar("correction_type", { length: 50 }).notNull(), // VOID, EDIT_NOTE
  reason: varchar("reason", { length: 255 }).notNull(),
  createdById: uuid("created_by_id").notNull().references(() => users.id),
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => [
  index("sale_corrections_sale_id_idx").on(table.saleId),
]);

export const saleCorrectionsRelations = relations(saleCorrections, ({ one }) => ({
  sale: one(sales, {
    fields: [saleCorrections.saleId],
    references: [sales.id],
  }),
  createdBy: one(users, {
    fields: [saleCorrections.createdById],
    references: [users.id],
  }),
}));
