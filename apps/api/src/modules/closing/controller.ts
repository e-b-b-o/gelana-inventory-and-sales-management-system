import { Request, Response, NextFunction } from "express";
import { ClosingService } from "./service.js";
import {
  getCurrentClosingQuerySchema,
  submitClosingSchema,
  approveClosingSchema,
  rejectClosingSchema,
  getClosingHistoryQuerySchema,
} from "./schema.js";

export class ClosingController {
  static async getCurrentClosing(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getCurrentClosingQuerySchema.parse(req.query);
      const user = (req as any).user;
      const result = await ClosingService.getCurrentClosing(query, user);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }

  static async submitClosing(req: Request, res: Response, next: NextFunction) {
    try {
      const input = submitClosingSchema.parse(req.body);
      const user = (req as any).user;
      const result = await ClosingService.submitClosing(input, user);
      res.status(201).json({
        message: "Daily closing submitted successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async approveClosing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = approveClosingSchema.parse(req.body);
      const user = (req as any).user;
      const result = await ClosingService.approveClosing(id as string, input, user);
      res.json({
        message: "Daily closing approved successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async rejectClosing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = rejectClosingSchema.parse(req.body);
      const user = (req as any).user;
      const result = await ClosingService.rejectClosing(id as string, input, user);
      res.json({
        message: "Daily closing rejected — correction required",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getClosingHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getClosingHistoryQuerySchema.parse(req.query);
      const user = (req as any).user;
      const result = await ClosingService.getClosingHistory(query, user);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getClosingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const result = await ClosingService.getClosingById(id as string, user);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  }
}
