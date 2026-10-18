import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role: "OWNER" | "EMPLOYEE";
  branchId?: string | null;
  isActive?: boolean;
  branchName?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface GetMeResponse {
  user: AuthUser;
}

export async function login(data: any) {
  return fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function logout() {
  return fetchApi("/auth/logout", {
    method: "POST"
  });
}

export async function getMe(): Promise<GetMeResponse> {
  return fetchApi("/auth/me");
}

export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery<GetMeResponse>({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: options?.enabled,
  });
}

