import { Request, Response, NextFunction } from "express";
import { ReceivingsService } from "./service.js";
import { createReceivingSchema, getReceivingsQuerySchema } from "./schema.js";

export class ReceivingsController {
  static async createReceiving(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createReceivingSchema.parse(req.body);
      const userId = (req.user as any)?.userId || (req.user as any)?.id;
      
      const receiving = await ReceivingsService.createReceiving(dto, userId as string);
      
      res.status(201).json({
        message: "Receiving confirmed successfully",
        receiving,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReceivings(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getReceivingsQuerySchema.parse(req.query);
      const result = await ReceivingsService.getReceivings(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getReceivingDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ReceivingsService.getReceivingDetails(id as string);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
