import { Request, Response, NextFunction } from "express";
import { ReportsService } from "./service.js";
import {
  getSalesReportQuerySchema,
  getInventoryReportQuerySchema,
  getProfitReportQuerySchema,
  getClosingReportQuerySchema,
} from "./schema.js";

export class ReportsController {
  static async getSalesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getSalesReportQuerySchema.parse(req.query);
      const user = (req as any).user;
      const result = await ReportsService.getSalesReport(query, user);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getInventoryReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getInventoryReportQuerySchema.parse(req.query);
      const user = (req as any).user;
      const result = await ReportsService.getInventoryReport(query, user);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getProfitReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getProfitReportQuerySchema.parse(req.query);
      const user = (req as any).user;
      const result = await ReportsService.getProfitReport(query, user);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getClosingReport(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getClosingReportQuerySchema.parse(req.query);
      const user = (req as any).user;
      const result = await ReportsService.getClosingReport(query, user);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
