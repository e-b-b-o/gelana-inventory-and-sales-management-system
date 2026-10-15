import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

export type OwnerDashboardResponse = {
  branchId: string | null;
  branchName: string;
  businessDate: string;
  kpis: {
    todaySales: number;
    todayTransactions: number;
    inventoryValuation: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  actionRequired: {
    closingDiscrepancy: {
      count: number;
      items: Array<{
        closingId: string;
        closingNumber: string;
        branchId: string;
        branchName: string;
        closingDate: string;
        expectedCash: number;
        actualCash: number | null;
        cashDifference: number;
        status: string;
        discrepancyReason: string | null;
        submittedAt: string | null;
      }>;
    };
    transferApprovals: {
      count: number;
      items: Array<{
        transferId: string;
        transferNumber: string;
        sourceBranchName: string;
        destinationBranchName: string;
        itemsCount: number;
        summary: string;
        createdAt: string;
      }>;
    };
    stockThresholds: {
      lowStockCount: number;
      outOfStockCount: number;
      impactedBranchesSummary: string;
    };
  };
  branchPerformance: Array<{
    branchId: string;
    branchName: string;
    branchCode: string;
    todaySales: number;
    todayTransactions: number;
    lowStockCount: number;
    outOfStockCount: number;
    closingStatus: "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";
    closingDiscrepancy: number | null;
    closingId: string | null;
  }>;
  salesTrend: {
    range: "today" | "7days" | "month";
    intervals: Array<{
      label: string;
      salesAmount: number;
      transactionCount: number;
    }>;
    totalAmount: number;
    peakLabel: string | null;
    peakAmount: number;
  };
  recentActivities: Array<{
    id: string;
    type: "SALE" | "RECEIVING" | "TRANSFER" | "CLOSING" | "RETURN";
    referenceNumber: string;
    title: string;
    branchName: string;
    timestamp: string;
    amount: number | null;
    subtitle: string;
    badgeText?: string | null;
  }>;
};

export type EmployeeDashboardResponse = {
  branchId: string;
  branchName: string;
  branchCode: string;
  businessDate: string;
  kpis: {
    todayBranchSales: number;
    todayBranchTransactions: number;
    todayOwnSales: number;
    todayOwnTransactions: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  dailyClosing: {
    closingId: string | null;
    closingNumber: string | null;
    status: "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";
    expectedCash: number;
    actualCash: number | null;
    cashDifference: number | null;
    nextAction: string;
    rejectionReason: string | null;
  };
  pendingTransfers: {
    inboundDispatchedCount: number;
    items: Array<{
      transferId: string;
      transferNumber: string;
      sourceBranchName: string;
      status: string;
      createdAt: string;
      dispatchedAt: string | null;
      itemsCount: number;
    }>;
  };
  recentSales: Array<{
    id: string;
    saleNumber: string;
    soldAt: string;
    cashierName: string;
    isOwnSale: boolean;
    grandTotal: number;
    status: string;
  }>;
  stockAlerts: Array<{
    productId: string;
    productName: string;
    sku: string;
    categoryName: string;
    availableQuantity: number;
    minimumStockQuantity: number;
    status: "LOW_STOCK" | "OUT_OF_STOCK";
  }>;
};

export function useOwnerDashboard(params?: { branchId?: string; trendRange?: "today" | "7days" | "month" }) {
  const queryParams = new URLSearchParams();
  if (params?.branchId) queryParams.set("branchId", params.branchId);
  if (params?.trendRange) queryParams.set("trendRange", params.trendRange);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: ["dashboard", "owner", params?.branchId, params?.trendRange],
    queryFn: async (): Promise<OwnerDashboardResponse> => {
      const res = await fetchApi(`/dashboard/owner${queryString}`);
      return res.data;
    },
    staleTime: 30000,
  });
}

export function useEmployeeDashboard(params?: { branchId?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.branchId) queryParams.set("branchId", params.branchId);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

  return useQuery({
    queryKey: ["dashboard", "employee", params?.branchId],
    queryFn: async (): Promise<EmployeeDashboardResponse> => {
      const res = await fetchApi(`/dashboard/employee${queryString}`);
      return res.data;
    },
    staleTime: 30000,
  });
}
