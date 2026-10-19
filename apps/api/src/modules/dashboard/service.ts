import { sql, eq, and, desc, gte, lte, or, asc } from "drizzle-orm";
import { db } from "../../config/database.js";
import {
  branches,
  sales,
  inventoryBalances,
  transfers,
  dailyClosings,
  receivings,
  salesReturns,
} from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import { GetOwnerDashboardQuery, GetEmployeeDashboardQuery } from "./schema.js";

// Helper: formats a Date to YYYY-MM-DD
function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export class DashboardService {
  /**
   * Slice 10.1 — Owner Dashboard
   * Aggregates authoritative business-wide metrics or filtered by branch.
   */
  static async getOwnerDashboard(query: GetOwnerDashboardQuery) {
    const today = new Date();
    const todayStr = toDateString(today);
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const { branchId, trendRange } = query;

    // 1. Validate branch if supplied
    let branchName = "All Branches";
    if (branchId) {
      const branchRecord = await db.query.branches.findFirst({
        where: eq(branches.id, branchId),
      });
      if (!branchRecord) {
        throw new AppError("Branch not found", 404, "NOT_FOUND");
      }
      branchName = branchRecord.name;
    }

    // 2. Fetch all active branches
    const allBranches = await db.query.branches.findMany({
      where: eq(branches.isActive, true),
      orderBy: [branches.name],
    });

    // 3. Sales KPI: Today's completed sales aggregated in PostgreSQL
    const salesFilter = and(
      eq(sales.status, "COMPLETED"),
      gte(sales.soldAt, startOfToday.toISOString()),
      lte(sales.soldAt, endOfToday.toISOString()),
      branchId ? eq(sales.branchId, branchId) : undefined
    );

    const [salesKpi] = await db
      .select({
        todaySalesTotal: sql<string>`COALESCE(SUM(${sales.grandTotal}), 0)`,
        todayTransactionsCount: sql<number>`COUNT(*)::int`,
      })
      .from(sales)
      .where(salesFilter);

    const todaySalesTotal = Number(salesKpi?.todaySalesTotal || 0);
    const todayTransactionsCount = Number(salesKpi?.todayTransactionsCount || 0);

    // Sales aggregated per branch for branch performance overview
    const branchSalesAgg = await db
      .select({
        branchId: sales.branchId,
        salesAmount: sql<string>`COALESCE(SUM(${sales.grandTotal}), 0)`,
        transactionCount: sql<number>`COUNT(*)::int`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.status, "COMPLETED"),
          gte(sales.soldAt, startOfToday.toISOString()),
          lte(sales.soldAt, endOfToday.toISOString()),
          branchId ? eq(sales.branchId, branchId) : undefined
        )
      )
      .groupBy(sales.branchId);

    const salesByBranchMap = new Map<string, { amount: number; count: number }>();
    branchSalesAgg.forEach((r) => {
      salesByBranchMap.set(r.branchId, {
        amount: Number(r.salesAmount),
        count: Number(r.transactionCount),
      });
    });

    // 4. Inventory Valuation & Thresholds KPI aggregated directly in PostgreSQL
    const branchBalancesAgg = await db
      .select({
        branchId: inventoryBalances.branchId,
        valuation: sql<string>`COALESCE(SUM(CASE WHEN ${inventoryBalances.availableQuantity} > 0 THEN ${inventoryBalances.availableQuantity} * ${inventoryBalances.wac} ELSE 0 END), 0)`,
        outOfStockCount: sql<number>`COUNT(CASE WHEN ${inventoryBalances.availableQuantity} <= 0 THEN 1 END)::int`,
        lowStockCount: sql<number>`COUNT(CASE WHEN ${inventoryBalances.availableQuantity} > 0 AND ${inventoryBalances.availableQuantity} <= ${inventoryBalances.minimumStockQuantity} THEN 1 END)::int`,
      })
      .from(inventoryBalances)
      .where(branchId ? eq(inventoryBalances.branchId, branchId) : undefined)
      .groupBy(inventoryBalances.branchId);

    let inventoryValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const lowStockBranchMap = new Map<string, number>();
    const outOfStockBranchMap = new Map<string, number>();
    const balanceByBranchMap = new Map<string, { low: number; out: number }>();

    const branchNameLookup = new Map<string, string>();
    allBranches.forEach((b) => branchNameLookup.set(b.id, b.name));

    for (const b of branchBalancesAgg) {
      inventoryValuation += Number(b.valuation);
      lowStockCount += b.lowStockCount;
      outOfStockCount += b.outOfStockCount;

      balanceByBranchMap.set(b.branchId, {
        low: b.lowStockCount,
        out: b.outOfStockCount,
      });

      const bName = branchNameLookup.get(b.branchId) || "Branch";
      if (b.lowStockCount > 0) {
        lowStockBranchMap.set(bName, b.lowStockCount);
      }
      if (b.outOfStockCount > 0) {
        outOfStockBranchMap.set(bName, b.outOfStockCount);
      }
    }

    // Impacted branches summary string
    const impactedBranches = new Set([
      ...lowStockBranchMap.keys(),
      ...outOfStockBranchMap.keys(),
    ]);
    const impactedSummary =
      impactedBranches.size > 0
        ? Array.from(impactedBranches).join(" & ") + " Impacted"
        : "All branches normal";

    // 5. Level 1: Action Required — Critical Discrepancies & Transfer Approvals
    // 5a. Critical Closings: Closings that are SUBMITTED or have non-zero variance
    const closingFilter = branchId
      ? and(
          eq(dailyClosings.branchId, branchId),
          or(
            eq(dailyClosings.status, "SUBMITTED"),
            sql`ABS(COALESCE(${dailyClosings.cashDifference}, 0)) > 0`
          )
        )
      : or(
          eq(dailyClosings.status, "SUBMITTED"),
          sql`ABS(COALESCE(${dailyClosings.cashDifference}, 0)) > 0`
        );

    const pendingOrDiscrepantClosings = await db.query.dailyClosings.findMany({
      where: closingFilter,
      with: {
        branch: true,
      },
      orderBy: [desc(dailyClosings.createdAt)],
      limit: 10,
    });

    const closingDiscrepancyItems = pendingOrDiscrepantClosings.map((c) => ({
      closingId: c.id,
      closingNumber: c.closingNumber,
      branchId: c.branchId,
      branchName: c.branch.name,
      closingDate: c.closingDate,
      expectedCash: Number(c.expectedCash),
      actualCash: c.actualCash !== null ? Number(c.actualCash) : null,
      cashDifference: c.cashDifference !== null ? Number(c.cashDifference) : 0,
      status: c.status,
      discrepancyReason: c.discrepancyReason,
      submittedAt: c.submittedAt,
    }));

    // 5b. Transfer Approvals: transfers with status 'REQUESTED'
    const transferFilter = and(
      eq(transfers.status, "REQUESTED"),
      branchId
        ? or(
            eq(transfers.sourceBranchId, branchId),
            eq(transfers.destinationBranchId, branchId)
          )
        : undefined
    );

    const pendingTransfers = await db.query.transfers.findMany({
      where: transferFilter,
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(transfers.createdAt)],
      limit: 10,
    });

    // Fetch branch names for transfers
    const branchNameMap = new Map<string, string>();
    allBranches.forEach((b) => branchNameMap.set(b.id, b.name));

    const transferApprovalItems = pendingTransfers.map((t) => {
      const topItem = t.items[0];
      const summaryText = topItem
        ? `${branchNameMap.get(t.sourceBranchId) || "Source"} → ${branchNameMap.get(t.destinationBranchId) || "Destination"} (${topItem.product.name} • ${topItem.requestedQuantity} units)`
        : `${branchNameMap.get(t.sourceBranchId) || "Source"} → ${branchNameMap.get(t.destinationBranchId) || "Destination"}`;

      return {
        transferId: t.id,
        transferNumber: t.transferNumber,
        sourceBranchName: branchNameMap.get(t.sourceBranchId) || "Source",
        destinationBranchName: branchNameMap.get(t.destinationBranchId) || "Destination",
        itemsCount: t.items.length,
        summary: summaryText,
        createdAt: t.createdAt,
      };
    });

    // 6. Level 3: Multi-Branch Performance Overview Table
    // Today's closings for each branch
    const todaysClosings = await db.query.dailyClosings.findMany({
      where: eq(dailyClosings.closingDate, todayStr),
    });
    const closingByBranchMap = new Map<string, typeof todaysClosings[0]>();
    todaysClosings.forEach((c) => closingByBranchMap.set(c.branchId, c));

    // Branch performance rows
    const branchesToShow = branchId
      ? allBranches.filter((b) => b.id === branchId)
      : allBranches;

    const branchPerformance = branchesToShow.map((b) => {
      const salesInfo = salesByBranchMap.get(b.id) || { amount: 0, count: 0 };
      const balInfo = balanceByBranchMap.get(b.id) || { low: 0, out: 0 };
      const closing = closingByBranchMap.get(b.id);
      const closingStatus = closing
        ? (closing.status as "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED")
        : "NOT_SUBMITTED";

      return {
        branchId: b.id,
        branchName: b.name,
        branchCode: b.code,
        todaySales: salesInfo.amount,
        todayTransactions: salesInfo.count,
        lowStockCount: balInfo.low,
        outOfStockCount: balInfo.out,
        closingStatus,
        closingDiscrepancy: closing?.cashDifference ? Number(closing.cashDifference) : null,
        closingId: closing?.id || null,
      };
    });

    // 7. Level 4: Sales Trend
    // Generate intervals based on trendRange: "today" (hourly), "7days" (daily), "month" (daily)
    let intervals: Array<{ label: string; salesAmount: number; transactionCount: number }> = [];

    if (trendRange === "today") {
      // Hourly intervals 09:00 through 18:00
      const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
      const hourMap = new Map<number, { amount: number; count: number }>();
      hours.forEach((h) => hourMap.set(h, { amount: 0, count: 0 }));

      const hourlySales = await db
        .select({
          hour: sql<number>`EXTRACT(HOUR FROM ${sales.soldAt}::timestamptz)::int`,
          salesAmount: sql<string>`COALESCE(SUM(${sales.grandTotal}), 0)`,
          transactionCount: sql<number>`COUNT(*)::int`,
        })
        .from(sales)
        .where(salesFilter)
        .groupBy(sql`EXTRACT(HOUR FROM ${sales.soldAt}::timestamptz)`);

      for (const hRow of hourlySales) {
        if (hourMap.has(hRow.hour)) {
          hourMap.set(hRow.hour, {
            amount: Number(hRow.salesAmount),
            count: hRow.transactionCount,
          });
        }
      }

      intervals = hours.map((h) => {
        const val = hourMap.get(h)!;
        return {
          label: `${String(h).padStart(2, "0")}:00`,
          salesAmount: Math.round(val.amount * 100) / 100,
          transactionCount: val.count,
        };
      });
    } else if (trendRange === "7days") {
      // Last 7 days daily intervals
      const dayMap = new Map<string, { label: string; amount: number; count: number }>();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = toDateString(d);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dayMap.set(dStr, { label, amount: 0, count: 0 });
      }

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const past7Sales = await db
        .select({
          dayStr: sql<string>`TO_CHAR(${sales.soldAt}::timestamptz, 'YYYY-MM-DD')`,
          salesAmount: sql<string>`COALESCE(SUM(${sales.grandTotal}), 0)`,
          transactionCount: sql<number>`COUNT(*)::int`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.status, "COMPLETED"),
            gte(sales.soldAt, sevenDaysAgo.toISOString()),
            lte(sales.soldAt, endOfToday.toISOString()),
            branchId ? eq(sales.branchId, branchId) : undefined
          )
        )
        .groupBy(sql`TO_CHAR(${sales.soldAt}::timestamptz, 'YYYY-MM-DD')`);

      for (const s of past7Sales) {
        if (dayMap.has(s.dayStr)) {
          const curr = dayMap.get(s.dayStr)!;
          curr.amount = Number(s.salesAmount);
          curr.count = s.transactionCount;
        }
      }

      intervals = Array.from(dayMap.values()).map((v) => ({
        label: v.label,
        salesAmount: Math.round(v.amount * 100) / 100,
        transactionCount: v.count,
      }));
    } else {
      // This Month daily intervals
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const dayMap = new Map<string, { label: string; amount: number; count: number }>();
      const temp = new Date(startOfMonth);
      while (temp <= endOfToday) {
        const dStr = toDateString(temp);
        const label = temp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dayMap.set(dStr, { label, amount: 0, count: 0 });
        temp.setDate(temp.getDate() + 1);
      }

      const monthSales = await db
        .select({
          dayStr: sql<string>`TO_CHAR(${sales.soldAt}::timestamptz, 'YYYY-MM-DD')`,
          salesAmount: sql<string>`COALESCE(SUM(${sales.grandTotal}), 0)`,
          transactionCount: sql<number>`COUNT(*)::int`,
        })
        .from(sales)
        .where(
          and(
            eq(sales.status, "COMPLETED"),
            gte(sales.soldAt, startOfMonth.toISOString()),
            lte(sales.soldAt, endOfToday.toISOString()),
            branchId ? eq(sales.branchId, branchId) : undefined
          )
        )
        .groupBy(sql`TO_CHAR(${sales.soldAt}::timestamptz, 'YYYY-MM-DD')`);

      for (const s of monthSales) {
        if (dayMap.has(s.dayStr)) {
          const curr = dayMap.get(s.dayStr)!;
          curr.amount = Number(s.salesAmount);
          curr.count = s.transactionCount;
        }
      }

      intervals = Array.from(dayMap.values()).map((v) => ({
        label: v.label,
        salesAmount: Math.round(v.amount * 100) / 100,
        transactionCount: v.count,
      }));
    }

    let trendTotal = 0;
    let peakLabel: string | null = null;
    let peakAmount = 0;
    for (const item of intervals) {
      trendTotal += item.salesAmount;
      if (item.salesAmount > peakAmount) {
        peakAmount = item.salesAmount;
        peakLabel = item.label;
      }
    }

    // 8. Recent Business Activity (last 10 items across sales, receivings, transfers, closings, returns)
    type ActivityItem = {
      id: string;
      type: "SALE" | "RECEIVING" | "TRANSFER" | "CLOSING" | "RETURN";
      referenceNumber: string;
      title: string;
      branchName: string;
      timestamp: string;
      amount: number | null;
      subtitle: string;
      badgeText?: string | null;
    };

    const activities: ActivityItem[] = [];

    // Recent 5 sales
    const recentSales = await db.query.sales.findMany({
      where: and(
        eq(sales.status, "COMPLETED"),
        branchId ? eq(sales.branchId, branchId) : undefined
      ),
      with: {
        branch: true,
      },
      orderBy: [desc(sales.soldAt)],
      limit: 5,
    });
    for (const s of recentSales) {
      activities.push({
        id: s.id,
        type: "SALE",
        referenceNumber: s.saleNumber,
        title: `${s.saleNumber} recorded`,
        branchName: s.branch.name,
        timestamp: s.soldAt,
        amount: Number(s.grandTotal),
        subtitle: `${s.branch.name}`,
      });
    }

    // Recent 5 receivings
    const recentReceivings = await db.query.receivings.findMany({
      where: branchId ? eq(receivings.branchId, branchId) : undefined,
      with: {
        branch: true,
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(receivings.createdAt)],
      limit: 5,
    });
    for (const r of recentReceivings) {
      const firstItem = r.items[0];
      activities.push({
        id: r.id,
        type: "RECEIVING",
        referenceNumber: r.receivingNumber,
        title: `${r.receivingNumber} received`,
        branchName: r.branch.name,
        timestamp: r.createdAt,
        amount: null,
        subtitle: firstItem
          ? `${firstItem.product.name} • ${r.branch.name}`
          : r.branch.name,
        badgeText: firstItem ? `${firstItem.quantity} units` : null,
      });
    }

    // Recent 5 transfers
    const recentTransfers = await db.query.transfers.findMany({
      where: branchId
        ? or(
            eq(transfers.sourceBranchId, branchId),
            eq(transfers.destinationBranchId, branchId)
          )
        : undefined,
      orderBy: [desc(transfers.createdAt)],
      limit: 5,
    });
    for (const t of recentTransfers) {
      const srcName = branchNameMap.get(t.sourceBranchId) || "Branch";
      const dstName = branchNameMap.get(t.destinationBranchId) || "Branch";
      activities.push({
        id: t.id,
        type: "TRANSFER",
        referenceNumber: t.transferNumber,
        title: `${t.transferNumber} (${t.status.toLowerCase()})`,
        branchName: srcName,
        timestamp: t.createdAt,
        amount: null,
        subtitle: `${srcName} → ${dstName}`,
        badgeText: t.status,
      });
    }

    // Recent 5 closings
    const recentClosings = await db.query.dailyClosings.findMany({
      where: branchId ? eq(dailyClosings.branchId, branchId) : undefined,
      with: {
        branch: true,
      },
      orderBy: [desc(dailyClosings.createdAt)],
      limit: 5,
    });
    for (const c of recentClosings) {
      activities.push({
        id: c.id,
        type: "CLOSING",
        referenceNumber: c.closingNumber,
        title: `${c.closingNumber} ${c.status.toLowerCase()}`,
        branchName: c.branch.name,
        timestamp: c.submittedAt || c.createdAt,
        amount: c.actualCash !== null ? Number(c.actualCash) : Number(c.expectedCash),
        subtitle: `${c.branch.name} • Discrepancy: ${Number(c.cashDifference || 0).toFixed(2)}`,
        badgeText: c.status,
      });
    }

    // Recent 5 returns
    const recentReturns = await db.query.salesReturns.findMany({
      where: branchId ? eq(salesReturns.branchId, branchId) : undefined,
      with: {
        branch: true,
        items: {
          with: {
            product: true,
          },
        },
      },
      orderBy: [desc(salesReturns.returnedAt)],
      limit: 5,
    });
    for (const ret of recentReturns) {
      const topItem = ret.items[0];
      activities.push({
        id: ret.id,
        type: "RETURN",
        referenceNumber: ret.returnNumber,
        title: `${ret.returnNumber} recorded`,
        branchName: ret.branch.name,
        timestamp: ret.returnedAt,
        amount: Number(ret.refundAmount),
        subtitle: topItem
          ? `${ret.branch.name} • ${topItem.product.name}`
          : ret.branch.name,
        badgeText: topItem ? topItem.condition : null,
      });
    }

    // Sort combined activities descending by timestamp and take top 10
    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const topActivities = activities.slice(0, 10);

    return {
      branchId: branchId || null,
      branchName,
      businessDate: todayStr,
      kpis: {
        todaySales: Math.round(todaySalesTotal * 100) / 100,
        todayTransactions: todayTransactionsCount,
        inventoryValuation: Math.round(inventoryValuation * 100) / 100,
        lowStockCount,
        outOfStockCount,
      },
      actionRequired: {
        closingDiscrepancy: {
          count: closingDiscrepancyItems.length,
          items: closingDiscrepancyItems,
        },
        transferApprovals: {
          count: transferApprovalItems.length,
          items: transferApprovalItems,
        },
        stockThresholds: {
          lowStockCount,
          outOfStockCount,
          impactedBranchesSummary: impactedSummary,
        },
      },
      branchPerformance,
      salesTrend: {
        range: trendRange,
        intervals,
        totalAmount: Math.round(trendTotal * 100) / 100,
        peakLabel,
        peakAmount: Math.round(peakAmount * 100) / 100,
      },
      recentActivities: topActivities,
    };
  }

  /**
   * Slice 10.2 — Employee Dashboard
   * Branch-scoped operational overview strictly omitting purchase cost, WAC, and gross profit.
   */
  static async getEmployeeDashboard(
    query: GetEmployeeDashboardQuery,
    user: { id: string; role: string; branchId: string | null }
  ) {
    const today = new Date();
    const todayStr = toDateString(today);
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Determine and strictly validate branch scope
    let branchId = user.branchId;

    if (user.role === "OWNER") {
      // Owner previewing employee dashboard for a branch
      if (query.branchId) {
        branchId = query.branchId;
      } else {
        const firstBranch = await db.query.branches.findFirst({
          where: eq(branches.isActive, true),
        });
        branchId = firstBranch?.id || null;
      }
    } else {
      // Employee: strictly locked to user's assigned branch
      if (query.branchId && query.branchId !== user.branchId) {
        throw new AppError(
          "You do not have permission to access another branch's dashboard",
          403,
          "AUTHORIZATION_ERROR"
        );
      }
      if (!branchId) {
        throw new AppError(
          "Employee is not assigned to a branch",
          400,
          "NO_BRANCH_ASSIGNED"
        );
      }
    }

    if (!branchId) {
      throw new AppError("No branch found", 404, "NOT_FOUND");
    }

    const branch = await db.query.branches.findFirst({
      where: eq(branches.id, branchId),
    });
    if (!branch) {
      throw new AppError("Branch not found", 404, "NOT_FOUND");
    }

    // 2. Today's Branch Sales & Employee's Own Sales (No costs/profit!)
    const [salesKpi] = await db
      .select({
        branchSales: sql<string>`COALESCE(SUM(${sales.grandTotal}), 0)`,
        branchTransactions: sql<number>`COUNT(*)::int`,
        ownSales: sql<string>`COALESCE(SUM(CASE WHEN ${sales.createdById} = ${user.id} THEN ${sales.grandTotal} ELSE 0 END), 0)`,
        ownTransactions: sql<number>`COUNT(CASE WHEN ${sales.createdById} = ${user.id} THEN 1 END)::int`,
      })
      .from(sales)
      .where(
        and(
          eq(sales.branchId, branchId),
          eq(sales.status, "COMPLETED"),
          gte(sales.soldAt, startOfToday.toISOString()),
          lte(sales.soldAt, endOfToday.toISOString())
        )
      );

    const todayBranchSales = Number(salesKpi?.branchSales || 0);
    const todayBranchTransactions = Number(salesKpi?.branchTransactions || 0);
    const todayOwnSales = Number(salesKpi?.ownSales || 0);
    const todayOwnTransactions = Number(salesKpi?.ownTransactions || 0);

    // 3. Branch Inventory Alerts (Zero cost, Zero WAC!)
    const [stockCounts] = await db
      .select({
        outOfStockCount: sql<number>`COUNT(CASE WHEN ${inventoryBalances.availableQuantity} <= 0 THEN 1 END)::int`,
        lowStockCount: sql<number>`COUNT(CASE WHEN ${inventoryBalances.availableQuantity} > 0 AND ${inventoryBalances.availableQuantity} <= ${inventoryBalances.minimumStockQuantity} THEN 1 END)::int`,
      })
      .from(inventoryBalances)
      .where(eq(inventoryBalances.branchId, branchId));

    const lowStockCount = Number(stockCounts?.lowStockCount || 0);
    const outOfStockCount = Number(stockCounts?.outOfStockCount || 0);

    const alertBalances = await db.query.inventoryBalances.findMany({
      where: and(
        eq(inventoryBalances.branchId, branchId),
        lte(inventoryBalances.availableQuantity, inventoryBalances.minimumStockQuantity)
      ),
      with: {
        product: {
          with: {
            category: true,
          },
        },
      },
      orderBy: [
        asc(inventoryBalances.availableQuantity),
      ],
      limit: 50,
    });

    const stockAlerts = alertBalances.map((b) => ({
      productId: b.productId,
      productName: b.product.name,
      sku: b.product.sku,
      categoryName: b.product.category?.name || "General",
      availableQuantity: b.availableQuantity,
      minimumStockQuantity: b.minimumStockQuantity,
      status: (b.availableQuantity <= 0 ? "OUT_OF_STOCK" : "LOW_STOCK") as "OUT_OF_STOCK" | "LOW_STOCK",
    }));

    // Sort alerts: OUT_OF_STOCK first, then LOW_STOCK
    stockAlerts.sort((a, b) => {
      if (a.status === "OUT_OF_STOCK" && b.status !== "OUT_OF_STOCK") return -1;
      if (a.status !== "OUT_OF_STOCK" && b.status === "OUT_OF_STOCK") return 1;
      return a.availableQuantity - b.availableQuantity;
    });

    // 4. Daily Closing Status for today at this branch
    const todaysClosing = await db.query.dailyClosings.findFirst({
      where: and(
        eq(dailyClosings.branchId, branchId),
        eq(dailyClosings.closingDate, todayStr)
      ),
    });

    let nextAction = "Submit Daily Closing at end of trading day";
    if (todaysClosing) {
      if (todaysClosing.status === "SUBMITTED") {
        nextAction = "Awaiting Owner review and approval";
      } else if (todaysClosing.status === "APPROVED") {
        nextAction = "Daily Closing approved. Trading day locked.";
      } else if (todaysClosing.status === "REJECTED") {
        nextAction = "Closing rejected by Owner. Corrections required before resubmission.";
      }
    }

    const dailyClosingInfo = {
      closingId: todaysClosing?.id || null,
      closingNumber: todaysClosing?.closingNumber || null,
      status: (todaysClosing?.status as "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED") || "NOT_SUBMITTED",
      expectedCash: todaysClosing ? Number(todaysClosing.expectedCash) : 0,
      actualCash: todaysClosing?.actualCash !== null && todaysClosing?.actualCash !== undefined
        ? Number(todaysClosing.actualCash)
        : null,
      cashDifference: todaysClosing?.cashDifference !== null && todaysClosing?.cashDifference !== undefined
        ? Number(todaysClosing.cashDifference)
        : null,
      nextAction,
      rejectionReason: todaysClosing?.rejectionReason || null,
    };

    // 5. Pending Transfers relevant to this branch
    // Dispatched inbound transfers waiting for receipt
    const inboundDispatched = await db.query.transfers.findMany({
      where: and(
        eq(transfers.destinationBranchId, branchId),
        eq(transfers.status, "DISPATCHED")
      ),
      with: {
        items: true,
      },
      orderBy: [desc(transfers.dispatchedAt)],
      limit: 5,
    });

    const allBranchList = await db.query.branches.findMany();
    const branchNameMap = new Map<string, string>();
    allBranchList.forEach((b) => branchNameMap.set(b.id, b.name));

    const pendingTransferItems = inboundDispatched.map((t) => ({
      transferId: t.id,
      transferNumber: t.transferNumber,
      sourceBranchName: branchNameMap.get(t.sourceBranchId) || "Source Branch",
      status: t.status,
      createdAt: t.createdAt,
      dispatchedAt: t.dispatchedAt,
      itemsCount: t.items.length,
    }));

    // 6. Recent Sales at Branch (top 10)
    const recentBranchSales = await db.query.sales.findMany({
      where: and(
        eq(sales.branchId, branchId),
        eq(sales.status, "COMPLETED")
      ),
      with: {
        createdBy: true,
      },
      orderBy: [desc(sales.soldAt)],
      limit: 10,
    });

    const recentSales = recentBranchSales.map((s) => ({
      id: s.id,
      saleNumber: s.saleNumber,
      soldAt: s.soldAt,
      cashierName: s.createdBy?.name || "Cashier",
      isOwnSale: s.createdById === user.id,
      grandTotal: Number(s.grandTotal),
      status: s.status,
    }));

    return {
      branchId,
      branchName: branch.name,
      branchCode: branch.code,
      businessDate: todayStr,
      kpis: {
        todayBranchSales: Math.round(todayBranchSales * 100) / 100,
        todayBranchTransactions,
        todayOwnSales: Math.round(todayOwnSales * 100) / 100,
        todayOwnTransactions,
        lowStockCount,
        outOfStockCount,
      },
      dailyClosing: dailyClosingInfo,
      pendingTransfers: {
        inboundDispatchedCount: inboundDispatched.length,
        items: pendingTransferItems,
      },
      recentSales,
      stockAlerts,
    };
  }
}
