import { useState } from "react";
import { Link } from "react-router-dom";
import { useOwnerDashboard } from "../api/dashboardApi";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export function OwnerDashboard() {
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [trendRange, setTrendRange] = useState<"today" | "7days" | "month">("today");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Fetch branches for filter dropdown
  const { data: branchesData } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const res = await fetchApi("/branches");
      return res.data;
    },
  });

  const { data, isLoading, isError, error, refetch } = useOwnerDashboard({
    branchId: selectedBranchId || undefined,
    trendRange,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface-container-high rounded w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-36 bg-surface-container-high rounded-lg"></div>
          <div className="h-36 bg-surface-container-high rounded-lg"></div>
          <div className="h-36 bg-surface-container-high rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-surface-container-high rounded-lg"></div>
          <div className="h-28 bg-surface-container-high rounded-lg"></div>
          <div className="h-28 bg-surface-container-high rounded-lg"></div>
          <div className="h-28 bg-surface-container-high rounded-lg"></div>
        </div>
        <div className="h-64 bg-surface-container-high rounded-lg"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-error-container text-on-error-container rounded-lg border border-error/30 space-y-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-error">error</span>
          <h2 className="text-headline-sm font-headline-sm font-bold">Failed to load Owner Dashboard</h2>
        </div>
        <p className="text-body-md font-body-md">
          {(error as any)?.message || "A server or network error occurred while loading dashboard metrics."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-on-primary font-semibold rounded hover:bg-primary-container transition-colors text-label-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, actionRequired, branchPerformance, salesTrend, recentActivities, businessDate } = data;

  // Maximum value for stylized sales trend chart
  const intervals = salesTrend?.intervals || [];
  const maxTrendVal = Math.max(
    ...(intervals.length > 0 ? intervals.map((i) => i.salesAmount) : [0]),
    100
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar: Title, Branch Selector & Business Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Owner Dashboard</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-0.5">
            Business overview across {selectedBranchId ? data.branchName : "all branches"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Filter Selector */}
          <div className="relative flex items-center bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-on-surface hover:border-primary transition-colors shadow-xs">
            <span className="material-symbols-outlined text-outline text-lg mr-2">store</span>
            <select
              aria-label="Select retail branch filter"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent text-label-md font-label-md font-semibold text-on-surface focus:outline-none border-none pr-6 cursor-pointer p-0"
            >
              <option value="">All Branches</option>
              {branchesData?.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Business Date Badge */}
          <div className="flex items-center gap-1.5 text-label-md font-label-md text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant/70 shadow-xs">
            <span className="material-symbols-outlined text-base text-outline">calendar_today</span>
            <span>Today — {businessDate}</span>
          </div>
        </div>
      </div>

      {/* 2. Level 1: "Action Required — Branch Review" Banner & Cards */}
      <section className="space-y-3" aria-label="Action required items">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600">emergency_home</span>
            <h2 className="text-headline-sm font-headline-sm text-on-surface font-bold">
              Action Required — Branch Review
            </h2>
          </div>
          <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
            {actionRequired.closingDiscrepancy.count + actionRequired.transferApprovals.count} Items Requiring Attention
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Critical Discrepancy Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                  actionRequired.closingDiscrepancy.count > 0 ? "bg-[#FEE4E2] text-[#D92D20]" : "bg-emerald-50 text-emerald-800"
                }`}>
                  {actionRequired.closingDiscrepancy.count > 0 ? "CRITICAL DISCREPANCY" : "CLOSINGS NORMAL"}
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
                  {actionRequired.closingDiscrepancy.count} Flagged
                </span>
              </div>
              <h3 className="text-label-lg font-label-lg text-on-surface font-bold">
                Daily Closing Discrepancies
              </h3>
              {actionRequired.closingDiscrepancy.count > 0 ? (
                <>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-2">
                    Expected:{" "}
                    <span className="font-semibold text-on-surface font-mono">
                      {actionRequired.closingDiscrepancy.items[0]?.expectedCash.toFixed(2)}
                    </span>{" "}
                    | Actual:{" "}
                    <span className="font-semibold text-on-surface font-mono">
                      {actionRequired.closingDiscrepancy.items[0]?.actualCash?.toFixed(2) ?? "N/A"}
                    </span>
                  </p>
                  <div className="mt-2.5 text-label-md font-label-md text-red-600 font-bold bg-red-50/80 p-2.5 rounded-xl border border-red-100 flex items-center justify-between font-mono">
                    <span>Variance:</span>
                    <span>
                      {actionRequired.closingDiscrepancy.items[0]?.cashDifference.toFixed(2)} ETB
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-body-sm font-body-sm text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 mt-2.5">
                  All daily closings are reconciled with zero pending cash shortages.
                </p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
              <span className="text-body-sm font-body-sm text-on-surface-variant">
                {actionRequired.closingDiscrepancy.items[0]?.branchName || "Daily Closing"}
              </span>
              <Link
                to="/daily-closing"
                className="inline-flex items-center gap-1 text-label-md font-label-md font-semibold text-primary hover:underline"
              >
                Review Closing <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Transfer Approval Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF9C3] text-[#A16207] tracking-wide">
                  TRANSFER APPROVAL
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
                  {actionRequired.transferApprovals.count} Awaiting
                </span>
              </div>
              <h3 className="text-label-lg font-label-lg text-on-surface font-bold">
                {actionRequired.transferApprovals.count} Stock Transfer Requests
              </h3>
              {actionRequired.transferApprovals.count > 0 ? (
                <>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-2">
                    Highest priority:{" "}
                    <span className="font-semibold text-on-surface">
                      {actionRequired.transferApprovals.items[0]?.transferNumber}
                    </span>
                  </p>
                  <div className="mt-2.5 text-body-sm font-body-sm bg-surface-container-low/70 p-2.5 rounded-xl border border-outline-variant/60">
                    <div className="font-medium text-on-surface truncate">
                      {actionRequired.transferApprovals.items[0]?.summary}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-body-sm font-body-sm text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 mt-2.5">
                  No stock transfers pending Owner approval at this time.
                </p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
              <span className="text-body-sm font-body-sm text-on-surface-variant">Stock Request</span>
              <Link
                to="/transfers"
                className="inline-flex items-center gap-1 text-label-md font-label-md font-semibold text-primary hover:underline"
              >
                Review Transfers <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Stock Thresholds Card */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-fixed text-primary tracking-wide">
                  STOCK THRESHOLDS
                </span>
                <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">Live Alert</span>
              </div>
              <h3 className="text-label-lg font-label-lg text-on-surface font-bold">
                {(actionRequired.stockThresholds?.lowStockCount ?? 0) + (actionRequired.stockThresholds?.outOfStockCount ?? 0)} Critical SKU Alerts
              </h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-2">
                Products currently at or below branch-specific minimum stock levels.
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2">
                  <span className="text-headline-sm font-headline-sm text-amber-800 block font-bold">
                    {actionRequired.stockThresholds?.lowStockCount ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700">Low Stock SKUs</span>
                </div>
                <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-2">
                  <span className="text-headline-sm font-headline-sm text-red-700 block font-bold">
                    {actionRequired.stockThresholds?.outOfStockCount ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-red-700">Out of Stock</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
              <span className="text-body-sm font-body-sm text-on-surface-variant truncate mr-2">
                {actionRequired.stockThresholds.impactedBranchesSummary}
              </span>
              <Link
                to="/inventory"
                className="inline-flex items-center gap-1 text-label-md font-label-md font-semibold text-primary hover:underline shrink-0"
              >
                View Inventory <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Level 2: Top KPI Metrics (Strictly 4 Operational Cards) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" aria-label="KPI overview">
        {/* Metric 1: Today's Recorded Sales */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md uppercase tracking-wider text-outline font-semibold">
              Today's Recorded Sales
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70">
              <span className="material-symbols-outlined text-lg">trending_up</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-headline-xl font-headline-xl text-on-surface tracking-tight font-mono font-bold">
              {kpis.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">ETB</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2.5">
            <span className="text-on-surface-variant">Completed Transactions</span>
            <span className="font-bold text-on-surface bg-surface-container-low px-2 py-0.5 rounded-lg text-xs">
              {kpis.todayTransactions} sales
            </span>
          </div>
        </div>

        {/* Metric 2: Current Inventory Valuation */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md uppercase tracking-wider text-outline font-semibold">
              Inventory Valuation
            </span>
            <span className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-headline-xl font-headline-xl text-on-surface tracking-tight font-mono font-bold">
              {kpis.inventoryValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">ETB</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2.5">
            <span className="text-on-surface-variant">Valuation Basis</span>
            <span className="text-[11px] font-semibold text-secondary">Weighted Avg Cost</span>
          </div>
        </div>

        {/* Metric 3: Low Stock Items */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md uppercase tracking-wider text-outline font-semibold">
              Low Stock Items
            </span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
              <span className="material-symbols-outlined text-lg">warning</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-headline-xl font-headline-xl text-on-surface tracking-tight font-bold font-mono">
              {kpis.lowStockCount}
            </span>
            <span className="text-label-sm font-label-sm text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
              Below Min Level
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2.5">
            <span className="text-on-surface-variant">Threshold Status</span>
            <span className="text-xs font-semibold text-amber-800">
              {actionRequired.stockThresholds.impactedBranchesSummary}
            </span>
          </div>
        </div>

        {/* Metric 4: Out of Stock */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md uppercase tracking-wider text-outline font-semibold">
              Out of Stock
            </span>
            <span className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200/70">
              <span className="material-symbols-outlined text-lg">error_outline</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-headline-xl font-headline-xl text-red-600 tracking-tight font-bold font-mono">
              {kpis.outOfStockCount}
            </span>
            <span className="text-label-sm font-label-sm text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-200/80">
              Zero Units
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2">
            <span className="text-on-surface-variant">Zero Sellable Stock</span>
            <span className="text-xs font-bold text-red-600">Needs Replenishment</span>
          </div>
        </div>
      </section>

      {/* 4. Level 3: Multi-Branch Performance Overview Table */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-bento overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">
              Multi-Branch Performance Overview
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              Real-time consolidation of retail floor sales, closing records, and stock integrity
            </p>
          </div>
          <span className="text-label-sm font-label-sm text-outline bg-surface-container-low px-3 py-1 rounded-lg border border-outline-variant/70 self-start sm:self-auto font-medium">
            {branchPerformance.length} Operating Branches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low/60 text-label-md font-label-md text-outline uppercase tracking-wider">
                <th className="py-3 px-6 font-semibold">Branch Name</th>
                <th className="py-3 px-6 font-semibold text-right">Today's Sales</th>
                <th className="py-3 px-6 font-semibold text-center">Transactions</th>
                <th className="py-3 px-6 font-semibold">Stock Status</th>
                <th className="py-3 px-6 font-semibold">Daily Closing Status</th>
                <th className="py-3 px-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60 text-body-sm font-body-sm">
              {branchPerformance.map((b) => {
                const hasDiscrepancy = b.closingDiscrepancy !== null && Math.abs(b.closingDiscrepancy) > 0;
                return (
                  <tr
                    key={b.branchId}
                    className={`hover:bg-surface-container-low/50 transition-colors ${
                      hasDiscrepancy ? "bg-red-50/30 border-l-4 border-l-red-500" : ""
                    }`}
                  >
                    <td className="py-4 px-6 font-semibold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            hasDiscrepancy
                              ? "bg-red-500"
                              : b.closingStatus === "APPROVED"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        ></span>
                        <span>{b.branchName}</span>
                        <span className="text-xs font-normal text-outline">({b.branchCode})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-on-surface font-mono">
                      {b.todaySales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                    </td>
                    <td className="py-4 px-6 text-center text-on-surface-variant">
                      {b.todayTransactions} sales
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        {b.lowStockCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            {b.lowStockCount} Low
                          </span>
                        )}
                        {b.outOfStockCount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            {b.outOfStockCount} Out
                          </span>
                        )}
                        {b.lowStockCount === 0 && b.outOfStockCount === 0 && (
                          <span className="text-xs text-secondary font-medium">Healthy</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {b.closingStatus === "SUBMITTED" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                          Submitted — Awaiting Approval
                          {b.closingDiscrepancy !== null && Math.abs(b.closingDiscrepancy) > 0 && (
                            <span className="ml-1 text-red-600 font-bold">
                              (Var: {b.closingDiscrepancy.toFixed(2)})
                            </span>
                          )}
                        </span>
                      ) : b.closingStatus === "APPROVED" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Approved
                        </span>
                      ) : b.closingStatus === "REJECTED" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                          Rejected — Revision Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant">
                          Not Submitted
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {b.closingStatus === "SUBMITTED" ? (
                        <Link
                          to="/daily-closing"
                          className="text-red-600 hover:text-red-800 text-label-md font-label-md font-bold"
                        >
                          Review Closing →
                        </Link>
                      ) : (
                        <Link
                          to="/daily-closing"
                          className="text-primary hover:text-primary/80 text-label-md font-label-md font-semibold"
                        >
                          View Detail →
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Level 4: Two-Column Operations Layout (Sales Trend + Recent Business Activity) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7/12): Sales Trend Chart */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-6 shadow-bento flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-outline-variant/60">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">Sales Trend</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">Sales volume trend across branches</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTrendRange("today")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    trendRange === "today"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-outline hover:text-on-surface bg-surface-container-low border border-outline-variant/70"
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setTrendRange("7days")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    trendRange === "7days"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-outline hover:text-on-surface bg-surface-container-low border border-outline-variant/70"
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTrendRange("month")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    trendRange === "month"
                      ? "bg-primary text-on-primary shadow-xs"
                      : "text-outline hover:text-on-surface bg-surface-container-low border border-outline-variant/70"
                  }`}
                >
                  This Month
                </button>
              </div>
            </div>

            {/* Stylized Operational Bar / Column Chart */}
            <div className="mt-6 pt-4">
              <div className="relative h-56 flex items-end justify-between pt-6 px-2 border-b border-outline-variant/60">
                {/* Horizontal Guidelines */}
                <div className="absolute inset-x-0 top-6 border-t border-dashed border-outline-variant/50 text-[10px] text-outline pr-2 text-right pointer-events-none">
                  {(maxTrendVal * 0.9).toFixed(0)}
                </div>
                <div className="absolute inset-x-0 top-20 border-t border-dashed border-outline-variant/50 text-[10px] text-outline pr-2 text-right pointer-events-none">
                  {(maxTrendVal * 0.6).toFixed(0)}
                </div>
                <div className="absolute inset-x-0 top-36 border-t border-dashed border-outline-variant/50 text-[10px] text-outline pr-2 text-right pointer-events-none">
                  {(maxTrendVal * 0.3).toFixed(0)}
                </div>

                {intervals.map((interval, idx) => {
                  const heightPx = Math.max(
                    6,
                    Math.round((interval.salesAmount / maxTrendVal) * 160)
                  );
                  const isPeak = salesTrend.peakLabel === interval.label && interval.salesAmount > 0;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="relative flex flex-col items-center gap-1.5 z-10 flex-1 min-w-0"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Floating Tooltip when hovered */}
                      {isHovered && (
                        <div className="absolute -top-12 z-30 pointer-events-none flex flex-col items-center">
                          <div className="bg-[#161C27] text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-pill whitespace-nowrap">
                            <span className="font-bold font-mono">{interval.salesAmount.toFixed(2)} ETB</span>
                            <span className="text-gray-400 ml-1">({interval.transactionCount} {interval.transactionCount === 1 ? "sale" : "sales"})</span>
                          </div>
                          <div className="w-1.5 h-1.5 bg-[#161C27] rotate-45 -mt-0.5"></div>
                        </div>
                      )}
                      {/* Vertical Guideline when hovered */}
                      {isHovered && (
                        <div className="absolute inset-x-1/2 -top-2 bottom-6 w-px border-l border-dashed border-primary/50 -translate-x-1/2 pointer-events-none z-0"></div>
                      )}
                      <div
                        className={`w-4 sm:w-6 rounded-t-md transition-all duration-200 cursor-pointer ${
                          isHovered
                            ? "bg-gradient-to-t from-primary to-primary-hover shadow-md scale-y-105 origin-bottom"
                            : isPeak
                            ? "bg-primary shadow-xs hover:bg-primary/90"
                            : interval.salesAmount > 0
                            ? "bg-primary/30 hover:bg-primary/50"
                            : "bg-surface-container-high"
                        }`}
                        style={{ height: `${heightPx}px` }}
                        title={`${interval.label}: ${interval.salesAmount.toFixed(2)} ETB (${interval.transactionCount} sales)`}
                      ></div>
                      <span className={`text-[10px] sm:text-[11px] font-medium truncate max-w-[45px] transition-colors ${
                        isHovered ? "text-primary font-bold" : "text-outline"
                      }`}>
                        {interval.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-body-sm font-body-sm text-outline">
            <span>
              Total Volume:{" "}
              <strong className="text-on-surface font-mono">
                {salesTrend.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB
              </strong>
            </span>
            <span className="font-semibold text-primary">Live Data Active</span>
          </div>
        </div>

        {/* Right Column (5/12): Recent Business Activity Log */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-6 shadow-bento flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">
                  Recent Business Activity
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Important events across operational branches
                </p>
              </div>
              <span className="p-1 rounded bg-surface-container-low text-outline">
                <span className="material-symbols-outlined text-base">history</span>
              </span>
            </div>

            <div className="mt-4 space-y-3.5">
              {recentActivities.length === 0 ? (
                <p className="text-body-sm font-body-sm text-outline text-center py-6">
                  No recent activities recorded yet.
                </p>
              ) : (
                recentActivities.map((act) => {
                  let icon = "receipt_long";
                  let iconBg = "bg-emerald-50 text-emerald-700";
                  if (act.type === "RECEIVING") {
                    icon = "move_to_inbox";
                    iconBg = "bg-blue-50 text-primary";
                  } else if (act.type === "TRANSFER") {
                    icon = "swap_horiz";
                    iconBg = "bg-amber-50 text-amber-700";
                  } else if (act.type === "CLOSING") {
                    icon = "fact_check";
                    iconBg = "bg-red-50 text-red-700";
                  } else if (act.type === "RETURN") {
                    icon = "assignment_return";
                    iconBg = "bg-gray-100 text-gray-700";
                  }

                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 pb-3 border-b border-outline-variant/40 last:border-b-0"
                    >
                      <div className={`w-8 h-8 rounded ${iconBg} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-base">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-label-md font-label-md text-on-surface font-bold truncate">
                            {act.title}
                          </p>
                          {act.amount !== null && (
                            <span className="text-xs font-mono font-bold text-on-surface shrink-0 ml-2">
                              {act.amount.toFixed(2)} ETB
                            </span>
                          )}
                          {act.badgeText && (
                            <span className="text-[10px] font-semibold bg-surface-container px-1.5 py-0.2 rounded text-outline shrink-0 ml-2">
                              {act.badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-body-sm font-body-sm text-on-surface-variant truncate">
                          {act.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/60 text-center">
            <Link
              to="/sales"
              className="text-label-md font-label-md font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>View All Sales</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
