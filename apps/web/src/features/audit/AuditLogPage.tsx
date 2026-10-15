import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import { useBranches } from "../branches/api";
import { useAuditLogsQuery, useAuditLogDetailsQuery } from "./api";
import type { AuditLogItem } from "./api";

function formatActionLabel(action: string): string {
  const map: Record<string, string> = {
    USER_CREATED: "User Created",
    USER_UPDATED: "User Updated",
    USER_STATUS_UPDATED: "User Status Changed",
    EMPLOYEE_BRANCH_REASSIGNED: "Branch Reassigned",
    ACCOUNT_REQUEST_CREATED: "Account Change Requested",
    ACCOUNT_REQUEST_DECIDED: "Account Request Decided",
    PASSWORD_CHANGED: "Password Changed",
    TRANSFER_REQUESTED: "Transfer Requested",
    TRANSFER_APPROVED: "Transfer Approved",
    TRANSFER_REJECTED: "Transfer Rejected",
    TRANSFER_DISPATCHED: "Transfer Dispatched",
    TRANSFER_RECEIVED: "Transfer Received",
    TRANSFER_DISCREPANCY_RESOLVED: "Transfer Discrepancy Resolved",
    CLOSING_SUBMITTED: "Closing Submitted",
    CLOSING_APPROVED: "Closing Approved",
    CLOSING_REJECTED: "Closing Rejected",
    SALE_CREATED: "Sale Completed",
    SALE_VOIDED: "Sale Voided",
    SALE_CORRECTED: "Sale Note Amended",
    RETURN_PROCESSED: "Sales Return Processed",
    OPENING_STOCK_RECORDED: "Opening Stock Recorded",
    STOCK_ADJUSTED: "Stock Adjusted",
    STOCKTAKE_SUBMITTED: "Stocktake Submitted",
    STOCK_DISPOSED: "Stock Disposed",
    NOTIFICATION_PREFERENCES_UPDATED: "Notification Preferences Updated",
  };
  return map[action] || action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function getCategoryBadge(category: string) {
  switch (category) {
    case "USERS":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          Users
        </span>
      );
    case "INVENTORY":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          Inventory
        </span>
      );
    case "TRANSFERS":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
          Transfers
        </span>
      );
    case "SALES_RETURNS":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Sales & Returns
        </span>
      );
    case "CLOSINGS":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Closings
        </span>
      );
    case "SETTINGS":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
          Settings
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant">
          {category}
        </span>
      );
  }
}

export function AuditLogPage() {
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const currentUser = userResponse?.user;
  const isOwner = currentUser?.role === "OWNER";

  const { data: branches = [] } = useBranches();

  // Filters state
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  // Selected item for modal
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useAuditLogsQuery({
    search: search || undefined,
    category: category || undefined,
    branchId: branchId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  const { data: detailData, isLoading: isDetailLoading } = useAuditLogDetailsQuery(selectedAuditId);
  const selectedRecord = detailData?.data;

  const logs: AuditLogItem[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray((data as any)?.logs)
    ? (data as any).logs
    : Array.isArray((data?.data as any)?.logs)
    ? (data?.data as any)?.logs
    : [];
  const pagination = data?.pagination || (data?.data as any)?.pagination;

  const handleResetFilters = () => {
    setSearch("");
    setCategory("");
    setBranchId("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || category || branchId || startDate || endDate);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Audit Log</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Immutable, system-wide historical ledger recording sensitive operational, financial, and inventory actions.
          </p>
        </div>
      </div>

      {/* Filters Bento Box */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">Search</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search action, actor, reason, entity..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="USERS">Users & Roles</option>
              <option value="INVENTORY">Inventory</option>
              <option value="TRANSFERS">Transfers</option>
              <option value="SALES_RETURNS">Sales & Returns</option>
              <option value="CLOSINGS">Daily Closings</option>
              <option value="SETTINGS">Settings</option>
            </select>
          </div>

          {/* Branch Filter (Owner View) */}
          {isOwner && (
            <div>
              <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">Branch</label>
              <select
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Start */}
          <div>
            <label className="block text-body-xs font-semibold text-on-surface-variant mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Date End & Reset Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/50">
          <div className="flex items-center gap-3">
            <span className="text-body-xs text-on-surface-variant font-medium">To Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 border-b border-outline-variant/40">
                <div className="h-4 bg-surface-container rounded w-1/4" />
                <div className="h-4 bg-surface-container rounded w-1/5" />
                <div className="h-4 bg-surface-container rounded w-1/6" />
                <div className="h-4 bg-surface-container rounded w-1/12" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">error</span>
            </div>
            <h3 className="text-title-md font-semibold text-on-surface">Failed to load audit logs</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              {(error as any)?.message || "Audit records could not be retrieved from the server."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-surface-container text-on-surface-variant flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[30px]">policy</span>
            </div>
            <h3 className="text-title-md font-semibold text-on-surface">No audit records found</h3>
            <p className="text-body-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No audit records matched your active search or filter criteria. Try clearing some filters."
                : "No historical audit entries have been logged yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low text-on-surface-variant text-label-sm font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {logs.map((log: AuditLogItem) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{log.actorName}</span>
                        <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                          {log.actorRole}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-on-surface">{formatActionLabel(log.action)}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{getCategoryBadge(log.category)}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                      {log.branchName || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate" title={log.reason || ""}>
                      {log.reason || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAuditId(log.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        <span>Inspect</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-outline-variant">
            <span className="text-body-sm text-on-surface-variant">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} audit entries
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors cursor-pointer"
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
                className="px-3 py-1.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspect Detail Modal */}
      {selectedAuditId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                <h3 className="text-title-lg font-bold text-on-surface">Audit Record Inspection</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditId(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {isDetailLoading || !selectedRecord ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-body-sm text-on-surface-variant mt-3">Loading audit details...</p>
              </div>
            ) : (
              <div className="space-y-4 text-body-sm">
                <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container-low rounded-xl">
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Action</span>
                    <p className="font-semibold text-on-surface mt-0.5">{formatActionLabel(selectedRecord.action)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Category</span>
                    <p className="mt-0.5">{getCategoryBadge(selectedRecord.category)}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Actor</span>
                    <p className="text-on-surface font-medium mt-0.5">
                      {selectedRecord.actorName} ({selectedRecord.actorRole})
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Timestamp</span>
                    <p className="text-on-surface font-mono text-xs mt-0.5">
                      {new Date(selectedRecord.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Entity Type & ID</span>
                    <p className="text-on-surface font-mono text-xs mt-0.5">
                      {selectedRecord.entityType} ({selectedRecord.entityId || "N/A"})
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Branch</span>
                    <p className="text-on-surface font-medium mt-0.5">{selectedRecord.branchName || "Global / N/A"}</p>
                  </div>
                </div>

                {selectedRecord.reason && (
                  <div>
                    <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Stated Reason</span>
                    <p className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/50 text-on-surface mt-1">
                      {selectedRecord.reason}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase">Sanitized Metadata</span>
                  <pre className="p-3 bg-surface-container rounded-xl text-xs font-mono text-on-surface overflow-x-auto mt-1 max-h-48">
                    {JSON.stringify(selectedRecord.metadata || {}, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setSelectedAuditId(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
