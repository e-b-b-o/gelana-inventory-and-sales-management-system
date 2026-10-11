import { z } from "zod";

export const SaleItemSchema = z.object({
  productId: z.string().uuid(),
  unitId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  lineDiscount: z.number().nonnegative().optional().default(0),
});

export const SalePaymentSchema = z.object({
  paymentMethodId: z.string().uuid(),
  amount: z.number().nonnegative(),
});

export const CreateSaleSchema = z.object({
  idempotencyKey: z.string().min(1).optional(),
  branchId: z.string().uuid(),
  soldAt: z.string().datetime().optional(), // ISO 8601 string
  items: z.array(SaleItemSchema).min(1, "Sale must have at least one item"),
  payments: z.array(SalePaymentSchema).min(1, "Sale must have at least one payment method"),
  saleDiscount: z.number().nonnegative().optional().default(0),
});

export type CreateSaleInput = z.input<typeof CreateSaleSchema>;

export const GetSalesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  branchId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export type GetSalesQuery = z.input<typeof GetSalesQuerySchema>;

export const VoidSaleSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(255),
});

export type VoidSaleInput = z.infer<typeof VoidSaleSchema>;

export const CorrectSaleSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(255),
  note: z.string().max(500).optional(),
});

export type CorrectSaleInput = z.infer<typeof CorrectSaleSchema>;

