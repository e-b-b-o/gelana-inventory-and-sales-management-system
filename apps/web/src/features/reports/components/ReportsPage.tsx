import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/api/auth";
import { useBranches } from "../../branches/api";
import { SalesReportsTab } from "./SalesReportsTab";
import { InventoryReportsTab } from "./InventoryReportsTab";
import { ProfitReportsTab } from "./ProfitReportsTab";
import { ClosingReportsTab } from "./ClosingReportsTab";

export type ReportTab = "sales" | "inventory" | "profit" | "closing";

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");

  // User session
  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });
  const user = meData?.user;
  const isOwner = user?.role === "OWNER";

  // Branches list for filter dropdown (Owner only)
  const { data: branchesData = [] } = useBranches({ enabled: isOwner });

  // Guard against non-owner accessing profit tab
  const currentTab: ReportTab = !isOwner && activeTab === "profit" ? "sales" : activeTab;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-outline-variant/60">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Reports</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-0.5">
            Review sales, inventory balances & movements, profitability, and daily closing performance.
          </p>
        </div>
      </div>

      {/* 2. Report Navigation: Segmented Control Tabs */}
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-2 shadow-bento">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isOwner ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-2`}>
          {/* Tab 1: Sales Reports */}
          <button
            type="button"
            onClick={() => setActiveTab("sales")}
            className={`flex flex-col items-start p-3.5 rounded-xl text-left transition-all duration-200 ${
              currentTab === "sales"
                ? "bg-primary text-on-primary shadow-xs"
                : "hover:bg-surface-container-low text-on-surface"
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTab === "sales" ? "text-on-primary" : "text-outline"
                }`}
                style={currentTab === "sales" ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                point_of_sale
              </span>
              <span className="text-label-lg font-label-lg font-bold">Sales Reports</span>
              {currentTab === "sales" && <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-xs" />}
            </div>
            <span
              className={`text-body-sm font-body-sm mt-1 ${
                currentTab === "sales" ? "text-white/90" : "text-on-surface-variant"
              }`}
            >
              Sales performance, trends & payment channels.
            </span>
          </button>

          {/* Tab 2: Inventory Reports */}
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`flex flex-col items-start p-3.5 rounded-xl text-left transition-all duration-200 ${
              currentTab === "inventory"
                ? "bg-primary text-on-primary shadow-xs"
                : "hover:bg-surface-container-low text-on-surface"
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTab === "inventory" ? "text-on-primary" : "text-outline"
                }`}
                style={currentTab === "inventory" ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                inventory_2
              </span>
              <span className="text-label-lg font-label-lg font-bold">Inventory Reports</span>
              {currentTab === "inventory" && <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-xs" />}
            </div>
            <span
              className={`text-body-sm font-body-sm mt-1 ${
                currentTab === "inventory" ? "text-white/90" : "text-on-surface-variant"
              }`}
            >
              Stock balances, ledger movements & transfers.
            </span>
          </button>

          {/* Tab 3: Profit Reports (Owner Only) */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setActiveTab("profit")}
              className={`flex flex-col items-start p-3.5 rounded-xl text-left transition-all duration-200 ${
                currentTab === "profit"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "hover:bg-surface-container-low text-on-surface"
              }`}
            >
              <div className="flex items-center gap-2 w-full">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    currentTab === "profit" ? "text-on-primary" : "text-outline"
                  }`}
                  style={currentTab === "profit" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  trending_up
                </span>
                <span className="text-label-lg font-label-lg font-bold">Profit Reports</span>
                {currentTab === "profit" && <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-xs" />}
              </div>
              <span
                className={`text-body-sm font-body-sm mt-1 ${
                  currentTab === "profit" ? "text-white/90" : "text-on-surface-variant"
                }`}
              >
                Gross profit & margin from historical WAC.
              </span>
            </button>
          )}

          {/* Tab 4: Closing Reports */}
          <button
            type="button"
            onClick={() => setActiveTab("closing")}
            className={`flex flex-col items-start p-3.5 rounded-xl text-left transition-all duration-200 ${
              currentTab === "closing"
                ? "bg-primary text-on-primary shadow-xs"
                : "hover:bg-surface-container-low text-on-surface"
            }`}
          >
            <div className="flex items-center gap-2 w-full">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  currentTab === "closing" ? "text-on-primary" : "text-outline"
                }`}
                style={currentTab === "closing" ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                lock_clock
              </span>
              <span className="text-label-lg font-label-lg font-bold">Closing Reports</span>
              {currentTab === "closing" && <span className="ml-auto w-2 h-2 rounded-full bg-white shadow-xs" />}
            </div>
            <span
              className={`text-body-sm font-body-sm mt-1 ${
                currentTab === "closing" ? "text-white/90" : "text-on-surface-variant"
              }`}
            >
              Daily closing logs, cash variance & audit review.
            </span>
          </button>
        </div>
      </div>

      {/* 3. Active Tab Content */}
      {currentTab === "sales" && (
        <SalesReportsTab isOwner={isOwner ?? false} branchesData={branchesData} />
      )}

      {currentTab === "inventory" && (
        <InventoryReportsTab isOwner={isOwner ?? false} branchesData={branchesData} />
      )}

      {currentTab === "profit" && isOwner && (
        <ProfitReportsTab branchesData={branchesData} />
      )}

      {currentTab === "closing" && (
        <ClosingReportsTab isOwner={isOwner ?? false} branchesData={branchesData} />
      )}
    </div>
  );
}
