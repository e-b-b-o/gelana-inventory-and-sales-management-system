import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "EMPLOYEE";
  branchId: string | null;
  isActive: boolean;
  createdAt: string;
}

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetchApi("/users");
      return response.data as User[];
    },
    enabled: options?.enabled,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<User> & { password?: string }) => {
      const response = await fetchApi("/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await fetchApi(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetchApi(`/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export interface BranchAssignment {
  id: string;
  branchId: string;
  branchName: string;
  assignedBy: string;
  assignedByName: string;
  startDate: string;
  endDate: string | null;
  reason: string | null;
}

export function useBranchAssignments(userId: string) {
  return useQuery({
    queryKey: ["branch-assignments", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await fetchApi(`/users/${userId}/branch-assignments`);
      return response.data as BranchAssignment[];
    },
    enabled: !!userId,
  });
}

export function useReassignBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, newBranchId, reason }: { userId: string; newBranchId: string; reason?: string }) => {
      const response = await fetchApi(`/users/${userId}/branch-assignments`, {
        method: "POST",
        body: JSON.stringify({ newBranchId, reason }),
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["branch-assignments", variables.userId] });
    },
  });
}
