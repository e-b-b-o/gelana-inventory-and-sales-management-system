import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(255, "Email is too long").email("Invalid email format"),
  password: z.string().min(1, "Password is required").max(128, "Password cannot exceed 128 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
