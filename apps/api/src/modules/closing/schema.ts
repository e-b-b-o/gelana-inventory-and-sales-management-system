import { z } from "zod";

export const getCurrentClosingQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD").optional(),
});

export const submitClosingSchema = z.object({
  branchId: z.string().uuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD"),
  actualCash: z
    .union([z.number(), z.string()])
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= 0;
    }, { message: "Actual cash must be a valid non-negative amount" })
    .transform((val) => Number(val)),
  discrepancyReason: z.string().max(500).optional(),
  allSalesRecorded: z.boolean().default(true),
});

export const approveClosingSchema = z.object({
  notes: z.string().max(500).optional(),
});

export const rejectClosingSchema = z.object({
  reason: z.string().min(1, "Reason for rejection is required").max(500, "Reason must not exceed 500 characters"),
});

export const getClosingHistoryQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["NOT_SUBMITTED", "SUBMITTED", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GetCurrentClosingQuery = z.infer<typeof getCurrentClosingQuerySchema>;
export type SubmitClosingInput = z.infer<typeof submitClosingSchema>;
export type ApproveClosingInput = z.infer<typeof approveClosingSchema>;
export type RejectClosingInput = z.infer<typeof rejectClosingSchema>;
export type GetClosingHistoryQuery = z.infer<typeof getClosingHistoryQuerySchema>;
