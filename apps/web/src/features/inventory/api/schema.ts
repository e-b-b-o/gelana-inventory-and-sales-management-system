import { z } from "zod";

export const InventoryProductSchema = z.object({
  id: z.string(),
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  brand: z.string().nullable().optional(),
  baseUnit: z.string(),
  altUnit: z.string().nullable().optional(),
  sellingPrice: z.string(),
  totalAvailable: z.number(),
  totalDamaged: z.number(),
  status: z.string(),
  units: z.array(z.object({
    id: z.string(),
    name: z.string(),
    isBase: z.boolean(),
    sellingPrice: z.string(),
    conversionQuantity: z.string().nullable().optional()
  })).optional(),
  balances: z.array(z.object({
    branchId: z.string(),
    branchName: z.string(),
    availableQuantity: z.number(),
    damagedQuantity: z.number(),
    minimumStockQuantity: z.number(),
    wac: z.string()
  }))
});

export type InventoryProduct = z.infer<typeof InventoryProductSchema>;

export const GetBalancesResponseSchema = z.object({
  data: z.array(InventoryProductSchema),
});

export type GetBalancesResponse = z.infer<typeof GetBalancesResponseSchema>;

export const InventoryMovementSchema = z.object({
  id: z.string(),
  transactionId: z.string().nullable(),
  branchName: z.string(),
  productName: z.string(),
  productSku: z.string(),
  categoryName: z.string(),
  baseUnit: z.string(),
  movementType: z.string(),
  quantity: z.number(),
  unitCost: z.string(),
  reason: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.string(),
});

export type InventoryMovement = z.infer<typeof InventoryMovementSchema>;

export const GetMovementsResponseSchema = z.object({
  data: z.array(InventoryMovementSchema),
  meta: z.object({
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
});

export type GetMovementsResponse = z.infer<typeof GetMovementsResponseSchema>;

export const CreateOpeningStockInputSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int("Quantity must be a whole number").positive("Quantity must be positive"),
  unitCost: z.number().positive("Unit cost must be greater than zero"),
});

export type CreateOpeningStockInput = z.infer<typeof CreateOpeningStockInputSchema>;

export const CreateAdjustmentInputSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  productId: z.string().min(1, "Product is required"),
  quantityDelta: z.number().int("Quantity must be a whole number").refine(val => val !== 0, {
    message: "Adjustment quantity cannot be zero"
  }),
  reason: z.string().min(1, "Reason is required"),
});

export type CreateAdjustmentInput = z.infer<typeof CreateAdjustmentInputSchema>;
