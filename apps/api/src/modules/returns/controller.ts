import { Request, Response, NextFunction } from "express";
import { CreateReturnSchema, GetReturnsQuerySchema } from "./schema.js";
import { ReturnsService } from "./service.js";

export class ReturnsController {
  static async createReturn(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateReturnSchema.parse(req.body);
      const user = req.user;

      const result = await ReturnsService.createReturn(input, user);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReturns(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetReturnsQuerySchema.parse(req.query);
      const user = req.user;

      const result = await ReturnsService.getReturns(query, user);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getReturnById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;

      const result = await ReturnsService.getReturnById(id as string, user);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
