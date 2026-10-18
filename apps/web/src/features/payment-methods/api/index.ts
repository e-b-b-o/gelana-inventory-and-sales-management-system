import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export interface PaymentMethod {
  id: string;
  name: string;
  details: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodInput {
  name: string;
  details?: string | null;
  isActive?: boolean;
}

export interface UpdatePaymentMethodInput {
  name?: string;
  details?: string | null;
}

export const usePaymentMethods = (options?: { enabled?: boolean }) => {
  return useQuery<PaymentMethod[]>({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const response = await fetchApi("/payment-methods");
      return response as PaymentMethod[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreatePaymentMethodInput) => {
      const response = await fetchApi("/payment-methods", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePaymentMethodInput }) => {
      const response = await fetchApi(`/payment-methods/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
};

export const useTogglePaymentMethodStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetchApi(`/payment-methods/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
};
