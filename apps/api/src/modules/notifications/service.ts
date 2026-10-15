import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import {
  notifications,
  notificationPreferences,
  users,
  NotificationPriority,
  NotificationCategory,
  NOTIFICATION_CATEGORIES,
} from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import { GetNotificationsQuery, UpdateNotificationPreferencesInput } from "./schema.js";

export class NotificationService {
  /**
   * Maps notification types to logical categories for preference checking
   */
  private static getCategoryForType(type: string): NotificationCategory {
    if (type.startsWith("TRANSFER_")) return "TRANSFERS";
    if (type.startsWith("CLOSING_")) return "CLOSINGS";
    if (type.startsWith("SALE_") || type.startsWith("RETURN_")) return "SALES_RETURNS";
    if (type.startsWith("LOW_STOCK") || type.startsWith("STOCK_")) return "INVENTORY";
    if (type.startsWith("ACCOUNT_") || type.startsWith("PASSWORD_") || type.startsWith("USER_")) return "ACCOUNT";
    return "ACCOUNT";
  }

  /**
   * Internal helper to create a persistent notification.
   * Checks recipient notification preferences (CRITICAL alerts cannot be disabled).
   */
  static async createNotification(
    data: {
      recipientUserId: string;
      title: string;
      message: string;
      type: string;
      priority?: NotificationPriority | undefined;
      entityType?: string | undefined;
      entityId?: string | undefined;
      link?: string | undefined;
      metadata?: any;
    },
    tx?: any
  ) {
    const client = tx || db;
    const priority = data.priority || "INFORMATIONAL";
    const category = this.getCategoryForType(data.type);

    // If not CRITICAL, check if user has explicitly disabled this category
    if (priority !== "CRITICAL") {
      const [pref] = await client
        .select()
        .from(notificationPreferences)
        .where(
          and(
            eq(notificationPreferences.userId, data.recipientUserId),
            eq(notificationPreferences.category, category)
          )
        )
        .limit(1);

      if (pref && !pref.isEnabled) {
        // User suppressed notifications in this category
        return null;
      }
    }

    // Idempotency check: don't insert duplicate identical unread notification for same entity & type within 1 minute
    if (data.entityType && data.entityId) {
      const [existing] = await client
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, data.recipientUserId),
            eq(notifications.type, data.type),
            eq(notifications.entityType, data.entityType),
            eq(notifications.entityId, data.entityId),
            eq(notifications.isRead, false)
          )
        )
        .limit(1);

      if (existing) {
        return existing;
      }
    }

    const [created] = await client
      .insert(notifications)
      .values({
        userId: data.recipientUserId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority,
        isRead: false,
        entityType: data.entityType,
        entityId: data.entityId,
        link: data.link,
        metadata: data.metadata,
      })
      .returning();

    return created;
  }

  /**
   * Notify all system owners
   */
  static async notifyOwner(
    data: {
      title: string;
      message: string;
      type: string;
      priority?: NotificationPriority | undefined;
      entityType?: string | undefined;
      entityId?: string | undefined;
      link?: string | undefined;
      metadata?: any;
    },
    tx?: any
  ) {
    const client = tx || db;
    const owners = await client
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "OWNER"), eq(users.isActive, true)));

    for (const owner of owners) {
      await this.createNotification(
        {
          ...data,
          recipientUserId: owner.id,
        },
        client
      );
    }
  }

  /**
   * Notify employees of a specific branch
   */
  static async notifyBranchEmployees(
    branchId: string,
    data: {
      title: string;
      message: string;
      type: string;
      priority?: NotificationPriority | undefined;
      entityType?: string | undefined;
      entityId?: string | undefined;
      link?: string | undefined;
      metadata?: any;
    },
    tx?: any
  ) {
    const client = tx || db;
    const employees = await client
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, "EMPLOYEE"), eq(users.branchId, branchId), eq(users.isActive, true)));

    for (const emp of employees) {
      await this.createNotification(
        {
          ...data,
          recipientUserId: emp.id,
        },
        client
      );
    }
  }

  /**
   * List notifications for authenticated user
   */
  static async getNotifications(userId: string, query: GetNotificationsQuery) {
    const conditions = [eq(notifications.userId, userId)];

    if (query.isRead !== undefined) {
      conditions.push(eq(notifications.isRead, query.isRead));
    }

    if (query.priority) {
      conditions.push(eq(notifications.priority, query.priority));
    }

    const whereClause = and(...conditions);

    const [items, countResult, unreadCountResult] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(whereClause)
        .orderBy(desc(notifications.createdAt))
        .limit(query.limit)
        .offset(query.offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(whereClause),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))),
    ]);

    const total = countResult[0]?.count || 0;
    const unreadCount = unreadCountResult[0]?.count || 0;

    return {
      notifications: items,
      total,
      unreadCount,
      limit: query.limit,
      offset: query.offset,
    };
  }

  /**
   * Quick unread notifications count for header & navigation
   */
  static async getUnreadCount(userId: string) {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    return { unreadCount: result?.count || 0 };
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(userId: string, notificationId: string) {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .limit(1);

    if (!notification) {
      throw new AppError("Notification not found", 404, "NOT_FOUND");
    }

    if (notification.isRead) {
      return notification;
    }

    const [updated] = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: sql`NOW()`,
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    return updated;
  }

  /**
   * Mark all unread notifications as read for current user
   */
  static async markAllAsRead(userId: string) {
    const result = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: sql`NOW()`,
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .returning({ id: notifications.id });

    return { updatedCount: result.length };
  }

  /**
   * Get notification preferences for user
   */
  static async getPreferences(userId: string) {
    const existing = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    const existingMap = new Map(existing.map((p) => [p.category, p.isEnabled]));

    // Return complete array covering all known categories (defaulting to enabled: true)
    return NOTIFICATION_CATEGORIES.map((category) => ({
      category,
      isEnabled: existingMap.has(category) ? existingMap.get(category)! : true,
    }));
  }

  /**
   * Update notification preferences for user
   */
  static async updatePreferences(userId: string, input: UpdateNotificationPreferencesInput) {
    for (const pref of input.preferences) {
      await db
        .insert(notificationPreferences)
        .values({
          userId,
          category: pref.category,
          isEnabled: pref.isEnabled,
          updatedAt: sql`NOW()`,
        })
        .onConflictDoUpdate({
          target: [notificationPreferences.userId, notificationPreferences.category],
          set: {
            isEnabled: pref.isEnabled,
            updatedAt: sql`NOW()`,
          },
        });
    }

    return this.getPreferences(userId);
  }
}
