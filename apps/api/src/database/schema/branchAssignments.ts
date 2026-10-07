import { pgTable, uuid, varchar, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { isNull } from "drizzle-orm";
import { users } from "./users.js";
import { branches } from "./branches.js";

export const branchAssignments = pgTable("branch_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  branchId: uuid("branch_id").notNull().references(() => branches.id),
  assignedBy: uuid("assigned_by").notNull().references(() => users.id),
  startDate: timestamp("start_date", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true, mode: "string" }),
  reason: varchar("reason", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
}, (table) => {
  return {
    activeAssignmentIndex: uniqueIndex("active_branch_assignment_idx").on(table.userId).where(isNull(table.endDate)),
  };
});
