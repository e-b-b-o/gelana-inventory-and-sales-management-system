import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().trim().min(1, "Supplier name is required").max(255),
  phone: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().optional().nullable(),
  contactPerson: z.string().trim().max(255).optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const updateSupplierSchema = createSupplierSchema.partial();
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;

export const toggleSupplierStatusSchema = z.object({
  isActive: z.boolean(),
});
export type ToggleSupplierStatusInput = z.infer<typeof toggleSupplierStatusSchema>;
