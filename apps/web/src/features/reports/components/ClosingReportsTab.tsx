import { useState, useMemo } from "react";
import { useClosingReport, exportToCsv } from "../api/reportsApi";
import type { ClosingReportQuery } from "../api/reportsApi";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface ClosingReportsTabProps {
  isOwner: boolean;
  branchesData?: Array<{ id: string; name: string }>;
}

export function ClosingReportsTab({ isOwner, branchesData }: ClosingReportsTabProps) {
  const today = useMemo(() => new Date(), []);
  const defaultEndDate = useMemo(() => toDateString(today), [today]);
  const defaultStartDate = useMemo(() => {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return toDateString(firstOfMonth);
  }, [today]);

  const [datePreset, setDatePreset] = useState<"today" | "7days" | "month" | "custom">("month");
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "SUBMITTED" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED">("all");
  const [discrepancyFilter, setDiscrepancyFilter] = useState<"all" | "discrepant" | "balanced">("all");
  const [page, setPage] = useState<number>(1);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Query object
  const queryObj: ClosingReportQuery = {
    startDate,
    endDate,
    branchId: isOwner ? (selectedBranchId || undefined) : undefined,
    status: statusFilter,
    hasDiscrepancy: discrepancyFilter === "discrepant" ? true : discrepancyFilter === "balanced" ? false : undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isError, error, refetch } = useClosingReport(queryObj);

  // Preset date handlers
  const handlePresetChange = (preset: "today" | "7days" | "month" | "custom") => {
    setDatePreset(preset);
    setPage(1);

    if (preset === "today") {
      const nowStr = toDateString(today);
      setStartDate(nowStr);
      setEndDate(nowStr);
    } else if (preset === "7days") {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 6);
      setStartDate(toDateString(past7));
      setEndDate(toDateString(today));
    } else if (preset === "month") {
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
    }
  };

  // CSV Export handler
  const handleExportCsv = () => {
    if (!data || !data.records || data.records.length === 0) return;
    const rows = data.records.map((r) => ({
      ClosingNumber: r.closingNumber,
      Date: r.closingDate,
      Branch: r.branchName,
      Status: r.status,
      NetSales: r.netSalesAmount.toFixed(2),
      ExpectedCash: r.expectedCash.toFixed(2),
      ActualCash: r.actualCash !== null ? r.actualCash.toFixed(2) : "N/A",
      CashDifference: r.cashDifference !== null ? r.cashDifference.toFixed(2) : "N/A",
      DiscrepancyReason: r.discrepancyReason || "",
      SubmittedBy: r.submittedByName || "N/A",
      SubmittedAt: r.submittedAt || "N/A",
      ReviewedBy: r.reviewedByName || "N/A",
      ReviewedAt: r.reviewedAt || "N/A",
      ReviewNotes: r.reviewNotes || r.rejectionReason || "",
    }));
    exportToCsv(`daily_closings_report_${startDate}_to_${endDate}.csv`, rows);
  };

  return (
    <div className="space-y-6">
      {/* 1. Filter Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 shadow-bento flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center bg-surface-container-low border border-outline-variant/70 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => handlePresetChange("today")}
              className={`px-3.5 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                datePreset === "today"
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange("7days")}
              className={`px-3.5 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                datePreset === "7days"
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange("month")}
              className={`px-3.5 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                datePreset === "month"
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => handlePresetChange("custom")}
              className={`px-3.5 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                datePreset === "custom"
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Date Range */}
          {datePreset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Start Date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
              />
              <span className="text-on-surface-variant font-label-sm">to</span>
              <input
                type="date"
                aria-label="End Date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {/* Branch Filter (Owner Only) */}
          {isOwner ? (
            <div className="flex items-center gap-2">
              <label htmlFor="closing-branch-filter" className="text-label-sm font-label-sm text-on-surface-variant">
                Branch:
              </label>
              <div className="relative">
                <select
                  id="closing-branch-filter"
                  aria-label="Filter closings by branch"
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="">All Branches</option>
                  {branchesData?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                  arrow_drop_down
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded border border-outline-variant text-label-sm font-label-sm text-on-surface font-semibold">
              <span className="material-symbols-outlined text-primary text-base">store</span>
              <span>Assigned Branch Scoped</span>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="closing-status-filter" className="text-label-sm font-label-sm text-on-surface-variant">
              Status:
            </label>
            <div className="relative">
              <select
                id="closing-status-filter"
                aria-label="Filter closings by status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="SUBMITTED">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="NOT_SUBMITTED">Not Submitted</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                arrow_drop_down
              </span>
            </div>
          </div>

          {/* Discrepancy Toggle */}
          <div className="flex items-center gap-2">
            <label htmlFor="closing-discrepancy-filter" className="text-label-sm font-label-sm text-on-surface-variant">
              Variance:
            </label>
            <div className="relative">
              <select
                id="closing-discrepancy-filter"
                aria-label="Filter closings by cash variance"
                value={discrepancyFilter}
                onChange={(e) => {
                  setDiscrepancyFilter(e.target.value as any);
                  setPage(1);
                }}
                className="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="all">All Records</option>
                <option value="discrepant">With Discrepancy (≠ 0)</option>
                <option value="balanced">Balanced (0 Variance)</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                arrow_drop_down
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Export & Refresh */}
        <div className="flex items-center gap-2 self-end xl:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!data || data.records.length === 0}
            className="h-9 px-3.5 bg-surface-container-low border border-outline-variant rounded text-label-md font-label-md text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-9 w-9 bg-surface-container-low border border-outline-variant rounded text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center"
            title="Refresh Report"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
          <p className="text-body-md font-body-md text-on-surface-variant">Reconciling daily closing logs and cash registers...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-error-container text-on-error-container rounded-lg border border-error flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-2xl">error</span>
          <div>
            <h4 className="font-semibold text-title-sm">Failed to load closing report</h4>
            <p className="text-body-sm mt-1">{(error as any)?.message || "An unexpected error occurred."}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 px-3 py-1 bg-on-error text-error text-label-sm font-label-sm rounded font-medium hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Success Content */}
      {data && !isLoading && !isError && (
        <>
          {/* 2. Four KPI Cards */}
          {/* 2. Four KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Total Closings */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Total Closings</span>
                <span className="w-9 h-9 rounded-xl bg-primary-container/60 text-primary flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-lg">point_of_sale</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="text-headline-sm font-headline-sm font-bold text-on-surface font-mono">
                  {data.summary.totalClosings}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5 border-t border-outline-variant/60 pt-2.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-emerald-100 text-emerald-800">
                    {data.summary.approvedClosings} Approved
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-amber-100 text-amber-800">
                    {data.summary.pendingReviewClosings} Pending
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-label-xs font-semibold bg-rose-100 text-rose-800">
                    {data.summary.rejectedClosings} Rejected
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Expected Cash */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Expected Cash</span>
                <span className="w-9 h-9 rounded-xl bg-secondary-container/60 text-secondary flex items-center justify-center border border-secondary/20">
                  <span className="material-symbols-outlined text-lg">calculate</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="text-headline-sm font-headline-sm font-bold text-on-surface font-mono">
                  ETB {data.summary.totalExpectedCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-body-xs font-body-xs text-on-surface-variant mt-2 border-t border-outline-variant/60 pt-2">
                  System-recorded cash sales minus refunds
                </div>
              </div>
            </div>

            {/* Card 3: Actual Declared Cash */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Actual Declared Cash</span>
                <span className="w-9 h-9 rounded-xl bg-tertiary-container/60 text-tertiary flex items-center justify-center border border-tertiary/20">
                  <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="text-headline-sm font-headline-sm font-bold text-on-surface font-mono">
                  ETB {data.summary.totalActualCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-body-xs font-body-xs text-on-surface-variant mt-2 border-t border-outline-variant/60 pt-2">
                  Cash physically counted by branch staff
                </div>
              </div>
            </div>

            {/* Card 4: Net Discrepancy */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Cash Variance</span>
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  Math.abs(data.summary.netCashDiscrepancy) < 0.01
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200/70"
                    : data.summary.netCashDiscrepancy < 0
                    ? "bg-rose-50 text-rose-800 border-rose-200/70"
                    : "bg-blue-50 text-blue-800 border-blue-200/70"
                }`}>
                  <span className="material-symbols-outlined text-lg">difference</span>
                </span>
              </div>
              <div className="mt-3">
                <div className={`text-headline-sm font-headline-sm font-bold font-mono ${
                  Math.abs(data.summary.netCashDiscrepancy) < 0.01
                    ? "text-emerald-700"
                    : data.summary.netCashDiscrepancy < 0
                    ? "text-rose-700"
                    : "text-blue-700"
                }`}>
                  {data.summary.netCashDiscrepancy > 0 ? "+" : ""}
                  ETB {data.summary.netCashDiscrepancy.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-body-xs font-body-xs text-on-surface-variant mt-2 border-t border-outline-variant/60 pt-2">
                  {data.summary.discrepantClosingsCount} closing{data.summary.discrepantClosingsCount === 1 ? "" : "s"} had discrepancies
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Method Reconciliation Table */}
          {data.paymentMethodsBreakdown && data.paymentMethodsBreakdown.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-bento overflow-hidden">
              <div className="p-4 border-b border-outline-variant/60">
                <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Payment Method Reconciliation</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Aggregated collections across tender types for this reporting window</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/60 border-b border-outline-variant/60 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                      <th className="py-2.5 px-4 font-semibold">Payment Method</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Gross Received</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Refunded</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Net Amount</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60 text-body-sm font-body-sm">
                    {data.paymentMethodsBreakdown.map((pm) => (
                      <tr key={pm.paymentMethodId} className="hover:bg-surface-container-low/50">
                        <td className="py-2.5 px-4 font-medium text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">payments</span>
                          <span>{pm.paymentMethodName}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-on-surface-variant font-mono">ETB {pm.receivedAmount.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right text-rose-600 font-mono">
                          {pm.refundedAmount > 0 ? `-ETB ${pm.refundedAmount.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-on-surface font-mono">ETB {pm.netAmount.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right text-on-surface-variant">{pm.transactionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Closings Records Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-bento overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-title-sm font-title-sm font-semibold text-on-surface">Daily Closing Records</h3>
                <p className="text-body-xs font-body-xs text-on-surface-variant">Register submissions, review statuses, and cash variance explanations</p>
              </div>
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                Showing {data.records.length} of {data.pagination.totalRecords} records
              </span>
            </div>

            {data.records.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                No daily closing records match the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm font-label-sm text-on-surface-variant">
                      <th className="py-3 px-4 font-semibold">Closing # / Date</th>
                      <th className="py-3 px-4 font-semibold">Branch</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Net Sales</th>
                      <th className="py-3 px-4 font-semibold text-right">Expected Cash</th>
                      <th className="py-3 px-4 font-semibold text-right">Actual Cash</th>
                      <th className="py-3 px-4 font-semibold text-right">Variance</th>
                      <th className="py-3 px-4 font-semibold">Audit / Decision</th>
                      <th className="py-3 px-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-sm font-body-sm">
                    {data.records.map((r) => {
                      const diff = r.cashDifference ?? 0;
                      const hasDiscrepancy = Math.abs(diff) >= 0.01;

                      return (
                        <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-primary">{r.closingNumber}</div>
                            <div className="text-label-xs font-label-xs text-on-surface-variant">{r.closingDate}</div>
                          </td>
                          <td className="py-3 px-4 font-medium text-on-surface">{r.branchName}</td>
                          <td className="py-3 px-4">
                            {r.status === "APPROVED" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-emerald-100 text-emerald-800">
                                Approved
                              </span>
                            )}
                            {r.status === "SUBMITTED" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-amber-100 text-amber-800">
                                Pending Review
                              </span>
                            )}
                            {r.status === "REJECTED" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-rose-100 text-rose-800">
                                Rejected
                              </span>
                            )}
                            {r.status === "NOT_SUBMITTED" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold bg-surface-container text-on-surface-variant">
                                Not Submitted
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-on-surface-variant">ETB {r.netSalesAmount.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-medium text-on-surface">ETB {r.expectedCash.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right font-medium text-on-surface">
                            {r.actualCash !== null ? `ETB ${r.actualCash.toFixed(2)}` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {r.cashDifference !== null ? (
                              <div className="flex flex-col items-end">
                                <span className={`font-bold ${
                                  !hasDiscrepancy
                                    ? "text-emerald-700"
                                    : diff < 0
                                    ? "text-rose-700"
                                    : "text-blue-700"
                                }`}>
                                  {diff > 0 ? "+" : ""}
                                  ETB {diff.toFixed(2)}
                                </span>
                                {r.discrepancyReason && (
                                  <span
                                    title={r.discrepancyReason}
                                    className="text-label-xs font-label-xs text-on-surface-variant truncate max-w-[140px] italic"
                                  >
                                    "{r.discrepancyReason}"
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-on-surface-variant">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-label-xs font-label-xs text-on-surface-variant">
                            <div>Submitted: {r.submittedByName || "—"}</div>
                            {r.reviewedByName && (
                              <div className="text-primary font-medium mt-0.5">
                                Reviewed: {r.reviewedByName}
                              </div>
                            )}
                            {(r.reviewNotes || r.rejectionReason) && (
                              <div className="text-on-surface-variant italic truncate max-w-[150px] mt-0.5">
                                "{r.reviewNotes || r.rejectionReason}"
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedRecord(r)}
                              className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded text-label-xs font-label-xs text-primary font-medium transition-colors"
                            >
                              Audit Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {data.pagination.totalPages > 1 && (
              <div className="p-4 border-t border-outline-variant flex items-center justify-between">
                <span className="text-label-sm font-label-sm text-on-surface-variant">
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={data.pagination.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-label-sm font-label-sm text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={data.pagination.page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1 bg-surface-container-low border border-outline-variant rounded text-label-sm font-label-sm text-on-surface hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Audit Detail Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant pb-4">
                  <div>
                    <h3 className="text-title-md font-title-md font-bold text-on-surface">
                      Daily Closing Reconciliation #{selectedRecord.closingNumber}
                    </h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">
                      {selectedRecord.branchName} • {selectedRecord.closingDate} (Revision {selectedRecord.revision})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="p-1 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Cash Reconciliation Summary */}
                <div className="grid grid-cols-3 gap-3 bg-surface-container-low p-4 rounded-lg">
                  <div>
                    <span className="text-label-xs font-label-xs text-on-surface-variant">Expected Cash</span>
                    <div className="text-title-sm font-title-sm font-bold text-on-surface mt-0.5">
                      ETB {selectedRecord.expectedCash.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <span className="text-label-xs font-label-xs text-on-surface-variant">Actual Declared Cash</span>
                    <div className="text-title-sm font-title-sm font-bold text-on-surface mt-0.5">
                      {selectedRecord.actualCash !== null ? `ETB ${selectedRecord.actualCash.toFixed(2)}` : "N/A"}
                    </div>
                  </div>
                  <div>
                    <span className="text-label-xs font-label-xs text-on-surface-variant">Variance</span>
                    <div className={`text-title-sm font-title-sm font-bold mt-0.5 ${
                      selectedRecord.cashDifference === null || Math.abs(selectedRecord.cashDifference) < 0.01
                        ? "text-emerald-700"
                        : selectedRecord.cashDifference < 0
                        ? "text-rose-700"
                        : "text-blue-700"
                    }`}>
                      {selectedRecord.cashDifference !== null ? `ETB ${selectedRecord.cashDifference.toFixed(2)}` : "—"}
                    </div>
                  </div>
                </div>

                {/* Discrepancy explanation if any */}
                {selectedRecord.discrepancyReason && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-body-sm">
                    <strong>Discrepancy Explanation:</strong> {selectedRecord.discrepancyReason}
                  </div>
                )}

                {/* Payment allocations list */}
                {selectedRecord.payments && selectedRecord.payments.length > 0 && (
                  <div>
                    <h4 className="text-label-lg font-label-lg font-semibold text-on-surface mb-2">
                      Tender Allocations
                    </h4>
                    <div className="border border-outline-variant rounded-lg overflow-hidden">
                      <table className="w-full text-left text-body-sm">
                        <thead className="bg-surface-container-low text-label-xs font-label-xs text-on-surface-variant border-b border-outline-variant">
                          <tr>
                            <th className="py-2 px-3">Method</th>
                            <th className="py-2 px-3 text-right">Received</th>
                            <th className="py-2 px-3 text-right">Refunded</th>
                            <th className="py-2 px-3 text-right">Net</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {selectedRecord.payments.map((p: any, idx: number) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-medium text-on-surface">{p.paymentMethodName}</td>
                              <td className="py-2 px-3 text-right text-on-surface-variant">ETB {p.receivedAmount.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right text-rose-600">ETB {p.refundedAmount.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-semibold text-on-surface">ETB {p.netAmount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Audit trail timeline */}
                <div>
                  <h4 className="text-label-lg font-label-lg font-semibold text-on-surface mb-2">
                    Review & Audit History
                  </h4>
                  {selectedRecord.events && selectedRecord.events.length > 0 ? (
                    <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-outline-variant">
                      {selectedRecord.events.map((evt: any) => (
                        <div key={evt.id} className="relative flex items-start gap-3 pl-8">
                          <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-surface-container-lowest ring-2 ring-primary/20" />
                          <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant w-full">
                            <div className="flex items-center justify-between text-label-sm font-label-sm">
                              <span className="font-semibold text-on-surface">
                                {evt.eventType.replace(/_/g, " ")} by {evt.actorName} ({evt.actorRole})
                              </span>
                              <span className="text-label-xs text-on-surface-variant">
                                {new Date(evt.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {evt.notes && (
                              <div className="mt-1 text-body-xs font-body-xs text-on-surface-variant italic">
                                "{evt.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-body-sm text-on-surface-variant bg-surface-container-low rounded-lg">
                      No explicit audit events recorded for this closing revision.
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest rounded text-label-md font-label-md font-medium text-on-surface transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
