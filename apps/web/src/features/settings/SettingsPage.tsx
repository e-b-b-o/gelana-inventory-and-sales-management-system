import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useChangeOwnerPasswordMutation,
  useAccountRequestsQuery,
  useCreateAccountRequestMutation,
  useDecideAccountRequestMutation,
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "./api";
import type { AccountRequestItem, NotificationPreferenceItem } from "./api";

type SettingsTab = "PROFILE" | "SECURITY" | "MY_REQUESTS" | "REQUEST_MANAGEMENT" | "NOTIFICATIONS";

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SettingsPage() {
  const { data: meResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const currentUser = meResponse?.user;
  const isOwner = currentUser?.role === "OWNER";

  const [activeTab, setActiveTab] = useState<SettingsTab>("PROFILE");

  // Profile State: View & Edit separation
  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const profile = profileData?.data || (currentUser ? {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role,
    branchId: currentUser.branchId,
    branchName: currentUser.branchName || (currentUser.role === "OWNER" ? "All Branches (Owner)" : null),
    createdAt: currentUser.createdAt,
  } : null);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");

  useEffect(() => {
    if (profile?.name && !isEditingProfile) {
      setDisplayName(profile.name);
    }
  }, [profile?.name, isEditingProfile]);

  const handleStartEditProfile = () => {
    setDisplayName(profile?.name || "");
    setProfileErrorMsg("");
    setProfileSuccessMsg("");
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => {
    setDisplayName(profile?.name || "");
    setProfileErrorMsg("");
    setIsEditingProfile(false);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg("");
    setProfileErrorMsg("");

    const trimmed = displayName.trim();
    if (!trimmed) {
      setProfileErrorMsg("Display name cannot be empty.");
      return;
    }
    if (trimmed.length < 2) {
      setProfileErrorMsg("Display name must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 255) {
      setProfileErrorMsg("Display name cannot exceed 255 characters.");
      return;
    }

    updateProfileMutation.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setProfileSuccessMsg("Profile updated successfully.");
          setIsEditingProfile(false);
        },
        onError: (err: any) => {
          setProfileErrorMsg(err?.message || "Failed to update profile name.");
        },
      }
    );
  };

  // Owner Password Change State
  const changePasswordMutation = useChangeOwnerPasswordMutation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccessMsg("");
    setPasswordErrorMsg("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordErrorMsg("All password fields are required.");
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordErrorMsg("New password must be at least 6 characters long and cannot consist solely of whitespace.");
      return;
    }

    if (newPassword.length > 128) {
      setPasswordErrorMsg("New password cannot exceed 128 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg("New passwords do not match.");
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setPasswordSuccessMsg("Password changed successfully.");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err: any) => {
          setPasswordErrorMsg(err?.message || "Failed to change password.");
        },
      }
    );
  };

  // Employee Account Request Submission State
  const createRequestMutation = useCreateAccountRequestMutation();
  const [requestType, setRequestType] = useState<"EMAIL_CHANGE" | "PASSWORD_RESET">("EMAIL_CHANGE");
  const [proposedEmail, setProposedEmail] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestSuccessMsg, setRequestSuccessMsg] = useState("");
  const [requestErrorMsg, setRequestErrorMsg] = useState("");

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSuccessMsg("");
    setRequestErrorMsg("");

    if (requestType === "EMAIL_CHANGE") {
      const trimmedEmail = proposedEmail.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail || !emailRegex.test(trimmedEmail) || trimmedEmail.length > 255) {
        setRequestErrorMsg("Please enter a valid proposed email address (max 255 characters).");
        return;
      }
    }

    createRequestMutation.mutate(
      {
        type: requestType,
        proposedEmail: requestType === "EMAIL_CHANGE" ? proposedEmail.trim() : undefined,
        reason: requestReason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setRequestSuccessMsg("Request submitted successfully to the Owner.");
          setProposedEmail("");
          setRequestReason("");
        },
        onError: (err: any) => {
          setRequestErrorMsg(err?.message || "Failed to submit account request.");
        },
      }
    );
  };

  // Owner Request Decision State
  const { data: requestsData, isLoading: isRequestsLoading } = useAccountRequestsQuery();
  const decideRequestMutation = useDecideAccountRequestMutation();
  const [selectedRequest, setSelectedRequest] = useState<AccountRequestItem | null>(null);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [requestFilter, setRequestFilter] = useState<string>("ALL");

  const allRequests = requestsData?.data || [];
  const pendingRequestsCount = allRequests.filter((r) => r.status === "PENDING").length;

  const filteredRequests = allRequests.filter((r) => {
    if (requestFilter === "ALL") return true;
    return r.status === requestFilter;
  });

  const handleDecideRequest = (status: "APPROVED" | "REJECTED") => {
    if (!selectedRequest) return;
    decideRequestMutation.mutate(
      {
        id: selectedRequest.id,
        data: {
          status,
          decisionNotes: decisionNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setSelectedRequest(null);
          setDecisionNotes("");
        },
      }
    );
  };

  // Notification Preferences State
  const { data: prefsData, isLoading: isPrefsLoading } = useNotificationPreferencesQuery();
  const updatePrefsMutation = useUpdateNotificationPreferencesMutation();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    INVENTORY: true,
    TRANSFERS: true,
    SALES_RETURNS: true,
    CLOSINGS: true,
    ACCOUNT: true,
  });
  const [prefsSuccessMsg, setPrefsSuccessMsg] = useState("");

  useEffect(() => {
    if (prefsData?.data) {
      const map: Record<string, boolean> = {
        INVENTORY: true,
        TRANSFERS: true,
        SALES_RETURNS: true,
        CLOSINGS: true,
        ACCOUNT: true,
      };
      for (const item of prefsData.data) {
        map[item.category] = item.isEnabled;
      }
      setPrefs(map);
    }
  }, [prefsData]);

  const handleTogglePref = (category: string) => {
    setPrefs((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSavePreferences = () => {
    setPrefsSuccessMsg("");
    const list: NotificationPreferenceItem[] = Object.entries(prefs).map(([category, isEnabled]) => ({
      category: category as any,
      isEnabled,
    }));

    updatePrefsMutation.mutate(
      { preferences: list },
      {
        onSuccess: () => {
          setPrefsSuccessMsg("Notification preferences updated successfully.");
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="material-symbols-outlined text-[14px]">check</span>
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="material-symbols-outlined text-[14px]">close</span>
            Rejected
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="material-symbols-outlined text-[14px]">task_alt</span>
            Completed
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Settings</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage your personal profile, account security, notification rules, and administrative change requests.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("PROFILE")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === "PROFILE"
              ? "bg-primary text-on-primary font-semibold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          <span>My Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SECURITY")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === "SECURITY"
              ? "bg-primary text-on-primary font-semibold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">shield</span>
          <span>Account & Security</span>
        </button>

        {!isOwner && (
          <button
            type="button"
            onClick={() => setActiveTab("MY_REQUESTS")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "MY_REQUESTS"
                ? "bg-primary text-on-primary font-semibold shadow-xs"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">pending_actions</span>
            <span>My Requests</span>
          </button>
        )}

        {isOwner && (
          <button
            type="button"
            onClick={() => setActiveTab("REQUEST_MANAGEMENT")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0 ${
              activeTab === "REQUEST_MANAGEMENT"
                ? "bg-primary text-on-primary font-semibold shadow-xs"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">assignment</span>
            <span>Account Requests</span>
            {pendingRequestsCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "REQUEST_MANAGEMENT"
                    ? "bg-on-primary text-primary"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {pendingRequestsCount}
              </span>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("NOTIFICATIONS")}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0 ${
            activeTab === "NOTIFICATIONS"
              ? "bg-primary text-on-primary font-semibold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">notifications_active</span>
          <span>Notification Preferences</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* TAB 1: MY PROFILE */}
        {activeTab === "PROFILE" && (
          <div className="max-w-2xl space-y-6">
            {isProfileLoading ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 animate-pulse">
                <div className="flex items-center gap-4 pb-6 border-b border-outline-variant/60">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container" />
                  <div className="space-y-2 flex-1">
                    <div className="h-6 bg-surface-container rounded-lg w-1/3" />
                    <div className="h-4 bg-surface-container rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-20 bg-surface-container rounded-xl" />
                  <div className="h-20 bg-surface-container rounded-xl" />
                  <div className="h-20 bg-surface-container rounded-xl" />
                  <div className="h-20 bg-surface-container rounded-xl" />
                </div>
              </div>
            ) : isProfileError ? (
              <div className="bg-surface-container-lowest border border-error/30 rounded-2xl p-8 text-center shadow-xs">
                <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[24px]">error</span>
                </div>
                <h3 className="text-title-md font-semibold text-on-surface">Failed to load profile</h3>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  {(profileError as any)?.message || "Your profile information could not be retrieved from the server."}
                </p>
                <button
                  type="button"
                  onClick={() => refetchProfile()}
                  className="mt-4 px-4 py-2 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : !isEditingProfile ? (
              /* READ-ONLY PROFILE OVERVIEW */
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                {/* Header with Avatar, Details and Edit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/60">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20 shrink-0 shadow-xs">
                      {getInitials(profile?.name || currentUser?.name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-headline-sm font-bold text-on-surface tracking-tight">
                          {profile?.name || "User Profile"}
                        </h2>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">
                        {profile?.email || currentUser?.email}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartEditProfile}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs shrink-0 self-start sm:self-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                    <span>Edit Profile</span>
                  </button>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                    <span className="font-medium">{profileSuccessMsg}</span>
                  </div>
                )}

                {/* Profile Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <div className="text-body-xs font-medium text-on-surface-variant">Full Name</div>
                    <div className="text-title-sm font-semibold text-on-surface mt-1">
                      {profile?.name || "—"}
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <div className="text-body-xs font-medium text-on-surface-variant">Email Address</div>
                    <div className="text-title-sm font-semibold text-on-surface mt-1 font-mono text-xs sm:text-sm">
                      {profile?.email || "—"}
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <div className="text-body-xs font-medium text-on-surface-variant">Account Role</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-surface-container-high text-on-surface border border-outline-variant capitalize">
                        {profile?.role === "OWNER" ? "System Owner" : "Branch Employee"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <div className="text-body-xs font-medium text-on-surface-variant">Assigned Branch</div>
                    <div className="text-title-sm font-semibold text-on-surface mt-1">
                      {profile?.branchName || (isOwner ? "All Branches (Owner)" : "Unassigned")}
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <div className="text-body-xs font-medium text-on-surface-variant">Account Status</div>
                    <div className="text-title-sm font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
                      <span>Active & In Good Standing</span>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl">
                    <div className="text-body-xs font-medium text-on-surface-variant">Member Since</div>
                    <div className="text-title-sm font-semibold text-on-surface mt-1">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </div>
                  </div>
                </div>

                {/* Helpful Account Notes */}
                <div className="p-4 bg-surface-container/60 border border-outline-variant/50 rounded-xl text-body-xs text-on-surface-variant space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                    <span>Account Security & Permissions</span>
                  </div>
                  <p className="leading-relaxed">
                    {isOwner
                      ? "You may change your display name directly at any time. Security settings and passwords can be updated under the Account & Security tab."
                      : "You may change your display name directly at any time. Email address changes or password resets require Owner approval and can be submitted under the Account & Security tab."}
                  </p>
                </div>
              </div>
            ) : (
              /* EXPLICIT EDIT PROFILE EXPERIENCE */
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors cursor-pointer"
                      title="Back to profile overview"
                      aria-label="Back to profile overview"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>
                    <div>
                      <h2 className="text-title-lg font-bold text-on-surface">Edit Profile</h2>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">
                        Update your personal display name. Other account attributes are managed administratively.
                      </p>
                    </div>
                  </div>
                </div>

                {profileErrorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center gap-2.5 shadow-2xs">
                    <span className="material-symbols-outlined text-[20px] text-rose-600">error</span>
                    <span className="font-medium">{profileErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  {/* Permitted Field: Display Name */}
                  <div>
                    <label className="block text-body-xs font-semibold text-on-surface mb-1">
                      Display Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={255}
                      autoFocus
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                      placeholder="Enter your full name"
                    />
                    <p className="text-[11px] text-on-surface-variant/80 mt-1">
                      This name will appear on receipts, audits, closing submissions, and transfer dispatches.
                    </p>
                  </div>

                  {/* Protected Field: Email Address */}
                  <div>
                    <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                      Email Address (Read-only)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-surface-container border border-outline-variant/60 rounded-xl text-sm text-on-surface-variant cursor-not-allowed font-mono text-xs sm:text-sm"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant/50 text-[18px]">
                        lock
                      </span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant/70 mt-1">
                      {!isOwner
                        ? "Email address changes require administrative review. You can submit an email change request under Account & Security."
                        : "Primary login email for the system owner."}
                    </p>
                  </div>

                  {/* Protected Fields: Role & Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                        Role (Read-only)
                      </label>
                      <div className="px-3.5 py-2.5 bg-surface-container border border-outline-variant/60 rounded-xl text-sm text-on-surface-variant flex items-center justify-between">
                        <span className="capitalize">{profile?.role === "OWNER" ? "System Owner" : "Branch Employee"}</span>
                        <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">lock</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                        Assigned Branch (Read-only)
                      </label>
                      <div className="px-3.5 py-2.5 bg-surface-container border border-outline-variant/60 rounded-xl text-sm text-on-surface-variant flex items-center justify-between">
                        <span className="truncate">{profile?.branchName || (isOwner ? "All Branches (Owner)" : "Unassigned")}</span>
                        <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">lock</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls: Save Changes & Cancel */}
                  <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/60">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">save</span>
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      disabled={updateProfileMutation.isPending}
                      className="px-4 py-2.5 bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high font-semibold text-sm rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACCOUNT & SECURITY */}
        {activeTab === "SECURITY" && (
          <div className="space-y-6 max-w-2xl">
            {isOwner ? (
              // Owner Direct Password Change
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-5">
                <div>
                  <h2 className="text-title-lg font-bold text-on-surface">Change Password</h2>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Update your system owner password. This will require entering your current password for security.
                  </p>
                </div>

                {passwordSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{passwordSuccessMsg}</span>
                  </div>
                )}

                {passwordErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{passwordErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                      New Password (min 8 characters)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div>
                    <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {changePasswordMutation.isPending ? "Updating Password..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Employee Account-Change Requests
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-6">
                <div>
                  <h2 className="text-title-lg font-bold text-on-surface">Request Account Changes</h2>
                  <p className="text-body-sm text-on-surface-variant mt-1">
                    Employee accounts are managed with administrative oversight. Submit an official request below to
                    request an email change or password reset assistance.
                  </p>
                </div>

                {requestSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>{requestSuccessMsg}</span>
                  </div>
                )}

                {requestErrorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{requestErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div>
                    <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                      Request Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRequestType("EMAIL_CHANGE")}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                          requestType === "EMAIL_CHANGE"
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">mail</span>
                        <div>
                          <div className="text-sm">Change Email</div>
                          <div className="text-[11px] text-on-surface-variant font-normal">
                            Propose a new corporate email
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRequestType("PASSWORD_RESET")}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-colors cursor-pointer ${
                          requestType === "PASSWORD_RESET"
                            ? "border-primary bg-primary/5 text-primary font-semibold"
                            : "border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                        <div>
                          <div className="text-sm">Password Reset</div>
                          <div className="text-[11px] text-on-surface-variant font-normal">
                            Request password assistance
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {requestType === "EMAIL_CHANGE" && (
                    <div>
                      <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                        Proposed New Email Address
                      </label>
                      <input
                        type="email"
                        value={proposedEmail}
                        onChange={(e) => setProposedEmail(e.target.value)}
                        placeholder="new.email@gelana.com"
                        required
                        className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  )}

                  {requestType === "PASSWORD_RESET" && (
                    <div className="p-3.5 bg-surface-container rounded-xl border border-outline-variant/60 space-y-1">
                      <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                        <span className="material-symbols-outlined text-[16px]">security</span>
                        <span>Security Protection Rule</span>
                      </div>
                      <p className="text-body-xs text-on-surface-variant leading-relaxed">
                        For your security, never propose or enter a password in this form. The Owner will review your
                        request and securely issue you a temporary reset credential.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                      Reason or Note (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      placeholder="Explain why you are requesting this account change..."
                      className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={createRequestMutation.isPending}
                      className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {createRequestMutation.isPending ? "Submitting..." : "Submit Change Request"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY REQUESTS (EMPLOYEE) */}
        {!isOwner && activeTab === "MY_REQUESTS" && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-title-lg font-bold text-on-surface">My Account Requests</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Track the status of your submitted email changes and password reset requests.
              </p>
            </div>

            {isRequestsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-surface-container rounded-xl" />
                ))}
              </div>
            ) : allRequests.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-[24px]">inbox</span>
                </div>
                <h3 className="text-title-sm font-semibold text-on-surface">No requests submitted</h3>
                <p className="text-body-xs text-on-surface-variant mt-1">
                  You haven't submitted any account change requests yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant text-label-sm font-semibold">
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Proposed Detail</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Owner Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {allRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="py-3.5 px-4 font-semibold text-on-surface whitespace-nowrap">
                          {req.type === "EMAIL_CHANGE" ? "Email Change" : "Password Reset"}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant font-mono text-xs">
                          {req.proposedEmail || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate" title={req.reason || ""}>
                          {req.reason || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate" title={req.decisionNotes || ""}>
                          {req.decisionNotes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REQUEST MANAGEMENT (OWNER) */}
        {isOwner && activeTab === "REQUEST_MANAGEMENT" && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-title-lg font-bold text-on-surface">Employee Account Requests</h2>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  Review and authorize employee email updates and password reset assistance.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRequestFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      requestFilter === st
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant"
                    }`}
                  >
                    {st === "ALL" ? "All Requests" : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {isRequestsLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-surface-container rounded-xl" />
                ))}
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-[24px]">task_alt</span>
                </div>
                <h3 className="text-title-sm font-semibold text-on-surface">No requests in this view</h3>
                <p className="text-body-xs text-on-surface-variant mt-1">
                  All employee requests have been handled or none exist.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant text-label-sm font-semibold">
                      <th className="py-3 px-4">Requester</th>
                      <th className="py-3 px-4">Branch</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Proposed Detail</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-on-surface">{req.userName}</span>
                            <span className="text-xs text-on-surface-variant font-mono">{req.userEmail}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant">{req.branchName || "—"}</td>
                        <td className="py-3.5 px-4 font-medium text-on-surface whitespace-nowrap">
                          {req.type === "EMAIL_CHANGE" ? "Email Change" : "Password Reset"}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant font-mono text-xs">
                          {req.proposedEmail || "N/A (Reset assistance)"}
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate" title={req.reason || ""}>
                          {req.reason || "—"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {req.status === "PENDING" ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(req);
                                setDecisionNotes("");
                              }}
                              className="px-3 py-1.5 bg-primary text-on-primary hover:bg-primary/90 font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                            >
                              Review
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(req);
                                setDecisionNotes(req.decisionNotes || "");
                              }}
                              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition-colors"
                            >
                              View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NOTIFICATION PREFERENCES */}
        {activeTab === "NOTIFICATIONS" && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xs max-w-2xl space-y-6">
            <div>
              <h2 className="text-title-lg font-bold text-on-surface">Notification Preferences</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Configure which operational alerts and event notifications you receive in your personal notifications
                center.
              </p>
            </div>

            {prefsSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{prefsSuccessMsg}</span>
              </div>
            )}

            <div className="p-3.5 bg-surface-container rounded-xl border border-outline-variant/60 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
              <p className="text-body-xs text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold">Critical Operational Policy:</strong> Critical events
                (such as cash closing discrepancies, stockouts, or security requests) cannot be suppressed and will always
                be delivered to protect operational integrity.
              </p>
            </div>

            {isPrefsLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-surface-container rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/60">
                {/* Inventory Alerts */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-title-sm font-semibold text-on-surface">Inventory & Stock Alerts</span>
                    <p className="text-body-xs text-on-surface-variant">
                      Low stock thresholds, stocktakes, and stock adjustment notices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePref("INVENTORY")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      prefs.INVENTORY ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        prefs.INVENTORY ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Transfer Updates */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-title-sm font-semibold text-on-surface">Transfer Updates</span>
                    <p className="text-body-xs text-on-surface-variant">
                      Inter-branch requests, approvals, dispatches, deliveries, and discrepancies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePref("TRANSFERS")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      prefs.TRANSFERS ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        prefs.TRANSFERS ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Sales & Returns */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-title-sm font-semibold text-on-surface">Sales & Returns</span>
                    <p className="text-body-xs text-on-surface-variant">
                      Voided transactions, amended sales notes, and processed customer returns.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePref("SALES_RETURNS")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      prefs.SALES_RETURNS ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        prefs.SALES_RETURNS ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Daily Closing */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-title-sm font-semibold text-on-surface">Daily Closing Reconciliations</span>
                    <p className="text-body-xs text-on-surface-variant">
                      Closing submissions, approvals, and rejection notices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePref("CLOSINGS")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      prefs.CLOSINGS ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        prefs.CLOSINGS ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Account & Security */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-title-sm font-semibold text-on-surface">Account & Security</span>
                    <p className="text-body-xs text-on-surface-variant">
                      Employee account-change requests, decision outcomes, and security notices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePref("ACCOUNT")}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      prefs.ACCOUNT ? "bg-primary" : "bg-surface-container-high"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        prefs.ACCOUNT ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={updatePrefsMutation.isPending}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold text-sm rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {updatePrefsMutation.isPending ? "Saving Preferences..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decision Modal (Owner Reviewing Employee Request) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">assignment_turned_in</span>
                <h3 className="text-title-lg font-bold text-on-surface">
                  {selectedRequest.status === "PENDING" ? "Review Account Request" : "Request Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-body-sm">
              <div className="p-3 bg-surface-container-low rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Requester:</span>
                  <span className="font-semibold text-on-surface">
                    {selectedRequest.userName} ({selectedRequest.userEmail})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Branch:</span>
                  <span className="text-on-surface">{selectedRequest.branchName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-medium">Type:</span>
                  <span className="font-semibold text-on-surface">
                    {selectedRequest.type === "EMAIL_CHANGE" ? "Email Change" : "Password Reset"}
                  </span>
                </div>
                {selectedRequest.proposedEmail && (
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-medium">Proposed Email:</span>
                    <span className="font-mono text-primary font-semibold">{selectedRequest.proposedEmail}</span>
                  </div>
                )}
                {selectedRequest.reason && (
                  <div>
                    <span className="text-on-surface-variant font-medium block">Reason:</span>
                    <p className="text-on-surface mt-0.5">{selectedRequest.reason}</p>
                  </div>
                )}
              </div>

              {selectedRequest.status === "PENDING" ? (
                <div>
                  <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">
                    Decision Explanation / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    placeholder="Provide explanation or next steps for the employee..."
                    className="w-full px-3.5 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>
              ) : (
                <div className="p-3 bg-surface-container rounded-xl">
                  <div className="flex justify-between mb-1">
                    <span className="text-on-surface-variant font-medium">Outcome:</span>
                    <span>{getStatusBadge(selectedRequest.status)}</span>
                  </div>
                  {selectedRequest.decisionNotes && (
                    <div className="mt-2 text-xs text-on-surface">
                      <strong>Notes:</strong> {selectedRequest.decisionNotes}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedRequest.status === "PENDING" && isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => handleDecideRequest("REJECTED")}
                    disabled={decideRequestMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-xs"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecideRequest("APPROVED")}
                    disabled={decideRequestMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-sm transition-colors cursor-pointer shadow-xs"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
