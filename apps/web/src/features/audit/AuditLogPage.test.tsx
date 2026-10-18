// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuditLogPage } from "./AuditLogPage";
import * as apiModule from "../../lib/api";
import * as authApi from "../auth/api/auth";

vi.mock("../../lib/api", () => ({
  fetchApi: vi.fn(),
  API_URL: "http://localhost:3000/api/v1",
}));

vi.mock("../auth/api/auth", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/audit-logs"]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    ),
  };
}

describe("AuditLogPage", () => {
  const mockBranches = [
    { id: "branch-main", name: "Main Branch", code: "BRANCH-MAIN" },
    { id: "branch-dt", name: "Downtown Branch", code: "BRANCH-DT" },
  ];

  const mockLogs = [
    {
      id: "audit-1",
      actorId: "user-1",
      actorName: "John Owner",
      actorRole: "OWNER",
      action: "STOCK_ADJUSTED",
      category: "INVENTORY",
      entityType: "inventory_movement",
      entityId: "mov-1",
      branchId: "branch-main",
      branchName: "Main Branch",
      reason: "Physical count recount correction",
      metadata: { previousQuantity: 10, newQuantity: 12 },
      createdAt: "2026-10-18T08:00:00Z",
    },
    {
      id: "audit-2",
      actorId: "user-2",
      actorName: "Alice Employee",
      actorRole: "EMPLOYEE",
      action: "TRANSFER_REQUESTED",
      category: "TRANSFERS",
      entityType: "transfer",
      entityId: "tr-1",
      branchId: "branch-dt",
      branchName: "Downtown Branch",
      reason: "Stock replenishment request",
      metadata: { requestedItems: 2 },
      createdAt: "2026-10-18T07:30:00Z",
    },
  ];

  beforeEach(() => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: { id: "user-1", name: "John Owner", role: "OWNER", branchId: null },
    });

    vi.mocked(apiModule.fetchApi).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/branches") {
        return { data: mockBranches };
      }
      if (endpoint.startsWith("/audit-logs/audit-1")) {
        return { data: mockLogs[0] };
      }
      if (endpoint.startsWith("/audit-logs")) {
        const url = new URL(`http://localhost${endpoint}`);
        const category = url.searchParams.get("category");
        const search = url.searchParams.get("search");

        let items = [...mockLogs];
        if (category) {
          items = items.filter((l) => l.category === category);
        }
        if (search) {
          items = items.filter((l) =>
            l.reason.toLowerCase().includes(search.toLowerCase()) ||
            l.actorName.toLowerCase().includes(search.toLowerCase())
          );
        }

        return {
          data: items,
          pagination: {
            page: 1,
            limit: 20,
            total: items.length,
            totalPages: 1,
          },
        };
      }
      return { data: null };
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders audit log table with actors, actions, categories, and branches", async () => {
    renderWithClient(<AuditLogPage />);

    await waitFor(() => {
      expect(screen.getByText("Physical count recount correction")).toBeTruthy();
    });

    expect(screen.getByText("John Owner")).toBeTruthy();
    expect(screen.getByText("Alice Employee")).toBeTruthy();
    expect(screen.getByText("Stock Adjusted")).toBeTruthy();
    expect(screen.getByText("Transfer Requested")).toBeTruthy();
    expect(screen.getAllByText("Main Branch").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Downtown Branch").length).toBeGreaterThanOrEqual(1);
  });

  it("filters audit logs by category when dropdown option is selected", async () => {
    renderWithClient(<AuditLogPage />);

    await waitFor(() => {
      expect(screen.getByText("Physical count recount correction")).toBeTruthy();
    });

    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: "INVENTORY" } });

    await waitFor(() => {
      expect(apiModule.fetchApi).toHaveBeenCalledWith(
        expect.stringContaining("category=INVENTORY")
      );
    });
  });

  it("filters audit logs by search query keyword", async () => {
    renderWithClient(<AuditLogPage />);

    await waitFor(() => {
      expect(screen.getByText("Physical count recount correction")).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText(/Search action, actor, reason/i);
    fireEvent.change(searchInput, { target: { value: "recount correction" } });

    await waitFor(() => {
      expect(apiModule.fetchApi).toHaveBeenCalledWith(
        expect.stringContaining("search=recount+correction")
      );
    });
  });

  it("opens metadata inspection modal on clicking Inspect button and closes it", async () => {
    renderWithClient(<AuditLogPage />);

    await waitFor(() => {
      expect(screen.getByText("Physical count recount correction")).toBeTruthy();
    });

    const inspectButtons = screen.getAllByRole("button", { name: /Inspect/i });
    expect(inspectButtons.length).toBe(2);

    fireEvent.click(inspectButtons[0]);

    // Modal opens and detail query resolves
    await waitFor(() => {
      expect(screen.getByText("Audit Record Inspection")).toBeTruthy();
      expect(screen.getByText("Sanitized Metadata")).toBeTruthy();
    });

    // Close button
    const closeBtn = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText("Audit Record Inspection")).toBeNull();
    });
  });

  it("renders empty state message when no records match filter criteria", async () => {
    vi.mocked(apiModule.fetchApi).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/branches") return { data: mockBranches };
      if (endpoint.startsWith("/audit-logs")) {
        return {
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
        };
      }
      return { data: null };
    });

    renderWithClient(<AuditLogPage />);

    await waitFor(() => {
      expect(screen.getByText("No audit records found")).toBeTruthy();
    });
  });
});
