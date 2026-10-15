import { pgTable, uuid, varchar, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const NOTIFICATION_CATEGORIES = [
  "INVENTORY",
  "TRANSFERS",
  "SALES_RETURNS",
  "CLOSINGS",
  "ACCOUNT",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 50 }).notNull().$type<NotificationCategory>(),
    isEnabled: boolean("is_enabled").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => ({
    userCategoryUniqueIdx: uniqueIndex("notification_pref_user_category_idx").on(table.userId, table.category),
  })
);

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
