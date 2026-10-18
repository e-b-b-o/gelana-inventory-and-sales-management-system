import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  phoneNumber?: string | null;
  isActive: boolean;
}

export function useBranches(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const response = await fetchApi("/branches");
      return response.data as Branch[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Branch>) => {
      const response = await fetchApi("/branches", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Branch> }) => {
      const response = await fetchApi(`/branches/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

export function useUpdateBranchStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetchApi(`/branches/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}
