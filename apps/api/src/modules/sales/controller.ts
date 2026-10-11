import { Request, Response, NextFunction } from "express";
import { CreateSaleSchema, GetSalesQuerySchema, VoidSaleSchema, CorrectSaleSchema } from "./schema.js";
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

  static async getSales(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetSalesQuerySchema.parse(req.query);
      const user = req.user;

      const result = await SalesService.getSales(query, user);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getSaleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;

      const sale = await SalesService.getSaleById(id as string, user);

      res.status(200).json(sale);
    } catch (error) {
      next(error);
    }
  }

  static async voidSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = VoidSaleSchema.parse(req.body);
      const user = req.user;

      const result = await SalesService.voidSale(id as string, input, user);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async correctSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = CorrectSaleSchema.parse(req.body);
      const user = req.user;

      const correction = await SalesService.correctSale(id as string, input, user);

      res.status(201).json({
        status: "success",
        data: correction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSaleCorrections(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;

      const corrections = await SalesService.getSaleCorrections(id as string, user);

      res.status(200).json(corrections);
    } catch (error) {
      next(error);
    }
  }
}


