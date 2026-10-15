import { Request, Response, NextFunction } from "express";
import { SettingsService } from "./service.js";
import {
  ChangePasswordSchema,
  CreateAccountRequestSchema,
  DecideAccountRequestSchema,
  UpdateProfileSchema,
} from "./schema.js";

export class SettingsController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const userId = (user.id || user.userId) as string;
      const result = await SettingsService.getProfile(userId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const input = UpdateProfileSchema.parse(req.body);
      const user = req.user!;
      const userId = (user.id || user.userId) as string;
      const result = await SettingsService.updateProfile(userId, user, input);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const input = ChangePasswordSchema.parse(req.body);
      const user = req.user!;
      const userId = (user.id || user.userId) as string;
      const result = await SettingsService.changePassword(userId, user, input);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async createAccountRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateAccountRequestSchema.parse(req.body);
      const user = req.user!;
      const userId = (user.id || user.userId) as string;
      const result = await SettingsService.createAccountRequest(userId, user, input);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getMyAccountRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const userId = (user.id || user.userId) as string;
      const result = await SettingsService.getMyAccountRequests(userId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getAllAccountRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const userId = (user.id || user.userId) as string;
      if (user.role === "EMPLOYEE") {
        const result = await SettingsService.getMyAccountRequests(userId);
        res.json({ data: result });
        return;
      }
      const status = req.query.status ? (req.query.status as string) : undefined;
      const result = await SettingsService.getAllAccountRequests({ status });
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async decideAccountRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const input = DecideAccountRequestSchema.parse(req.body);
      const owner = req.user!;
      const ownerId = (owner.id || owner.userId) as string;
      const id = req.params.id as string;
      const result = await SettingsService.decideAccountRequest(ownerId, owner, id, input);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}
