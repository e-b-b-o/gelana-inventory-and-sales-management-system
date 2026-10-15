import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllReadMutation,
} from "./api";
import type { NotificationItem } from "./api";

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function NotificationsPage() {
  const [filterMode, setFilterMode] = useState<"ALL" | "UNREAD" | "CRITICAL">("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  const isReadParam = filterMode === "UNREAD" ? false : undefined;
  const priorityParam = filterMode === "CRITICAL" ? "CRITICAL" : undefined;

  const { data, isLoading, isError, error, refetch } = useNotificationsQuery({
    isRead: isReadParam,
    priority: priorityParam,
    page,
    limit,
  });

  const { data: unreadData } = useUnreadCountQuery();
  const unreadCount = unreadData?.unreadCount ?? 0;

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllReadMutation = useMarkAllReadMutation();

  const notifications: NotificationItem[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as any)?.notifications)
    ? (data as any).notifications
    : Array.isArray((data?.data as any)?.notifications)
    ? (data?.data as any)?.notifications
    : [];
  const pagination = data?.pagination || (data?.data as any)?.pagination;

  const handleMarkAllRead = () => {
    if (unreadCount > 0 && !markAllReadMutation.isPending) {
      markAllReadMutation.mutate();
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="material-symbols-outlined text-rose-600 text-[14px]">warning</span>
            Critical
          </span>
        );
      case "IMPORTANT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="material-symbols-outlined text-amber-600 text-[14px]">priority_high</span>
            Important
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant/60">
            <span className="material-symbols-outlined text-outline text-[14px]">info</span>
            Notice
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.startsWith("TRANSFER_")) return "sync_alt";
    if (type.startsWith("CLOSING_")) return "lock_clock";
    if (type.startsWith("SALE_")) return "receipt_long";
    if (type.startsWith("RETURN_")) return "assignment_return";
    if (type.startsWith("LOW_STOCK") || type.startsWith("STOCK_")) return "inventory_2";
    if (type.startsWith("ACCOUNT_") || type.startsWith("PASSWORD_")) return "security";
    return "notifications";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-body-md text-on-surface-variant mt-1">
            Real-time business notifications for inventory, transfers, sales corrections, and daily reconciliations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              unreadCount > 0
                ? "bg-surface-container border border-outline-variant text-on-surface hover:bg-surface-container-high cursor-pointer shadow-xs"
                : "bg-surface-container-low text-on-surface-variant/50 border border-outline-variant/40 cursor-not-allowed"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-3">
        <button
          type="button"
          onClick={() => {
            setFilterMode("ALL");
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            filterMode === "ALL"
              ? "bg-primary text-on-primary font-semibold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          All Notifications
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterMode("UNREAD");
            setPage(1);
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            filterMode === "UNREAD"
              ? "bg-primary text-on-primary font-semibold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          <span>Unread Only</span>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filterMode === "UNREAD"
                  ? "bg-on-primary text-primary"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setFilterMode("CRITICAL");
            setPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
            filterMode === "CRITICAL"
              ? "bg-primary text-on-primary font-semibold shadow-xs"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          }`}
        >
          Critical Alerts
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 space-y-4 shadow-xs">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-4 p-4 rounded-xl border border-outline-variant/50">
              <div className="w-10 h-10 rounded-xl bg-surface-container shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-container rounded w-1/3" />
                <div className="h-3 bg-surface-container rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="bg-surface-container-lowest border border-error/30 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px]">error</span>
          </div>
          <h3 className="text-title-md font-semibold text-on-surface">Failed to load notifications</h3>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-md mx-auto">
            {(error as any)?.message || "A network or server error occurred while retrieving notifications."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[30px]">notifications_off</span>
          </div>
          <h3 className="text-title-md font-semibold text-on-surface">No notifications found</h3>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
            {filterMode === "UNREAD"
              ? "You're all caught up! There are no unread notifications right now."
              : filterMode === "CRITICAL"
              ? "Great news! There are no critical alerts requiring immediate attention."
              : "When system events or alerts occur, they will appear right here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item: NotificationItem) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !item.isRead
                  ? "bg-surface-container-lowest border-primary/30 shadow-xs ring-1 ring-primary/10"
                  : "bg-surface-container-lowest border-outline-variant/70 opacity-90 hover:opacity-100"
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Status Dot / Category Icon */}
                <div className="relative shrink-0 mt-0.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.priority === "CRITICAL"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : item.priority === "IMPORTANT"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-surface-container text-primary border border-outline-variant/60"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{getTypeIcon(item.type)}</span>
                  </div>
                  {!item.isRead && (
                    <span
                      title="Unread"
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container-lowest"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-title-sm font-semibold ${!item.isRead ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {item.title}
                    </span>
                    {getPriorityBadge(item.priority)}
                    <span className="text-body-xs text-on-surface-variant/70">
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant max-w-2xl leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {item.link && (
                  <Link
                    to={item.link}
                    onClick={() => {
                      if (!item.isRead) {
                        markAsReadMutation.mutate(item.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant transition-colors"
                  >
                    <span>View Record</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                )}

                {!item.isRead && (
                  <button
                    type="button"
                    title="Mark as read"
                    onClick={() => markAsReadMutation.mutate(item.id)}
                    disabled={markAsReadMutation.isPending}
                    className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-outline-variant pt-4 mt-6">
              <span className="text-body-sm text-on-surface-variant">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} notifications
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-on-surface px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
