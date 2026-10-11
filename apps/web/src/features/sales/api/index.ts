import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export type SaleItemPayload = {
  productId: string;
  unitId: string;
  quantity: number;
  unitPrice: number;
  lineDiscount?: number;
};

export type SalePaymentPayload = {
  paymentMethodId: string;
  amount: number;
};

export type CreateSalePayload = {
  idempotencyKey?: string;
  branchId: string;
  soldAt?: string;
  items: SaleItemPayload[];
  payments: SalePaymentPayload[];
  saleDiscount?: number;
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSalePayload) => {
      const res = await fetchApi("/sales", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      return res;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] }),
        queryClient.invalidateQueries({ queryKey: ["sales"] }),
      ]);
      alert("Sale completed successfully");
    },
    onError: (err: any) => {
      alert(err?.message || "Failed to create sale");
    },
  });
};

export type GetSalesQuery = {
  page?: number;
  limit?: number;
  branchId?: string;
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
};

export const getSales = async (query: GetSalesQuery) => {
  const params = new URLSearchParams();
  if (query.page) params.append("page", query.page.toString());
  if (query.limit) params.append("limit", query.limit.toString());
  if (query.branchId) params.append("branchId", query.branchId);
  if (query.employeeId) params.append("employeeId", query.employeeId);
  if (query.startDate) params.append("startDate", query.startDate);
  if (query.endDate) params.append("endDate", query.endDate);
  if (query.search) params.append("search", query.search);

  return await fetchApi(`/sales?${params.toString()}`);
};

export const useSales = (query: GetSalesQuery = {}) => {
  return useQuery({
    queryKey: ["sales", query],
    queryFn: () => getSales(query),
  });
};

export const getSaleDetails = async (id: string) => {
  return await fetchApi(`/sales/${id}`);
};

export const useSaleDetails = (id?: string) => {
  return useQuery({
    queryKey: ["sale-details", id],
    queryFn: () => getSaleDetails(id!),
    enabled: !!id,
  });
};

export type VoidSalePayload = {
  reason: string;
};

export const useVoidSale = (saleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VoidSalePayload) => {
      return await fetchApi(`/sales/${saleId}/void`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] }),
        queryClient.invalidateQueries({ queryKey: ["sales"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] }),
      ]);
    },
  });
};

export type CorrectSalePayload = {
  reason: string;
  note?: string;
};

export const useCorrectSale = (saleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CorrectSalePayload) => {
      return await fetchApi(`/sales/${saleId}/corrections`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] }),
        queryClient.invalidateQueries({ queryKey: ["sales"] }),
        queryClient.invalidateQueries({ queryKey: ["sale-corrections", saleId] }),
      ]);
    },
  });
};

export const getSaleCorrections = async (saleId: string) => {
  return await fetchApi(`/sales/${saleId}/corrections`);
};

export const useSaleCorrections = (saleId?: string) => {
  return useQuery({
    queryKey: ["sale-corrections", saleId],
    queryFn: () => getSaleCorrections(saleId!),
    enabled: !!saleId,
  });
};



