import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export function useCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetchApi("/categories");
      return response.data as Category[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await fetchApi("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string } }) => {
      const response = await fetchApi(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetchApi(`/categories/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
