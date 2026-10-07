import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["OWNER", "EMPLOYEE"]),
  branchId: z.string().uuid("Invalid branch ID").optional().nullable(),
}).refine(
  (data) => {
    if (data.role === "EMPLOYEE") {
      return data.branchId !== null && data.branchId !== undefined;
    }
    return true;
  },
  {
    message: "Branch assignment is required for employees",
    path: ["branchId"],
  }
);

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  role: z.enum(["OWNER", "EMPLOYEE"]),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const reassignBranchSchema = z.object({
  newBranchId: z.string().uuid("Invalid branch ID"),
  reason: z.string().max(500, "Reason is too long").optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type ReassignBranchInput = z.infer<typeof reassignBranchSchema>;
