// @vitest-environment jsdom
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrentClosingPage } from "./CurrentClosingPage";
import { ClosingHistoryPage } from "./ClosingHistoryPage";
import * as closingApi from "./api";
import * as branchesApi from "../branches/api";

vi.mock("../auth/api/auth", () => ({
  getMe: vi.fn(),
}));

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    useCurrentClosing: vi.fn(),
    useSubmitClosing: vi.fn(),
    useApproveClosing: vi.fn(),
    useRejectClosing: vi.fn(),
    useClosingHistory: vi.fn(),
    useClosingById: vi.fn(),
  };
});

vi.mock("../branches/api", () => ({
  useBranches: vi.fn(),
}));

describe("Daily Closing Frontend Components (Slices 9.1 – 9.4)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();

    vi.mocked(branchesApi.useBranches).mockReturnValue({
      data: [
        { id: "branch-1", name: "Main Branch", code: "MAIN" },
        { id: "branch-2", name: "Downtown Branch", code: "DT" },
      ],
      isLoading: false,
    } as any);

    vi.mocked(closingApi.useSubmitClosing).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(closingApi.useApproveClosing).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(closingApi.useRejectClosing).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  describe("CurrentClosingPage", () => {
    it("renders unsubmitted current closing for Employee with sales summary, checks, and counted cash form", () => {
      queryClient.setQueryData(["me"], {
        user: { id: "emp-1", name: "Employee Abebe", role: "EMPLOYEE", branchId: "branch-1" },
      });

      vi.mocked(closingApi.useCurrentClosing).mockReturnValue({
        data: {
          data: {
            closing: {
              id: null,
              closingNumber: null,
              branchId: "branch-1",
              branch: { id: "branch-1", name: "Main Branch", code: "MAIN" },
              closingDate: "2026-10-14",
              status: "NOT_SUBMITTED" as const,
              totalSalesAmount: "12450.00",
              totalReturnsAmount: "0.00",
              netSalesAmount: "12450.00",
              salesCount: 37,
              expectedCash: "7200.00",
              actualCash: null,
              cashDifference: null,
              discrepancyReason: null,
              submittedById: null,
              submittedBy: null,
              submittedAt: null,
              reviewedById: null,
              reviewedBy: null,
              reviewedAt: null,
              reviewNotes: null,
              rejectionReason: null,
              revision: 1,
              payments: [
                {
                  paymentMethodId: "pm-1",
                  paymentMethodName: "Cash",
                  receivedAmount: "7200.00",
                  refundedAmount: "0.00",
                  netAmount: "7200.00",
                  transactionCount: 22,
                },
                {
                  paymentMethodId: "pm-2",
                  paymentMethodName: "Bank Transfer",
                  receivedAmount: "5250.00",
                  refundedAmount: "0.00",
                  netAmount: "5250.00",
                  transactionCount: 15,
                },
              ],
              events: [],
            },
            liveCalculations: null,
            checks: {
              allSalesRecorded: { passed: true, message: "37 of 37 sales entered for this business day." },
              previousDayStatus: { passed: true, message: "Previous Day: October 13 closing was approved." },
            },
          },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CurrentClosingPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Verify Header and Badges
      expect(screen.getByRole("heading", { level: 1, name: "Daily Closing" })).toBeTruthy();
      expect(screen.getByText("Not Submitted")).toBeTruthy();

      // Verify Sales & Payments reconciliation
      expect(screen.getAllByText("ETB 12,450.00").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("37 Completed Sales Transactions")).toBeTruthy();
      expect(screen.getByText("Cash")).toBeTruthy();
      expect(screen.getByText("Bank Transfer")).toBeTruthy();
      expect(screen.getAllByText("ETB 7,200.00").length).toBeGreaterThanOrEqual(1);

      // Verify Pre-Closing Readiness Checks
      expect(screen.getByText("37 of 37 sales entered for this business day.")).toBeTruthy();

      // Verify Submission form inputs
      expect(screen.getByLabelText(/Actual Physical Cash Counted/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: /Submit Daily Closing/i })).toBeTruthy();

      // Verify NO duplicate breadcrumb navigation is rendered inside page
      expect(screen.queryByRole("navigation", { name: /breadcrumb/i })).toBeNull();
      expect(screen.queryByRole("link", { name: /home/i })).toBeNull();
    });

    it("displays live variance calculation and requires explanation when counted cash differs from expected cash", () => {
      queryClient.setQueryData(["me"], {
        user: { id: "emp-1", name: "Employee Abebe", role: "EMPLOYEE", branchId: "branch-1" },
      });

      vi.mocked(closingApi.useCurrentClosing).mockReturnValue({
        data: {
          data: {
            closing: {
              id: null,
              closingNumber: null,
              branchId: "branch-1",
              branch: { id: "branch-1", name: "Main Branch", code: "MAIN" },
              closingDate: "2026-10-14",
              status: "NOT_SUBMITTED" as const,
              totalSalesAmount: "5000.00",
              totalReturnsAmount: "0.00",
              netSalesAmount: "5000.00",
              salesCount: 10,
              expectedCash: "3000.00",
              actualCash: null,
              cashDifference: null,
              discrepancyReason: null,
              submittedById: null,
              submittedBy: null,
              submittedAt: null,
              reviewedById: null,
              reviewedBy: null,
              reviewedAt: null,
              reviewNotes: null,
              rejectionReason: null,
              revision: 1,
              payments: [],
              events: [],
            },
            liveCalculations: null,
            checks: {
              allSalesRecorded: { passed: true, message: "All recorded" },
              previousDayStatus: { passed: true, message: "OK" },
            },
          },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CurrentClosingPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      const cashInput = screen.getByLabelText(/Actual Physical Cash Counted/i);

      // Enter 2950 (50 Birr shortage against 3000.00 expected)
      fireEvent.change(cashInput, { target: { value: "2950" } });

      // Variance warning should appear
      expect(screen.getByText(/Cash Discrepancy Detected/i)).toBeTruthy();
      expect(screen.getByLabelText(/Explanation \/ Reason for Discrepancy/i)).toBeTruthy();
    });

    it("renders Owner Review actions (Approve & Reject) when closing is SUBMITTED and user is OWNER", () => {
      queryClient.setQueryData(["me"], {
        user: { id: "owner-1", name: "Gelana Owner", role: "OWNER", branchId: null },
      });

      vi.mocked(closingApi.useCurrentClosing).mockReturnValue({
        data: {
          data: {
            closing: {
              id: "closing-123",
              closingNumber: "CLS-000042",
              branchId: "branch-1",
              branch: { id: "branch-1", name: "Main Branch", code: "MAIN" },
              closingDate: "2026-10-14",
              status: "SUBMITTED" as const,
              totalSalesAmount: "8000.00",
              totalReturnsAmount: "0.00",
              netSalesAmount: "8000.00",
              salesCount: 20,
              expectedCash: "4500.00",
              actualCash: "4500.00",
              cashDifference: "0.00",
              discrepancyReason: null,
              submittedById: "emp-1",
              submittedBy: { id: "emp-1", name: "Dawit T.", email: "dawit@gelana.com", role: "EMPLOYEE" },
              submittedAt: "2026-10-14T18:30:00Z",
              reviewedById: null,
              reviewedBy: null,
              reviewedAt: null,
              reviewNotes: null,
              rejectionReason: null,
              revision: 1,
              payments: [],
              events: [
                {
                  id: "ev-1",
                  closingId: "closing-123",
                  eventType: "SUBMITTED" as const,
                  actorId: "emp-1",
                  actorRole: "EMPLOYEE",
                  expectedCash: "4500.00",
                  actualCash: "4500.00",
                  cashDifference: "0.00",
                  notes: "Balanced",
                  revision: 1,
                  createdAt: "2026-10-14T18:30:00Z",
                  actor: { id: "emp-1", name: "Dawit T.", email: "dawit@gelana.com", role: "EMPLOYEE" },
                },
              ],
            },
            liveCalculations: null,
            checks: {
              allSalesRecorded: { passed: true, message: "All recorded" },
              previousDayStatus: { passed: true, message: "OK" },
            },
            branchOverview: [
              {
                branchId: "branch-1",
                branchName: "Main Branch",
                branchCode: "MAIN",
                closingId: "closing-123",
                closingNumber: "CLS-000042",
                status: "SUBMITTED" as const,
                totalSalesAmount: "8000.00",
                expectedCash: "4500.00",
                actualCash: "4500.00",
                cashDifference: "0.00",
                submittedAt: "2026-10-14T18:30:00Z",
                reviewedAt: null,
              },
            ],
          },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CurrentClosingPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Verify Owner Review card
      expect(screen.getByRole("button", { name: /Approve Closing/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Reject — Correction Required/i })).toBeTruthy();

      // Click Reject to open rejection drawer
      fireEvent.click(screen.getByRole("button", { name: /Reject — Correction Required/i }));
      expect(screen.getByLabelText(/Reason for Rejection/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: /Confirm Rejection/i })).toBeTruthy();
    });

    it("displays Rejection feedback when closing status is REJECTED", () => {
      queryClient.setQueryData(["me"], {
        user: { id: "emp-1", name: "Employee Abebe", role: "EMPLOYEE", branchId: "branch-1" },
      });

      vi.mocked(closingApi.useCurrentClosing).mockReturnValue({
        data: {
          data: {
            closing: {
              id: "closing-99",
              closingNumber: "CLS-000099",
              branchId: "branch-1",
              branch: { id: "branch-1", name: "Main Branch", code: "MAIN" },
              closingDate: "2026-10-14",
              status: "REJECTED" as const,
              totalSalesAmount: "6000.00",
              totalReturnsAmount: "0.00",
              netSalesAmount: "6000.00",
              salesCount: 12,
              expectedCash: "4000.00",
              actualCash: "3500.00",
              cashDifference: "-500.00",
              discrepancyReason: "Shortage",
              submittedById: "emp-1",
              submittedBy: { id: "emp-1", name: "Abebe", email: "a@g.com", role: "EMPLOYEE" },
              submittedAt: "2026-10-14T17:00:00Z",
              reviewedById: "owner-1",
              reviewedBy: { id: "owner-1", name: "Owner", email: "o@g.com", role: "OWNER" },
              reviewedAt: "2026-10-14T17:30:00Z",
              reviewNotes: null,
              rejectionReason: "Please recount the cash drawer 2.",
              revision: 1,
              payments: [],
              events: [],
            },
            liveCalculations: null,
            checks: {
              allSalesRecorded: { passed: true, message: "OK" },
              previousDayStatus: { passed: true, message: "OK" },
            },
          },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <CurrentClosingPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText("Rejected — Correction Required")).toBeTruthy();
      expect(screen.getByText(/Please recount the cash drawer 2/i)).toBeTruthy();
      // Form should be re-enabled for correction
      expect(screen.getByRole("button", { name: /Submit Daily Closing/i })).toBeTruthy();
    });
  });

  describe("ClosingHistoryPage (Slice 9.4)", () => {
    it("renders historical closing records with filters and opens detail modal", () => {
      queryClient.setQueryData(["me"], {
        user: { id: "owner-1", name: "Gelana Owner", role: "OWNER", branchId: null },
      });

      const mockClosingItem: closingApi.DailyClosingItem = {
        id: "c-1",
        closingNumber: "CLS-000001",
        branchId: "branch-1",
        branch: { id: "branch-1", name: "Main Branch", code: "MAIN" },
        closingDate: "2026-10-14",
        status: "APPROVED" as const,
        totalSalesAmount: "15000.00",
        totalReturnsAmount: "0.00",
        netSalesAmount: "15000.00",
        salesCount: 45,
        expectedCash: "9000.00",
        actualCash: "9000.00",
        cashDifference: "0.00",
        discrepancyReason: null,
        submittedById: "emp-1",
        submittedBy: { id: "emp-1", name: "Dawit Staff", email: "d@g.com", role: "EMPLOYEE" },
        submittedAt: "2026-10-14T18:00:00Z",
        reviewedById: "owner-1",
        reviewedBy: { id: "owner-1", name: "Abebe Owner", email: "o@g.com", role: "OWNER" },
        reviewedAt: "2026-10-14T18:30:00Z",
        reviewNotes: "Reconciled perfectly.",
        rejectionReason: null,
        revision: 1,
        payments: [
          {
            paymentMethodId: "pm-1",
            paymentMethodName: "Cash",
            receivedAmount: "9000.00",
            refundedAmount: "0.00",
            netAmount: "9000.00",
            transactionCount: 30,
          },
        ],
        events: [],
      };

      vi.mocked(closingApi.useClosingHistory).mockReturnValue({
        data: {
          data: [mockClosingItem],
          pagination: {
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
          },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ClosingHistoryPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByRole("heading", { level: 1, name: "Closing History" })).toBeTruthy();
      expect(screen.getByText("CLS-000001")).toBeTruthy();
      expect(screen.getAllByText("Main Branch").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("ETB 15,000.00")).toBeTruthy();

      // Click "View Details" to open detail modal
      const viewDetailsBtn = screen.getByRole("button", { name: /View Details/i });
      fireEvent.click(viewDetailsBtn);

      // Verify modal content
      expect(screen.getByRole("dialog")).toBeTruthy();
      expect(screen.getByText(/Reconciled perfectly/i)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();

      // Verify NO duplicate breadcrumb navigation is rendered inside page
      expect(screen.queryByRole("navigation", { name: /breadcrumb/i })).toBeNull();
      expect(screen.queryByRole("link", { name: /home/i })).toBeNull();
    });
  });
});
