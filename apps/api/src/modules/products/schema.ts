import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(255),
  categoryId: z.string().uuid("Invalid category ID"),
  brand: z.string().trim().max(255).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().max(1024).optional().nullable(),
  // Legacy fields preserved until Slices 3.3 and 3.4
  unit: z.string().trim().min(1, "Unit is required").max(20),
  defaultSellingPrice: z.coerce.number().min(0, "Price must be >= 0"),
  isActive: z.boolean().optional().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const toggleProductStatusSchema = z.object({
  isActive: z.boolean(),
});
export type ToggleProductStatusInput = z.infer<typeof toggleProductStatusSchema>;
