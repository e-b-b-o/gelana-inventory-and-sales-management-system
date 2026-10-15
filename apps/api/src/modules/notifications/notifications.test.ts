import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NotificationService } from "./service.js";
import { db } from "../../config/database.js";
import { users, branches, notifications, notificationPreferences } from "../../database/schema/index.js";
import { eq } from "drizzle-orm";
import crypto from "crypto";

describe("Milestone 11 — Notifications Service", () => {
  let ownerId: string;
  let employeeId: string;
  let branchId: string;

  beforeEach(async () => {
    ownerId = crypto.randomUUID();
    employeeId = crypto.randomUUID();
    branchId = crypto.randomUUID();

    await db.insert(branches).values({
      id: branchId,
      name: "Notif Test Branch",
      code: `NT-${branchId.substring(0, 4)}`,
    });

    await db.insert(users).values([
      {
        id: ownerId,
        email: `owner-${ownerId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Notif Owner",
        role: "OWNER",
      },
      {
        id: employeeId,
        email: `emp-${employeeId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Notif Employee",
        role: "EMPLOYEE",
        branchId,
      },
    ]);
  });

  afterEach(async () => {
    await db.delete(notifications).where(eq(notifications.userId, ownerId));
    await db.delete(notifications).where(eq(notifications.userId, employeeId));
    await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, ownerId));
    await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, employeeId));
    await db.delete(users).where(eq(users.id, employeeId));
    await db.delete(users).where(eq(users.id, ownerId));
    await db.delete(branches).where(eq(branches.id, branchId));
  });

  it("creates notifications and accurately calculates unread counts", async () => {
    // Initially 0 unread
    const initialCount = await NotificationService.getUnreadCount(employeeId);
    expect(initialCount.unreadCount).toBe(0);

    // Create 2 notifications
    await NotificationService.createNotification({
      recipientUserId: employeeId,
      title: "Transfer Dispatched",
      message: "Transfer TR-001 has been dispatched to your branch",
      type: "TRANSFER_DISPATCHED",
      priority: "IMPORTANT",
      link: "/transfers/1",
    });

    await NotificationService.createNotification({
      recipientUserId: employeeId,
      title: "Daily Closing Approved",
      message: "Your daily closing has been approved by Owner",
      type: "CLOSING_APPROVED",
      priority: "INFORMATIONAL",
      link: "/daily-closing/history",
    });

    const unread = await NotificationService.getUnreadCount(employeeId);
    expect(unread.unreadCount).toBe(2);

    const list = await NotificationService.getNotifications(employeeId, { limit: 10, offset: 0 });
    expect(list.notifications.length).toBe(2);
    expect(list.total).toBe(2);
    expect(list.unreadCount).toBe(2);
  });

  it("marks a single notification as read and preserves other unread items", async () => {
    const notif1 = await NotificationService.createNotification({
      recipientUserId: employeeId,
      title: "Low Stock Alert",
      message: "Notebooks stock is low",
      type: "LOW_STOCK",
      priority: "IMPORTANT",
    });

    await NotificationService.createNotification({
      recipientUserId: employeeId,
      title: "System Notice",
      message: "Scheduled maintenance tonight",
      type: "SYSTEM",
      priority: "INFORMATIONAL",
    });

    expect(notif1).toBeTruthy();
    const updated = await NotificationService.markAsRead(employeeId, notif1!.id);
    expect(updated).toBeTruthy();
    expect(updated!.isRead).toBe(true);
    expect(updated!.readAt).toBeTruthy();

    const unread = await NotificationService.getUnreadCount(employeeId);
    expect(unread.unreadCount).toBe(1);
  });

  it("marks all notifications as read in bulk", async () => {
    await NotificationService.createNotification({
      recipientUserId: ownerId,
      title: "Closing 1",
      message: "Closing submitted",
      type: "CLOSING_SUBMITTED",
    });
    await NotificationService.createNotification({
      recipientUserId: ownerId,
      title: "Closing 2",
      message: "Closing submitted",
      type: "CLOSING_SUBMITTED",
    });

    const markResult = await NotificationService.markAllAsRead(ownerId);
    expect(markResult.updatedCount).toBe(2);

    const count = await NotificationService.getUnreadCount(ownerId);
    expect(count.unreadCount).toBe(0);
  });

  it("respects user notification preferences and suppresses disabled categories unless CRITICAL", async () => {
    // Disable INVENTORY category for owner
    await NotificationService.updatePreferences(ownerId, {
      preferences: [{ category: "INVENTORY", isEnabled: false }],
    });

    // Try creating an INFORMATIONAL inventory notification (should be suppressed)
    const normalNotif = await NotificationService.createNotification({
      recipientUserId: ownerId,
      title: "Stock Adjusted",
      message: "Stock adjusted by +2",
      type: "STOCK_ADJUSTMENT",
      priority: "INFORMATIONAL",
    });
    expect(normalNotif).toBeNull();

    // Critical notification must NEVER be suppressed
    const criticalNotif = await NotificationService.createNotification({
      recipientUserId: ownerId,
      title: "Critical Stock Discrepancy",
      message: "Major discrepancy reported",
      type: "STOCK_DISCREPANCY",
      priority: "CRITICAL",
    });
    expect(criticalNotif).toBeTruthy();
    expect(criticalNotif?.title).toBe("Critical Stock Discrepancy");
  });

  it("prevents rapid duplicate notifications for the same entity and type (idempotency)", async () => {
    const entityId = crypto.randomUUID();

    const first = await NotificationService.createNotification({
      recipientUserId: employeeId,
      title: "Transfer Dispatched",
      message: "Transfer dispatched",
      type: "TRANSFER_DISPATCHED",
      entityType: "transfer",
      entityId,
    });

    const second = await NotificationService.createNotification({
      recipientUserId: employeeId,
      title: "Transfer Dispatched",
      message: "Transfer dispatched",
      type: "TRANSFER_DISPATCHED",
      entityType: "transfer",
      entityId,
    });

    expect(first?.id).toBe(second?.id);

    const count = await NotificationService.getUnreadCount(employeeId);
    expect(count.unreadCount).toBe(1);
  });

  it("prevents users from marking other users' notifications as read", async () => {
    const ownerNotif = await NotificationService.createNotification({
      recipientUserId: ownerId,
      title: "Owner Only",
      message: "Confidential notice",
      type: "SYSTEM",
    });

    await expect(NotificationService.markAsRead(employeeId, ownerNotif!.id)).rejects.toThrow(
      "Notification not found"
    );
  });
});
