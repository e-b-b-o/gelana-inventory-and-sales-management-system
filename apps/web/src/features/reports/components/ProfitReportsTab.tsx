import { useState, useMemo } from "react";
import { useProfitReport, exportToCsv } from "../api/reportsApi";
import type { ProfitReportQuery } from "../api/reportsApi";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface ProfitReportsTabProps {
  branchesData?: Array<{ id: string; name: string }>;
}

export function ProfitReportsTab({ branchesData }: ProfitReportsTabProps) {
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
  const [breakdown, setBreakdown] = useState<"day" | "branch" | "category" | "product">("day");
  const [page, setPage] = useState<number>(1);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  // Query object
  const queryObj: ProfitReportQuery = {
    startDate,
    endDate,
    branchId: selectedBranchId || undefined,
    breakdown,
    page,
    limit: 10,
  };

  const { data, isLoading, isError, error, refetch } = useProfitReport(queryObj);

  // Date Preset handler
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

  // CSV Export handlers
  const handleExportBreakdownCsv = () => {
    if (!data || !data.breakdown || data.breakdown.length === 0) return;
    const rows = data.breakdown.map((b) => ({
      Group: b.name,
      GrossRevenue: b.grossRevenue.toFixed(2),
      Returns: b.returns.toFixed(2),
      NetRevenue: b.netRevenue.toFixed(2),
      COGS: b.cogs.toFixed(2),
      GrossProfit: b.grossProfit.toFixed(2),
      MarginPercent: b.profitMargin.toFixed(1) + "%",
      UnitsSold: b.unitsSold,
    }));
    exportToCsv(`profit_breakdown_${breakdown}_${startDate}_to_${endDate}.csv`, rows);
    setShowExportMenu(false);
  };

  const handleExportDetailedCsv = () => {
    if (!data || !data.detailedRecords || data.detailedRecords.length === 0) return;
    const rows = data.detailedRecords.map((r) => ({
      SaleNumber: r.saleNumber,
      Date: r.soldAt,
      Branch: r.branchName,
      Product: r.productName,
      SKU: r.sku,
      Category: r.categoryName,
      QuantitySold: r.quantitySold,
      UnitPrice: r.unitPrice.toFixed(2),
      UnitCost: r.unitCost.toFixed(2),
      NetRevenue: r.netRevenue.toFixed(2),
      COGS: r.cogs.toFixed(2),
      GrossProfit: r.grossProfit.toFixed(2),
      MarginPercent: r.marginPercent.toFixed(1) + "%",
    }));
    exportToCsv(`profit_detailed_records_${startDate}_to_${endDate}.csv`, rows);
    setShowExportMenu(false);
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

          {/* Date Range Inputs */}
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

          {/* Branch Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="profit-branch-filter" className="text-label-sm font-label-sm text-on-surface-variant">
              Branch:
            </label>
            <div className="relative">
              <select
                id="profit-branch-filter"
                aria-label="Filter profit by branch"
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

          {/* Breakdown Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="profit-breakdown-filter" className="text-label-sm font-label-sm text-on-surface-variant">
              Breakdown:
            </label>
            <div className="relative">
              <select
                id="profit-breakdown-filter"
                aria-label="Group profit by dimension"
                value={breakdown}
                onChange={(e) => {
                  setBreakdown(e.target.value as any);
                  setPage(1);
                }}
                className="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="day">By Day</option>
                <option value="branch">By Branch</option>
                <option value="category">By Category</option>
                <option value="product">By Product</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                arrow_drop_down
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Export & Refresh */}
        <div className="flex items-center gap-2 self-end xl:self-auto">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-9 px-3.5 bg-surface-container-low border border-outline-variant rounded text-label-md font-label-md text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export CSV</span>
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-52 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg z-20 py-1">
                <button
                  type="button"
                  onClick={handleExportBreakdownCsv}
                  className="w-full text-left px-3 py-2 text-label-sm font-label-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-outline">table_chart</span>
                  <span>Export Breakdown Table</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportDetailedCsv}
                  className="w-full text-left px-3 py-2 text-label-sm font-label-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm text-outline">receipt_long</span>
                  <span>Export Detailed Records</span>
                </button>
              </div>
            )}
          </div>

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
          <p className="text-body-md font-body-md text-on-surface-variant">Calculating profit margins and COGS...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-error-container text-on-error-container rounded-lg border border-error flex items-start gap-3">
          <span className="material-symbols-outlined text-error text-2xl">error</span>
          <div>
            <h4 className="font-semibold text-title-sm">Failed to load profit report</h4>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Net Revenue */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Net Revenue</span>
                <span className="w-9 h-9 rounded-xl bg-primary-container/60 text-primary flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-lg">payments</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="text-headline-sm font-headline-sm font-bold text-on-surface font-mono">
                  ETB {data.summary.netRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-body-xs font-body-xs text-on-surface-variant mt-2 border-t border-outline-variant/60 pt-2">
                  Gross: ETB {data.summary.grossRevenue.toFixed(2)} | Returns: -ETB {data.summary.returnsAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Card 2: Cost of Goods Sold (COGS) */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Net COGS</span>
                <span className="w-9 h-9 rounded-xl bg-secondary-container/60 text-secondary flex items-center justify-center border border-secondary/20">
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="text-headline-sm font-headline-sm font-bold text-on-surface font-mono">
                  ETB {data.summary.netCogs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-body-xs font-body-xs text-on-surface-variant mt-2 border-t border-outline-variant/60 pt-2">
                  Gross COGS: ETB {data.summary.grossCogs.toFixed(2)} | Return Adj: -ETB {data.summary.returnCogsAdjustment.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Card 3: Gross Profit */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Gross Profit</span>
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                  data.summary.grossProfit >= 0 ? "bg-emerald-50 text-emerald-800 border-emerald-200/70" : "bg-rose-50 text-rose-800 border-rose-200/70"
                }`}>
                  <span className="material-symbols-outlined text-lg">trending_up</span>
                </span>
              </div>
              <div className="mt-3">
                <div className={`text-headline-sm font-headline-sm font-bold font-mono ${
                  data.summary.grossProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}>
                  ETB {data.summary.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-body-xs font-body-xs text-on-surface-variant mt-2 border-t border-outline-variant/60 pt-2">
                  Revenue minus inventory cost basis (WAC)
                </div>
              </div>
            </div>

            {/* Card 4: Profit Margin */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Profit Margin</span>
                <span className="w-9 h-9 rounded-xl bg-tertiary-container/60 text-tertiary flex items-center justify-center border border-tertiary/20">
                  <span className="material-symbols-outlined text-lg">percent</span>
                </span>
              </div>
              <div className="mt-3">
                <div className="text-headline-sm font-headline-sm font-bold text-on-surface font-mono">
                  {data.summary.profitMargin.toFixed(1)}%
                </div>
                <div className="text-body-xs font-body-xs text-on-surface-variant mt-2 border-t border-outline-variant/60 pt-2">
                  {data.summary.totalUnitsSold.toLocaleString()} units sold across {data.summary.totalTransactions} sales
                </div>
              </div>
            </div>
          </div>

          {/* 3. Trend Chart (SVG) */}
          {data.trend && data.trend.dataPoints.length > 0 && (
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-bento">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline-variant/60 gap-2">
                <div>
                  <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Profit & Revenue Trend</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">Daily net revenue, inventory cost (COGS), and gross profit</p>
                </div>
                {data.trend.peakDay && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 text-label-sm font-label-sm font-semibold">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    <span>Peak Day: <strong>{data.trend.peakDay.date}</strong> (ETB {data.trend.peakDay.profit.toFixed(2)})</span>
                  </div>
                )}
              </div>

              {/* Responsive SVG Chart with interactive guideline and tooltip */}
              <div className="mt-4 pt-2 relative">
                {(() => {
                  const points = data.trend.dataPoints;
                  const maxVal = Math.max(
                    ...points.map((p) => Math.max(p.revenue, p.cogs, p.profit, 100))
                  );
                  const minVal = Math.min(
                    0,
                    ...points.map((p) => Math.min(p.profit, 0))
                  );
                  const range = maxVal - minVal || 1;

                  const width = 800;
                  const height = 180;
                  const padding = 30;
                  const usableWidth = width - padding * 2;
                  const usableHeight = height - padding * 2;

                  const getX = (index: number) =>
                    points.length > 1
                      ? padding + (index / (points.length - 1)) * usableWidth
                      : width / 2;

                  const getY = (val: number) =>
                    height - padding - ((val - minVal) / range) * usableHeight;

                  const revPath = points
                    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.revenue)}`)
                    .join(" ");

                  const cogsPath = points
                    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.cogs)}`)
                    .join(" ");

                  const profitPath = points
                    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.profit)}`)
                    .join(" ");

                  const activePoint = hoveredTrendIndex !== null ? points[hoveredTrendIndex] : null;

                  return (
                    <div>
                      {/* Floating Tooltip */}
                      {activePoint && hoveredTrendIndex !== null && (
                        <div
                          className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full pb-2 transition-all duration-150"
                          style={{
                            left: `${(getX(hoveredTrendIndex) / width) * 100}%`,
                            top: `${(getY(activePoint.profit) / height) * 100}%`,
                          }}
                        >
                          <div className="bg-[#161C27] text-white text-[11px] font-medium py-2 px-3 rounded-xl shadow-pill whitespace-nowrap flex flex-col items-center">
                            <span className="font-bold text-emerald-400 font-mono">Profit: ETB {activePoint.profit.toFixed(2)} ({activePoint.marginPercent.toFixed(1)}%)</span>
                            <span className="text-gray-300 text-[10px] mt-0.5">Rev: ETB {activePoint.revenue.toFixed(2)} | COGS: ETB {activePoint.cogs.toFixed(2)}</span>
                            <span className="text-gray-400 text-[9px] mt-0.5">{activePoint.date}</span>
                            <div className="w-1.5 h-1.5 bg-[#161C27] rotate-45 -mb-2 mt-1"></div>
                          </div>
                        </div>
                      )}

                      <svg
                        viewBox={`0 0 ${width} ${height}`}
                        className="w-full h-44 overflow-visible"
                      >
                        {/* Zero Line */}
                        <line
                          x1={padding}
                          y1={getY(0)}
                          x2={width - padding}
                          y2={getY(0)}
                          stroke="#cbd5e1"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />

                        {/* Guideline on hover */}
                        {hoveredTrendIndex !== null && (
                          <line
                            x1={getX(hoveredTrendIndex)}
                            y1={padding}
                            x2={getX(hoveredTrendIndex)}
                            y2={height - padding}
                            stroke="#0047FF"
                            strokeDasharray="3 3"
                            strokeWidth="1.5"
                            strokeOpacity="0.6"
                          />
                        )}

                        {/* Revenue line (blue) */}
                        <path
                          d={revPath}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* COGS line (amber) */}
                        <path
                          d={cogsPath}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                        />

                        {/* Profit line (emerald) */}
                        <path
                          d={profitPath}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />

                        {/* Data point circles */}
                        {points.map((p, i) => {
                          const isHovered = hoveredTrendIndex === i;
                          return (
                            <g key={p.date}>
                              {/* Profit Circle */}
                              <circle
                                cx={getX(i)}
                                cy={getY(p.profit)}
                                r={isHovered ? 6 : 4}
                                fill="#10b981"
                                stroke={isHovered ? "#FFFFFF" : "none"}
                                strokeWidth={isHovered ? 2.5 : 0}
                                className="transition-all duration-150"
                              />
                              {/* If hovered, show markers on Revenue and COGS too */}
                              {isHovered && (
                                <>
                                  <circle
                                    cx={getX(i)}
                                    cy={getY(p.revenue)}
                                    r="5"
                                    fill="#3b82f6"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                  />
                                  <circle
                                    cx={getX(i)}
                                    cy={getY(p.cogs)}
                                    r="5"
                                    fill="#f59e0b"
                                    stroke="#FFFFFF"
                                    strokeWidth="2"
                                  />
                                </>
                              )}
                            </g>
                          );
                        })}

                        {/* Invisible Hit Detection Areas */}
                        {points.map((p, i) => {
                          const colW = usableWidth / Math.max(1, points.length);
                          return (
                            <rect
                              key={`hit-${p.date}`}
                              x={getX(i) - colW / 2}
                              y={padding}
                              width={colW}
                              height={usableHeight}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredTrendIndex(i)}
                              onMouseLeave={() => setHoveredTrendIndex(null)}
                            />
                          );
                        })}
                      </svg>

                      {/* Legend */}
                      <div className="flex items-center justify-center gap-6 mt-2 text-label-sm font-label-sm text-on-surface-variant">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-blue-500" />
                          <span>Net Revenue</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-0.5 bg-amber-500 border-t border-dashed" />
                          <span>Cost of Goods (COGS)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span>Gross Profit</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* 4. Breakdown Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-bento overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <div>
                <h3 className="text-title-sm font-title-sm font-semibold text-on-surface">
                  Performance Breakdown by {breakdown.charAt(0).toUpperCase() + breakdown.slice(1)}
                </h3>
                <p className="text-body-xs font-body-xs text-on-surface-variant">
                  Detailed revenue, cost, and profitability aggregated by {breakdown}
                </p>
              </div>
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                {data.breakdown.length} group{data.breakdown.length === 1 ? "" : "s"}
              </span>
            </div>

            {data.breakdown.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                No breakdown data available for the selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm font-label-sm text-on-surface-variant">
                      <th className="py-3 px-4 font-semibold">{breakdown.charAt(0).toUpperCase() + breakdown.slice(1)}</th>
                      <th className="py-3 px-4 font-semibold text-right">Gross Sales</th>
                      <th className="py-3 px-4 font-semibold text-right">Returns</th>
                      <th className="py-3 px-4 font-semibold text-right">Net Revenue</th>
                      <th className="py-3 px-4 font-semibold text-right">COGS</th>
                      <th className="py-3 px-4 font-semibold text-right">Gross Profit</th>
                      <th className="py-3 px-4 font-semibold text-right">Margin %</th>
                      <th className="py-3 px-4 font-semibold text-right">Units Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-sm font-body-sm">
                    {data.breakdown.map((row) => (
                      <tr key={row.key} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-on-surface">{row.name}</td>
                        <td className="py-3 px-4 text-right text-on-surface-variant">ETB {row.grossRevenue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-rose-600">
                          {row.returns > 0 ? `-ETB ${row.returns.toFixed(2)}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-on-surface">ETB {row.netRevenue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-on-surface-variant">ETB {row.cogs.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-bold ${
                          row.grossProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}>
                          ETB {row.grossProfit.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex px-2 py-0.5 rounded text-label-xs font-label-xs font-semibold ${
                            row.profitMargin >= 30
                              ? "bg-emerald-100 text-emerald-800"
                              : row.profitMargin >= 10
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {row.profitMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-on-surface-variant">{row.unitsSold.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 5. Detailed Transactions Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-title-sm font-title-sm font-semibold text-on-surface">
                  Detailed Item Sales & WAC Cost Basis
                </h3>
                <p className="text-body-xs font-body-xs text-on-surface-variant">
                  Audit trail showing item sale prices, historical WAC snapshot, and computed unit margin
                </p>
              </div>
              <span className="text-label-sm font-label-sm text-on-surface-variant">
                Showing {data.detailedRecords.length} of {data.pagination.totalRecords} records
              </span>
            </div>

            {data.detailedRecords.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                No detailed sales records found for this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm font-label-sm text-on-surface-variant">
                      <th className="py-3 px-4 font-semibold">Sale #</th>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Branch</th>
                      <th className="py-3 px-4 font-semibold">Product & SKU</th>
                      <th className="py-3 px-4 font-semibold text-right">Qty</th>
                      <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
                      <th className="py-3 px-4 font-semibold text-right">WAC Cost</th>
                      <th className="py-3 px-4 font-semibold text-right">Net Revenue</th>
                      <th className="py-3 px-4 font-semibold text-right">COGS</th>
                      <th className="py-3 px-4 font-semibold text-right">Profit</th>
                      <th className="py-3 px-4 font-semibold text-right">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-sm font-body-sm">
                    {data.detailedRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-primary">{r.saleNumber}</td>
                        <td className="py-3 px-4 text-on-surface-variant whitespace-nowrap">
                          {new Date(r.soldAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant">{r.branchName}</td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-on-surface">{r.productName}</div>
                          <div className="text-label-xs font-label-xs text-on-surface-variant">{r.sku} • {r.categoryName}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-on-surface">{r.quantitySold}</td>
                        <td className="py-3 px-4 text-right text-on-surface-variant">ETB {r.unitPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-on-surface-variant">ETB {r.unitCost.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-on-surface">ETB {r.netRevenue.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-on-surface-variant">ETB {r.cogs.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-bold ${
                          r.grossProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}>
                          ETB {r.grossProfit.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-label-xs font-label-xs font-semibold ${
                            r.marginPercent >= 25 ? "text-emerald-800 bg-emerald-50" : "text-rose-800 bg-rose-50"
                          }`}>
                            {r.marginPercent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
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
        </>
      )}
    </div>
  );
}
