import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../../lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "EMPLOYEE";
  branchId: string | null;
  branchName: string | null;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AccountRequestItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  branchName?: string | null;
  type: "EMAIL_CHANGE" | "PASSWORD_RESET";
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  proposedEmail?: string | null;
  reason?: string | null;
  decidedById?: string | null;
  decidedByName?: string | null;
  decidedAt?: string | null;
  decisionNotes?: string | null;
  createdAt: string;
}

export interface NotificationPreferenceItem {
  category: "INVENTORY" | "TRANSFERS" | "SALES_RETURNS" | "CLOSINGS" | "ACCOUNT";
  isEnabled: boolean;
}

// Profile API
export async function getProfile(): Promise<{ data: UserProfile }> {
  return fetchApi("/settings/profile");
}

export async function updateProfile(data: { name: string }): Promise<{ success: boolean; data: UserProfile }> {
  return fetchApi("/settings/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Password / Security API
export async function changeOwnerPassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ success: boolean; message: string }> {
  return fetchApi("/settings/security/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Account Requests API
export async function createAccountRequest(data: {
  type: "EMAIL_CHANGE" | "PASSWORD_RESET";
  proposedEmail?: string;
  reason?: string;
}): Promise<{ success: boolean; data: AccountRequestItem }> {
  return fetchApi("/settings/account-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAccountRequests(params?: { status?: string }): Promise<{ data: AccountRequestItem[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return fetchApi(`/settings/account-requests${qs ? `?${qs}` : ""}`);
}

export async function decideAccountRequest(
  id: string,
  data: { status: "APPROVED" | "REJECTED"; decisionNotes?: string }
): Promise<{ success: boolean; message: string; data: AccountRequestItem }> {
  return fetchApi(`/settings/account-requests/${id}/decision`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Notification Preferences API
export async function getNotificationPreferences(): Promise<{ data: NotificationPreferenceItem[] }> {
  return fetchApi("/settings/notification-preferences");
}

export async function updateNotificationPreferences(data: {
  preferences: NotificationPreferenceItem[];
}): Promise<{ success: boolean; data: NotificationPreferenceItem[] }> {
  return fetchApi("/settings/notification-preferences", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Hooks
export function useProfileQuery() {
  return useQuery({
    queryKey: ["settings", "profile"],
    queryFn: getProfile,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useChangeOwnerPasswordMutation() {
  return useMutation({
    mutationFn: changeOwnerPassword,
  });
}

export function useAccountRequestsQuery(status?: string) {
  return useQuery({
    queryKey: ["settings", "account-requests", status],
    queryFn: () => getAccountRequests({ status }),
  });
}

export function useCreateAccountRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccountRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "account-requests"] });
    },
  });
}

export function useDecideAccountRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: "APPROVED" | "REJECTED"; decisionNotes?: string } }) =>
      decideAccountRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "account-requests"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useNotificationPreferencesQuery() {
  return useQuery({
    queryKey: ["settings", "notification-preferences"],
    queryFn: getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "notification-preferences"] });
    },
  });
}
