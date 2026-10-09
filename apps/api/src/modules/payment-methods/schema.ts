import { z } from "zod";

export const createPaymentMethodSchema = z.object({
  name: z.string().trim().min(1, "Payment method name is required").max(255),
  details: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial();
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;

export const togglePaymentMethodStatusSchema = z.object({
  isActive: z.boolean(),
});
export type TogglePaymentMethodStatusInput = z.infer<typeof togglePaymentMethodStatusSchema>;
