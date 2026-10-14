import { z } from "zod";

export const TransferStatusEnum = z.enum([
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "DISPATCHED",
  "DISCREPANCY",
  "COMPLETED",
  "CANCELLED",
]);
export type TransferStatus = z.infer<typeof TransferStatusEnum>;

export const CreateTransferItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  requestedQuantity: z.number().int("Quantity must be an integer").positive("Requested quantity must be positive"),
});

export const CreateTransferSchema = z.object({
  sourceBranchId: z.string().uuid("Invalid source branch ID"),
  destinationBranchId: z.string().uuid("Invalid destination branch ID"),
  items: z.array(CreateTransferItemSchema).min(1, "At least one product line is required"),
  notes: z.string().max(255, "Notes cannot exceed 255 characters").optional(),
}).refine(data => data.sourceBranchId !== data.destinationBranchId, {
  message: "Source and destination branches must be different",
  path: ["destinationBranchId"],
}).refine(data => {
  const productIds = data.items.map(item => item.productId);
  return new Set(productIds).size === productIds.length;
}, {
  message: "Duplicate product lines are not allowed in a transfer request",
  path: ["items"],
});

export const ApproveTransferItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  approvedQuantity: z.number().int("Quantity must be an integer").positive("Approved quantity must be positive"),
});

export const ApproveTransferSchema = z.object({
  notes: z.string().max(255).optional(),
  items: z.array(ApproveTransferItemSchema).optional(),
});

export const RejectTransferSchema = z.object({
  reason: z.string().min(3, "Rejection reason must be at least 3 characters").max(255, "Rejection reason cannot exceed 255 characters"),
});

export const DispatchTransferSchema = z.object({
  notes: z.string().max(255).optional(),
});

export const ReceiveTransferItemSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  receivedQuantity: z.number().int("Received quantity must be an integer").min(0, "Received quantity cannot be negative"),
  damagedQuantity: z.number().int("Damaged quantity must be an integer").min(0, "Damaged quantity cannot be negative").default(0),
  discrepancyReason: z.string().max(255).optional(),
});

export const ReceiveTransferSchema = z.object({
  items: z.array(ReceiveTransferItemSchema).min(1, "At least one item must be received"),
  notes: z.string().max(255).optional(),
});

export const ResolveDiscrepancySchema = z.object({
  resolutionNotes: z.string().min(1, "Resolution notes are required").max(255, "Resolution notes cannot exceed 255 characters"),
});

export const GetTransfersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: TransferStatusEnum.optional(),
  sourceBranchId: z.string().uuid().optional(),
  destinationBranchId: z.string().uuid().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateTransferInput = z.infer<typeof CreateTransferSchema>;
export type ApproveTransferInput = z.infer<typeof ApproveTransferSchema>;
export type RejectTransferInput = z.infer<typeof RejectTransferSchema>;
export type DispatchTransferInput = z.infer<typeof DispatchTransferSchema>;
export type ReceiveTransferInput = z.infer<typeof ReceiveTransferSchema>;
export type ResolveDiscrepancyInput = z.infer<typeof ResolveDiscrepancySchema>;
export type GetTransfersQuery = z.infer<typeof GetTransfersQuerySchema>;

