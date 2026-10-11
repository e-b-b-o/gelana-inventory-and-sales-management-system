import { NextFunction, Request, Response } from "express";
import {
  ApproveTransferSchema,
  CreateTransferSchema,
  DispatchTransferSchema,
  GetTransfersQuerySchema,
  RejectTransferSchema,
} from "./schema.js";
import { TransfersService } from "./service.js";

export class TransfersController {
  static async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const input = CreateTransferSchema.parse(req.body);
      const user = req.user;

      const result = await TransfersService.createTransfer(input, user);

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetTransfersQuerySchema.parse(req.query);
      const user = req.user;

      const result = await TransfersService.getTransfers(query, user);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getTransferById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user;

      const result = await TransfersService.getTransferById(id as string, user);

      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async approveTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = ApproveTransferSchema.parse(req.body);
      const user = req.user;

      const result = await TransfersService.approveTransfer(id as string, input, user);

      res.status(200).json({
        status: "success",
        message: "Transfer request approved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async rejectTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = RejectTransferSchema.parse(req.body);
      const user = req.user;

      const result = await TransfersService.rejectTransfer(id as string, input, user);

      res.status(200).json({
        status: "success",
        message: "Transfer request rejected",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async dispatchTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const input = DispatchTransferSchema.parse(req.body);
      const user = req.user;

      const result = await TransfersService.dispatchTransfer(id as string, input, user);

      res.status(200).json({
        status: "success",
        message: "Transfer dispatched successfully. Goods are now in transit.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
