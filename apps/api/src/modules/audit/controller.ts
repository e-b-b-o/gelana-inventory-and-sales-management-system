import { Request, Response, NextFunction } from "express";
import { AuditService } from "./service.js";
import { GetAuditLogsQuerySchema } from "./schema.js";

export class AuditController {
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = GetAuditLogsQuerySchema.parse(req.query);
      const user = req.user!;
      const userId = (user.id || user.userId) as string;
      const result = await AuditService.getAuditLogs(
        { id: userId, role: user.role, branchId: user.branchId },
        query
      );
      res.json({
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const userId = (user.id || user.userId) as string;
      const id = req.params.id as string;
      const record = await AuditService.getAuditLogById(id, {
        id: userId,
        role: user.role,
        branchId: user.branchId,
      });
      res.json({ data: record });
    } catch (error) {
      next(error);
    }
  }
}
