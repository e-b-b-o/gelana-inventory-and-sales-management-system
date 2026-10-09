import { Request, Response, NextFunction } from "express";
import { CreateSaleSchema } from "./schema.js";
import { SalesService } from "./service.js";

export class SalesController {
  static async createSale(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateSaleSchema.parse(req.body);
      const user = req.user; // from auth middleware

      const sale = await SalesService.createSale(input, user);

      res.status(201).json({
        status: "success",
        data: sale,
      });
    } catch (error) {
      next(error);
    }
  }
}
