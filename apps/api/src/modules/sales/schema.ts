import { z } from "zod";

export const SaleItemSchema = z.object({
  productId: z.string().uuid(),
  unitId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
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
  // Note: For Slice 6.1, we assume no discounts are applied.
});

export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
