import { z } from "zod";

export const getBalancesQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  brand: z.string().optional(),
  status: z.enum(["instock", "lowstock", "outofstock", "damaged"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type GetBalancesQuery = z.infer<typeof getBalancesQuerySchema>;

export const getMovementsQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  movementType: z.enum([
    "OPENING_STOCK", "SALE", "RECEIVING", "ADJUSTMENT", 
    "TRANSFER_OUT", "TRANSFER_IN", "RETURN_GOOD", "RETURN_DAMAGED", "DISPOSAL", "TRANSFER_DAMAGED"
  ]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type GetMovementsQuery = z.infer<typeof getMovementsQuerySchema>;

export type RecordMovementParams = {
  branchId: string;
  productId: string;
  movementType: "OPENING_STOCK" | "SALE" | "RECEIVING" | "ADJUSTMENT" | "TRANSFER_OUT" | "TRANSFER_IN" | "RETURN_GOOD" | "RETURN_DAMAGED" | "DISPOSAL" | "TRANSFER_DAMAGED";
  quantity: number; // Signed delta
  unitCost: number;
  referenceId?: string;
  reason?: string;
  createdById: string;
  dbTx?: any; // To allow running inside an external transaction if needed
};

export const createOpeningStockSchema = z.object({
  branchId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitCost: z.number().positive(),
});

export type CreateOpeningStockInput = z.infer<typeof createOpeningStockSchema>;

export const createAdjustmentSchema = z.object({
  branchId: z.string().uuid(),
  productId: z.string().uuid(),
  quantityDelta: z.number().int().refine(val => val !== 0, {
    message: "Adjustment quantity cannot be zero"
  }),
  reason: z.string().min(1, "Reason is required"),

});

export type CreateAdjustmentInput = z.infer<typeof createAdjustmentSchema>;

export const stocktakeItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  physicalCount: z.number().int("Physical count must be an integer").min(0, "Physical count cannot be negative"),
});

export const submitStocktakeSchema = z.object({
  branchId: z.string().uuid("Invalid branch ID"),
  items: z.array(stocktakeItemSchema).min(1, "At least one item must be submitted for stocktake"),
  reason: z.string().optional(),
});

export type SubmitStocktakeInput = z.infer<typeof submitStocktakeSchema>;

export const createDisposalSchema = z.object({
  branchId: z.string().uuid("Invalid branch ID"),
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int("Quantity must be an integer").positive("Quantity must be positive"),
  reason: z.string().min(1, "Reason is required"),
});

export type CreateDisposalInput = z.infer<typeof createDisposalSchema>;
