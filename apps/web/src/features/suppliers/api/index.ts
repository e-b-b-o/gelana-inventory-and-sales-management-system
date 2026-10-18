import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierInput {
  name: string;
  phone?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface UpdateSupplierInput {
  name?: string;
  phone?: string | null;
  address?: string | null;
  contactPerson?: string | null;
  notes?: string | null;
}

export const useSuppliers = (options?: { enabled?: boolean }) => {
  return useQuery<Supplier[]>({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const response = await fetchApi("/suppliers");
      return response as Supplier[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSupplierInput) => {
      const response = await fetchApi("/suppliers", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSupplierInput }) => {
      const response = await fetchApi(`/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};

export const useToggleSupplierStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetchApi(`/suppliers/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};
