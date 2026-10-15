import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./service.js";
import {
  getOwnerDashboardQuerySchema,
  getEmployeeDashboardQuerySchema,
} from "./schema.js";

export class DashboardController {
  static async getOwnerDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getOwnerDashboardQuerySchema.parse(req.query);
      const result = await DashboardService.getOwnerDashboard(query);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getEmployeeDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getEmployeeDashboardQuerySchema.parse(req.query);
      const user = (req as any).user;
      const result = await DashboardService.getEmployeeDashboard(query, user);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
