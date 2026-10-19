import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryQueryParams {
  search?: string;
  isActive?: boolean;
}

export function useCategories(
  paramsOrOptions?: CategoryQueryParams | { enabled?: boolean },
  options?: { enabled?: boolean }
) {
  const isParams = paramsOrOptions && ("search" in paramsOrOptions || "isActive" in paramsOrOptions);
  const params = isParams ? (paramsOrOptions as CategoryQueryParams) : undefined;
  const opts = isParams ? options : (paramsOrOptions as { enabled?: boolean });

  return useQuery({
    queryKey: ["categories", params?.search, params?.isActive],
    queryFn: async ({ signal }) => {
      const searchParams = new URLSearchParams();
      if (params?.search?.trim()) searchParams.append("search", params.search.trim());
      if (params?.isActive !== undefined) searchParams.append("isActive", String(params.isActive));

      const qs = searchParams.toString();
      const endpoint = qs ? `/categories?${qs}` : "/categories";
      const response = await fetchApi(endpoint, { signal });
      return response.data as Category[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: opts?.enabled,
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
