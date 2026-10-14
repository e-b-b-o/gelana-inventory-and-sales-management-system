// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TransfersListPage } from "./TransfersListPage";
import { NewTransferPage } from "./NewTransferPage";
import { TransferDetailsPage } from "./TransferDetailsPage";
import * as transfersApi from "./api";
import * as branchesApi from "../branches/api";
import * as productsApi from "../products/api";
import * as inventoryApi from "../inventory/api";

vi.mock("../auth/api/auth", () => ({
  getMe: vi.fn(),
}));

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    useTransfers: vi.fn(),
    useTransferDetails: vi.fn(),
    useCreateTransfer: vi.fn(),
    useApproveTransfer: vi.fn(),
    useRejectTransfer: vi.fn(),
    useDispatchTransfer: vi.fn(),
    useReceiveTransfer: vi.fn(),
    useResolveDiscrepancy: vi.fn(),
  };
});

vi.mock("../branches/api", () => ({
  useBranches: vi.fn(),
}));

vi.mock("../products/api", () => ({
  useProducts: vi.fn(),
}));

vi.mock("../inventory/api", () => ({
  useInventoryBalances: vi.fn(),
}));

describe("Transfers Frontend Pages", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();

    queryClient.setQueryData(["me"], {
      user: { id: "owner-1", name: "System Owner", role: "OWNER", branchId: null },
    });

    vi.mocked(branchesApi.useBranches).mockReturnValue({
      data: [
        { id: "branch-1", name: "Branch 1", code: "BR1" },
        { id: "branch-2", name: "Branch 2", code: "BR2" },
      ],
    } as any);

    vi.mocked(productsApi.useProducts).mockReturnValue({
      data: [
        { id: "prod-1", name: "A4 Paper", sku: "SKU-001" },
        { id: "prod-2", name: "Bic Pen", sku: "SKU-002" },
      ],
    } as any);

    vi.mocked(inventoryApi.useInventoryBalances).mockReturnValue({
      data: {
        data: [
          {
            id: "prod-1",
            sku: "SKU-001",
            name: "A4 Paper",
            totalAvailable: 50,
            balances: [{ branchId: "branch-1", availableQuantity: 50 }],
          },
        ],
      },
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  describe("TransfersListPage", () => {
    it("renders page header with single New Transfer button and transfers table with badges", () => {
      vi.mocked(transfersApi.useTransfers).mockReturnValue({
        data: {
          data: [
            {
              id: "trf-1",
              transferNumber: "TRF-000001",
              sourceBranch: { name: "Branch 1" },
              destinationBranch: { name: "Branch 2" },
              status: "REQUESTED",
              itemCount: 2,
              totalRequestedQuantity: 30,
              createdBy: { name: "Dawit T." },
              createdAt: "2026-10-11T12:00:00Z",
            },
          ],
          pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
        },
        isLoading: false,
        isError: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <TransfersListPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText("Stock Transfers")).toBeDefined();
      const newTransferLinks = screen.getAllByRole("link", { name: /New Transfer/i });
      expect(newTransferLinks.length).toBe(1);
      expect(newTransferLinks[0].getAttribute("href")).toBe("/transfers/new");
      // Verify no duplicate creation entry points
      expect(screen.queryByText("Create Transfer Request")).toBeNull();
      expect(screen.getByText("TRF-000001")).toBeDefined();
      expect(screen.getByText("Requested")).toBeDefined();
      expect(screen.getByText("Branch 1")).toBeDefined();
      expect(screen.getByText("Branch 2")).toBeDefined();
    });

    it("renders empty state without a duplicate creation button, keeping exactly one primary New Transfer button", () => {
      vi.mocked(transfersApi.useTransfers).mockReturnValue({
        data: {
          data: [],
          pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
        },
        isLoading: false,
        isError: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <TransfersListPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText("No transfers found")).toBeDefined();
      // Ensure only the header creation button exists, and no duplicate in the empty state
      const creationButtons = screen.getAllByRole("link", { name: /New Transfer/i });
      expect(creationButtons.length).toBe(1);
      expect(screen.queryByText("Create Transfer Request")).toBeNull();
    });
  });

  describe("NewTransferPage", () => {
    it("renders route selection, product selection, and submit controls without duplicate breadcrumbs", () => {
      vi.mocked(transfersApi.useCreateTransfer).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/transfers/new"]}>
            <NewTransferPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText("New Transfer Request")).toBeDefined();
      expect(screen.getByText("Back to Transfers")).toBeDefined();
      expect(screen.getByText("Transfer Route")).toBeDefined();
      expect(screen.getByText("Transfer Items")).toBeDefined();
      expect(screen.getByText("Submit Transfer Request")).toBeDefined();
    });
  });

  describe("TransferDetailsPage", () => {
    it("renders single dedicated transfer details page with progress stepper and status-aware actions", () => {
      vi.mocked(transfersApi.useTransferDetails).mockReturnValue({
        data: {
          id: "trf-1",
          transferNumber: "TRF-000018",
          status: "REQUESTED",
          notes: "Restock paper",
          sourceBranch: { id: "branch-1", name: "Branch 1", code: "BR1" },
          destinationBranch: { id: "branch-2", name: "Branch 2", code: "BR2" },
          createdBy: { name: "Dawit T." },
          createdAt: "2026-10-11T12:00:00Z",
          items: [
            {
              id: "item-1",
              productId: "prod-1",
              product: { name: "A4 Paper", sku: "SKU-001" },
              unit: { name: "Ream" },
              requestedQuantity: 20,
              approvedQuantity: null,
              dispatchedQuantity: null,
              sourceAvailableQuantity: 50,
            },
          ],
          events: [
            {
              id: "ev-1",
              eventType: "REQUESTED",
              actor: { name: "Dawit T." },
              createdAt: "2026-10-11T12:00:00Z",
              notes: "Submitted request",
            },
          ],
        },
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(transfersApi.useApproveTransfer).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
      vi.mocked(transfersApi.useRejectTransfer).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
      vi.mocked(transfersApi.useDispatchTransfer).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/transfers/trf-1"]}>
            <Routes>
              <Route path="/transfers/:id" element={<TransferDetailsPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Header and ID
      expect(screen.getAllByText("TRF-000018").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Transfer Progress")).toBeDefined();
      expect(screen.getByText("A4 Paper")).toBeDefined();

      // No page-level Back to Transfers link
      expect(screen.queryByText("Back to Transfers")).toBeNull();

      // Directional Route Indicator
      expect(screen.getByText("BR1 → BR2")).toBeDefined();
      expect(screen.getByText("Branch 1")).toBeDefined();
      expect(screen.getByText("Branch 2")).toBeDefined();

      // Owner action buttons available for REQUESTED status
      expect(screen.getByText("Approve Transfer")).toBeDefined();
      expect(screen.getByText("Reject Request")).toBeDefined();
    });

    it("renders Dispatch Stock action for Owner when status is APPROVED", () => {
      vi.mocked(transfersApi.useTransferDetails).mockReturnValue({
        data: {
          id: "trf-1",
          transferNumber: "TRF-000018",
          status: "APPROVED",
          sourceBranch: { id: "branch-1", name: "Branch 1", code: "BR1" },
          destinationBranch: { id: "branch-2", name: "Branch 2", code: "BR2" },
          createdBy: { name: "Dawit T." },
          approvedBy: { name: "System Owner" },
          createdAt: "2026-10-11T12:00:00Z",
          approvedAt: "2026-10-11T12:30:00Z",
          items: [
            {
              id: "item-1",
              productId: "prod-1",
              product: { name: "A4 Paper", sku: "SKU-001" },
              unit: { name: "Ream" },
              requestedQuantity: 20,
              approvedQuantity: 20,
              dispatchedQuantity: null,
              sourceAvailableQuantity: 50,
            },
          ],
          events: [],
        },
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(transfersApi.useApproveTransfer).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
      vi.mocked(transfersApi.useRejectTransfer).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
      vi.mocked(transfersApi.useDispatchTransfer).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/transfers/trf-1"]}>
            <Routes>
              <Route path="/transfers/:id" element={<TransferDetailsPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText("Dispatch Stock")).toBeDefined();
      expect(screen.queryByText("Approve Transfer")).toBeNull();
    });

    it("renders Receive Stock action when transfer is DISPATCHED for destination branch employee or Owner", () => {
      vi.mocked(transfersApi.useTransferDetails).mockReturnValue({
        data: {
          id: "trf-1",
          transferNumber: "TRF-000018",
          status: "DISPATCHED",
          sourceBranch: { id: "branch-1", name: "Branch 1", code: "BR1" },
          destinationBranch: { id: "branch-2", name: "Branch 2", code: "BR2" },
          destinationBranchId: "branch-2",
          createdBy: { name: "Dawit T." },
          approvedBy: { name: "System Owner" },
          dispatchedBy: { name: "System Owner" },
          createdAt: "2026-10-11T12:00:00Z",
          approvedAt: "2026-10-11T12:30:00Z",
          dispatchedAt: "2026-10-11T13:00:00Z",
          items: [
            {
              id: "item-1",
              productId: "prod-1",
              product: { name: "A4 Paper", sku: "SKU-001" },
              unit: { name: "Ream" },
              requestedQuantity: 20,
              approvedQuantity: 20,
              dispatchedQuantity: 20,
              sourceAvailableQuantity: 30,
            },
          ],
          events: [],
        },
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(transfersApi.useReceiveTransfer).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
      vi.mocked(transfersApi.useDispatchTransfer).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/transfers/trf-1"]}>
            <Routes>
              <Route path="/transfers/:id" element={<TransferDetailsPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      expect(screen.getByText("Receive Stock")).toBeDefined();
      expect(screen.getByText("Dispatched (In Transit)")).toBeDefined();
    });

    it("renders Prominent Discrepancy Card and Review Discrepancy button when status is DISCREPANCY", () => {
      vi.mocked(transfersApi.useTransferDetails).mockReturnValue({
        data: {
          id: "trf-1",
          transferNumber: "TRF-000018",
          status: "DISCREPANCY",
          hasDiscrepancy: true,
          sourceBranch: { id: "branch-1", name: "Branch 1", code: "BR1" },
          destinationBranch: { id: "branch-2", name: "Branch 2", code: "BR2" },
          destinationBranchId: "branch-2",
          createdBy: { name: "Dawit T." },
          receivedBy: { name: "Destination Staff" },
          receivedAt: "2026-10-11T14:00:00Z",
          receivingNotes: "Damaged packaging",
          items: [
            {
              id: "item-1",
              productId: "prod-1",
              product: { name: "A4 Paper", sku: "SKU-001" },
              unit: { name: "Ream" },
              requestedQuantity: 20,
              approvedQuantity: 20,
              dispatchedQuantity: 20,
              receivedQuantity: 15,
              damagedQuantity: 3,
              missingQuantity: 2,
              discrepancyReason: "Box crushed during transit",
              sourceAvailableQuantity: 30,
            },
          ],
          events: [],
        },
        isLoading: false,
        isError: false,
      } as any);

      vi.mocked(transfersApi.useResolveDiscrepancy).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={["/transfers/trf-1"]}>
            <Routes>
              <Route path="/transfers/:id" element={<TransferDetailsPage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );

      // Discrepancy header badge
      expect(screen.getAllByText("Received — Discrepancy").length).toBeGreaterThanOrEqual(1);

      // Prominent Amber Discrepancy Card
      expect(screen.getByText("Transfer Discrepancy Flagged")).toBeDefined();
      expect(screen.getByText(/Box crushed during transit/)).toBeDefined();
      expect(screen.getAllByText("Resolve Discrepancy").length).toBeGreaterThanOrEqual(1);
    });
  });
});

