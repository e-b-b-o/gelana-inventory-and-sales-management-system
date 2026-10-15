import { z } from "zod";
import { ACCOUNT_REQUEST_TYPES } from "../../database/schema/accountRequests.js";

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const CreateAccountRequestSchema = z
  .object({
    type: z.enum(ACCOUNT_REQUEST_TYPES),
    proposedEmail: z.string().email("Invalid email address").optional(),
    reason: z.string().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "EMAIL_CHANGE" && !data.proposedEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Proposed email is required for an email change request",
        path: ["proposedEmail"],
      });
    }
  });

export type CreateAccountRequestInput = z.infer<typeof CreateAccountRequestSchema>;

export const DecideAccountRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  decisionNotes: z.string().max(1000).optional(),
});

export type DecideAccountRequestInput = z.infer<typeof DecideAccountRequestSchema>;
