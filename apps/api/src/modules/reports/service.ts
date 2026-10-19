import { eq, and, desc, gte, lte, sql, gt, inArray } from "drizzle-orm";
import { db } from "../../config/database.js";
import {
  branches,
  sales,
  salesReturns,
  paymentMethods,
  inventoryBalances,
  inventoryMovements,
  transfers,
  dailyClosings,
  dailyClosingEvents,
  products,
} from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import {
  GetSalesReportInput,
  GetInventoryReportInput,
  GetProfitReportInput,
  GetClosingReportInput,
} from "./schema.js";

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export class ReportsService {
  /**
   * Slice 10.3 — Sales Reports
   * Authoritative, accurate sales reporting for Owner and branch-scoped reporting for Employees.
   */
  static async getSalesReport(
    query: GetSalesReportInput,
    user: { id: string; role: string; branchId: string | null }
  ) {
    // 1. Role & Branch Scoping Security Boundary
    let effectiveBranchId: string | null = null;

    if (user.role === "EMPLOYEE") {
      if (!user.branchId) {
        throw new AppError("Employee is not assigned to a branch", 400, "NO_BRANCH_ASSIGNED");
      }
      if (query.branchId && query.branchId !== user.branchId) {
        throw new AppError(
          "You do not have permission to access another branch's reports",
          403,
          "AUTHORIZATION_ERROR"
        );
      }
      effectiveBranchId = user.branchId;

      // Employee cannot request cross-branch breakdown
      if (query.breakdown === "branch") {
        query.breakdown = "day";
      }
    } else {
      // Owner
      effectiveBranchId = query.branchId || null;
    }

    // 2. Date Boundary Handling
    const today = new Date();
    const endDateStr = query.endDate || toDateString(today);
    // Default start date: 1st of current month
    const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDateStr = query.startDate || toDateString(defaultStart);

    const startDateTime = new Date(`${startDateStr}T00:00:00.000Z`);
    const endDateTime = new Date(`${endDateStr}T23:59:59.999Z`);

    if (startDateTime.getTime() > endDateTime.getTime()) {
      throw new AppError("Start date cannot be after end date", 400, "INVALID_DATE_RANGE");
    }

    // 3. Fetch Master Data References
    const allBranches = await db.query.branches.findMany({
      where: eq(branches.isActive, true),
      orderBy: [branches.name],
    });
    const branchMap = new Map<string, string>();
    allBranches.forEach((b) => branchMap.set(b.id, b.name));

    const allPaymentMethods = await db.query.paymentMethods.findMany({
      where: eq(paymentMethods.isActive, true),
      orderBy: [paymentMethods.name],
    });

    // 4. Query Completed Sales in Current Period
    const salesConditions = [
      eq(sales.status, "COMPLETED"),
      gte(sales.soldAt, startDateTime.toISOString()),
      lte(sales.soldAt, endDateTime.toISOString()),
    ];

    if (effectiveBranchId) {
      salesConditions.push(eq(sales.branchId, effectiveBranchId));
    }
    if (query.employeeId) {
      salesConditions.push(eq(sales.createdById, query.employeeId));
    }

    const currentSales = await db.query.sales.findMany({
      where: and(...salesConditions),
      with: {
        branch: true,
        createdBy: true,
        items: {
          with: {
            product: {
              with: {
                category: true,
              },
            },
            unit: true,
          },
        },
        payments: {
          with: {
            paymentMethod: true,
          },
        },
      },
      orderBy: [desc(sales.soldAt)],
    });

    // Optional filtering by productId or paymentMethodId in memory if specified
    let filteredSales = currentSales;
    if (query.productId) {
      filteredSales = filteredSales.filter((s) =>
        s.items.some((item) => item.productId === query.productId)
      );
    }
    if (query.paymentMethodId) {
      filteredSales = filteredSales.filter((s) =>
        s.payments.some((p) => p.paymentMethodId === query.paymentMethodId)
      );
    }

    // 5. Query Completed Returns in Current Period
    const returnsConditions = [
      eq(salesReturns.status, "COMPLETED"),
      gte(salesReturns.returnedAt, startDateTime.toISOString()),
      lte(salesReturns.returnedAt, endDateTime.toISOString()),
    ];

    if (effectiveBranchId) {
      returnsConditions.push(eq(salesReturns.branchId, effectiveBranchId));
    }
    if (query.employeeId) {
      returnsConditions.push(eq(salesReturns.createdById, query.employeeId));
    }

    const currentReturns = await db.query.salesReturns.findMany({
      where: and(...returnsConditions),
      with: {
        items: true,
        refundPaymentMethod: true,
      },
    });

    // Filter returns by product or payment method if specified
    let filteredReturns = currentReturns;
    if (query.productId) {
      filteredReturns = filteredReturns.filter((r) =>
        r.items.some((item) => item.productId === query.productId)
      );
    }
    if (query.paymentMethodId) {
      filteredReturns = filteredReturns.filter(
        (r) => r.refundPaymentMethodId === query.paymentMethodId
      );
    }

    // 6. Aggregate Current Period Financials
    let grossSales = 0;
    let totalUnitsSold = 0;
    const productStatsMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        sku: string;
        categoryName: string;
        unitName: string;
        quantitySold: number;
        totalRevenue: number;
        salesCount: number;
      }
    >();

    for (const s of filteredSales) {
      grossSales += Number(s.grandTotal);

      for (const item of s.items) {
        if (query.productId && item.productId !== query.productId) {
          continue;
        }
        const qty = item.enteredQuantity;
        const lineTotal = Number(item.lineTotal);
        totalUnitsSold += qty;

        const existing = productStatsMap.get(item.productId) || {
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          categoryName: item.product.category?.name || "General",
          unitName: item.unit?.name || "Unit",
          quantitySold: 0,
          totalRevenue: 0,
          salesCount: 0,
        };

        existing.quantitySold += qty;
        existing.totalRevenue += lineTotal;
        existing.salesCount += 1;
        productStatsMap.set(item.productId, existing);
      }
    }

    let totalReturns = 0;
    for (const r of filteredReturns) {
      totalReturns += Number(r.refundAmount);
    }

    const netSales = Math.max(0, grossSales - totalReturns);
    const totalTransactions = filteredSales.length;
    const averageSale = totalTransactions > 0 ? netSales / totalTransactions : 0;

    // Top Selling Product
    let topProduct: {
      productId: string;
      productName: string;
      unitsSold: number;
      unitName: string;
      totalRevenue: number;
    } | null = null;

    let maxRev = -1;
    for (const p of productStatsMap.values()) {
      if (p.totalRevenue > maxRev) {
        maxRev = p.totalRevenue;
        topProduct = {
          productId: p.productId,
          productName: p.productName,
          unitsSold: p.quantitySold,
          unitName: p.unitName,
          totalRevenue: Math.round(p.totalRevenue * 100) / 100,
        };
      }
    }

    // 7. Previous Period Comparison Calculation
    const periodDurationMs = endDateTime.getTime() - startDateTime.getTime();
    const prevEndDateTime = new Date(startDateTime.getTime() - 1);
    const prevStartDateTime = new Date(prevEndDateTime.getTime() - periodDurationMs);

    const prevSalesConditions = [
      eq(sales.status, "COMPLETED"),
      gte(sales.soldAt, prevStartDateTime.toISOString()),
      lte(sales.soldAt, prevEndDateTime.toISOString()),
    ];
    if (effectiveBranchId) prevSalesConditions.push(eq(sales.branchId, effectiveBranchId));
    if (query.employeeId) prevSalesConditions.push(eq(sales.createdById, query.employeeId));

    const prevSales = await db.query.sales.findMany({
      where: and(...prevSalesConditions),
      columns: {
        grandTotal: true,
      },
    });

    let prevGrossSales = 0;
    for (const ps of prevSales) {
      prevGrossSales += Number(ps.grandTotal);
    }

    const prevReturnsConditions = [
      eq(salesReturns.status, "COMPLETED"),
      gte(salesReturns.returnedAt, prevStartDateTime.toISOString()),
      lte(salesReturns.returnedAt, prevEndDateTime.toISOString()),
    ];
    if (effectiveBranchId) prevReturnsConditions.push(eq(salesReturns.branchId, effectiveBranchId));
    if (query.employeeId) prevReturnsConditions.push(eq(salesReturns.createdById, query.employeeId));

    const prevReturns = await db.query.salesReturns.findMany({
      where: and(...prevReturnsConditions),
      columns: {
        refundAmount: true,
      },
    });

    let prevTotalReturns = 0;
    for (const pr of prevReturns) {
      prevTotalReturns += Number(pr.refundAmount);
    }

    const prevNetSales = Math.max(0, prevGrossSales - prevTotalReturns);
    const prevTransactions = prevSales.length;
    const prevAverageSale = prevTransactions > 0 ? prevNetSales / prevTransactions : 0;

    const salesGrowthPercent =
      prevNetSales > 0
        ? Math.round(((netSales - prevNetSales) / prevNetSales) * 1000) / 10
        : 0;
    const transactionsGrowthPercent =
      prevTransactions > 0
        ? Math.round(((totalTransactions - prevTransactions) / prevTransactions) * 1000) / 10
        : 0;
    const averageSaleGrowthPercent =
      prevAverageSale > 0
        ? Math.round(((averageSale - prevAverageSale) / prevAverageSale) * 1000) / 10
        : 0;

    // 8. Sales Trend: Group by Day within [startDate, endDate]
    const trendMap = new Map<string, { label: string; totalSales: number; count: number }>();
    const cursor = new Date(startDateTime);
    while (cursor.getTime() <= endDateTime.getTime()) {
      const dStr = toDateString(cursor);
      const label = cursor.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      trendMap.set(dStr, { label, totalSales: 0, count: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const s of filteredSales) {
      const dStr = toDateString(new Date(s.soldAt));
      if (trendMap.has(dStr)) {
        const item = trendMap.get(dStr)!;
        item.totalSales += Number(s.grandTotal);
        item.count += 1;
      }
    }

    let peakDay: { date: string; totalSales: number } | null = null;
    let maxTrendSale = -1;

    const trendDataPoints = Array.from(trendMap.entries()).map(([dateStr, val]) => {
      const daySales = Math.round(val.totalSales * 100) / 100;
      if (daySales > maxTrendSale && daySales > 0) {
        maxTrendSale = daySales;
        peakDay = { date: dateStr, totalSales: daySales };
      }
      return {
        date: dateStr,
        label: val.label,
        totalSales: daySales,
        transactionCount: val.count,
      };
    });

    // 9. Sales by Branch
    const branchSalesMap = new Map<string, { totalSales: number; count: number }>();
    allBranches.forEach((b) => branchSalesMap.set(b.id, { totalSales: 0, count: 0 }));

    for (const s of filteredSales) {
      const bEntry = branchSalesMap.get(s.branchId) || { totalSales: 0, count: 0 };
      bEntry.totalSales += Number(s.grandTotal);
      bEntry.count += 1;
      branchSalesMap.set(s.branchId, bEntry);
    }

    const branchesToReport = effectiveBranchId
      ? allBranches.filter((b) => b.id === effectiveBranchId)
      : allBranches;

    const salesByBranch = branchesToReport.map((b) => {
      const stat = branchSalesMap.get(b.id) || { totalSales: 0, count: 0 };
      const pct = netSales > 0 ? Math.round((stat.totalSales / netSales) * 1000) / 10 : 0;
      return {
        branchId: b.id,
        branchName: b.name,
        branchCode: b.code,
        totalSales: Math.round(stat.totalSales * 100) / 100,
        transactionCount: stat.count,
        percentage: pct,
      };
    });

    // 10. Payment Method Breakdown
    const pmMap = new Map<
      string,
      {
        paymentMethodId: string;
        paymentMethodName: string;
        received: number;
        refunded: number;
        count: number;
      }
    >();

    allPaymentMethods.forEach((pm) => {
      pmMap.set(pm.id, {
        paymentMethodId: pm.id,
        paymentMethodName: pm.name,
        received: 0,
        refunded: 0,
        count: 0,
      });
    });

    for (const s of filteredSales) {
      for (const p of s.payments) {
        const entry = pmMap.get(p.paymentMethodId) || {
          paymentMethodId: p.paymentMethodId,
          paymentMethodName: p.paymentMethod?.name || "Payment Method",
          received: 0,
          refunded: 0,
          count: 0,
        };
        entry.received += Number(p.amount);
        entry.count += 1;
        pmMap.set(p.paymentMethodId, entry);
      }
    }

    for (const r of filteredReturns) {
      const entry = pmMap.get(r.refundPaymentMethodId);
      if (entry) {
        entry.refunded += Number(r.refundAmount);
      }
    }

    let totalPaymentReceived = 0;
    for (const pm of pmMap.values()) {
      totalPaymentReceived += pm.received;
    }

    const paymentMethodBreakdown = Array.from(pmMap.values()).map((pm) => {
      const net = Math.max(0, pm.received - pm.refunded);
      const pct =
        totalPaymentReceived > 0
          ? Math.round((pm.received / totalPaymentReceived) * 1000) / 10
          : 0;
      return {
        paymentMethodId: pm.paymentMethodId,
        paymentMethodName: pm.paymentMethodName,
        receivedAmount: Math.round(pm.received * 100) / 100,
        refundedAmount: Math.round(pm.refunded * 100) / 100,
        netAmount: Math.round(net * 100) / 100,
        transactionCount: pm.count,
        percentage: pct,
      };
    });

    // 11. Detailed Breakdown Table
    let allDetailedRecords: any[] = [];

    if (query.breakdown === "day") {
      // Group by day
      allDetailedRecords = trendDataPoints
        .filter((dp) => dp.transactionCount > 0)
        .reverse()
        .map((dp) => {
          const avg = dp.transactionCount > 0 ? dp.totalSales / dp.transactionCount : 0;
          const daySales = filteredSales.filter(
            (s) => toDateString(new Date(s.soldAt)) === dp.date
          );
          // Top item on this day
          let dayTopItem = "-";
          let maxItemQty = 0;
          const dayItemMap = new Map<string, { name: string; qty: number }>();
          daySales.forEach((s) => {
            s.items.forEach((item) => {
              const curr = dayItemMap.get(item.productId) || {
                name: item.product.name,
                qty: 0,
              };
              curr.qty += item.enteredQuantity;
              dayItemMap.set(item.productId, curr);
              if (curr.qty > maxItemQty) {
                maxItemQty = curr.qty;
                dayTopItem = `${curr.name} (${curr.qty} units)`;
              }
            });
          });

          return {
            date: dp.date,
            displayDate: dp.label,
            branch: effectiveBranchId
              ? branchMap.get(effectiveBranchId) || "Branch"
              : "All Branches",
            transactions: dp.transactionCount,
            averageSale: Math.round(avg * 100) / 100,
            topSellingItem: dayTopItem,
            totalSales: dp.totalSales,
            isPeak: peakDay?.date === dp.date,
          };
        });
    } else if (query.breakdown === "branch") {
      allDetailedRecords = salesByBranch.map((sb) => {
        const avg = sb.transactionCount > 0 ? sb.totalSales / sb.transactionCount : 0;
        return {
          branchId: sb.branchId,
          branchName: sb.branchName,
          branchCode: sb.branchCode,
          transactions: sb.transactionCount,
          averageSale: Math.round(avg * 100) / 100,
          totalSales: sb.totalSales,
          percentage: sb.percentage,
        };
      });
    } else if (query.breakdown === "employee") {
      const empMap = new Map<
        string,
        {
          employeeId: string;
          employeeName: string;
          branchName: string;
          totalSales: number;
          count: number;
        }
      >();

      for (const s of filteredSales) {
        const empId = s.createdById;
        const empName = s.createdBy?.name || "Employee";
        const bName = s.branch.name;

        const curr = empMap.get(empId) || {
          employeeId: empId,
          employeeName: empName,
          branchName: bName,
          totalSales: 0,
          count: 0,
        };
        curr.totalSales += Number(s.grandTotal);
        curr.count += 1;
        empMap.set(empId, curr);
      }

      allDetailedRecords = Array.from(empMap.values()).map((emp) => {
        const avg = emp.count > 0 ? emp.totalSales / emp.count : 0;
        return {
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          branchName: emp.branchName,
          transactions: emp.count,
          averageSale: Math.round(avg * 100) / 100,
          totalSales: Math.round(emp.totalSales * 100) / 100,
        };
      });
    } else if (query.breakdown === "product") {
      allDetailedRecords = Array.from(productStatsMap.values())
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .map((p) => ({
          productId: p.productId,
          productName: p.productName,
          sku: p.sku,
          categoryName: p.categoryName,
          quantitySold: p.quantitySold,
          unitName: p.unitName,
          totalSales: Math.round(p.totalRevenue * 100) / 100,
          transactions: p.salesCount,
        }));
    } else if (query.breakdown === "payment_method") {
      allDetailedRecords = paymentMethodBreakdown.map((pm) => ({
        paymentMethodId: pm.paymentMethodId,
        paymentMethodName: pm.paymentMethodName,
        transactions: pm.transactionCount,
        totalAmount: pm.netAmount,
        percentage: pm.percentage,
      }));
    }

    // Pagination
    const totalRecords = allDetailedRecords.length;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const startIndex = (page - 1) * limit;
    const paginatedRecords = allDetailedRecords.slice(startIndex, startIndex + limit);

    return {
      summary: {
        totalSales: Math.round(netSales * 100) / 100,
        grossSales: Math.round(grossSales * 100) / 100,
        totalReturns: Math.round(totalReturns * 100) / 100,
        totalTransactions,
        averageSale: Math.round(averageSale * 100) / 100,
        totalUnitsSold,
        topProduct,
        comparisonWithPreviousPeriod: {
          previousStartDate: toDateString(prevStartDateTime),
          previousEndDate: toDateString(prevEndDateTime),
          previousTotalSales: Math.round(prevNetSales * 100) / 100,
          previousTransactions: prevTransactions,
          previousAverageSale: Math.round(prevAverageSale * 100) / 100,
          salesGrowthPercent,
          transactionsGrowthPercent,
          averageSaleGrowthPercent,
        },
      },
      trend: {
        interval: "day" as const,
        peakDay,
        dataPoints: trendDataPoints,
      },
      salesByBranch,
      paymentMethodBreakdown,
      breakdownType: query.breakdown,
      detailedRecords: paginatedRecords,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    };
  }

  /**
   * Slice 10.4 — Inventory Reports
   * Current stock, movements history, and transfer reconciliation.
   * Employees strictly scoped to their assigned branch and stripped of WAC, unit cost, and valuation.
   */
  static async getInventoryReport(
    query: GetInventoryReportInput,
    user: { id: string; role: string; branchId: string | null }
  ) {
    let effectiveBranchId: string | null = null;
    const isOwner = user.role === "OWNER";

    if (!isOwner) {
      if (!user.branchId) {
        throw new AppError("Employee is not assigned to a branch", 400, "NO_BRANCH_ASSIGNED");
      }
      if (query.branchId && query.branchId !== user.branchId) {
        throw new AppError(
          "You do not have permission to access another branch's reports",
          403,
          "AUTHORIZATION_ERROR"
        );
      }
      effectiveBranchId = user.branchId;
    } else {
      effectiveBranchId = query.branchId || null;
    }

    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const view = query.view || "balances";

    if (view === "balances") {
      // 1. Balances view
      const balanceConditions = [];
      if (effectiveBranchId) {
        balanceConditions.push(eq(inventoryBalances.branchId, effectiveBranchId));
      }
      if (query.productId) {
        balanceConditions.push(eq(inventoryBalances.productId, query.productId));
      }
      if (query.categoryId) {
        const catProductSubquery = db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.categoryId, query.categoryId));
        balanceConditions.push(inArray(inventoryBalances.productId, catProductSubquery));
      }

      // Compute Authoritative Summary KPIs across matching balances in PostgreSQL
      const [summary] = await db
        .select({
          totalStock: sql<number>`COALESCE(SUM(${inventoryBalances.availableQuantity}), 0)::int`,
          totalDamaged: sql<number>`COALESCE(SUM(${inventoryBalances.damagedQuantity}), 0)::int`,
          inTransitTotal: sql<number>`COALESCE(SUM(${inventoryBalances.inTransitQuantity}), 0)::int`,
          lowStockCount: sql<number>`COUNT(CASE WHEN ${inventoryBalances.availableQuantity} > 0 AND ${inventoryBalances.availableQuantity} <= ${inventoryBalances.minimumStockQuantity} THEN 1 END)::int`,
          outOfStockCount: sql<number>`COUNT(CASE WHEN ${inventoryBalances.availableQuantity} = 0 THEN 1 END)::int`,
          totalValuation: isOwner
            ? sql<string>`COALESCE(SUM(${inventoryBalances.availableQuantity} * ${inventoryBalances.wac}), 0)`
            : sql<string>`0`,
        })
        .from(inventoryBalances)
        .where(balanceConditions.length > 0 ? and(...balanceConditions) : undefined);

      const recordConditions = [...balanceConditions];
      if (query.stockStatus === "low") {
        recordConditions.push(
          lte(inventoryBalances.availableQuantity, inventoryBalances.minimumStockQuantity),
          gt(inventoryBalances.availableQuantity, 0)
        );
      } else if (query.stockStatus === "out") {
        recordConditions.push(eq(inventoryBalances.availableQuantity, 0));
      } else if (query.stockStatus === "in_stock") {
        recordConditions.push(gt(inventoryBalances.availableQuantity, 0));
      }

      const [countRow] = await db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(inventoryBalances)
        .where(recordConditions.length > 0 ? and(...recordConditions) : undefined);

      const totalRecords = Number(countRow?.count || 0);
      const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
      const offset = (page - 1) * limit;

      const pageBalances = await db.query.inventoryBalances.findMany({
        where: recordConditions.length > 0 ? and(...recordConditions) : undefined,
        with: {
          branch: true,
          product: {
            with: {
              category: true,
            },
          },
        },
        orderBy: [
          sql`CASE 
            WHEN ${inventoryBalances.availableQuantity} = 0 THEN 0 
            WHEN ${inventoryBalances.availableQuantity} <= ${inventoryBalances.minimumStockQuantity} THEN 1 
            ELSE 2 
          END ASC`,
        ],
        limit,
        offset,
      });

      // Map balance items (ensuring Employees NEVER receive WAC or valuation)
      const mappedItems = pageBalances.map((b) => ({
        id: b.id,
        productId: b.productId,
        productName: b.product.name,
        sku: b.product.sku,
        categoryName: b.product.category?.name || "General",
        branchId: b.branchId,
        branchName: b.branch.name,
        availableQuantity: b.availableQuantity,
        damagedQuantity: b.damagedQuantity,
        inTransitQuantity: b.inTransitQuantity,
        minimumStockQuantity: b.minimumStockQuantity,
        stockStatus: (b.availableQuantity === 0
          ? "OUT_OF_STOCK"
          : b.availableQuantity <= b.minimumStockQuantity
          ? "LOW_STOCK"
          : "IN_STOCK") as "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK",
        wac: isOwner ? Number(b.wac) : null,
        valuation: isOwner ? Math.round(b.availableQuantity * Number(b.wac) * 100) / 100 : null,
        updatedAt: b.updatedAt,
      }));

      // Sort items: Out of stock first, then low stock, then product name
      mappedItems.sort((a, b) => {
        const order = { OUT_OF_STOCK: 0, LOW_STOCK: 1, IN_STOCK: 2 };
        if (order[a.stockStatus] !== order[b.stockStatus]) {
          return order[a.stockStatus] - order[b.stockStatus];
        }
        return a.productName.localeCompare(b.productName);
      });

      return {
        view: "balances" as const,
        summary: {
          totalStock: summary?.totalStock || 0,
          totalDamaged: summary?.totalDamaged || 0,
          inTransitTotal: summary?.inTransitTotal || 0,
          lowStockCount: summary?.lowStockCount || 0,
          outOfStockCount: summary?.outOfStockCount || 0,
          totalValuation: isOwner ? Math.round(Number(summary?.totalValuation || 0) * 100) / 100 : null,
        },
        records: mappedItems,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
        },
      };
    } else if (view === "movements") {
      // 2. Movements View
      const today = new Date();
      const endDateStr = query.endDate || toDateString(today);
      const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDateStr = query.startDate || toDateString(defaultStart);

      const startDateTime = new Date(`${startDateStr}T00:00:00.000Z`);
      const endDateTime = new Date(`${endDateStr}T23:59:59.999Z`);

      const movementConditions = [
        gte(inventoryMovements.createdAt, startDateTime.toISOString()),
        lte(inventoryMovements.createdAt, endDateTime.toISOString()),
      ];

      if (effectiveBranchId) {
        movementConditions.push(eq(inventoryMovements.branchId, effectiveBranchId));
      }
      if (query.productId) {
        movementConditions.push(eq(inventoryMovements.productId, query.productId));
      }
      if (query.movementType) {
        movementConditions.push(eq(inventoryMovements.movementType, query.movementType));
      }
      if (query.categoryId) {
        const catProductSubquery = db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.categoryId, query.categoryId));
        movementConditions.push(inArray(inventoryMovements.productId, catProductSubquery));
      }

      // Compute summary in PostgreSQL
      const [movementSummary] = await db
        .select({
          totalRecords: sql<number>`COUNT(*)::int`,
          totalAdded: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.quantity} > 0 THEN ${inventoryMovements.quantity} ELSE 0 END), 0)::int`,
          totalDeducted: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.quantity} < 0 THEN ABS(${inventoryMovements.quantity}) ELSE 0 END), 0)::int`,
        })
        .from(inventoryMovements)
        .where(and(...movementConditions));

      const totalRecords = movementSummary?.totalRecords || 0;
      const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
      const offset = (page - 1) * limit;

      const pageMovements = await db.query.inventoryMovements.findMany({
        where: and(...movementConditions),
        with: {
          branch: true,
          product: {
            with: {
              category: true,
            },
          },
          createdBy: true,
        },
        orderBy: [desc(inventoryMovements.createdAt)],
        limit,
        offset,
      });

      const mappedMovements = pageMovements.map((m) => ({
        id: m.id,
        transactionId: m.transactionId,
        branchId: m.branchId,
        branchName: m.branch.name,
        productId: m.productId,
        productName: m.product.name,
        sku: m.product.sku,
        categoryName: m.product.category?.name || "General",
        movementType: m.movementType,
        quantity: m.quantity,
        unitCost: isOwner ? Number(m.unitCost) : null,
        totalCost: isOwner ? Math.round(Math.abs(m.quantity) * Number(m.unitCost) * 100) / 100 : null,
        reason: m.reason,
        createdById: m.createdById,
        createdByName: m.createdBy.name,
        createdAt: m.createdAt,
      }));

      return {
        view: "movements" as const,
        summary: {
          totalMovements: totalRecords,
          totalUnitsAdded: movementSummary?.totalAdded || 0,
          totalUnitsDeducted: movementSummary?.totalDeducted || 0,
          netMovement: (movementSummary?.totalAdded || 0) - (movementSummary?.totalDeducted || 0),
        },
        records: mappedMovements,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
        },
      };
    } else {
      // 3. Transfers View
      const today = new Date();
      const endDateStr = query.endDate || toDateString(today);
      const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDateStr = query.startDate || toDateString(defaultStart);

      const startDateTime = new Date(`${startDateStr}T00:00:00.000Z`);
      const endDateTime = new Date(`${endDateStr}T23:59:59.999Z`);

      const allTransfers = await db.query.transfers.findMany({
        where: and(
          gte(transfers.createdAt, startDateTime.toISOString()),
          lte(transfers.createdAt, endDateTime.toISOString())
        ),
        with: {
          sourceBranch: true,
          destinationBranch: true,
          createdBy: true,
          items: {
            with: {
              product: true,
            },
          },
        },
        orderBy: [desc(transfers.createdAt)],
      });

      let filteredTransfers = allTransfers;
      if (effectiveBranchId) {
        filteredTransfers = filteredTransfers.filter(
          (t) =>
            t.sourceBranchId === effectiveBranchId ||
            t.destinationBranchId === effectiveBranchId
        );
      }
      if (query.productId) {
        filteredTransfers = filteredTransfers.filter((t) =>
          t.items.some((item) => item.productId === query.productId)
        );
      }

      let totalDispatched = 0;
      let totalReceived = 0;
      let totalDamaged = 0;
      let totalMissing = 0;
      let totalInTransit = 0;
      let discrepancyCount = 0;

      for (const t of filteredTransfers) {
        if (t.hasDiscrepancy) {
          discrepancyCount++;
        }
        for (const item of t.items) {
          totalDispatched += item.dispatchedQuantity || 0;
          totalReceived += item.receivedQuantity || 0;
          totalDamaged += item.damagedQuantity || 0;
          totalMissing += item.missingQuantity || 0;
          if (t.status === "DISPATCHED") {
            totalInTransit += item.dispatchedQuantity || 0;
          }
        }
      }

      const mappedTransfers = filteredTransfers.map((t) => ({
        id: t.id,
        transferNumber: t.transferNumber,
        sourceBranchId: t.sourceBranchId,
        sourceBranchName: t.sourceBranch.name,
        destinationBranchId: t.destinationBranchId,
        destinationBranchName: t.destinationBranch.name,
        status: t.status,
        hasDiscrepancy: t.hasDiscrepancy,
        createdAt: t.createdAt,
        createdByName: t.createdBy.name,
        itemsCount: t.items.length,
        requestedQuantity: t.items.reduce((s, i) => s + i.requestedQuantity, 0),
        dispatchedQuantity: t.items.reduce((s, i) => s + (i.dispatchedQuantity || 0), 0),
        receivedQuantity: t.items.reduce((s, i) => s + (i.receivedQuantity || 0), 0),
        damagedQuantity: t.items.reduce((s, i) => s + i.damagedQuantity, 0),
        missingQuantity: t.items.reduce((s, i) => s + i.missingQuantity, 0),
        items: t.items.map((i) => ({
          id: i.id,
          productName: i.product.name,
          sku: i.product.sku,
          requestedQuantity: i.requestedQuantity,
          dispatchedQuantity: i.dispatchedQuantity,
          receivedQuantity: i.receivedQuantity,
          damagedQuantity: i.damagedQuantity,
          missingQuantity: i.missingQuantity,
          discrepancyReason: i.discrepancyReason,
        })),
      }));

      const totalRecords = mappedTransfers.length;
      const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
      const paginatedRecords = mappedTransfers.slice((page - 1) * limit, page * limit);

      return {
        view: "transfers" as const,
        summary: {
          totalTransfers: totalRecords,
          totalDispatchedUnits: totalDispatched,
          totalReceivedUnits: totalReceived,
          totalDamagedUnits: totalDamaged,
          totalMissingUnits: totalMissing,
          totalInTransitUnits: totalInTransit,
          discrepancyCount,
        },
        records: paginatedRecords,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
        },
      };
    }
  }

  /**
   * Slice 10.5 — Profit Reports
   * Owner-only financial reporting: Revenue, COGS, Gross Profit, and Margins.
   * Leverages historical WAC snapshots captured on sale_items and sellable returns.
   */
  static async getProfitReport(
    query: GetProfitReportInput,
    user: { id: string; role: string; branchId: string | null }
  ) {
    if (user.role !== "OWNER") {
      throw new AppError(
        "Profit reports are strictly accessible to the business owner only",
        403,
        "AUTHORIZATION_ERROR"
      );
    }

    const today = new Date();
    const endDateStr = query.endDate || toDateString(today);
    const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDateStr = query.startDate || toDateString(defaultStart);

    const startDateTime = new Date(`${startDateStr}T00:00:00.000Z`);
    const endDateTime = new Date(`${endDateStr}T23:59:59.999Z`);

    if (startDateTime.getTime() > endDateTime.getTime()) {
      throw new AppError("Start date cannot be after end date", 400, "INVALID_DATE_RANGE");
    }

    // 1. Fetch Completed Sales
    const salesConditions = [
      eq(sales.status, "COMPLETED"),
      gte(sales.soldAt, startDateTime.toISOString()),
      lte(sales.soldAt, endDateTime.toISOString()),
    ];
    if (query.branchId) {
      salesConditions.push(eq(sales.branchId, query.branchId));
    }

    const currentSales = await db.query.sales.findMany({
      where: and(...salesConditions),
      with: {
        branch: true,
        items: {
          with: {
            product: {
              with: {
                category: true,
              },
            },
            unit: true,
          },
        },
      },
      orderBy: [desc(sales.soldAt)],
    });

    // 2. Fetch Completed Returns
    const returnsConditions = [
      eq(salesReturns.status, "COMPLETED"),
      gte(salesReturns.returnedAt, startDateTime.toISOString()),
      lte(salesReturns.returnedAt, endDateTime.toISOString()),
    ];
    if (query.branchId) {
      returnsConditions.push(eq(salesReturns.branchId, query.branchId));
    }

    const currentReturns = await db.query.salesReturns.findMany({
      where: and(...returnsConditions),
      with: {
        branch: true,
        items: {
          with: {
            product: {
              with: {
                category: true,
              },
            },
            saleItem: true,
          },
        },
      },
    });

    // Optional category & product filters
    let filteredSales = currentSales;
    if (query.categoryId) {
      filteredSales = filteredSales.filter((s) =>
        s.items.some((item) => item.product.categoryId === query.categoryId)
      );
    }
    if (query.productId) {
      filteredSales = filteredSales.filter((s) =>
        s.items.some((item) => item.productId === query.productId)
      );
    }

    let filteredReturns = currentReturns;
    if (query.categoryId) {
      filteredReturns = filteredReturns.filter((r) =>
        r.items.some((item) => item.product.categoryId === query.categoryId)
      );
    }
    if (query.productId) {
      filteredReturns = filteredReturns.filter((r) =>
        r.items.some((item) => item.productId === query.productId)
      );
    }

    // 3. Aggregate Financials
    let totalGrossRevenue = 0;
    let totalGrossCogs = 0;
    let totalUnitsSold = 0;

    const detailedProfitItems: Array<{
      id: string;
      saleNumber: string;
      soldAt: string;
      branchId: string;
      branchName: string;
      productId: string;
      productName: string;
      sku: string;
      categoryId: string;
      categoryName: string;
      quantitySold: number;
      unitPrice: number;
      unitCost: number;
      netRevenue: number;
      cogs: number;
      grossProfit: number;
      marginPercent: number;
    }> = [];

    for (const s of filteredSales) {
      for (const item of s.items) {
        if (query.productId && item.productId !== query.productId) continue;
        if (query.categoryId && item.product.categoryId !== query.categoryId) continue;

        const lineNetRevenue = Math.max(
          0,
          Number(item.lineTotal) - Number(item.apportionedSaleDiscount || 0)
        );
        const lineCogs = item.baseQuantity * Number(item.unitCost);
        const lineProfit = lineNetRevenue - lineCogs;
        const lineMargin = lineNetRevenue > 0 ? (lineProfit / lineNetRevenue) * 100 : 0;

        totalGrossRevenue += lineNetRevenue;
        totalGrossCogs += lineCogs;
        totalUnitsSold += item.enteredQuantity;

        detailedProfitItems.push({
          id: item.id,
          saleNumber: s.saleNumber,
          soldAt: s.soldAt,
          branchId: s.branchId,
          branchName: s.branch.name,
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          categoryId: item.product.categoryId,
          categoryName: item.product.category?.name || "General",
          quantitySold: item.enteredQuantity,
          unitPrice: Number(item.unitPrice),
          unitCost: Number(item.unitCost),
          netRevenue: Math.round(lineNetRevenue * 100) / 100,
          cogs: Math.round(lineCogs * 100) / 100,
          grossProfit: Math.round(lineProfit * 100) / 100,
          marginPercent: Math.round(lineMargin * 10) / 10,
        });
      }
    }

    // Returns deductions
    let totalRefunds = 0;
    let totalReturnCogs = 0;

    for (const r of filteredReturns) {
      for (const item of r.items) {
        if (query.productId && item.productId !== query.productId) continue;
        if (query.categoryId && item.product.categoryId !== query.categoryId) continue;

        const refund = Number(item.refundAmount);
        totalRefunds += refund;

        if (item.condition === "SELLABLE") {
          const itemUnitCost = item.saleItem ? Number(item.saleItem.unitCost) : 0;
          totalReturnCogs += item.baseQuantity * itemUnitCost;
        }
      }
    }

    const netRevenue = Math.max(0, totalGrossRevenue - totalRefunds);
    const netCogs = Math.max(0, totalGrossCogs - totalReturnCogs);
    const grossProfit = netRevenue - netCogs;
    const profitMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

    // 4. Breakdown Aggregation
    const breakdown = query.breakdown || "day";
    const breakdownMap = new Map<
      string,
      {
        key: string;
        name: string;
        grossRevenue: number;
        returns: number;
        netRevenue: number;
        cogs: number;
        grossProfit: number;
        profitMargin: number;
        unitsSold: number;
      }
    >();

    for (const item of detailedProfitItems) {
      let groupKey = "";
      let groupName = "";

      if (breakdown === "day") {
        groupKey = item.soldAt.slice(0, 10);
        groupName = groupKey;
      } else if (breakdown === "branch") {
        groupKey = item.branchId;
        groupName = item.branchName;
      } else if (breakdown === "category") {
        groupKey = item.categoryId;
        groupName = item.categoryName;
      } else if (breakdown === "product") {
        groupKey = item.productId;
        groupName = item.productName;
      }

      const existing = breakdownMap.get(groupKey) || {
        key: groupKey,
        name: groupName,
        grossRevenue: 0,
        returns: 0,
        netRevenue: 0,
        cogs: 0,
        grossProfit: 0,
        profitMargin: 0,
        unitsSold: 0,
      };

      existing.grossRevenue += item.netRevenue;
      existing.cogs += item.cogs;
      existing.unitsSold += item.quantitySold;
      breakdownMap.set(groupKey, existing);
    }

    // Allocate returns to breakdown groups
    for (const r of filteredReturns) {
      for (const item of r.items) {
        if (query.productId && item.productId !== query.productId) continue;
        if (query.categoryId && item.product.categoryId !== query.categoryId) continue;

        let groupKey = "";
        if (breakdown === "day") {
          groupKey = r.returnedAt.slice(0, 10);
        } else if (breakdown === "branch") {
          groupKey = r.branchId;
        } else if (breakdown === "category") {
          groupKey = item.product.categoryId;
        } else if (breakdown === "product") {
          groupKey = item.productId;
        }

        const existing = breakdownMap.get(groupKey);
        if (existing) {
          existing.returns += Number(item.refundAmount);
          if (item.condition === "SELLABLE") {
            const itemUnitCost = item.saleItem ? Number(item.saleItem.unitCost) : 0;
            existing.cogs = Math.max(0, existing.cogs - item.baseQuantity * itemUnitCost);
          }
        }
      }
    }

    // Finalize breakdown stats
    const breakdownList = Array.from(breakdownMap.values()).map((b) => {
      const bNetRevenue = Math.max(0, b.grossRevenue - b.returns);
      const bProfit = bNetRevenue - b.cogs;
      const bMargin = bNetRevenue > 0 ? (bProfit / bNetRevenue) * 100 : 0;
      return {
        key: b.key,
        name: b.name,
        grossRevenue: Math.round(b.grossRevenue * 100) / 100,
        returns: Math.round(b.returns * 100) / 100,
        netRevenue: Math.round(bNetRevenue * 100) / 100,
        cogs: Math.round(b.cogs * 100) / 100,
        grossProfit: Math.round(bProfit * 100) / 100,
        profitMargin: Math.round(bMargin * 10) / 10,
        unitsSold: b.unitsSold,
      };
    });

    if (breakdown === "day") {
      breakdownList.sort((a, b) => b.key.localeCompare(a.key));
    } else {
      breakdownList.sort((a, b) => b.grossProfit - a.grossProfit);
    }

    // 5. Continuous Daily Trend Points
    const dailyMap = new Map<string, { revenue: number; cogs: number; profit: number }>();
    const currentDayIter = new Date(startDateTime);
    while (currentDayIter <= endDateTime) {
      dailyMap.set(toDateString(currentDayIter), { revenue: 0, cogs: 0, profit: 0 });
      currentDayIter.setDate(currentDayIter.getDate() + 1);
    }

    for (const item of detailedProfitItems) {
      const dKey = item.soldAt.slice(0, 10);
      const entry = dailyMap.get(dKey);
      if (entry) {
        entry.revenue += item.netRevenue;
        entry.cogs += item.cogs;
        entry.profit += item.grossProfit;
      }
    }

    for (const r of filteredReturns) {
      const dKey = r.returnedAt.slice(0, 10);
      const entry = dailyMap.get(dKey);
      if (entry) {
        entry.revenue = Math.max(0, entry.revenue - Number(r.refundAmount));
        for (const item of r.items) {
          if (item.condition === "SELLABLE") {
            const itemUnitCost = item.saleItem ? Number(item.saleItem.unitCost) : 0;
            entry.cogs = Math.max(0, entry.cogs - item.baseQuantity * itemUnitCost);
          }
        }
        entry.profit = entry.revenue - entry.cogs;
      }
    }

    let peakDay: { date: string; profit: number } | null = null;
    let maxDayProfit = -Infinity;

    const trendDataPoints = Array.from(dailyMap.entries()).map(([date, vals]) => {
      const dProfit = Math.round(vals.profit * 100) / 100;
      if (dProfit > maxDayProfit && vals.revenue > 0) {
        maxDayProfit = dProfit;
        peakDay = { date, profit: dProfit };
      }
      return {
        date,
        revenue: Math.round(vals.revenue * 100) / 100,
        cogs: Math.round(vals.cogs * 100) / 100,
        profit: dProfit,
        marginPercent:
          vals.revenue > 0 ? Math.round((dProfit / vals.revenue) * 1000) / 10 : 0,
      };
    });

    // 6. Pagination for Detailed Table
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const totalRecords = detailedProfitItems.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const paginatedRecords = detailedProfitItems.slice((page - 1) * limit, page * limit);

    return {
      summary: {
        grossRevenue: Math.round(totalGrossRevenue * 100) / 100,
        returnsAmount: Math.round(totalRefunds * 100) / 100,
        netRevenue: Math.round(netRevenue * 100) / 100,
        grossCogs: Math.round(totalGrossCogs * 100) / 100,
        returnCogsAdjustment: Math.round(totalReturnCogs * 100) / 100,
        netCogs: Math.round(netCogs * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 10) / 10,
        totalUnitsSold,
        totalTransactions: filteredSales.length,
      },
      trend: {
        peakDay,
        dataPoints: trendDataPoints,
      },
      breakdownType: breakdown,
      breakdown: breakdownList,
      detailedRecords: paginatedRecords,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    };
  }

  /**
   * Slice 10.6 — Closing Reports
   * Daily closing performance, expected vs declared cash reconciliation,
   * recorded discrepancy logs, and audit review history.
   * Scoped to assigned branch for employees; business-wide for Owner.
   */
  static async getClosingReport(
    query: GetClosingReportInput,
    user: { id: string; role: string; branchId: string | null }
  ) {
    let effectiveBranchId: string | null = null;
    const isOwner = user.role === "OWNER";

    if (!isOwner) {
      if (!user.branchId) {
        throw new AppError("Employee is not assigned to a branch", 400, "NO_BRANCH_ASSIGNED");
      }
      if (query.branchId && query.branchId !== user.branchId) {
        throw new AppError(
          "You do not have permission to access another branch's reports",
          403,
          "AUTHORIZATION_ERROR"
        );
      }
      effectiveBranchId = user.branchId;
    } else {
      effectiveBranchId = query.branchId || null;
    }

    const today = new Date();
    const endDateStr = query.endDate || toDateString(today);
    const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDateStr = query.startDate || toDateString(defaultStart);

    const conditions = [
      gte(dailyClosings.closingDate, startDateStr),
      lte(dailyClosings.closingDate, endDateStr),
    ];

    if (effectiveBranchId) {
      conditions.push(eq(dailyClosings.branchId, effectiveBranchId));
    }
    if (query.status && query.status !== "all") {
      conditions.push(eq(dailyClosings.status, query.status));
    }

    const allClosings = await db.query.dailyClosings.findMany({
      where: and(...conditions),
      with: {
        branch: true,
        submittedBy: true,
        reviewedBy: true,
        payments: {
          with: {
            paymentMethod: true,
          },
        },
        events: {
          with: {
            actor: true,
          },
          orderBy: [desc(dailyClosingEvents.createdAt)],
        },
      },
      orderBy: [desc(dailyClosings.closingDate)],
    });

    let filteredClosings = allClosings;
    if (query.hasDiscrepancy === true) {
      filteredClosings = filteredClosings.filter(
        (c) => Number(c.cashDifference || 0) !== 0 || !!c.discrepancyReason
      );
    } else if (query.hasDiscrepancy === false) {
      filteredClosings = filteredClosings.filter(
        (c) => Number(c.cashDifference || 0) === 0 && !c.discrepancyReason
      );
    }

    // Summary KPIs
    let approvedClosings = 0;
    let pendingReviewClosings = 0;
    let rejectedClosings = 0;
    let notSubmittedClosings = 0;
    let totalExpectedCash = 0;
    let totalActualCash = 0;
    let totalCashDiscrepancy = 0;
    let discrepantClosingsCount = 0;

    // Payment methods aggregation
    const paymentMethodsMap = new Map<
      string,
      {
        paymentMethodId: string;
        paymentMethodName: string;
        receivedAmount: number;
        refundedAmount: number;
        netAmount: number;
        transactionCount: number;
      }
    >();

    for (const c of filteredClosings) {
      if (c.status === "APPROVED") approvedClosings++;
      else if (c.status === "SUBMITTED") pendingReviewClosings++;
      else if (c.status === "REJECTED") rejectedClosings++;
      else if (c.status === "NOT_SUBMITTED") notSubmittedClosings++;

      totalExpectedCash += Number(c.expectedCash);
      totalActualCash += Number(c.actualCash || 0);
      const diff = Number(c.cashDifference || 0);
      totalCashDiscrepancy += diff;

      if (diff !== 0 || !!c.discrepancyReason) {
        discrepantClosingsCount++;
      }

      for (const p of c.payments) {
        const existing = paymentMethodsMap.get(p.paymentMethodId) || {
          paymentMethodId: p.paymentMethodId,
          paymentMethodName: p.paymentMethodName,
          receivedAmount: 0,
          refundedAmount: 0,
          netAmount: 0,
          transactionCount: 0,
        };

        existing.receivedAmount += Number(p.receivedAmount);
        existing.refundedAmount += Number(p.refundedAmount);
        existing.netAmount += Number(p.netAmount);
        existing.transactionCount += p.transactionCount;
        paymentMethodsMap.set(p.paymentMethodId, existing);
      }
    }

    const paymentMethodsSummary = Array.from(paymentMethodsMap.values()).map((p) => ({
      ...p,
      receivedAmount: Math.round(p.receivedAmount * 100) / 100,
      refundedAmount: Math.round(p.refundedAmount * 100) / 100,
      netAmount: Math.round(p.netAmount * 100) / 100,
    }));

    // Map detailed records
    const mappedClosings = filteredClosings.map((c) => ({
      id: c.id,
      closingNumber: c.closingNumber,
      closingDate: c.closingDate,
      branchId: c.branchId,
      branchName: c.branch.name,
      status: c.status,
      totalSalesAmount: Number(c.totalSalesAmount),
      totalReturnsAmount: Number(c.totalReturnsAmount),
      netSalesAmount: Number(c.netSalesAmount),
      salesCount: c.salesCount,
      expectedCash: Number(c.expectedCash),
      actualCash: c.actualCash !== null ? Number(c.actualCash) : null,
      cashDifference: c.cashDifference !== null ? Number(c.cashDifference) : null,
      discrepancyReason: c.discrepancyReason,
      submittedById: c.submittedById,
      submittedByName: c.submittedBy?.name || null,
      submittedAt: c.submittedAt,
      reviewedById: c.reviewedById,
      reviewedByName: c.reviewedBy?.name || null,
      reviewedAt: c.reviewedAt,
      reviewNotes: c.reviewNotes,
      rejectionReason: c.rejectionReason,
      revision: c.revision,
      payments: c.payments.map((p) => ({
        paymentMethodName: p.paymentMethodName,
        receivedAmount: Number(p.receivedAmount),
        refundedAmount: Number(p.refundedAmount),
        netAmount: Number(p.netAmount),
        transactionCount: p.transactionCount,
      })),
      events: c.events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        actorName: e.actor.name,
        actorRole: e.actorRole,
        expectedCash: Number(e.expectedCash),
        actualCash: e.actualCash !== null ? Number(e.actualCash) : null,
        cashDifference: e.cashDifference !== null ? Number(e.cashDifference) : null,
        notes: e.notes,
        revision: e.revision,
        createdAt: e.createdAt,
      })),
    }));

    // Pagination
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 10);
    const totalRecords = mappedClosings.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const paginatedRecords = mappedClosings.slice((page - 1) * limit, page * limit);

    return {
      summary: {
        totalClosings: totalRecords,
        approvedClosings,
        pendingReviewClosings,
        rejectedClosings,
        notSubmittedClosings,
        totalExpectedCash: Math.round(totalExpectedCash * 100) / 100,
        totalActualCash: Math.round(totalActualCash * 100) / 100,
        netCashDiscrepancy: Math.round(totalCashDiscrepancy * 100) / 100,
        discrepantClosingsCount,
      },
      paymentMethodsBreakdown: paymentMethodsSummary,
      records: paginatedRecords,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    };
  }
}
