import { Request, Response, NextFunction } from "express";
import { getBalancesQuerySchema, getMovementsQuerySchema, createOpeningStockSchema, createAdjustmentSchema, submitStocktakeSchema, createDisposalSchema } from "./schema.js";
import { InventoryService } from "./service.js";
export class InventoryController {
  static async getBalances(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getBalancesQuerySchema.parse(req.query);
      const user = req.user as any;

      const result = await InventoryService.getBalances(query, user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const query = getMovementsQuerySchema.parse(req.query);
      const user = req.user as any;

      const result = await InventoryService.getMovements(query, user);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createOpeningStock(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createOpeningStockSchema.parse(req.body);
      const user = req.user as any;

      const result = await InventoryService.createOpeningStock(input, user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createAdjustment(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createAdjustmentSchema.parse(req.body);
      const user = req.user as any;

      const result = await InventoryService.createAdjustment(input, user);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async submitStocktake(req: Request, res: Response, next: NextFunction) {
    try {
      const input = submitStocktakeSchema.parse(req.body);
      const user = req.user as any;
      const movements = await InventoryService.submitStocktake(input, user);
      res.status(200).json(movements);
    } catch (error) {
      next(error);
    }
  }

  static async createDisposal(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createDisposalSchema.parse(req.body);
      const user = req.user as any;
      const movement = await InventoryService.createDisposal(input, user);
      res.status(201).json(movement);
    } catch (error) {
      next(error);
    }
  }
}
