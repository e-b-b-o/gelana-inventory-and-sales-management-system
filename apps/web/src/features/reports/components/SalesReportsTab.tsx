import { useState, useMemo } from "react";
import { useSalesReport, exportToCsv } from "../api/reportsApi";
import type { SalesReportQuery } from "../api/reportsApi";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface SalesReportsTabProps {
  isOwner: boolean;
  branchesData?: Array<{ id: string; name: string }>;
}

export function SalesReportsTab({ isOwner, branchesData }: SalesReportsTabProps) {
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
  const [breakdown, setBreakdown] = useState<"day" | "branch" | "employee" | "product" | "payment_method">("day");
  const [page, setPage] = useState<number>(1);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Query object
  const queryObj: SalesReportQuery = {
    startDate,
    endDate,
    branchId: isOwner ? (selectedBranchId || undefined) : undefined,
    breakdown,
    page,
    limit: 10,
  };

  const { data, isLoading, isError, error, refetch } = useSalesReport(queryObj);

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

  // Export handlers
  const handleExportSummaryCsv = () => {
    if (!data) return;
    const exportRows = [
      {
        Metric: "Total Sales (ETB)",
        Value: data.summary.totalSales.toFixed(2),
      },
      {
        Metric: "Gross Sales (ETB)",
        Value: data.summary.grossSales.toFixed(2),
      },
      {
        Metric: "Total Returns (ETB)",
        Value: data.summary.totalReturns.toFixed(2),
      },
      {
        Metric: "Sales Transactions",
        Value: data.summary.totalTransactions,
      },
      {
        Metric: "Average Sale (ETB)",
        Value: data.summary.averageSale.toFixed(2),
      },
      {
        Metric: "Top Product",
        Value: data.summary.topProduct?.productName || "N/A",
      },
      {
        Metric: "Top Product Revenue (ETB)",
        Value: data.summary.topProduct?.totalRevenue.toFixed(2) || "0.00",
      },
    ];
    exportToCsv(`sales_summary_${startDate}_to_${endDate}.csv`, exportRows);
    setShowExportMenu(false);
  };

  const handleExportDetailedCsv = () => {
    if (!data || !data.detailedRecords || data.detailedRecords.length === 0) return;
    const rows = data.detailedRecords.map((r: any) => {
      if (breakdown === "day") {
        return {
          Date: r.date,
          SalesCount: r.salesCount,
          TotalSales: r.totalSales.toFixed(2),
          AverageSale: r.averageSale.toFixed(2),
          TopProduct: r.topProduct?.productName || "N/A",
        };
      }
      if (breakdown === "branch") {
        return {
          Branch: r.branchName,
          Code: r.branchCode,
          SalesCount: r.salesCount,
          TotalSales: r.totalSales.toFixed(2),
          Percentage: `${r.percentage}%`,
        };
      }
      if (breakdown === "employee") {
        return {
          Employee: r.employeeName,
          Email: r.employeeEmail,
          SalesCount: r.salesCount,
          TotalSales: r.totalSales.toFixed(2),
          AverageSale: r.averageSale.toFixed(2),
        };
      }
      if (breakdown === "product") {
        return {
          Product: r.productName,
          SKU: r.sku,
          Category: r.categoryName,
          QuantitySold: r.quantitySold,
          TotalRevenue: r.totalRevenue.toFixed(2),
          SalesCount: r.salesCount,
        };
      }
      return {
        PaymentMethod: r.paymentMethodName,
        Received: r.receivedAmount.toFixed(2),
        Refunded: r.refundedAmount.toFixed(2),
        NetCollected: r.netAmount.toFixed(2),
        Transactions: r.transactionCount,
        Percentage: `${r.percentage}%`,
      };
    });
    exportToCsv(`sales_breakdown_${breakdown}_${startDate}_to_${endDate}.csv`, rows);
    setShowExportMenu(false);
  };

  // Trend line coordinates calculation
  const trendPoints = useMemo(() => data?.trend?.dataPoints || [], [data?.trend?.dataPoints]);
  const maxTrendSale = useMemo(() => {
    if (trendPoints.length === 0) return 10000;
    const max = Math.max(...trendPoints.map((p) => p.totalSales));
    return max > 0 ? max * 1.15 : 10000;
  }, [trendPoints]);

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 25;
  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const usableHeight = svgHeight - paddingTop - paddingBottom;

  const pointsCoordinates = useMemo(() => {
    if (trendPoints.length === 0) return [];
    if (trendPoints.length === 1) {
      return [{ x: paddingLeft + usableWidth / 2, y: paddingTop + usableHeight / 2, p: trendPoints[0] }];
    }
    return trendPoints.map((pt, idx) => {
      const x = paddingLeft + (idx / (trendPoints.length - 1)) * usableWidth;
      const y = paddingTop + usableHeight - (pt.totalSales / maxTrendSale) * usableHeight;
      return { x, y, p: pt };
    });
  }, [trendPoints, maxTrendSale, usableWidth, usableHeight]);

  const linePathD = useMemo(() => {
    if (pointsCoordinates.length === 0) return "";
    return pointsCoordinates.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      return `${acc} L ${curr.x} ${curr.y}`;
    }, "");
  }, [pointsCoordinates]);

  const areaPathD = useMemo(() => {
    if (pointsCoordinates.length === 0) return "";
    const firstX = pointsCoordinates[0].x;
    const lastX = pointsCoordinates[pointsCoordinates.length - 1].x;
    const bottomY = paddingTop + usableHeight;
    return `${linePathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePathD, pointsCoordinates, paddingTop, usableHeight]);

  return (
    <div className="space-y-6">
      {/* 1. Global Reusable Report Filters Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 shadow-bento flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center bg-surface-container-low border border-outline-variant/70 rounded-xl p-1 gap-1">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-outline ml-1.5 mr-1 text-base">calendar_today</span>
              <button
                type="button"
                onClick={() => handlePresetChange("today")}
                className={`px-3 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
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
                className={`px-3 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
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
                className={`px-3 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                  datePreset === "month"
                    ? "bg-primary text-on-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setDatePreset("custom")}
                className={`px-3 py-1.5 text-label-sm font-label-sm rounded-lg transition-colors ${
                  datePreset === "custom"
                    ? "bg-primary text-on-primary font-semibold shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Custom
              </button>
            </div>

            <span className="hidden sm:inline-block h-4 w-px bg-outline-variant/60 mx-1"></span>
            <span className="px-2 text-label-sm font-label-sm text-on-surface font-medium w-full sm:w-auto text-left">
              {startDate} – {endDate}
            </span>
          </div>

          {/* Custom Date Inputs if Custom Selected */}
          {datePreset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                aria-label="Start date"
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
                aria-label="End date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 px-2 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {/* Branch Filter (Owner Only) */}
          {isOwner ? (
            <div className="flex items-center gap-2">
              <label htmlFor="branch-filter" className="text-label-sm font-label-sm text-on-surface-variant">
                Branch:
              </label>
              <div className="relative">
                <select
                  id="branch-filter"
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

          {/* Breakdown Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="breakdown-filter" className="text-label-sm font-label-sm text-on-surface-variant">
              Breakdown:
            </label>
            <div className="relative">
              <select
                id="breakdown-filter"
                aria-label="Breakdown aggregation type"
                value={breakdown}
                onChange={(e) => {
                  setBreakdown(e.target.value as any);
                  setPage(1);
                }}
                className="h-9 pl-3 pr-8 bg-surface-container-lowest border border-outline-variant rounded text-label-md font-label-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="day">By Day</option>
                {isOwner && <option value="branch">By Branch</option>}
                <option value="employee">By Employee</option>
                <option value="product">By Product</option>
                <option value="payment_method">By Payment Method</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-base">
                arrow_drop_down
              </span>
            </div>
          </div>
        </div>

        {/* Filter Action Buttons & Export */}
        <div className="flex items-center gap-2 shrink-0 self-end xl:self-auto">
          <button
            type="button"
            onClick={() => {
              handlePresetChange("month");
              setSelectedBranchId("");
              setBreakdown("day");
            }}
            className="h-9 px-3 bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-on-surface rounded text-label-md font-label-md transition-colors"
          >
            Reset
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-9 px-4 bg-primary text-on-primary rounded font-semibold text-label-md font-label-md hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export CSV</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg py-1 z-30">
                <button
                  type="button"
                  onClick={handleExportSummaryCsv}
                  className="w-full text-left px-3 py-2 text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-outline text-base">summarize</span>
                  <span>Export Summary</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportDetailedCsv}
                  className="w-full text-left px-3 py-2 text-body-sm text-on-surface hover:bg-surface-container flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-outline text-base">table_view</span>
                  <span>Export Breakdown</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div data-testid="reports-loading" className="p-12 text-center bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3"></div>
          <p className="text-body-md text-on-surface-variant font-medium">Aggregating authoritative report metrics...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 shadow-sm flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-rose-600 text-3xl mb-2">error</span>
          <h3 className="text-label-lg font-bold">Failed to load sales report</h3>
          <p className="text-body-sm mt-1 max-w-md">{(error as any)?.message || "An unexpected error occurred while fetching reports data."}</p>
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
          {/* 2. Key KPI Summary Cards (4 in a Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Net Revenue */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Total Net Sales</span>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <span className="material-symbols-outlined text-lg">payments</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight font-mono">
                  ETB {data.summary.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-body-sm font-body-sm text-on-surface-variant border-t border-outline-variant/60 pt-2.5">
                <span>Gross: ETB {data.summary.grossSales.toFixed(2)}</span>
                {data.summary.totalReturns > 0 && (
                  <span className="text-rose-700 font-semibold">• Returns: -ETB {data.summary.totalReturns.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* KPI 2: Sales Transactions */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Sales Transactions</span>
                <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/70">
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight font-mono">
                  {data.summary.totalTransactions}
                </span>
                <span className="text-body-sm font-body-sm text-on-surface-variant">completed sales</span>
              </div>
              <div className="mt-3 text-body-sm font-body-sm text-on-surface-variant border-t border-outline-variant/60 pt-2.5">
                {data.summary.totalUnitsSold} units sold total
              </div>
            </div>

            {/* KPI 3: Average Sale */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Average Sale</span>
                <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/70">
                  <span className="material-symbols-outlined text-lg">analytics</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight font-mono">
                  ETB {data.summary.averageSale.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="mt-3 text-body-sm font-body-sm text-on-surface-variant border-t border-outline-variant/60 pt-2.5">
                per completed transaction
              </div>
            </div>

            {/* KPI 4: Top Product */}
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-bento hover:shadow-bento-hover transition-all duration-200">
              <div className="flex items-center justify-between">
                <span className="text-label-md font-label-md text-on-surface-variant font-medium">Top Product</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200/70">
                  <span className="material-symbols-outlined text-lg">stars</span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-label-lg font-label-lg font-bold text-on-surface line-clamp-1">
                  {data.summary.topProduct?.productName || "No sales in range"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/60 pt-2.5">
                <span className="text-on-surface-variant">
                  {data.summary.topProduct ? `${data.summary.topProduct.unitsSold} ${data.summary.topProduct.unitName}s sold` : "0 sold"}
                </span>
                <span className="text-label-md font-label-md font-semibold text-primary font-mono">
                  ETB {data.summary.topProduct?.totalRevenue.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Visual Trend & Distribution Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales Trend Line Chart */}
            <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-bento flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-outline-variant/60">
                  <div>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">Sales Trend</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">Daily sales performance in Ethiopian Birr (ETB)</p>
                  </div>
                </div>

                {data.trend?.peakDay && (
                  <div className="mt-4 flex items-center justify-between text-body-sm font-body-sm">
                    <span className="text-on-surface-variant">{startDate} – {endDate}</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-label-sm font-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      Peak Day: {data.trend.peakDay.date} (ETB {data.trend.peakDay.totalSales.toFixed(2)})
                    </span>
                  </div>
                )}
              </div>

              {/* SVG Chart with Bento Depth and Interactive Hover Tooltip */}
              <div className="mt-4 w-full h-64 relative">
                {trendPoints.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-outline text-body-sm">
                    No trend data for selected date range
                  </div>
                ) : (
                  <>
                    {/* Floating Compact Tooltip */}
                    {hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex] && (
                      <div
                        className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-full pb-2 transition-all duration-150"
                        style={{
                          left: `${(pointsCoordinates[hoveredPointIndex].x / svgWidth) * 100}%`,
                          top: `${(pointsCoordinates[hoveredPointIndex].y / svgHeight) * 100}%`,
                        }}
                      >
                        <div className="bg-[#161C27] text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-pill whitespace-nowrap flex flex-col items-center">
                          <span className="font-bold font-mono">ETB {pointsCoordinates[hoveredPointIndex].p.totalSales.toFixed(2)}</span>
                          <span className="text-gray-400 text-[10px] mt-0.5">{pointsCoordinates[hoveredPointIndex].p.date} • {pointsCoordinates[hoveredPointIndex].p.transactionCount} {pointsCoordinates[hoveredPointIndex].p.transactionCount === 1 ? "sale" : "sales"}</span>
                          <div className="w-1.5 h-1.5 bg-[#161C27] rotate-45 -mb-2 mt-1"></div>
                        </div>
                      </div>
                    )}

                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                      <defs>
                        <linearGradient id="salesGradTab" x1="0%" x2="0%" y1="0%" y2="100%">
                          <stop offset="0%" stopColor="#0047FF" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#0047FF" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines */}
                      <g stroke="#E2E7EE" strokeDasharray="3 3" strokeWidth="1">
                        <line x1={paddingLeft} x2={svgWidth - paddingRight} y1={paddingTop} y2={paddingTop} />
                        <line x1={paddingLeft} x2={svgWidth - paddingRight} y1={paddingTop + usableHeight * 0.5} y2={paddingTop + usableHeight * 0.5} />
                        <line x1={paddingLeft} x2={svgWidth - paddingRight} y1={paddingTop + usableHeight} y2={paddingTop + usableHeight} />
                      </g>

                      {/* Y-Axis Labels */}
                      <g fill="#747688" fontSize="10" fontFamily="sans-serif">
                        <text x="5" y={paddingTop + 4}>{Math.round(maxTrendSale).toLocaleString()}</text>
                        <text x="5" y={paddingTop + usableHeight * 0.5 + 4}>{Math.round(maxTrendSale / 2).toLocaleString()}</text>
                        <text x="20" y={paddingTop + usableHeight + 4}>0</text>
                      </g>

                      {/* Gradient Area */}
                      <path d={areaPathD} fill="url(#salesGradTab)" />

                      {/* Trend Line */}
                      <path d={linePathD} fill="none" stroke="#0047FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Vertical Guideline when hovered */}
                      {hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex] && (
                        <line
                          x1={pointsCoordinates[hoveredPointIndex].x}
                          x2={pointsCoordinates[hoveredPointIndex].x}
                          y1={paddingTop}
                          y2={paddingTop + usableHeight}
                          stroke="#0047FF"
                          strokeDasharray="3 3"
                          strokeWidth="1.5"
                          strokeOpacity="0.6"
                        />
                      )}

                      {/* Data Points */}
                      {pointsCoordinates.map((coord, i) => {
                        const isHovered = hoveredPointIndex === i;
                        return (
                          <circle
                            key={i}
                            cx={coord.x}
                            cy={coord.y}
                            r={isHovered ? 6 : coord.p.totalSales > 0 ? 3.5 : 2}
                            fill={isHovered ? "#0047FF" : "#FFFFFF"}
                            stroke={isHovered ? "#FFFFFF" : "#0047FF"}
                            strokeWidth={isHovered ? 3 : 2}
                            className="transition-all duration-150"
                          />
                        );
                      })}

                      {/* Invisible Hover Hit Areas */}
                      {pointsCoordinates.map((coord, i) => {
                        const colWidth = usableWidth / Math.max(1, pointsCoordinates.length);
                        return (
                          <rect
                            key={`hit-${i}`}
                            x={coord.x - colWidth / 2}
                            y={paddingTop}
                            width={colWidth}
                            height={usableHeight}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPointIndex(i)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />
                        );
                      })}
                    </svg>
                  </>
                )}
              </div>
            </div>

            {/* Sales Distribution & Payment Methods Breakdown */}
            <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 shadow-bento flex flex-col justify-between">
              {/* Branch Breakdown (if multiple branches exist) */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
                  <div>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface font-bold">Sales by Branch</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">Regional performance breakdown</p>
                  </div>
                  <span className="text-label-sm font-label-sm bg-surface-container-high px-2.5 py-1 rounded-lg text-on-surface font-medium">
                    {data.salesByBranch.length} Branches
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {data.salesByBranch.map((b) => (
                    <div key={b.branchId}>
                      <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                          <span className="font-semibold text-on-surface">{b.branchName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-on-surface font-mono">ETB {b.totalSales.toFixed(2)}</span>
                          <span className="text-label-sm text-outline ml-1 font-mono">({b.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${b.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Breakdown */}
              <div className="mt-6 pt-4 border-t border-outline-variant/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label-md font-label-md font-bold text-on-surface">Payment Method Breakdown</span>
                  <span className="text-label-sm font-label-sm text-outline font-medium">Net collections</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-label-sm font-label-sm mt-3">
                  {data.paymentMethodBreakdown.map((pm) => (
                    <div key={pm.paymentMethodId} className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
                      <span className="text-on-surface-variant block truncate">{pm.paymentMethodName}</span>
                      <span className="font-bold text-on-surface block mt-1 font-mono">ETB {pm.netAmount.toFixed(2)}</span>
                      <span className="text-xs text-outline block mt-0.5 font-mono">{pm.percentage}% • {pm.transactionCount} txns</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Detailed Breakdown Table Card */}
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl shadow-bento overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant">
              <div>
                <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Detailed Sales Summary</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Aggregation by <span className="font-semibold capitalize">{breakdown.replace("_", " ")}</span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    {breakdown === "day" && <th className="py-3 px-4 font-semibold">Date</th>}
                    {breakdown === "branch" && <th className="py-3 px-4 font-semibold">Branch</th>}
                    {breakdown === "employee" && <th className="py-3 px-4 font-semibold">Employee</th>}
                    {breakdown === "product" && <th className="py-3 px-4 font-semibold">Product</th>}
                    {breakdown === "payment_method" && <th className="py-3 px-4 font-semibold">Payment Method</th>}

                    {breakdown === "product" && <th className="py-3 px-4 font-semibold">SKU / Category</th>}
                    {breakdown === "product" && <th className="py-3 px-4 font-semibold text-right">Units Sold</th>}
                    {breakdown === "payment_method" && <th className="py-3 px-4 font-semibold text-right">Received</th>}
                    {breakdown === "payment_method" && <th className="py-3 px-4 font-semibold text-right">Refunded</th>}

                    <th className="py-3 px-4 font-semibold text-right">Transactions</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Net Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60 text-body-sm font-body-sm text-on-surface">
                  {data.detailedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-outline">
                        No sales records found matching the active filters.
                      </td>
                    </tr>
                  ) : (
                    data.detailedRecords.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-surface-container-low/70 transition-colors">
                        {breakdown === "day" && <td className="py-3 px-4 font-medium">{r.date}</td>}
                        {breakdown === "branch" && <td className="py-3 px-4 font-medium">{r.branchName}</td>}
                        {breakdown === "employee" && <td className="py-3 px-4 font-medium">{r.employeeName}</td>}
                        {breakdown === "product" && <td className="py-3 px-4 font-medium">{r.productName}</td>}
                        {breakdown === "payment_method" && <td className="py-3 px-4 font-medium">{r.paymentMethodName}</td>}

                        {breakdown === "product" && (
                          <td className="py-3 px-4 text-outline font-mono text-xs">
                            {r.sku} • {r.categoryName}
                          </td>
                        )}
                        {breakdown === "product" && <td className="py-3 px-4 text-right font-medium">{r.quantitySold}</td>}
                        {breakdown === "payment_method" && <td className="py-3 px-4 text-right">ETB {r.receivedAmount.toFixed(2)}</td>}
                        {breakdown === "payment_method" && (
                          <td className="py-3 px-4 text-right text-rose-700">
                            {r.refundedAmount > 0 ? `-ETB ${r.refundedAmount.toFixed(2)}` : "ETB 0.00"}
                          </td>
                        )}

                        <td className="py-3 px-4 text-right font-medium">{r.salesCount ?? r.transactionCount ?? "—"}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">
                          ETB {(r.totalSales ?? r.totalRevenue ?? r.netAmount).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
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
