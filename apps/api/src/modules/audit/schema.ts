import { z } from "zod";

export const GetAuditLogsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  action: z.string().optional(),
  branchId: z.string().uuid().optional(),
  actorId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(parseInt(val, 10), 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(Math.max(parseInt(val, 10), 1), 100) : 25)),
});

export type GetAuditLogsQuery = z.infer<typeof GetAuditLogsQuerySchema>;
