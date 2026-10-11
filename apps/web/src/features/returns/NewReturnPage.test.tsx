// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NewReturnPage } from "./NewReturnPage";
import * as paymentMethodsApi from "../payment-methods/api";
import * as branchesApi from "../branches/api";
import * as inventoryApi from "../inventory/api";

vi.mock("../auth/api/auth", () => ({
  getMe: vi.fn(),
}));

vi.mock("../payment-methods/api", () => ({
  usePaymentMethods: vi.fn(),
}));

vi.mock("../branches/api", () => ({
  useBranches: vi.fn(),
}));

vi.mock("../inventory/api", () => ({
  useInventoryBalances: vi.fn(),
}));

describe("NewReturnPage Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();

    queryClient.setQueryData(["me"], {
      user: { id: "user-1", name: "Test Owner", role: "OWNER", branchId: null },
    });

    vi.mocked(paymentMethodsApi.usePaymentMethods).mockReturnValue({
      data: [{ id: "pm-1", name: "Cash", isActive: true }],
    } as any);

    vi.mocked(branchesApi.useBranches).mockReturnValue({
      data: [{ id: "branch-1", name: "Main Branch", code: "MAIN" }],
    } as any);

    vi.mocked(inventoryApi.useInventoryBalances).mockReturnValue({
      data: { data: [] },
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders page header and actions without an internal duplicate breadcrumb", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/sales/returns/new"]}>
          <NewReturnPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Title and subtitle are present
    expect(screen.getByRole("heading", { name: /Process Sales Return/i })).toBeTruthy();
    expect(
      screen.getByText(/Restock sellable items, quarantine damaged goods, and issue customer refunds/i)
    ).toBeTruthy();

    // Back button is present
    expect(screen.getByRole("link", { name: /Back to Returns/i })).toBeTruthy();

    // Verify there is NO duplicate breadcrumb links inside the page body
    const links = screen.getAllByRole("link");
    const linkTexts = links.map((l) => l.textContent?.trim());
    expect(linkTexts).not.toContain("Sales");
    expect(linkTexts).not.toContain("Returns");
    expect(screen.queryByText("New Return")).toBeNull();
  });

  it("renders linked and owner-authorized unlinked return mode controls", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/sales/returns/new"]}>
          <NewReturnPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText(/Linked Return \(With Receipt \/ Sale #\)/i)).toBeTruthy();
    expect(screen.getByText(/Unlinked Return \(Owner Authorized\)/i)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Enter sale number/i)).toBeTruthy();
  });
});
