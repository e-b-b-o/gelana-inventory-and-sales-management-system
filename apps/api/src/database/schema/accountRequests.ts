import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const ACCOUNT_REQUEST_TYPES = ["EMAIL_CHANGE", "PASSWORD_RESET", "OTHER"] as const;
export type AccountRequestType = (typeof ACCOUNT_REQUEST_TYPES)[number];

export const ACCOUNT_REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED", "COMPLETED"] as const;
export type AccountRequestStatus = (typeof ACCOUNT_REQUEST_STATUSES)[number];

export const accountRequests = pgTable(
  "account_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull().$type<AccountRequestType>(),
    status: varchar("status", { length: 20 }).notNull().default("PENDING").$type<AccountRequestStatus>(),
    payload: jsonb("payload"),
    reason: text("reason"),
    decisionNotes: text("decision_notes"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => ({
    userStatusCreatedIdx: index("account_requests_user_status_idx").on(table.userId, table.status, table.createdAt),
    statusCreatedIdx: index("account_requests_status_idx").on(table.status, table.createdAt),
  })
);

export type AccountRequest = typeof accountRequests.$inferSelect;
export type NewAccountRequest = typeof accountRequests.$inferInsert;
