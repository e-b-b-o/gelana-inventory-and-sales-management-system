import { z } from "zod";
import { NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES } from "../../database/schema/index.js";

export const GetNotificationsQuerySchema = z.object({
  isRead: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  priority: z.enum(NOTIFICATION_PRIORITIES).optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(Math.max(parseInt(val, 10), 1), 100) : 20)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(parseInt(val, 10), 0) : 0)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(parseInt(val, 10), 1) : undefined)),
});

export interface GetNotificationsQuery {
  isRead?: boolean | undefined;
  priority?: (typeof NOTIFICATION_PRIORITIES)[number] | undefined;
  limit: number;
  offset: number;
  page?: number | undefined;
}

export const UpdateNotificationPreferencesSchema = z.object({
  preferences: z.array(
    z.object({
      category: z.enum(NOTIFICATION_CATEGORIES),
      isEnabled: z.boolean(),
    })
  ),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof UpdateNotificationPreferencesSchema>;
