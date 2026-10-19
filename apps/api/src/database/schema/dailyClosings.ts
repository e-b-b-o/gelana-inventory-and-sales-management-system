import { pgTable, uuid, varchar, timestamp, numeric, integer, uniqueIndex, index, pgSequence } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches.js";
import { users } from "./users.js";
import { paymentMethods } from "./paymentMethods.js";

export const dailyClosingNumberSeq = pgSequence("daily_closing_number_seq", { startWith: 1, increment: 1 });

export const dailyClosings = pgTable(
  "daily_closings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    closingNumber: varchar("closing_number", { length: 50 }).notNull().unique(), // e.g. CLS-000001
    branchId: uuid("branch_id").notNull().references(() => branches.id),
    closingDate: varchar("closing_date", { length: 10 }).notNull(), // YYYY-MM-DD
    status: varchar("status", { length: 50 }).notNull().default("NOT_SUBMITTED"), // NOT_SUBMITTED, SUBMITTED, APPROVED, REJECTED
    totalSalesAmount: numeric("total_sales_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    totalReturnsAmount: numeric("total_returns_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    netSalesAmount: numeric("net_sales_amount", { precision: 12, scale: 2 }).notNull().default("0"),
    salesCount: integer("sales_count").notNull().default(0),
    expectedCash: numeric("expected_cash", { precision: 12, scale: 2 }).notNull().default("0"),
    actualCash: numeric("actual_cash", { precision: 12, scale: 2 }),
    cashDifference: numeric("cash_difference", { precision: 12, scale: 2 }),
    discrepancyReason: varchar("discrepancy_reason", { length: 500 }),
    submittedById: uuid("submitted_by_id").references(() => users.id),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "string" }),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "string" }),
    reviewNotes: varchar("review_notes", { length: 500 }),
    rejectionReason: varchar("rejection_reason", { length: 500 }),
    revision: integer("revision").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_closings_branch_date_idx").on(table.branchId, table.closingDate),
  ]
);

export const dailyClosingPayments = pgTable("daily_closing_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  closingId: uuid("closing_id").notNull().references(() => dailyClosings.id, { onDelete: "cascade" }),
  paymentMethodId: uuid("payment_method_id").notNull().references(() => paymentMethods.id),
  paymentMethodName: varchar("payment_method_name", { length: 100 }).notNull(),
  receivedAmount: numeric("received_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  refundedAmount: numeric("refunded_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  netAmount: numeric("net_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  transactionCount: integer("transaction_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [
  index("daily_closing_payments_closing_id_idx").on(table.closingId),
]);

export const dailyClosingEvents = pgTable("daily_closing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  closingId: uuid("closing_id").notNull().references(() => dailyClosings.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // SUBMITTED, REJECTED, RESUBMITTED, APPROVED
  actorId: uuid("actor_id").notNull().references(() => users.id),
  actorRole: varchar("actor_role", { length: 50 }).notNull(),
  expectedCash: numeric("expected_cash", { precision: 12, scale: 2 }).notNull(),
  actualCash: numeric("actual_cash", { precision: 12, scale: 2 }),
  cashDifference: numeric("cash_difference", { precision: 12, scale: 2 }),
  notes: varchar("notes", { length: 500 }),
  revision: integer("revision").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => [
  index("daily_closing_events_closing_id_idx").on(table.closingId),
]);

export const dailyClosingsRelations = relations(dailyClosings, ({ one, many }) => ({
  branch: one(branches, {
    fields: [dailyClosings.branchId],
    references: [branches.id],
  }),
  submittedBy: one(users, {
    fields: [dailyClosings.submittedById],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [dailyClosings.reviewedById],
    references: [users.id],
  }),
  payments: many(dailyClosingPayments),
  events: many(dailyClosingEvents),
}));

export const dailyClosingPaymentsRelations = relations(dailyClosingPayments, ({ one }) => ({
  closing: one(dailyClosings, {
    fields: [dailyClosingPayments.closingId],
    references: [dailyClosings.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [dailyClosingPayments.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const dailyClosingEventsRelations = relations(dailyClosingEvents, ({ one }) => ({
  closing: one(dailyClosings, {
    fields: [dailyClosingEvents.closingId],
    references: [dailyClosings.id],
  }),
  actor: one(users, {
    fields: [dailyClosingEvents.actorId],
    references: [users.id],
  }),
}));
