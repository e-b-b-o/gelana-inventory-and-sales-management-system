import { z } from "zod";

export const createReceivingItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("Quantity must be greater than zero"),
  unitCost: z.number().positive("Unit cost must be greater than zero"),
});

export const createReceivingSchema = z.object({
  branchId: z.string().uuid(),
  supplierId: z.string().uuid(),
  invoiceNumber: z.string().optional(),
  items: z.array(createReceivingItemSchema).min(1, "Receiving must contain at least one item"),
});

export type CreateReceivingDto = z.infer<typeof createReceivingSchema>;
export type CreateReceivingItemDto = z.infer<typeof createReceivingItemSchema>;

export const getReceivingsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  branchId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
});

export type GetReceivingsQuery = z.infer<typeof getReceivingsQuerySchema>;
