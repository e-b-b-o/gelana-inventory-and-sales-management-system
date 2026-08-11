import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { branches } from "./branches.js";

export const USER_ROLES = ["OWNER", "EMPLOYEE"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 50, enum: ["OWNER", "EMPLOYEE"] }).notNull().$type<UserRole>(),
  branchId: uuid("branch_id").references(() => branches.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
