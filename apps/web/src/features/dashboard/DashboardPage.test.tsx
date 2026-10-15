// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardPage } from "./DashboardPage";
import * as authApi from "../auth/api/auth";
import * as dashboardApi from "./api/dashboardApi";

vi.mock("../auth/api/auth", () => ({
  getMe: vi.fn(),
}));

vi.mock("./api/dashboardApi", () => ({
  useOwnerDashboard: vi.fn(),
  useEmployeeDashboard: vi.fn(),
}));

// Mock fetchApi for branch list
vi.mock("../../utils/fetchApi", () => ({
  fetchApi: vi.fn().mockResolvedValue({
    data: [
      { id: "b-1", name: "Main Branch", code: "MAIN" },
      { id: "b-2", name: "Downtown Branch", code: "DT" },
    ],
  }),
}));

describe("DashboardPage Component (Slices 10.1 & 10.2)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders loading state while user profile is loading", () => {
    vi.mocked(authApi.getMe).mockReturnValue(new Promise(() => {}));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("dashboard-loading")).toBeTruthy();
  });

  it("renders Owner Dashboard when logged in as OWNER", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: {
        id: "owner-1",
        email: "owner@gelana.com",
        fullName: "System Owner",
        role: "OWNER",
        branchId: null,
      },
    } as any);

    vi.mocked(dashboardApi.useOwnerDashboard).mockReturnValue({
      data: {
        branchId: null,
        branchName: "All Branches",
        businessDate: "2026-10-15",
        kpis: {
          todaySales: 15450.5,
          todayTransactions: 24,
          inventoryValuation: 325000.0,
          lowStockCount: 4,
          outOfStockCount: 1,
        },
        actionRequired: {
          closingDiscrepancy: {
            count: 1,
            items: [
              {
                closingId: "cl-1",
                closingNumber: "DC-001",
                branchId: "b-1",
                branchName: "Main Branch",
                closingDate: "2026-10-15",
                expectedCash: 5000.0,
                actualCash: 4800.0,
                cashDifference: -200.0,
                status: "SUBMITTED",
                discrepancyReason: "Cash shortage",
                submittedAt: "2026-10-15T18:00:00.000Z",
              },
            ],
          },
          transferApprovals: {
            count: 2,
            items: [
              {
                transferId: "tr-1",
                transferNumber: "TR-001",
                sourceBranchName: "Main Branch",
                destinationBranchName: "Downtown Branch",
                itemsCount: 5,
                summary: "5 items requested",
                createdAt: "2026-10-15T10:00:00.000Z",
              },
            ],
          },
          stockThresholds: {
            lowStockCount: 4,
            outOfStockCount: 1,
            impactedBranchesSummary: "Main Branch, Downtown Branch",
          },
        },
        branchPerformance: [
          {
            branchId: "b-1",
            branchName: "Main Branch",
            branchCode: "MAIN",
            todaySales: 9800.0,
            todayTransactions: 15,
            lowStockCount: 2,
            outOfStockCount: 0,
            closingStatus: "SUBMITTED",
            closingDiscrepancy: -200.0,
            closingId: "cl-1",
          },
          {
            branchId: "b-2",
            branchName: "Downtown Branch",
            branchCode: "DT",
            todaySales: 5650.5,
            todayTransactions: 9,
            lowStockCount: 2,
            outOfStockCount: 1,
            closingStatus: "NOT_SUBMITTED",
            closingDiscrepancy: null,
            closingId: null,
          },
        ],
        salesTrend: {
          range: "today",
          intervals: [
            { label: "10:00", salesAmount: 2400, transactionCount: 4 },
            { label: "12:00", salesAmount: 4800, transactionCount: 8 },
            { label: "14:00", salesAmount: 8250, transactionCount: 12 },
          ],
          totalAmount: 15450.0,
          peakLabel: "14:00",
          peakAmount: 8250.0,
        },
        recentActivities: [
          {
            id: "act-1",
            type: "SALE",
            referenceNumber: "REC-001",
            title: "REC-001 completed",
            branchName: "Main Branch",
            timestamp: "2026-10-15T08:30:00.000Z",
            amount: 1200.0,
            subtitle: "Main Branch • Cash",
            badgeText: "Completed",
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
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Title and business-wide indicators
    expect(await screen.findByText("Owner Dashboard")).toBeTruthy();
    expect(screen.getByText(/Inventory Valuation/i)).toBeTruthy();
    expect(screen.getByText(/325,000\.00/i)).toBeTruthy();

    // Branch Performance table
    expect(screen.getAllByText("Main Branch").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Downtown Branch")).toBeTruthy();

    // Action Required Banner
    expect(screen.getByText(/1 Flagged/i)).toBeTruthy();
    expect(screen.getByText(/2 Awaiting/i)).toBeTruthy();

    // Navigation links
    expect(screen.getAllByText(/Review Closing/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Review Transfers/i)).toBeTruthy();
    expect(screen.getByText(/View All Sales/i)).toBeTruthy();
  });

  it("renders Employee Dashboard with branch-restricted operational metrics when logged in as EMPLOYEE", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: {
        id: "emp-1",
        email: "downtown@gelana.com",
        fullName: "Downtown Employee",
        role: "EMPLOYEE",
        branchId: "b-2",
      },
    } as any);

    vi.mocked(dashboardApi.useEmployeeDashboard).mockReturnValue({
      data: {
        branchId: "b-2",
        branchName: "Downtown Branch",
        branchCode: "DT",
        businessDate: "2026-10-15",
        kpis: {
          todayBranchSales: 5650.5,
          todayBranchTransactions: 9,
          todayOwnSales: 3200.0,
          todayOwnTransactions: 5,
          lowStockCount: 2,
          outOfStockCount: 0,
        },
        dailyClosing: {
          closingId: "cl-1",
          closingNumber: "DC-DT-001",
          status: "NOT_SUBMITTED",
          expectedCash: 4500.0,
          actualCash: null,
          cashDifference: null,
          nextAction: "Daily closing is open. Register sales normally and submit closing at end of shift.",
          rejectionReason: null,
        },
        pendingTransfers: {
          inboundDispatchedCount: 1,
          items: [
            {
              transferId: "tr-1",
              transferNumber: "TR-0012",
              sourceBranchName: "Central Warehouse",
              status: "DISPATCHED",
              itemCount: 4,
              dispatchedAt: "2026-10-15T07:30:00.000Z",
            },
          ],
        },
        recentSales: [
          {
            id: "sale-1",
            saleNumber: "REC-DT-001",
            soldAt: "2026-10-15T09:00:00.000Z",
            cashierName: "Downtown Employee",
            isOwnSale: true,
            grandTotal: 850.0,
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
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Title and Employee Context
    expect(await screen.findByText("Employee Dashboard")).toBeTruthy();
    expect(screen.getByText("Downtown Branch")).toBeTruthy();

    // Operational Action Buttons
    expect(screen.getByText("Record New Sale")).toBeTruthy();
    expect(screen.getByText("Daily Closing")).toBeTruthy();

    // Branch Operational KPIs
    expect(screen.getByText("Today's Branch Sales")).toBeTruthy();
    expect(screen.getByText("My Sales Today")).toBeTruthy();
    expect(screen.getByText("Low Stock Items")).toBeTruthy();
    expect(screen.getByText("Pending Stock Receipts")).toBeTruthy();

    // Branch Daily Closing Status card
    expect(screen.getByText("Today's Register Reconciliation")).toBeTruthy();
    expect(screen.getByText(/Daily closing is open/i)).toBeTruthy();

    // Inbound Transfer card
    expect(screen.getByText("TR-0012")).toBeTruthy();
    expect(screen.getByText(/dispatched from Central Warehouse/i)).toBeTruthy();

    // Recent Sales
    expect(screen.getByText("REC-DT-001")).toBeTruthy();

    // MUST NOT expose owner-only financial items
    expect(screen.queryByText("Inventory Valuation")).toBeNull();
    expect(screen.queryByText("Weighted Average Cost")).toBeNull();
    expect(screen.queryByText("Gross Profit")).toBeNull();
  });

  it("handles error state and provides retry action", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: {
        id: "owner-1",
        email: "owner@gelana.com",
        fullName: "System Owner",
        role: "OWNER",
      },
    } as any);

    const refetchMock = vi.fn();
    vi.mocked(dashboardApi.useOwnerDashboard).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error("Network timeout connecting to dashboard API"),
      refetch: refetchMock,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(await screen.findByText("Failed to load Owner Dashboard")).toBeTruthy();
    expect(screen.getByText("Network timeout connecting to dashboard API")).toBeTruthy();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});
