import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";
import { type GetBalancesResponse, GetBalancesResponseSchema, type GetMovementsResponse, GetMovementsResponseSchema, type CreateOpeningStockInput } from "./schema";

export const getBalances = async (params: { branchId?: string; search?: string; categoryId?: string; status?: string }): Promise<GetBalancesResponse> => {
  const query = new URLSearchParams();
  if (params.branchId) query.append("branchId", params.branchId);
  if (params.search) query.append("search", params.search);
  if (params.categoryId) query.append("categoryId", params.categoryId);
  if (params.status) query.append("status", params.status);

  const data = await fetchApi(`/inventory/balances?${query.toString()}`);
  
  const parsed = GetBalancesResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Schema validation failed", parsed.error);
    throw new Error("Failed to validate inventory balances response");
  }
  return parsed.data;
};

export const useInventoryBalances = (params: { branchId?: string; search?: string; categoryId?: string; status?: string }) => {
  return useQuery({
    queryKey: ["inventory", "balances", params],
    queryFn: () => getBalances(params),
  });
};

export const getMovements = async (params: { 
  branchId?: string; 
  productId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<GetMovementsResponse> => {
  const query = new URLSearchParams();
  if (params.branchId) query.append("branchId", params.branchId);
  if (params.productId) query.append("productId", params.productId);
  if (params.movementType) query.append("movementType", params.movementType);
  if (params.startDate) query.append("startDate", params.startDate);
  if (params.endDate) query.append("endDate", params.endDate);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());

  const data = await fetchApi(`/inventory/movements?${query.toString()}`);
  
  const parsed = GetMovementsResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Schema validation failed", parsed.error);
    throw new Error("Failed to validate inventory movements response");
  }
  return parsed.data;
};

export const useInventoryMovements = (params: { 
  branchId?: string; 
  productId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["inventory", "movements", params],
    queryFn: () => getMovements(params),
  });
};

export const createOpeningStock = async (data: CreateOpeningStockInput) => {
  return await fetchApi("/inventory/opening-stock", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useCreateOpeningStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOpeningStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const createAdjustment = async (data: { branchId: string; productId: string; quantityDelta: number; reason: string }) => {
  return await fetchApi("/inventory/adjustments", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useCreateAdjustment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAdjustment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
export const submitStocktake = async (data: { branchId: string; items: { productId: string; physicalCount: number }[]; reason?: string }) => {
  return await fetchApi("/inventory/stocktake", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useSubmitStocktake = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitStocktake,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};

export const createDisposal = async (data: { branchId: string; productId: string; quantity: number; reason: string }) => {
  return await fetchApi("/inventory/disposal", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const useCreateDisposal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDisposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
