import { z } from "zod";

export const getOwnerDashboardQuerySchema = z.object({
  branchId: z.string().uuid("Invalid branch ID format").optional(),
  trendRange: z.enum(["today", "7days", "month"]).default("today"),
});

export const getEmployeeDashboardQuerySchema = z.object({
  branchId: z.string().uuid("Invalid branch ID format").optional(),
});

export type GetOwnerDashboardQuery = z.infer<typeof getOwnerDashboardQuerySchema>;
export type GetEmployeeDashboardQuery = z.infer<typeof getEmployeeDashboardQuerySchema>;
