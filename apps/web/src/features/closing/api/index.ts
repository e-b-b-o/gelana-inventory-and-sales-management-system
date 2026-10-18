import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export type DailyClosingStatus = "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface PaymentSummaryItem {
  id?: string;
  paymentMethodId: string;
  paymentMethodName: string;
  receivedAmount: string;
  refundedAmount: string;
  netAmount: string;
  transactionCount: number;
}

export interface DailyClosingEventItem {
  id: string;
  closingId: string;
  eventType: "SUBMITTED" | "REJECTED" | "RESUBMITTED" | "APPROVED";
  actorId: string;
  actorRole: string;
  expectedCash: string;
  actualCash: string | null;
  cashDifference: string | null;
  notes: string | null;
  revision: number;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface DailyClosingItem {
  id: string | null;
  closingNumber: string | null;
  branchId: string;
  closingDate: string;
  status: DailyClosingStatus;
  totalSalesAmount: string;
  totalReturnsAmount: string;
  netSalesAmount: string;
  salesCount: number;
  expectedCash: string;
  actualCash: string | null;
  cashDifference: string | null;
  discrepancyReason: string | null;
  submittedById: string | null;
  submittedAt: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  revision: number;
  createdAt?: string;
  updatedAt?: string;
  branch?: {
    id: string;
    name: string;
    code: string;
  };
  submittedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  payments: PaymentSummaryItem[];
  events: DailyClosingEventItem[];
}

export interface BranchOverviewItem {
  branchId: string;
  branchName: string;
  branchCode: string;
  closingId: string | null;
  closingNumber: string | null;
  status: DailyClosingStatus;
  totalSalesAmount: string;
  expectedCash: string;
  actualCash: string | null;
  cashDifference: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface CurrentClosingResponse {
  closing: DailyClosingItem;
  liveCalculations: {
    salesCount: number;
    totalSalesAmount: string;
    totalReturnsAmount: string;
    netSalesAmount: string;
    expectedCash: string;
    paymentsSummary: PaymentSummaryItem[];
  } | null;
  checks: {
    allSalesRecorded: { passed: boolean; message: string };
    previousDayStatus: { passed: boolean; message: string };
  };
  branchOverview?: BranchOverviewItem[];
}

export interface SubmitClosingPayload {
  branchId?: string;
  date: string;
  actualCash: number;
  discrepancyReason?: string;
  allSalesRecorded?: boolean;
}

export interface ApproveClosingPayload {
  notes?: string;
}

export interface RejectClosingPayload {
  reason: string;
}

export interface GetClosingHistoryQuery {
  branchId?: string;
  startDate?: string;
  endDate?: string;
  status?: DailyClosingStatus;
  page?: number;
  limit?: number;
}

export interface ClosingHistoryResponse {
  data: DailyClosingItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getCurrentClosing = async (params: { branchId?: string; date?: string } = {}): Promise<{ data: CurrentClosingResponse }> => {
  const query = new URLSearchParams();
  if (params.branchId) query.append("branchId", params.branchId);
  if (params.date) query.append("date", params.date);

  const endpoint = `/closings/current${query.toString() ? `?${query.toString()}` : ""}`;
  return fetchApi(endpoint);
};

export const useCurrentClosing = (
  params: { branchId?: string; date?: string } = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["current-closing", params],
    queryFn: () => getCurrentClosing(params),
    enabled: options?.enabled,
  });
};

export const submitClosing = async (payload: SubmitClosingPayload) => {
  return fetchApi("/closings/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const useSubmitClosing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitClosing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-closing"] });
      queryClient.invalidateQueries({ queryKey: ["closings-history"] });
    },
  });
};

export const approveClosing = async (id: string, payload: ApproveClosingPayload) => {
  return fetchApi(`/closings/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const useApproveClosing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ApproveClosingPayload }) => approveClosing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-closing"] });
      queryClient.invalidateQueries({ queryKey: ["closing-detail"] });
      queryClient.invalidateQueries({ queryKey: ["closings-history"] });
    },
  });
};

export const rejectClosing = async (id: string, payload: RejectClosingPayload) => {
  return fetchApi(`/closings/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const useRejectClosing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectClosingPayload }) => rejectClosing(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-closing"] });
      queryClient.invalidateQueries({ queryKey: ["closing-detail"] });
      queryClient.invalidateQueries({ queryKey: ["closings-history"] });
    },
  });
};

export const getClosingHistory = async (query: GetClosingHistoryQuery = {}): Promise<ClosingHistoryResponse> => {
  const params = new URLSearchParams();
  if (query.branchId) params.append("branchId", query.branchId);
  if (query.startDate) params.append("startDate", query.startDate);
  if (query.endDate) params.append("endDate", query.endDate);
  if (query.status) params.append("status", query.status);
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());

  const endpoint = `/closings/history${params.toString() ? `?${params.toString()}` : ""}`;
  return fetchApi(endpoint);
};

export const useClosingHistory = (
  query: GetClosingHistoryQuery = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["closings-history", query],
    queryFn: () => getClosingHistory(query),
    enabled: options?.enabled,
  });
};

export const getClosingById = async (id: string): Promise<{ data: DailyClosingItem }> => {
  return fetchApi(`/closings/${id}`);
};

export const useClosingById = (id: string) => {
  return useQuery({
    queryKey: ["closing-detail", id],
    queryFn: () => getClosingById(id),
    enabled: Boolean(id),
  });
};
