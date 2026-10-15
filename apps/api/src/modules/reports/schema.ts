import { z } from "zod";

export const getSalesReportQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
    .optional(),
  branchId: z.string().uuid("Invalid branch ID format").optional(),
  employeeId: z.string().uuid("Invalid employee ID format").optional(),
  productId: z.string().uuid("Invalid product ID format").optional(),
  paymentMethodId: z.string().uuid("Invalid payment method ID format").optional(),
  breakdown: z
    .enum(["day", "branch", "employee", "product", "payment_method"])
    .default("day"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetSalesReportQuery = z.infer<typeof getSalesReportQuerySchema>;
export type GetSalesReportInput = z.input<typeof getSalesReportQuerySchema>;

export const getInventoryReportQuerySchema = z.object({
  branchId: z.string().uuid("Invalid branch ID format").optional(),
  categoryId: z.string().uuid("Invalid category ID format").optional(),
  productId: z.string().uuid("Invalid product ID format").optional(),
  view: z.enum(["balances", "movements", "transfers"]).default("balances"),
  stockStatus: z.enum(["all", "low", "out", "in_stock"]).default("all"),
  movementType: z
    .enum([
      "OPENING_STOCK",
      "SALE",
      "RECEIVING",
      "ADJUSTMENT",
      "TRANSFER_OUT",
      "TRANSFER_IN",
      "RETURN_GOOD",
      "RETURN_DAMAGED",
      "DISPOSAL",
      "TRANSFER_DAMAGED",
    ])
    .optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetInventoryReportQuery = z.infer<typeof getInventoryReportQuerySchema>;
export type GetInventoryReportInput = z.input<typeof getInventoryReportQuerySchema>;

export const getProfitReportQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
    .optional(),
  branchId: z.string().uuid("Invalid branch ID format").optional(),
  categoryId: z.string().uuid("Invalid category ID format").optional(),
  productId: z.string().uuid("Invalid product ID format").optional(),
  breakdown: z.enum(["day", "branch", "category", "product"]).default("day"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetProfitReportQuery = z.infer<typeof getProfitReportQuerySchema>;
export type GetProfitReportInput = z.input<typeof getProfitReportQuerySchema>;

export const getClosingReportQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD")
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
    .optional(),
  branchId: z.string().uuid("Invalid branch ID format").optional(),
  status: z
    .enum(["all", "SUBMITTED", "APPROVED", "REJECTED", "NOT_SUBMITTED"])
    .default("all"),
  hasDiscrepancy: z
    .preprocess((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetClosingReportQuery = z.infer<typeof getClosingReportQuerySchema>;
export type GetClosingReportInput = z.input<typeof getClosingReportQuerySchema>;
