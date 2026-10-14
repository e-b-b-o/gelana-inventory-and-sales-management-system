import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export type TransferItemInput = {
  productId: string;
  requestedQuantity: number;
};

export type CreateTransferPayload = {
  sourceBranchId: string;
  destinationBranchId: string;
  items: TransferItemInput[];
  notes?: string;
};

export type ApproveTransferPayload = {
  notes?: string;
  items?: { productId: string; approvedQuantity: number }[];
};

export type RejectTransferPayload = {
  reason: string;
};

export type DispatchTransferPayload = {
  notes?: string;
};

export type GetTransfersQuery = {
  page?: number;
  limit?: number;
  status?: string;
  sourceBranchId?: string;
  destinationBranchId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export const getTransfers = async (query: GetTransfersQuery = {}) => {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.status) params.append("status", query.status);
  if (query.sourceBranchId) params.append("sourceBranchId", query.sourceBranchId);
  if (query.destinationBranchId) params.append("destinationBranchId", query.destinationBranchId);
  if (query.search) params.append("search", query.search);
  if (query.startDate) params.append("startDate", query.startDate);
  if (query.endDate) params.append("endDate", query.endDate);

  const endpoint = `/transfers${params.toString() ? `?${params.toString()}` : ""}`;
  return fetchApi(endpoint);
};

export const useTransfers = (query: GetTransfersQuery = {}) => {
  return useQuery({
    queryKey: ["transfers", query],
    queryFn: () => getTransfers(query),
  });
};

export const getTransferById = async (id: string) => {
  const res = await fetchApi(`/transfers/${id}`);
  return res.data;
};

export const useTransferDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ["transfer-details", id],
    queryFn: () => getTransferById(id!),
    enabled: Boolean(id),
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTransferPayload) => {
      const res = await fetchApi("/transfers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transfers"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] }),
      ]);
    },
  });
};

export const useApproveTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ApproveTransferPayload }) => {
      const res = await fetchApi(`/transfers/${id}/approve`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transfers"] }),
        queryClient.invalidateQueries({ queryKey: ["transfer-details", variables.id] }),
      ]);
    },
  });
};

export const useRejectTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RejectTransferPayload }) => {
      const res = await fetchApi(`/transfers/${id}/reject`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transfers"] }),
        queryClient.invalidateQueries({ queryKey: ["transfer-details", variables.id] }),
      ]);
    },
  });
};

export const useDispatchTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: DispatchTransferPayload }) => {
      const res = await fetchApi(`/transfers/${id}/dispatch`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transfers"] }),
        queryClient.invalidateQueries({ queryKey: ["transfer-details", variables.id] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] }),
      ]);
    },
  });
};

export type ReceiveTransferItemInput = {
  itemId: string;
  receivedQuantity: number;
  damagedQuantity?: number;
  discrepancyReason?: string;
};

export type ReceiveTransferPayload = {
  items: ReceiveTransferItemInput[];
  notes?: string;
};

export type ResolveDiscrepancyPayload = {
  resolutionNotes: string;
};

export const useReceiveTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReceiveTransferPayload }) => {
      const res = await fetchApi(`/transfers/${id}/receive`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transfers"] }),
        queryClient.invalidateQueries({ queryKey: ["transfer-details", variables.id] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] }),
      ]);
    },
  });
};

export const useResolveDiscrepancy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ResolveDiscrepancyPayload }) => {
      const res = await fetchApi(`/transfers/${id}/resolve-discrepancy`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transfers"] }),
        queryClient.invalidateQueries({ queryKey: ["transfer-details", variables.id] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] }),
      ]);
    },
  });
};

