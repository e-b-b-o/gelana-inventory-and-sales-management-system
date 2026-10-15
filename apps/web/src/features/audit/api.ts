import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../lib/api";

export interface AuditLogItem {
  id: string;
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  action: string;
  category: string;
  entityType: string;
  entityId?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  reason?: string | null;
  metadata?: any;
  createdAt: string;
}

export interface GetAuditLogsParams {
  category?: string;
  action?: string;
  branchId?: string;
  actorId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsResponse {
  data: AuditLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAuditLogs(params: GetAuditLogsParams = {}): Promise<AuditLogsResponse> {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.action) query.set("action", params.action);
  if (params.branchId) query.set("branchId", params.branchId);
  if (params.actorId) query.set("actorId", params.actorId);
  if (params.search) query.set("search", params.search);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return fetchApi(`/audit-logs${qs ? `?${qs}` : ""}`);
}

export async function getAuditLogById(id: string): Promise<{ data: AuditLogItem }> {
  return fetchApi(`/audit-logs/${id}`);
}

export function useAuditLogsQuery(params: GetAuditLogsParams = {}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => getAuditLogs(params),
  });
}

export function useAuditLogDetailsQuery(id: string | null) {
  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: () => (id ? getAuditLogById(id) : null),
    enabled: Boolean(id),
  });
}
