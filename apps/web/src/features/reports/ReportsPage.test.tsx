// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReportsPage } from "./components/ReportsPage";
import * as authApi from "../auth/api/auth";
import * as reportsApi from "./api/reportsApi";

vi.mock("../auth/api/auth", () => ({
  getMe: vi.fn(),
}));

vi.mock("./api/reportsApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api/reportsApi")>();
  return {
    ...actual,
    useSalesReport: vi.fn(),
    useInventoryReport: vi.fn(),
    useProfitReport: vi.fn(),
    useClosingReport: vi.fn(),
    exportToCsv: vi.fn(),
  };
});

// Mock fetchApi for branch listing
vi.mock("../../../lib/api", () => ({
  fetchApi: vi.fn().mockResolvedValue({
    data: [
      { id: "b-1", name: "Main Branch", code: "MAIN" },
      { id: "b-2", name: "Downtown Branch", code: "DT" },
    ],
  }),
}));

describe("ReportsPage Component (Milestone 10 — Slices 10.3, 10.4, 10.5, 10.6)", () => {
  let queryClient: QueryClient;

  const mockOwnerSalesReportData: reportsApi.SalesReportResponse = {
    summary: {
      totalSales: 45000.0,
      grossSales: 46200.0,
      totalReturns: 1200.0,
      totalTransactions: 60,
      averageSale: 750.0,
      totalUnitsSold: 300,
      topProduct: {
        productId: "p-1",
        productName: "Spiral Notebook A4",
        unitsSold: 240,
        unitName: "pcs",
        totalRevenue: 12000.0,
      },
      comparisonWithPreviousPeriod: {
        previousStartDate: "2026-09-15",
        previousEndDate: "2026-09-30",
        previousTotalSales: 40000.0,
        previousTransactions: 55,
        previousAverageSale: 727.27,
        salesGrowthPercent: 12.5,
        transactionsGrowthPercent: 9.1,
        averageSaleGrowthPercent: 3.1,
      },
    },
    trend: {
      interval: "day",
      peakDay: {
        date: "2026-10-10",
        totalSales: 6500.0,
      },
      dataPoints: [
        { date: "2026-10-01", label: "Oct 01", totalSales: 3000, transactionCount: 4 },
        { date: "2026-10-10", label: "Oct 10", totalSales: 6500, transactionCount: 8 },
        { date: "2026-10-15", label: "Oct 15", totalSales: 4000, transactionCount: 5 },
      ],
    },
    salesByBranch: [
      {
        branchId: "b-1",
        branchName: "Main Branch",
        branchCode: "MAIN",
        totalSales: 28000.0,
        transactionCount: 38,
        percentage: 62.2,
      },
      {
        branchId: "b-2",
        branchName: "Downtown Branch",
        branchCode: "DT",
        totalSales: 17000.0,
        transactionCount: 22,
        percentage: 37.8,
      },
    ],
    paymentMethodBreakdown: [
      {
        paymentMethodId: "pm-1",
        paymentMethodName: "Cash",
        receivedAmount: 30000.0,
        refundedAmount: 500.0,
        netAmount: 29500.0,
        transactionCount: 40,
        percentage: 65.6,
      },
    ],
    breakdownType: "day",
    detailedRecords: [
      {
        date: "2026-10-10",
        displayDate: "Oct 10",
        branch: "Main Branch",
        transactions: 8,
        averageSale: 812.5,
        topSellingItem: "Spiral Notebook A4 (25 units)",
        totalSales: 6500.0,
        isPeak: true,
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
    },
  };

  const mockInventoryReportData: reportsApi.InventoryReportResponse = {
    view: "balances",
    summary: {
      totalStock: 500,
      totalDamaged: 5,
      inTransitTotal: 20,
      lowStockCount: 2,
      outOfStockCount: 1,
      totalValuation: 75000.0,
    },
    records: [
      {
        productId: "p-1",
        productName: "Premium Pen",
        sku: "PEN-001",
        categoryName: "Stationery",
        branchId: "b-1",
        branchName: "Main Branch",
        availableQuantity: 150,
        damagedQuantity: 2,
        inTransitQuantity: 10,
        minimumStockQuantity: 30,
        stockStatus: "IN_STOCK",
        wac: 15.5,
        valuation: 2325.0,
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
    },
  };

  const mockProfitReportData: reportsApi.ProfitReportResponse = {
    summary: {
      grossRevenue: 50000.0,
      returnsAmount: 2000.0,
      netRevenue: 48000.0,
      grossCogs: 30000.0,
      returnCogsAdjustment: 1200.0,
      netCogs: 28800.0,
      grossProfit: 19200.0,
      profitMargin: 40.0,
      totalUnitsSold: 400,
      totalTransactions: 65,
    },
    trend: {
      peakDay: { date: "2026-10-12", profit: 4500.0 },
      dataPoints: [
        { date: "2026-10-10", revenue: 15000, cogs: 9000, profit: 6000, marginPercent: 40 },
        { date: "2026-10-12", revenue: 20000, cogs: 12000, profit: 8000, marginPercent: 40 },
      ],
    },
    breakdownType: "day",
    breakdown: [
      {
        key: "2026-10-10",
        name: "2026-10-10",
        grossRevenue: 15000.0,
        returns: 0,
        netRevenue: 15000.0,
        cogs: 9000.0,
        grossProfit: 6000.0,
        profitMargin: 40.0,
        unitsSold: 120,
      },
    ],
    detailedRecords: [
      {
        id: "item-1",
        saleNumber: "SAL-20261010-001",
        soldAt: "2026-10-10T14:30:00Z",
        branchId: "b-1",
        branchName: "Main Branch",
        productId: "p-1",
        productName: "Premium Pen",
        sku: "PEN-001",
        categoryId: "c-1",
        categoryName: "Stationery",
        quantitySold: 10,
        unitPrice: 30.0,
        unitCost: 18.0,
        netRevenue: 300.0,
        cogs: 180.0,
        grossProfit: 120.0,
        marginPercent: 40.0,
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
    },
  };

  const mockClosingReportData: reportsApi.ClosingReportResponse = {
    summary: {
      totalClosings: 12,
      approvedClosings: 10,
      pendingReviewClosings: 1,
      rejectedClosings: 1,
      notSubmittedClosings: 0,
      totalExpectedCash: 35000.0,
      totalActualCash: 34950.0,
      netCashDiscrepancy: -50.0,
      discrepantClosingsCount: 1,
    },
    paymentMethodsBreakdown: [
      {
        paymentMethodId: "pm-1",
        paymentMethodName: "Cash",
        receivedAmount: 35000.0,
        refundedAmount: 500.0,
        netAmount: 34500.0,
        transactionCount: 45,
      },
    ],
    records: [
      {
        id: "cls-1",
        closingNumber: "CLS-20261014-001",
        closingDate: "2026-10-14",
        branchId: "b-1",
        branchName: "Main Branch",
        status: "APPROVED",
        totalSalesAmount: 35000.0,
        totalReturnsAmount: 500.0,
        netSalesAmount: 34500.0,
        salesCount: 45,
        expectedCash: 35000.0,
        actualCash: 34950.0,
        cashDifference: -50.0,
        discrepancyReason: "Minor register change shortage",
        submittedById: "u-emp",
        submittedByName: "Main Cashier",
        submittedAt: "2026-10-14T20:00:00Z",
        reviewedById: "u-owner",
        reviewedByName: "System Owner",
        reviewedAt: "2026-10-14T21:00:00Z",
        reviewNotes: "Approved with small shortage noted",
        rejectionReason: null,
        revision: 1,
        payments: [
          {
            paymentMethodName: "Cash",
            receivedAmount: 35000.0,
            refundedAmount: 500.0,
            netAmount: 34500.0,
            transactionCount: 45,
          },
        ],
        events: [
          {
            id: "evt-1",
            eventType: "SUBMITTED",
            actorName: "Main Cashier",
            actorRole: "EMPLOYEE",
            expectedCash: 35000.0,
            actualCash: 34950.0,
            cashDifference: -50.0,
            notes: "Day completed",
            revision: 1,
            createdAt: "2026-10-14T20:00:00Z",
          },
        ],
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      totalRecords: 1,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();

    vi.mocked(reportsApi.useSalesReport).mockReturnValue({
      data: mockOwnerSalesReportData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(reportsApi.useInventoryReport).mockReturnValue({
      data: mockInventoryReportData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(reportsApi.useProfitReport).mockReturnValue({
      data: mockProfitReportData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(reportsApi.useClosingReport).mockReturnValue({
      data: mockClosingReportData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders Sales Reports tab by default and allows tab switching for Owner", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: {
        id: "owner-1",
        email: "owner@gelana.com",
        fullName: "System Owner",
        role: "OWNER",
      },
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Header and All 4 Tabs must be visible for Owner
    expect(await screen.findByText("Reports")).toBeTruthy();
    expect(screen.getByText("Sales Reports")).toBeTruthy();
    expect(screen.getByText("Inventory Reports")).toBeTruthy();
    expect(await screen.findByText("Profit Reports")).toBeTruthy();
    expect(screen.getByText("Closing Reports")).toBeTruthy();

    // Sales Tab is active
    expect(screen.getAllByText("Total Net Sales").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/45,000\.00/i)).toBeTruthy();

    // Switch to Inventory Reports tab
    fireEvent.click(screen.getByText("Inventory Reports"));
    expect(screen.getByText("Stock Balances")).toBeTruthy();
    expect(screen.getByText("Movements Ledger")).toBeTruthy();
    expect(screen.getByText("Transfers Reconciliation")).toBeTruthy();
    expect(screen.getByText("Total Available Stock")).toBeTruthy();

    // Switch to Profit Reports tab
    fireEvent.click(screen.getByText("Profit Reports"));
    expect(screen.getAllByText("Net Revenue").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Net COGS").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Gross Profit").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Profit Margin").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Profit & Revenue Trend")).toBeTruthy();

    // Switch to Closing Reports tab
    fireEvent.click(screen.getByText("Closing Reports"));
    expect(screen.getAllByText("Total Closings").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Expected Cash").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Actual Declared Cash").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Cash Variance").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Daily Closing Records")).toBeTruthy();
  });

  it("hides Profit Reports tab and restricts financial data for Employee", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: {
        id: "emp-1",
        email: "downtown@gelana.com",
        fullName: "Downtown Employee",
        role: "EMPLOYEE",
        branchId: "b-2",
      },
    } as any);

    // Mock employee inventory data without WAC or total valuation
    vi.mocked(reportsApi.useInventoryReport).mockReturnValue({
      data: {
        ...mockInventoryReportData,
        summary: {
          ...mockInventoryReportData.summary,
          totalValuation: null,
        },
        records: [
          {
            ...mockInventoryReportData.records[0],
            wac: null,
            valuation: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Reports")).toBeTruthy();

    // Profit Reports tab button must NOT be rendered for employees
    expect(screen.queryByText("Profit Reports")).toBeNull();

    // Switch to Inventory tab
    fireEvent.click(screen.getByText("Inventory Reports"));
    expect(screen.getByText("Stock Balances")).toBeTruthy();

    // Valuation card and WAC columns must be hidden for employee
    expect(screen.queryByText(/Inventory Valuation/i)).toBeNull();
    expect(screen.queryByText("WAC Cost")).toBeNull();
  });

  it("opens Closing Audit Details modal in Closing Reports tab", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: {
        id: "owner-1",
        email: "owner@gelana.com",
        fullName: "System Owner",
        role: "OWNER",
      },
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReportsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Switch to Closing Reports
    fireEvent.click(await screen.findByText("Closing Reports"));

    // Find and click Audit Details button
    const auditBtn = screen.getByRole("button", { name: /Audit Details/i });
    expect(auditBtn).toBeTruthy();
    fireEvent.click(auditBtn);

    // Modal opens showing reconciliation and audit timeline
    expect(screen.getByText(/Daily Closing Reconciliation #CLS-20261014-001/i)).toBeTruthy();
    expect(screen.getAllByText(/Minor register change shortage/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Tender Allocations/i)).toBeTruthy();
    expect(screen.getByText(/Review & Audit History/i)).toBeTruthy();
  });
});
