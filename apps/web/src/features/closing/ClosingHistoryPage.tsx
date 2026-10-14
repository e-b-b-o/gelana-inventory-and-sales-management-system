import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import { useBranches } from "../branches/api";
import {
  useClosingHistory,
  type DailyClosingItem,
  type DailyClosingStatus,
} from "./api";

function formatETB(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "ETB 0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "ETB 0.00";
  return `ETB ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ClosingHistoryPage() {
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const currentUser = userResponse?.user;
  const isOwner = currentUser?.role === "OWNER";

  const { data: branches = [] } = useBranches();

  // Filters state
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const limit = 20;

  // Selected closing for detail modal
  const [selectedClosing, setSelectedClosing] = useState<DailyClosingItem | null>(null);

  const { data, isLoading, isError, error, refetch } = useClosingHistory({
    branchId: isOwner ? selectedBranchId || undefined : currentUser?.branchId,
    status: (selectedStatus as DailyClosingStatus) || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  const closings = data?.data || [];
  const pagination = data?.pagination;

  const handleResetFilters = () => {
    setSelectedBranchId("");
    setSelectedStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(selectedBranchId || selectedStatus || startDate || endDate);

  const renderStatusBadge = (status: DailyClosingStatus) => {
    switch (status) {
      case "NOT_SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-outline-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Not Submitted
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Submitted
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="material-symbols-outlined text-emerald-600 text-[14px]">check</span>
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="material-symbols-outlined text-rose-600 text-[14px]">close</span>
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Closing History</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Historical record of branch daily reconciliations, counted cash, discrepancies, and Owner review actions.
          </p>
        </div>

        <Link
          to="/daily-closing"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#0039cc] text-on-primary rounded-lg text-label-md font-bold shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">event_available</span>
          Current Closing
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="surface-card rounded-xl p-4 bg-surface-container-lowest border border-outline-variant shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch filter (Owner only) */}
          {isOwner && (
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="history-branch" className="block text-[11px] font-semibold text-outline mb-1 uppercase tracking-wider">
                Branch
              </label>
              <select
                id="history-branch"
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm text-on-surface font-medium focus:ring-1 focus:ring-primary outline-none"
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

          {/* Status filter */}
          <div className="flex-1 min-w-[160px]">
            <label htmlFor="history-status" className="block text-[11px] font-semibold text-outline mb-1 uppercase tracking-wider">
              Status
            </label>
            <select
              id="history-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm text-on-surface font-medium focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted — Awaiting Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected — Correction Required</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="history-start-date" className="block text-[11px] font-semibold text-outline mb-1 uppercase tracking-wider">
              Start Date
            </label>
            <input
              id="history-start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm text-on-surface font-mono focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* End Date */}
          <div className="flex-1 min-w-[140px]">
            <label htmlFor="history-end-date" className="block text-[11px] font-semibold text-outline mb-1 uppercase tracking-wider">
              End Date
            </label>
            <input
              id="history-end-date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm text-on-surface font-mono focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <div className="self-end pb-0.5">
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 text-label-sm font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="surface-card rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-body-md text-on-surface-variant">Loading closing records...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-rose-700">
            <p className="text-headline-sm font-bold">Failed to load closing history</p>
            <p className="text-body-sm mt-1">{(error as any)?.message || "An unexpected error occurred."}</p>
            <button
              onClick={() => refetch()}
              className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded text-label-md font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : closings.length === 0 ? (
          <div className="p-12 text-center text-outline">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">history</span>
            <p className="text-headline-sm font-semibold text-on-surface">No closing records found</p>
            <p className="text-body-sm mt-1">
              {hasActiveFilters
                ? "Try clearing filters to see all available closings."
                : "No daily closings have been submitted yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-1.5 bg-primary text-on-primary rounded text-label-md font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-outline">
                  <th className="py-3 px-4 font-semibold">Closing ID</th>
                  <th className="py-3 px-4 font-semibold">Business Date</th>
                  <th className="py-3 px-4 font-semibold">Branch</th>
                  <th className="py-3 px-4 font-semibold">Submitter</th>
                  <th className="py-3 px-4 font-semibold text-right">Sales Total</th>
                  <th className="py-3 px-4 font-semibold text-right">Expected Cash</th>
                  <th className="py-3 px-4 font-semibold text-right">Counted Cash</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {closings.map((c) => {
                  const hasVariance = c.cashDifference && Math.abs(parseFloat(c.cashDifference)) > 0.001;
                  const isNegative = c.cashDifference && parseFloat(c.cashDifference) < 0;

                  return (
                    <tr key={c.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="py-3 px-4 font-bold font-mono text-primary">
                        {c.closingNumber}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-on-surface">
                        {c.closingDate}
                      </td>
                      <td className="py-3 px-4 font-medium text-on-surface">
                        {c.branch?.name}
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">
                        {c.submittedBy?.name || "—"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-on-surface">
                        {formatETB(c.totalSalesAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-on-surface">
                        {formatETB(c.expectedCash)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-on-surface">
                        {formatETB(c.actualCash)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold ${
                          hasVariance
                            ? isNegative
                              ? "text-rose-700"
                              : "text-amber-700"
                            : "text-outline"
                        }`}
                      >
                        {formatETB(c.cashDifference)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {renderStatusBadge(c.status)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedClosing(c)}
                          className="px-2.5 py-1 text-label-sm font-semibold text-primary hover:bg-primary-fixed/40 rounded transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-low">
            <span className="text-body-sm text-outline">
              Showing page <strong className="text-on-surface">{pagination.page}</strong> of{" "}
              <strong className="text-on-surface">{pagination.totalPages}</strong> ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-label-md font-medium text-on-surface hover:bg-surface-container disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-label-md font-medium text-on-surface hover:bg-surface-container disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Historical Closing Detail Modal */}
      {selectedClosing && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 space-y-5 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-headline-md font-bold text-on-surface">
                    {selectedClosing.closingNumber || "Daily Closing"}
                  </h2>
                  {renderStatusBadge(selectedClosing.status)}
                </div>
                <p className="text-label-sm text-outline mt-0.5">
                  {selectedClosing.branch?.name} • Business Date: {selectedClosing.closingDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedClosing(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Reconciliation Snapshot Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline">Sales Total</p>
                <p className="text-headline-sm font-bold font-mono text-on-surface mt-0.5">
                  {formatETB(selectedClosing.totalSalesAmount)}
                </p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline">Expected Cash</p>
                <p className="text-headline-sm font-bold font-mono text-on-surface mt-0.5">
                  {formatETB(selectedClosing.expectedCash)}
                </p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline">Actual Cash</p>
                <p className="text-headline-sm font-bold font-mono text-on-surface mt-0.5">
                  {formatETB(selectedClosing.actualCash)}
                </p>
              </div>
              <div
                className={`p-3 rounded-lg border ${
                  selectedClosing.cashDifference && parseFloat(selectedClosing.cashDifference) < 0
                    ? "bg-rose-50 border-rose-200"
                    : "bg-surface border-outline-variant"
                }`}
              >
                <p className="text-label-sm text-outline font-semibold">Variance</p>
                <p
                  className={`text-headline-sm font-bold font-mono mt-0.5 ${
                    selectedClosing.cashDifference && parseFloat(selectedClosing.cashDifference) < 0
                      ? "text-rose-700"
                      : "text-on-surface"
                  }`}
                >
                  {formatETB(selectedClosing.cashDifference)}
                </p>
              </div>
            </div>

            {/* Explanation / Notes */}
            {selectedClosing.discrepancyReason && (
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                <p className="text-label-sm font-bold text-on-surface mb-1">Discrepancy Explanation:</p>
                <p className="text-body-sm font-mono text-on-surface-variant italic">
                  "{selectedClosing.discrepancyReason}"
                </p>
              </div>
            )}

            {selectedClosing.reviewNotes && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
                <p className="text-label-sm font-bold mb-1">Owner Review Notes:</p>
                <p className="text-body-sm italic">"{selectedClosing.reviewNotes}"</p>
              </div>
            )}

            {selectedClosing.rejectionReason && (
              <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-900">
                <p className="text-label-sm font-bold mb-1">Owner Rejection Reason:</p>
                <p className="text-body-sm italic">"{selectedClosing.rejectionReason}"</p>
              </div>
            )}

            {/* Payment Methods Snapshot Table */}
            {selectedClosing.payments && selectedClosing.payments.length > 0 && (
              <div>
                <h3 className="text-label-md font-bold text-on-surface mb-2">Payment Method Breakdown</h3>
                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <table className="w-full text-left text-body-sm">
                    <thead>
                      <tr className="bg-surface-container-low text-label-sm text-outline border-b border-outline-variant">
                        <th className="py-2 px-3">Method</th>
                        <th className="py-2 px-3 text-center">Txns</th>
                        <th className="py-2 px-3 text-right">Received</th>
                        <th className="py-2 px-3 text-right">Refunds</th>
                        <th className="py-2 px-3 text-right">Net Reconciled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {selectedClosing.payments.map((p) => (
                        <tr key={p.paymentMethodId}>
                          <td className="py-2 px-3 font-medium text-on-surface">{p.paymentMethodName}</td>
                          <td className="py-2 px-3 text-center text-outline">{p.transactionCount}</td>
                          <td className="py-2 px-3 text-right font-mono">{formatETB(p.receivedAmount)}</td>
                          <td className="py-2 px-3 text-right font-mono text-rose-700">{formatETB(p.refundedAmount)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">
                            {formatETB(p.netAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="pt-3 border-t border-outline-variant flex justify-end">
              <button
                onClick={() => setSelectedClosing(null)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-label-md font-semibold text-on-surface cursor-pointer"
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
