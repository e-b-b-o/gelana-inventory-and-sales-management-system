import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./service.js";
import { GetNotificationsQuerySchema, UpdateNotificationPreferencesSchema } from "./schema.js";

export class NotificationController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetNotificationsQuerySchema.parse(req.query);
      const userId = (req.user!.id || req.user!.userId) as string;
      const limit = query.limit;
      const page = query.page || (Math.floor(query.offset / limit) + 1);
      const offset = query.page ? (page - 1) * limit : query.offset;
      const result = await NotificationService.getNotifications(userId, { ...query, limit, offset });
      res.json({
        data: result.notifications,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit) || 1,
        },
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user!.id || req.user!.userId) as string;
      const result = await NotificationService.getUnreadCount(userId);
      res.json({ data: result, unreadCount: result.unreadCount });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user!.id || req.user!.userId) as string;
      const id = req.params.id as string;
      const notification = await NotificationService.markAsRead(userId, id);
      res.json({ data: notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user!.id || req.user!.userId) as string;
      const result = await NotificationService.markAllAsRead(userId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user!.id || req.user!.userId) as string;
      const preferences = await NotificationService.getPreferences(userId);
      res.json({ data: preferences });
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req.user!.id || req.user!.userId) as string;
      const input = UpdateNotificationPreferencesSchema.parse(req.body);
      const updated = await NotificationService.updatePreferences(userId, input);
      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  }
}
