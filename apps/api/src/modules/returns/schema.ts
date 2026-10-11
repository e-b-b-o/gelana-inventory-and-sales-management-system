import { z } from "zod";

export const ReturnConditionEnum = z.enum(["SELLABLE", "DAMAGED"]);

export const CreateReturnItemSchema = z.object({
  saleItemId: z.string().uuid().optional(),
  productId: z.string().uuid(),
  unitId: z.string().uuid(),
  quantity: z.number().int().positive("Return quantity must be positive"),
  condition: ReturnConditionEnum,
  unitPrice: z.number().min(0).optional(),
  refundAmount: z.number().min(0, "Refund amount cannot be negative").optional(),
});

export const CreateReturnSchema = z.object({
  saleId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional(), // required if unlinked, otherwise derived from original sale
  items: z.array(CreateReturnItemSchema).min(1, "At least one item must be returned"),
  refundPaymentMethodId: z.string().uuid(),
  reason: z.string().min(3, "Reason for return is required"),
  isUnlinked: z.boolean().optional().default(false),
});

export const GetReturnsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  branchId: z.string().uuid().optional(),
  saleId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export type CreateReturnInput = z.input<typeof CreateReturnSchema>;

export type GetReturnsQuery = z.infer<typeof GetReturnsQuerySchema>;
