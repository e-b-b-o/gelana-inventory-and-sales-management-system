import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export type ReturnItemPayload = {
  saleItemId?: string;
  productId: string;
  unitId: string;
  quantity: number;
  condition: "SELLABLE" | "DAMAGED";
  unitPrice?: number;
};

export type CreateReturnPayload = {
  saleId?: string;
  branchId?: string;
  reason: string;
  refundPaymentMethodId: string;
  items: ReturnItemPayload[];
};

export const useCreateReturn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReturnPayload) => {
      const res = await fetchApi("/returns", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["returns"] }),
        queryClient.invalidateQueries({ queryKey: ["sales"] }),
        queryClient.invalidateQueries({ queryKey: ["sale-details"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] }),
      ]);
    },
  });
};

export type GetReturnsQuery = {
  page?: number;
  limit?: number;
  branchId?: string;
  isUnlinked?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export const getReturns = async (query: GetReturnsQuery = {}) => {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.branchId) params.append("branchId", query.branchId);
  if (query.isUnlinked !== undefined) params.append("isUnlinked", String(query.isUnlinked));
  if (query.startDate) params.append("startDate", query.startDate);
  if (query.endDate) params.append("endDate", query.endDate);
  if (query.search) params.append("search", query.search);

  return await fetchApi(`/returns?${params.toString()}`);
};

export const useReturns = (query: GetReturnsQuery = {}) => {
  return useQuery({
    queryKey: ["returns", query],
    queryFn: () => getReturns(query),
  });
};

export const getReturnDetails = async (id: string) => {
  return await fetchApi(`/returns/${id}`);
};

export const useReturnDetails = (id?: string) => {
  return useQuery({
    queryKey: ["return-details", id],
    queryFn: () => getReturnDetails(id!),
    enabled: !!id,
  });
};
