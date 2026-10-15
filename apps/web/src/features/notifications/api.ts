import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../lib/api";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: "INFORMATIONAL" | "IMPORTANT" | "CRITICAL";
  isRead: boolean;
  readAt?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  link?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsParams {
  isRead?: boolean;
  priority?: "INFORMATIONAL" | "IMPORTANT" | "CRITICAL";
  page?: number;
  limit?: number;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getNotifications(params: GetNotificationsParams = {}): Promise<NotificationsResponse> {
  const query = new URLSearchParams();
  if (params.isRead !== undefined) query.set("isRead", String(params.isRead));
  if (params.priority) query.set("priority", params.priority);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return fetchApi(`/notifications${qs ? `?${qs}` : ""}`);
}

export async function getUnreadCount(): Promise<{ unreadCount: number }> {
  const res = await fetchApi("/notifications/unread-count");
  if (typeof res?.unreadCount === "number") return { unreadCount: res.unreadCount };
  if (typeof res?.data?.unreadCount === "number") return { unreadCount: res.data.unreadCount };
  return { unreadCount: 0 };
}

export async function markNotificationAsRead(id: string): Promise<{ success: boolean; data: NotificationItem }> {
  return fetchApi(`/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<{ success: boolean; updatedCount: number }> {
  return fetchApi("/notifications/mark-all-read", {
    method: "POST",
  });
}

export function useNotificationsQuery(params: GetNotificationsParams = {}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => getNotifications(params),
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: (query) => {
      const status = (query.state.error as any)?.statusCode ?? (query.state.error as any)?.status;
      if (status === 401 || status === 403) return false;
      return 30000;
    },
    staleTime: 15000,
  });
}

export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
