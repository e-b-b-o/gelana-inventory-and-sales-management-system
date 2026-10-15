import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { branches } from "./branches.js";

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorName: varchar("actor_name", { length: 255 }).notNull(),
    actorRole: varchar("actor_role", { length: 50 }).notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }),
    branchId: uuid("branch_id").references(() => branches.id, { onDelete: "set null" }),
    branchName: varchar("branch_name", { length: 255 }),
    reason: text("reason"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => ({
    createdIdx: index("audit_logs_created_idx").on(table.createdAt),
    actorCreatedIdx: index("audit_logs_actor_created_idx").on(table.actorId, table.createdAt),
    actionCreatedIdx: index("audit_logs_action_created_idx").on(table.action, table.createdAt),
    categoryCreatedIdx: index("audit_logs_category_created_idx").on(table.category, table.createdAt),
    branchCreatedIdx: index("audit_logs_branch_created_idx").on(table.branchId, table.createdAt),
    entityIdx: index("audit_logs_entity_idx").on(table.entityType, table.entityId),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
