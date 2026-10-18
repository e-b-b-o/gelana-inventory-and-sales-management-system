import { useState, useMemo } from "react";
import { useInventoryReport, exportToCsv } from "../api/reportsApi";
import type { InventoryReportQuery } from "../api/reportsApi";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface InventoryReportsTabProps {
  isOwner: boolean;
  branchesData?: Array<{ id: string; name: string }>;
}

export function InventoryReportsTab({ isOwner, branchesData }: InventoryReportsTabProps) {
  const today = useMemo(() => new Date(), []);
  const defaultEndDate = useMemo(() => toDateString(today), [today]);
  const defaultStartDate = useMemo(() => {
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return toDateString(firstOfMonth);
  }, [today]);

  const [view, setView] = useState<"balances" | "movements" | "transfers">("balances");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [stockStatus, setStockStatus] = useState<"all" | "low" | "out" | "in_stock">("all");
  const [movementType, setMovementType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [page, setPage] = useState<number>(1);

  // Query object
  const queryObj: InventoryReportQuery = {
    view,
    branchId: isOwner ? (selectedBranchId || undefined) : undefined,
    stockStatus: view === "balances" ? stockStatus : undefined,
    movementType: view === "movements" && movementType ? movementType : undefined,
    startDate: view !== "balances" ? startDate : undefined,
    endDate: view !== "balances" ? endDate : undefined,
    page,
    limit: 10,
  };

  const { data, isLoading, isError, error, refetch } = useInventoryReport(queryObj);

  // CSV Export handler
  const handleExportCsv = () => {
    if (!data || !data.records || data.records.length === 0) return;

    if (view === "balances") {
      const rows = data.records.map((r: any) => ({
        Product: r.productName,
        SKU: r.sku,
        Category: r.categoryName,
        Branch: r.branchName,
        AvailableQty: r.availableQuantity,
        DamagedQty: r.damagedQuantity,
        InTransitQty: r.inTransitQuantity,
        ReorderLevel: r.minimumStockQuantity,
        Status: r.stockStatus,
        ...(isOwner
          ? {
              WAC: r.wac !== null ? r.wac.toFixed(2) : "N/A",
              TotalValuation: r.valuation !== null ? r.valuation.toFixed(2) : "N/A",
            }
          : {}),
      }));
      exportToCsv(`inventory_balances_${toDateString(today)}.csv`, rows);
    } else if (view === "movements") {
      const rows = data.records.map((r: any) => ({
        Date: r.createdAt,
        Transaction: r.transactionId || "N/A",
        Branch: r.branchName,
        Product: r.productName,
        SKU: r.sku,
        Type: r.movementType,
        Quantity: r.quantity,
        Reason: r.reason || "",
        CreatedBy: r.createdByName,
        ...(isOwner
          ? {
              UnitCost: r.unitCost !== null ? r.unitCost.toFixed(2) : "N/A",
              TotalCost: r.totalCost !== null ? r.totalCost.toFixed(2) : "N/A",
            }
          : {}),
      }));
      exportToCsv(`inventory_movements_${startDate}_to_${endDate}.csv`, rows);
    } else {
      const rows = data.records.map((r: any) => ({
        TransferNumber: r.transferNumber,
        Date: r.createdAt,
        SourceBranch: r.sourceBranchName,
        DestinationBranch: r.destinationBranchName,
        Status: r.status,
        RequestedQty: r.requestedQuantity,
        DispatchedQty: r.dispatchedQuantity,
        ReceivedQty: r.receivedQuantity,
        DamagedQty: r.damagedQuantity,
        MissingQty: r.missingQuantity,
        HasDiscrepancy: r.hasDiscrepancy ? "YES" : "NO",
      }));
      exportToCsv(`inventory_transfers_${startDate}_to_${endDate}.csv`, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Sub-view Navigation & Filters Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 shadow-bento flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-view Toggle */}
          <div className="flex flex-wrap items-center bg-surface-container-low border border-outline-variant/70 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                setView("balances");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                view === "balances"
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Stock Balances
            </button>
            <button
              type="button"
              onClick={() => {
                setView("movements");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                view === "movements"
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Movements Ledger
            </button>
            <button
              type="button"
              onClick={() => {
                setView("transfers");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                view === "transfers"
                  ? "bg-primary text-on-primary font-semibold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Transfers Reconciliation
            </button>
          </div>

          {/* Branch Filter (Owner Only) */}
          {isOwner ? (
            <div className="flex items-center gap-2">
              <label htmlFor="inv-branch-filter" className="text-label-sm font-label-sm text-on-surface-variant">
                Branch:
              </label>
              <div className="relative">
                <select
                  id="inv-branch-filter"
                  aria-label="Filter report by branch"
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

          {/* Conditional Filters: Stock Status for Balances */}
          {view === "balances" && (
            <div className="flex items-center gap-2">
              <label htmlFor="inv-status-filter" className="text-label-sm font-label-sm text-on-surface-variant">
                Stock Status:
              </label>
              <div className="relative">
                <select
                  id="inv-status-filter"
                  aria-label="Filter by stock status"
                  value={stockStatus}
                  onChange={(e) => {
                    setStockStatus(e.target.value as any);
                    setPage(1);
                  }}
                  className="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="all">All Items</option>
                  <option value="in_stock">In Stock (&gt; 0)</option>
                  <option value="low">Low Stock (≤ Minimum)</option>
                  <option value="out">Out of Stock (0)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                  arrow_drop_down
                </span>
              </div>
            </div>
          )}

          {/* Conditional Filters: Movement Type for Movements */}
          {view === "movements" && (
            <div className="flex items-center gap-2">
              <label htmlFor="inv-movement-filter" className="text-label-sm font-label-sm text-on-surface-variant">
                Movement Type:
              </label>
              <div className="relative">
                <select
                  id="inv-movement-filter"
                  aria-label="Filter by movement type"
                  value={movementType}
                  onChange={(e) => {
                    setMovementType(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="OPENING_STOCK">Opening Stock</option>
                  <option value="RECEIVING">Receiving</option>
                  <option value="SALE">Sale</option>
                  <option value="RETURN_GOOD">Return (Sellable)</option>
                  <option value="RETURN_DAMAGED">Return (Damaged)</option>
                  <option value="TRANSFER_IN">Transfer In</option>
                  <option value="TRANSFER_OUT">Transfer Out</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                  arrow_drop_down
                </span>
              </div>
            </div>
          )}

          {/* Date Range for Movements and Transfers */}
          {view !== "balances" && (
            <div className="flex items-center gap-2">
              <label className="text-label-sm font-label-sm text-on-surface-variant">Date Range:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
              />
              <span className="text-outline text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="flex items-center gap-2 shrink-0 self-end xl:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="h-9 px-4 bg-primary text-on-primary rounded font-semibold text-label-md font-label-md hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div data-testid="reports-loading" className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3"></div>
          <p className="text-body-md text-on-surface-variant font-medium">Loading inventory report data...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-rose-600 text-3xl mb-2">error</span>
          <h3 className="text-label-lg font-bold">Failed to load inventory report</h3>
          <p className="text-body-sm mt-1 max-w-md">{(error as any)?.message || "An error occurred fetching inventory data."}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded text-label-md font-semibold hover:bg-rose-700 transition-colors shadow-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && data && (
        <>
          {/* 2. Key KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {view === "balances" ? (
              <>
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Total Available Stock</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight font-mono">
                      {data.summary.totalStock?.toLocaleString()}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">sellable units</span>
                  </div>
                  <div className="mt-3 text-body-sm font-body-sm text-outline border-t border-outline-variant/60 pt-2.5">
                    {data.summary.inTransitTotal ? `${data.summary.inTransitTotal} units in transit` : "No stock in transit"}
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Low Stock Alerts</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-amber-700 font-bold tracking-tight font-mono">
                      {data.summary.lowStockCount}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">products</span>
                  </div>
                  <div className="mt-3 text-body-sm font-body-sm text-outline border-t border-outline-variant/60 pt-2.5">At or below reorder threshold</div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Out of Stock</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-rose-700 font-bold tracking-tight font-mono">
                      {data.summary.outOfStockCount}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">products</span>
                  </div>
                  <div className="mt-3 text-body-sm font-body-sm text-outline border-t border-outline-variant/60 pt-2.5">Requires immediate replenishment</div>
                </div>

                {isOwner ? (
                  <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                    <span className="text-label-md font-label-md text-on-surface-variant font-medium">Inventory Valuation (WAC)</span>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-headline-lg font-headline-lg text-emerald-700 font-bold tracking-tight font-mono">
                        ETB {data.summary.totalValuation?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="mt-3 text-body-sm font-body-sm text-outline border-t border-outline-variant/60 pt-2.5">Owner view • Weighted average cost</div>
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                    <span className="text-label-md font-label-md text-on-surface-variant font-medium">Damaged / Quarantine Stock</span>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight font-mono">
                        {data.summary.totalDamaged}
                      </span>
                      <span className="text-body-sm font-body-sm text-on-surface-variant">units quarantined</span>
                    </div>
                    <div className="mt-3 text-body-sm font-body-sm text-outline border-t border-outline-variant/60 pt-2.5">Non-sellable items</div>
                  </div>
                )}
              </>
            ) : view === "movements" ? (
              <>
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Total Ledger Movements</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight font-mono">
                      {data.summary.totalMovements}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">recorded entries</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Stock Additions</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-emerald-700 font-bold tracking-tight font-mono">
                      +{data.summary.totalUnitsAdded}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">units</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Stock Deductions</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-rose-700 font-bold tracking-tight font-mono">
                      -{data.summary.totalUnitsDeducted}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">units</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Net Stock Movement</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-primary font-bold tracking-tight font-mono">
                      {(data.summary.netMovement ?? 0) >= 0 ? `+${data.summary.netMovement}` : data.summary.netMovement}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">units</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Total Transfers</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight font-mono">
                      {data.summary.totalTransfers}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Units Dispatched</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight font-mono">
                      {data.summary.totalDispatchedUnits}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">units</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Stock in Transit</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-primary font-bold tracking-tight font-mono">
                      {data.summary.totalInTransitUnits}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">units en route</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
                  <span className="text-label-md font-label-md text-on-surface-variant font-medium">Discrepancy Alerts</span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-headline-lg font-headline-lg text-amber-700 font-bold tracking-tight font-mono">
                      {data.summary.discrepancyCount}
                    </span>
                    <span className="text-body-sm font-body-sm text-on-surface-variant">transfers</span>
                  </div>
                  <div className="mt-3 text-body-sm font-body-sm text-outline border-t border-outline-variant/60 pt-2.5">
                    {data.summary.totalDamagedUnits} damaged • {data.summary.totalMissingUnits} missing
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 3. Main Data Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-bento overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant">
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                  {view === "balances"
                    ? "Branch Stock Balances"
                    : view === "movements"
                    ? "Inventory Movements Ledger"
                    : "Inter-Branch Stock Transfers"}
                </h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  {view === "balances"
                    ? "Live stock balances projection based on immutable ledger."
                    : view === "movements"
                    ? "Audit trail of receiving, sales, returns, and transfer adjustments."
                    : "End-to-end transfer lifecycle tracking and discrepancies."}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    {view === "balances" ? (
                      <>
                        <th className="py-3 px-4 font-semibold">Product</th>
                        <th className="py-3 px-4 font-semibold">SKU / Category</th>
                        <th className="py-3 px-4 font-semibold">Branch</th>
                        <th className="py-3 px-4 font-semibold text-right">Available</th>
                        <th className="py-3 px-4 font-semibold text-right">Damaged</th>
                        <th className="py-3 px-4 font-semibold text-right">In Transit</th>
                        <th className="py-3 px-4 font-semibold text-right">Reorder Level</th>
                        <th className="py-3 px-4 font-semibold text-center">Status</th>
                        {isOwner && <th className="py-3 px-4 font-semibold text-right">WAC (ETB)</th>}
                        {isOwner && <th className="py-3 px-4 font-semibold text-right">Valuation (ETB)</th>}
                      </>
                    ) : view === "movements" ? (
                      <>
                        <th className="py-3 px-4 font-semibold">Date & Time</th>
                        <th className="py-3 px-4 font-semibold">Txn ID / Ref</th>
                        <th className="py-3 px-4 font-semibold">Branch</th>
                        <th className="py-3 px-4 font-semibold">Product</th>
                        <th className="py-3 px-4 font-semibold">Movement Type</th>
                        <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                        {isOwner && <th className="py-3 px-4 font-semibold text-right">Unit Cost</th>}
                        {isOwner && <th className="py-3 px-4 font-semibold text-right">Total Cost</th>}
                        <th className="py-3 px-4 font-semibold">User / Reason</th>
                      </>
                    ) : (
                      <>
                        <th className="py-3 px-4 font-semibold">Transfer #</th>
                        <th className="py-3 px-4 font-semibold">Date</th>
                        <th className="py-3 px-4 font-semibold">Route</th>
                        <th className="py-3 px-4 font-semibold text-right">Dispatched</th>
                        <th className="py-3 px-4 font-semibold text-right">Received</th>
                        <th className="py-3 px-4 font-semibold text-right">Damaged</th>
                        <th className="py-3 px-4 font-semibold text-right">Missing</th>
                        <th className="py-3 px-4 font-semibold text-center">Status</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 text-body-sm font-body-sm text-on-surface">
                  {data.records.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-outline">
                        No records found matching the active filters.
                      </td>
                    </tr>
                  ) : (
                    data.records.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-surface-container-low/70 transition-colors">
                        {view === "balances" ? (
                          <>
                            <td className="py-3 px-4 font-bold text-on-surface">{r.productName}</td>
                            <td className="py-3 px-4 text-outline font-mono text-xs">
                              {r.sku} • {r.categoryName}
                            </td>
                            <td className="py-3 px-4">{r.branchName}</td>
                            <td className="py-3 px-4 text-right font-bold text-on-surface">{r.availableQuantity}</td>
                            <td className="py-3 px-4 text-right text-rose-700 font-medium">
                              {r.damagedQuantity > 0 ? r.damagedQuantity : "—"}
                            </td>
                            <td className="py-3 px-4 text-right text-primary font-medium">
                              {r.inTransitQuantity > 0 ? r.inTransitQuantity : "—"}
                            </td>
                            <td className="py-3 px-4 text-right text-outline">{r.minimumStockQuantity}</td>
                            <td className="py-3 px-4 text-center">
                              {r.stockStatus === "OUT_OF_STOCK" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                  Out of Stock
                                </span>
                              )}
                              {r.stockStatus === "LOW_STOCK" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                  Low Stock
                                </span>
                              )}
                              {r.stockStatus === "IN_STOCK" && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                  In Stock
                                </span>
                              )}
                            </td>
                            {isOwner && <td className="py-3 px-4 text-right font-mono">ETB {r.wac?.toFixed(2)}</td>}
                            {isOwner && (
                              <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                                ETB {r.valuation?.toFixed(2)}
                              </td>
                            )}
                          </>
                        ) : view === "movements" ? (
                          <>
                            <td className="py-3 px-4 font-mono text-xs">{r.createdAt.slice(0, 16).replace("T", " ")}</td>
                            <td className="py-3 px-4 font-mono text-xs text-outline">{r.transactionId || "—"}</td>
                            <td className="py-3 px-4">{r.branchName}</td>
                            <td className="py-3 px-4 font-medium">
                              {r.productName} <span className="text-outline font-mono text-xs">({r.sku})</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-surface-container-high text-on-surface">
                                {r.movementType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right font-bold">
                              {r.quantity > 0 ? (
                                <span className="text-emerald-700">+{r.quantity}</span>
                              ) : (
                                <span className="text-rose-700">{r.quantity}</span>
                              )}
                            </td>
                            {isOwner && <td className="py-3 px-4 text-right font-mono">ETB {r.unitCost?.toFixed(2)}</td>}
                            {isOwner && <td className="py-3 px-4 text-right font-mono font-bold">ETB {r.totalCost?.toFixed(2)}</td>}
                            <td className="py-3 px-4 text-xs text-outline truncate max-w-xs">
                              {r.createdByName}: {r.reason || "Operational movement"}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 font-bold text-primary font-mono">{r.transferNumber}</td>
                            <td className="py-3 px-4 text-outline text-xs">{r.createdAt.slice(0, 10)}</td>
                            <td className="py-3 px-4 font-medium">
                              {r.sourceBranchName} → {r.destinationBranchName}
                            </td>
                            <td className="py-3 px-4 text-right font-medium">{r.dispatchedQuantity}</td>
                            <td className="py-3 px-4 text-right font-bold">{r.receivedQuantity}</td>
                            <td className="py-3 px-4 text-right text-rose-700 font-medium">
                              {r.damagedQuantity > 0 ? r.damagedQuantity : "—"}
                            </td>
                            <td className="py-3 px-4 text-right text-rose-700 font-medium">
                              {r.missingQuantity > 0 ? r.missingQuantity : "—"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {r.hasDiscrepancy ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Discrepancy
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                                  {r.status}
                                </span>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {data.pagination.totalPages > 1 && (
              <div className="p-4 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 text-label-md font-label-md">
                <span className="text-on-surface-variant">
                  Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.totalRecords} records)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container flex items-center justify-center disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <span className="px-3 py-1 bg-primary text-on-primary rounded font-bold text-xs">{page}</span>
                  <button
                    type="button"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="w-8 h-8 rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container flex items-center justify-center disabled:opacity-40"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
