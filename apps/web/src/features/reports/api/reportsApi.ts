import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export type SalesReportResponse = {
  summary: {
    totalSales: number;
    grossSales: number;
    totalReturns: number;
    totalTransactions: number;
    averageSale: number;
    totalUnitsSold: number;
    topProduct: {
      productId: string;
      productName: string;
      unitsSold: number;
      unitName: string;
      totalRevenue: number;
    } | null;
    comparisonWithPreviousPeriod: {
      previousStartDate: string;
      previousEndDate: string;
      previousTotalSales: number;
      previousTransactions: number;
      previousAverageSale: number;
      salesGrowthPercent: number;
      transactionsGrowthPercent: number;
      averageSaleGrowthPercent: number;
    };
  };
  trend: {
    interval: "day" | "week" | "month";
    peakDay: {
      date: string;
      totalSales: number;
    } | null;
    dataPoints: Array<{
      date: string;
      label: string;
      totalSales: number;
      transactionCount: number;
    }>;
  };
  salesByBranch: Array<{
    branchId: string;
    branchName: string;
    branchCode: string;
    totalSales: number;
    transactionCount: number;
    percentage: number;
  }>;
  paymentMethodBreakdown: Array<{
    paymentMethodId: string;
    paymentMethodName: string;
    receivedAmount: number;
    refundedAmount: number;
    netAmount: number;
    transactionCount: number;
    percentage: number;
  }>;
  breakdownType: "day" | "branch" | "employee" | "product" | "payment_method";
  detailedRecords: Array<any>;
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
};

export type SalesReportQuery = {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  employeeId?: string;
  productId?: string;
  paymentMethodId?: string;
  breakdown?: "day" | "branch" | "employee" | "product" | "payment_method";
  page?: number;
  limit?: number;
};

export function useSalesReport(query: SalesReportQuery) {
  const queryParams = new URLSearchParams();
  if (query.startDate) queryParams.set("startDate", query.startDate);
  if (query.endDate) queryParams.set("endDate", query.endDate);
  if (query.branchId) queryParams.set("branchId", query.branchId);
  if (query.employeeId) queryParams.set("employeeId", query.employeeId);
  if (query.productId) queryParams.set("productId", query.productId);
  if (query.paymentMethodId) queryParams.set("paymentMethodId", query.paymentMethodId);
  if (query.breakdown) queryParams.set("breakdown", query.breakdown);
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: [
      "reports",
      "sales",
      query.startDate,
      query.endDate,
      query.branchId,
      query.employeeId,
      query.productId,
      query.paymentMethodId,
      query.breakdown,
      query.page,
      query.limit,
    ],
    queryFn: async (): Promise<SalesReportResponse> => {
      const res = await fetchApi(`/reports/sales${queryString}`);
      return res.data;
    },
    staleTime: 30000,
  });
}

export type InventoryReportResponse = {
  view: "balances" | "movements" | "transfers";
  summary: {
    totalStock?: number;
    totalDamaged?: number;
    inTransitTotal?: number;
    lowStockCount?: number;
    outOfStockCount?: number;
    totalValuation?: number | null;
    totalMovements?: number;
    totalUnitsAdded?: number;
    totalUnitsDeducted?: number;
    netMovement?: number;
    totalTransfers?: number;
    totalDispatchedUnits?: number;
    totalReceivedUnits?: number;
    totalDamagedUnits?: number;
    totalMissingUnits?: number;
    totalInTransitUnits?: number;
    discrepancyCount?: number;
  };
  records: Array<any>;
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
};

export type InventoryReportQuery = {
  branchId?: string;
  categoryId?: string;
  productId?: string;
  view?: "balances" | "movements" | "transfers";
  stockStatus?: "all" | "low" | "out" | "in_stock";
  movementType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export function useInventoryReport(query: InventoryReportQuery) {
  const queryParams = new URLSearchParams();
  if (query.branchId) queryParams.set("branchId", query.branchId);
  if (query.categoryId) queryParams.set("categoryId", query.categoryId);
  if (query.productId) queryParams.set("productId", query.productId);
  if (query.view) queryParams.set("view", query.view);
  if (query.stockStatus) queryParams.set("stockStatus", query.stockStatus);
  if (query.movementType) queryParams.set("movementType", query.movementType);
  if (query.startDate) queryParams.set("startDate", query.startDate);
  if (query.endDate) queryParams.set("endDate", query.endDate);
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: [
      "reports",
      "inventory",
      query.branchId,
      query.categoryId,
      query.productId,
      query.view,
      query.stockStatus,
      query.movementType,
      query.startDate,
      query.endDate,
      query.page,
      query.limit,
    ],
    queryFn: async (): Promise<InventoryReportResponse> => {
      const res = await fetchApi(`/reports/inventory${queryString}`);
      return res.data;
    },
    staleTime: 30000,
  });
}

