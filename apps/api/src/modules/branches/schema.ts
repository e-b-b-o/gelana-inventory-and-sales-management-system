import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  address: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
});

export const updateBranchSchema = createBranchSchema.partial();

export const updateBranchStatusSchema = z.object({
  isActive: z.boolean(),
});
