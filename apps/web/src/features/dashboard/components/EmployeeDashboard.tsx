import { Link } from "react-router-dom";
import { useEmployeeDashboard } from "../api/dashboardApi";

export function EmployeeDashboard() {
  const { data, isLoading, isError, error, refetch } = useEmployeeDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface-container-high rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-surface-container-high rounded-lg"></div>
          <div className="h-32 bg-surface-container-high rounded-lg"></div>
          <div className="h-32 bg-surface-container-high rounded-lg"></div>
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
          <h2 className="text-headline-sm font-headline-sm font-bold">Failed to load Employee Dashboard</h2>
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

  const { branchName, branchCode, businessDate, kpis, dailyClosing, pendingTransfers, recentSales, stockAlerts = [] } = data;

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar: Branch Context & Business Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Employee Dashboard</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-0.5">
            Operational floor overview for your assigned branch
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Static Branch Context (Read-Only) */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant text-on-surface shadow-xs">
            <span className="material-symbols-outlined text-primary text-lg">storefront</span>
            <span className="text-label-md font-label-md font-bold">{branchName}</span>
            <span className="text-xs text-outline font-medium">({branchCode})</span>
          </div>

          {/* Business Date Badge */}
          <div className="flex items-center gap-1.5 text-label-md font-label-md text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded border border-outline-variant/70 shadow-xs">
            <span className="material-symbols-outlined text-base text-outline">calendar_today</span>
            <span>Today — {businessDate}</span>
          </div>
        </div>
      </div>

      {/* 2. Level 1: Quick Operational Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5" aria-label="Operational actions">
        {/* Action 1: Record New Sale */}
        <div className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl p-4 sm:p-6 shadow-bento hover:shadow-bento-hover transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white tracking-wide">
                POINT OF SALE
              </span>
              <span className="material-symbols-outlined text-white/80">point_of_sale</span>
            </div>
            <h3 className="text-headline-sm font-headline-sm font-bold text-white">Record New Sale</h3>
            <p className="text-body-sm font-body-sm text-white/80 mt-1">
              Start a new retail transaction, add items, and process payments.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/20">
            <Link
              to="/sales/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary rounded-xl font-bold text-label-md shadow-xs hover:bg-white/90 transition-all"
            >
              <span>Open Sales Register</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Action 2: Daily Closing Status */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 sm:p-6 shadow-bento hover:shadow-bento-hover transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                  dailyClosing.status === "APPROVED"
                    ? "bg-emerald-50 text-emerald-800"
                    : dailyClosing.status === "SUBMITTED"
                    ? "bg-amber-50 text-amber-800"
                    : dailyClosing.status === "REJECTED"
                    ? "bg-red-50 text-red-700"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {dailyClosing.status.replace("_", " ")}
              </span>
              <span className="text-xs text-outline font-medium">Daily Closing</span>
            </div>
            <h3 className="text-label-lg font-label-lg text-on-surface font-bold">
              Today's Register Reconciliation
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1.5">
              {dailyClosing.nextAction}
            </p>
            {dailyClosing.status === "REJECTED" && dailyClosing.rejectionReason && (
              <div className="mt-2.5 text-xs text-red-700 bg-red-50/80 p-2.5 rounded-xl border border-red-200">
                <strong>Feedback:</strong> {dailyClosing.rejectionReason}
              </div>
            )}
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
            <span className="text-body-sm font-body-sm font-mono font-bold text-on-surface">
              Expected: {(dailyClosing.expectedCash ?? 0).toFixed(2)} ETB
            </span>
            <Link
              to="/daily-closing"
              className="inline-flex items-center gap-1 text-label-md font-label-md font-semibold text-primary hover:underline"
            >
              {dailyClosing.status === "NOT_SUBMITTED"
                ? "Submit Closing"
                : dailyClosing.status === "REJECTED"
                ? "Correct Closing"
                : "View Closing"}{" "}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Action 3: Inbound Transfers Awaiting Receipt */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 sm:p-6 shadow-bento hover:shadow-bento-hover transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-primary tracking-wide">
                INBOUND SHIPMENTS
              </span>
              <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
                {pendingTransfers.inboundDispatchedCount} Dispatched
              </span>
            </div>
            <h3 className="text-label-lg font-label-lg text-on-surface font-bold">
              Pending Stock Receipts
            </h3>
            {pendingTransfers.inboundDispatchedCount > 0 ? (
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1.5">
                Shipment{" "}
                <strong className="text-on-surface">
                  {pendingTransfers.items[0]?.transferNumber}
                </strong>{" "}
                dispatched from {pendingTransfers.items[0]?.sourceBranchName}.
              </p>
            ) : (
              <p className="text-body-sm font-body-sm text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 mt-2.5">
                No inbound transfers awaiting receipt at your branch.
              </p>
            )}
          </div>
          <div className="mt-5 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
            <span className="text-body-sm font-body-sm text-on-surface-variant">Stock Transfer</span>
            <Link
              to="/transfers"
              className="inline-flex items-center gap-1 text-label-md font-label-md font-semibold text-primary hover:underline"
            >
              Receive Stock <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Level 2: Top KPI Metrics (Strictly 4 Operational Cards, NO cost/WAC/profit) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5" aria-label="Branch metrics">
        {/* Metric 1: Today's Branch Sales */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 sm:p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md uppercase tracking-wider text-outline font-semibold">
              Today's Branch Sales
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 shrink-0">
              <span className="material-symbols-outlined text-lg">trending_up</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2 flex-wrap min-w-0">
            <span className="text-2xl sm:text-headline-xl font-bold tracking-tight font-mono text-on-surface break-words min-w-0">
              {kpis.todayBranchSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">ETB</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2.5">
            <span className="text-on-surface-variant">Branch Transactions</span>
            <span className="font-bold text-on-surface bg-surface-container-low px-2 py-0.5 rounded-lg text-xs">
              {kpis.todayBranchTransactions} sales
            </span>
          </div>
        </div>

        {/* Metric 2: Today's Own Sales */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 sm:p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md uppercase tracking-wider text-outline font-semibold">
              My Sales Today
            </span>
            <span className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <span className="material-symbols-outlined text-lg">badge</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2 flex-wrap min-w-0">
            <span className="text-2xl sm:text-headline-xl font-bold tracking-tight font-mono text-primary break-words min-w-0">
              {kpis.todayOwnSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">ETB</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2.5">
            <span className="text-on-surface-variant">Recorded by You</span>
            <span className="font-bold text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-lg text-xs">
              {kpis.todayOwnTransactions} sales
            </span>
          </div>
        </div>

        {/* Metric 3: Branch Low Stock */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 sm:p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md uppercase tracking-wider text-outline font-semibold">
              Low Stock Items
            </span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70 shrink-0">
              <span className="material-symbols-outlined text-lg">warning</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2 flex-wrap min-w-0">
            <span className="text-2xl sm:text-headline-xl font-bold tracking-tight font-mono text-on-surface break-words min-w-0">
              {kpis.lowStockCount}
            </span>
            <span className="text-label-sm font-label-sm text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
              At Min Level
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2.5">
            <span className="text-on-surface-variant">Replenishment</span>
            <span className="text-xs font-semibold text-amber-800">Review Shelf Stock</span>
          </div>
        </div>

        {/* Metric 4: Branch Out of Stock */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 sm:p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md uppercase tracking-wider text-outline font-semibold">
              Out of Stock
            </span>
            <span className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200/70 shrink-0">
              <span className="material-symbols-outlined text-lg">error_outline</span>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2 flex-wrap min-w-0">
            <span className="text-2xl sm:text-headline-xl font-bold tracking-tight font-mono text-red-600 break-words min-w-0">
              {kpis.outOfStockCount}
            </span>
            <span className="text-label-sm font-label-sm text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-full border border-red-200/80">
              Zero Units
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2.5">
            <span className="text-on-surface-variant">Request Transfer</span>
            <span className="text-xs font-bold text-red-600">Immediate Action</span>
          </div>
        </div>
      </section>

      {/* 4. Level 3 & 4: Two Columns (Recent Branch Sales + Branch Inventory Alerts) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7/12): Recent Sales at Branch */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-bento overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">
                  Recent Branch Sales
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Completed retail sales recorded at this branch
                </p>
              </div>
              <Link
                to="/sales"
                className="text-label-md font-label-md font-semibold text-primary hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/60 bg-surface-container-low/60 text-label-md font-label-md text-outline uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Sale #</th>
                    <th className="py-3 px-4 font-semibold">Time</th>
                    <th className="py-3 px-4 font-semibold">Cashier</th>
                    <th className="py-3 px-4 font-semibold text-right">Total</th>
                    <th className="py-3 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 text-body-sm font-body-sm">
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-outline">
                        No sales recorded today at this branch yet.
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-medium font-mono text-on-surface">
                          {sale.saleNumber}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant">
                          {new Date(sale.soldAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 text-on-surface">
                          <span className="flex items-center gap-1.5">
                            <span>{sale.cashierName}</span>
                            {sale.isOwnSale && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary text-on-primary">
                                You
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-on-surface">
                          {(sale.grandTotal ?? 0).toFixed(2)} ETB
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            to={`/sales/${sale.id}`}
                            className="text-primary hover:underline text-label-md font-label-md inline-flex items-center gap-0.5"
                          >
                            Details <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-surface-container-low/40 border-t border-outline-variant/60 flex items-center justify-between text-body-sm font-body-sm text-outline">
            <span>Showing recent floor sales</span>
            <Link to="/sales/new" className="text-primary font-semibold hover:underline">
              + Record Sale
            </Link>
          </div>
        </div>

        {/* Right Column (5/12): Branch Stock Alerts Table */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-bento overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-outline-variant/60 flex items-center justify-between">
              <div>
                <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">
                  Stock Alerts
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Low or depleted items requiring stock transfer
                </p>
              </div>
              <Link
                to="/transfers/new"
                className="text-label-md font-label-md font-semibold text-primary hover:underline"
              >
                + Request
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {stockAlerts.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
                  <p className="text-body-md font-body-md text-emerald-800 font-semibold">
                    Stock levels are healthy
                  </p>
                  <p className="text-body-sm font-body-sm text-outline">
                    All branch products are currently above minimum threshold levels.
                  </p>
                </div>
              ) : (
                stockAlerts.slice(0, 6).map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-label-md font-label-md font-bold text-on-surface truncate">
                        {item.productName}
                      </p>
                      <p className="text-body-sm font-body-sm text-on-surface-variant truncate">
                        SKU: {item.sku} • {item.categoryName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm block ${
                            item.status === "OUT_OF_STOCK" ? "text-red-600" : "text-amber-800"
                          }`}
                        >
                          {item.availableQuantity} units
                        </span>
                        <span className="text-[10px] text-outline">
                          Min: {item.minimumStockQuantity}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "OUT_OF_STOCK"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {item.status === "OUT_OF_STOCK" ? "Out" : "Low"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-surface-container-low/40 border-t border-outline-variant/60 flex items-center justify-between text-body-sm font-body-sm text-outline">
            <span>{stockAlerts.length} items flagged</span>
            <Link to="/transfers/new" className="text-primary font-semibold hover:underline">
              Request Stock Transfer →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
