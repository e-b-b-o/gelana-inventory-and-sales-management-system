import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export const receivingItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().int().positive("Quantity must be greater than zero"),
  unitCost: z.number().positive("Unit cost must be greater than zero"),
});

export const createReceivingSchema = z.object({
  branchId: z.string().min(1, "Branch is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  invoiceNumber: z.string().optional(),
  items: z.array(receivingItemSchema).min(1, "At least one item is required"),
});

export type CreateReceivingDto = z.infer<typeof createReceivingSchema>;

export const createReceiving = async (data: CreateReceivingDto) => {
  const response = await fetchApi("/receivings", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response;
};

export const useCreateReceiving = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReceiving,
    onSuccess: async () => {
      // Invalidate inventory balances
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["inventory", "balances"] }),
        queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] }),
      ]);
    },
  });

};

export type GetReceivingsQuery = {
  page: number;
  limit: number;
  branchId?: string;
  supplierId?: string;
};

export const getReceivings = async (query: GetReceivingsQuery) => {
  const params = new URLSearchParams();
  params.append("page", query.page.toString());
  params.append("limit", query.limit.toString());
  if (query.branchId) params.append("branchId", query.branchId);
  if (query.supplierId) params.append("supplierId", query.supplierId);

  return await fetchApi(`/receivings?${params.toString()}`);
};

export const useReceivings = (query: GetReceivingsQuery) => {
  return useQuery({
    queryKey: ["receivings", query],
    queryFn: () => getReceivings(query),
  });
};

export const getReceivingDetails = async (id: string) => {
  return await fetchApi(`/receivings/${id}`);
};

export const useReceivingDetails = (id?: string) => {
  return useQuery({
    queryKey: ["receiving-details", id],
    queryFn: () => getReceivingDetails(id!),
    enabled: !!id,
  });
};