export type ProfitReportResponse = {
  summary: {
    grossRevenue: number;
    returnsAmount: number;
    netRevenue: number;
    grossCogs: number;
    returnCogsAdjustment: number;
    netCogs: number;
    grossProfit: number;
    profitMargin: number;
    totalUnitsSold: number;
    totalTransactions: number;
  };
  trend: {
    peakDay: { date: string; profit: number } | null;
    dataPoints: Array<{
      date: string;
      revenue: number;
      cogs: number;
      profit: number;
      marginPercent: number;
    }>;
  };
  breakdownType: "day" | "branch" | "category" | "product";
  breakdown: Array<{
    key: string;
    name: string;
    grossRevenue: number;
    returns: number;
    netRevenue: number;
    cogs: number;
    grossProfit: number;
    profitMargin: number;
    unitsSold: number;
  }>;
  detailedRecords: Array<{
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
  }>;
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
};

export type ProfitReportQuery = {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  categoryId?: string;
  productId?: string;
  breakdown?: "day" | "branch" | "category" | "product";
  page?: number;
  limit?: number;
};

export function useProfitReport(query: ProfitReportQuery, enabled: boolean = true) {
  const queryParams = new URLSearchParams();
  if (query.startDate) queryParams.set("startDate", query.startDate);
  if (query.endDate) queryParams.set("endDate", query.endDate);
  if (query.branchId) queryParams.set("branchId", query.branchId);
  if (query.categoryId) queryParams.set("categoryId", query.categoryId);
  if (query.productId) queryParams.set("productId", query.productId);
  if (query.breakdown) queryParams.set("breakdown", query.breakdown);
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: [
      "reports",
      "profit",
      query.startDate,
      query.endDate,
      query.branchId,
      query.categoryId,
      query.productId,
      query.breakdown,
      query.page,
      query.limit,
    ],
    queryFn: async (): Promise<ProfitReportResponse> => {
      const res = await fetchApi(`/reports/profit${queryString}`);
      return res.data;
    },
    enabled,
    staleTime: 30000,
  });
}

export type ClosingReportResponse = {
  summary: {
    totalClosings: number;
    approvedClosings: number;
    pendingReviewClosings: number;
    rejectedClosings: number;
    notSubmittedClosings: number;
    totalExpectedCash: number;
    totalActualCash: number;
    netCashDiscrepancy: number;
    discrepantClosingsCount: number;
  };
  paymentMethodsBreakdown: Array<{
    paymentMethodId: string;
    paymentMethodName: string;
    receivedAmount: number;
    refundedAmount: number;
    netAmount: number;
    transactionCount: number;
  }>;
  records: Array<{
    id: string;
    closingNumber: string;
    closingDate: string;
    branchId: string;
    branchName: string;
    status: string;
    totalSalesAmount: number;
    totalReturnsAmount: number;
    netSalesAmount: number;
    salesCount: number;
    expectedCash: number;
    actualCash: number | null;
    cashDifference: number | null;
    discrepancyReason: string | null;
    submittedById: string | null;
    submittedByName: string | null;
    submittedAt: string | null;
    reviewedById: string | null;
    reviewedByName: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    rejectionReason: string | null;
    revision: number;
    payments: Array<{
      paymentMethodName: string;
      receivedAmount: number;
      refundedAmount: number;
      netAmount: number;
      transactionCount: number;
    }>;
    events: Array<{
      id: string;
      eventType: string;
      actorName: string;
      actorRole: string;
      expectedCash: number;
      actualCash: number | null;
      cashDifference: number | null;
      notes: string | null;
      revision: number;
      createdAt: string;
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
};

export type ClosingReportQuery = {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  status?: "all" | "SUBMITTED" | "APPROVED" | "REJECTED" | "NOT_SUBMITTED";
  hasDiscrepancy?: boolean;
  page?: number;
  limit?: number;
};

export function useClosingReport(query: ClosingReportQuery) {
  const queryParams = new URLSearchParams();
  if (query.startDate) queryParams.set("startDate", query.startDate);
  if (query.endDate) queryParams.set("endDate", query.endDate);
  if (query.branchId) queryParams.set("branchId", query.branchId);
  if (query.status && query.status !== "all") queryParams.set("status", query.status);
  if (query.hasDiscrepancy !== undefined) queryParams.set("hasDiscrepancy", String(query.hasDiscrepancy));
  if (query.page) queryParams.set("page", String(query.page));
  if (query.limit) queryParams.set("limit", String(query.limit));

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: [
      "reports",
      "closing",
      query.startDate,
      query.endDate,
      query.branchId,
      query.status,
      query.hasDiscrepancy,
      query.page,
      query.limit,
    ],
    queryFn: async (): Promise<ClosingReportResponse> => {
      const res = await fetchApi(`/reports/closing${queryString}`);
      return res.data;
    },
    staleTime: 30000,
  });
}

/**
 * Client-side CSV export helper for tabular report records
 */
export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
