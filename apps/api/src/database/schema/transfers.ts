import { pgTable, uuid, varchar, timestamp, numeric, integer, pgSequence, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches.js";
import { users } from "./users.js";
import { products } from "./products.js";
import { productUnits } from "./productUnits.js";

export const transferNumberSeq = pgSequence("transfer_number_seq", { startWith: 1, increment: 1 });

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferNumber: varchar("transfer_number", { length: 50 }).notNull().unique(), // e.g. TRF-000001
  sourceBranchId: uuid("source_branch_id").notNull().references(() => branches.id),
  destinationBranchId: uuid("destination_branch_id").notNull().references(() => branches.id),
  status: varchar("status", { length: 50 }).notNull().default("REQUESTED"), // 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'DISPATCHED'
  notes: varchar("notes", { length: 255 }),
  createdById: uuid("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  approvedById: uuid("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at", { mode: "string" }),
  approvalNotes: varchar("approval_notes", { length: 255 }),
  rejectedById: uuid("rejected_by_id").references(() => users.id),
  rejectedAt: timestamp("rejected_at", { mode: "string" }),
  rejectionReason: varchar("rejection_reason", { length: 255 }),
  dispatchedById: uuid("dispatched_by_id").references(() => users.id),
  dispatchedAt: timestamp("dispatched_at", { mode: "string" }),
  dispatchNotes: varchar("dispatch_notes", { length: 255 }),
  updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    sourceDestStatusIdx: index("transfers_source_dest_status_idx").on(table.sourceBranchId, table.destinationBranchId, table.status),
    statusCreatedAtIdx: index("transfers_status_created_at_idx").on(table.status, table.createdAt),
    destBranchIdx: index("transfers_dest_branch_idx").on(table.destinationBranchId),
  };
});

export const transferItems = pgTable("transfer_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id").notNull().references(() => transfers.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  unitId: uuid("unit_id").references(() => productUnits.id),
  requestedQuantity: integer("requested_quantity").notNull(),
  approvedQuantity: integer("approved_quantity"),
  dispatchedQuantity: integer("dispatched_quantity"),
  receivedQuantity: integer("received_quantity"), // Reserved for Prompt 2 (Slice 8.5)
  sourceUnitCost: numeric("source_unit_cost", { precision: 12, scale: 2 }), // Captured at dispatch time
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    transferIdIdx: index("transfer_items_transfer_id_idx").on(table.transferId),
    productIdIdx: index("transfer_items_product_id_idx").on(table.productId),
  };
});

export const transferEvents = pgTable("transfer_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id").notNull().references(() => transfers.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'DISPATCHED'
  actorId: uuid("actor_id").notNull().references(() => users.id),
  notes: varchar("notes", { length: 255 }),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    transferEventTransferIdIdx: index("transfer_events_transfer_id_idx").on(table.transferId),
  };
});

export const transfersRelations = relations(transfers, ({ one, many }) => ({
  sourceBranch: one(branches, {
    fields: [transfers.sourceBranchId],
    references: [branches.id],
    relationName: "transferSourceBranch",
  }),
  destinationBranch: one(branches, {
    fields: [transfers.destinationBranchId],
    references: [branches.id],
    relationName: "transferDestinationBranch",
  }),
  createdBy: one(users, {
    fields: [transfers.createdById],
    references: [users.id],
    relationName: "transferCreatedBy",
  }),
  approvedBy: one(users, {
    fields: [transfers.approvedById],
    references: [users.id],
    relationName: "transferApprovedBy",
  }),
  rejectedBy: one(users, {
    fields: [transfers.rejectedById],
    references: [users.id],
    relationName: "transferRejectedBy",
  }),
  dispatchedBy: one(users, {
    fields: [transfers.dispatchedById],
    references: [users.id],
    relationName: "transferDispatchedBy",
  }),
  items: many(transferItems),
  events: many(transferEvents),
}));

export const transferItemsRelations = relations(transferItems, ({ one }) => ({
  transfer: one(transfers, {
    fields: [transferItems.transferId],
    references: [transfers.id],
  }),
  product: one(products, {
    fields: [transferItems.productId],
    references: [products.id],
  }),
  unit: one(productUnits, {
    fields: [transferItems.unitId],
    references: [productUnits.id],
  }),
}));

export const transferEventsRelations = relations(transferEvents, ({ one }) => ({
  transfer: one(transfers, {
    fields: [transferEvents.transferId],
    references: [transfers.id],
  }),
  actor: one(users, {
    fields: [transferEvents.actorId],
    references: [users.id],
  }),
}));
