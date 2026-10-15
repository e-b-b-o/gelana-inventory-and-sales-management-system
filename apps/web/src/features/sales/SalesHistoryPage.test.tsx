// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SalesHistoryPage } from "./SalesHistoryPage";
import * as usersApi from "../users/api";
import * as salesApi from "./api";
import * as branchesApi from "../branches/api";

vi.mock("../users/api", () => ({
  useUsers: vi.fn(),
}));

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    useSales: vi.fn(),
  };
});

vi.mock("../branches/api", () => ({
  useBranches: vi.fn(),
}));

vi.mock("../auth/api/auth", () => ({
  getMe: vi.fn(),
}));

describe("SalesHistoryPage - Role-based permissions & query prevention", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.mocked(branchesApi.useBranches).mockReturnValue({
      data: [{ id: "b-1", name: "Main Branch", code: "MB" }],
    } as any);

    vi.mocked(salesApi.useSales).mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 1 } },
      isLoading: false,
      isError: false,
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("does not query users when logged in as an EMPLOYEE", () => {
    queryClient.setQueryData(["me"], {
      user: { id: "emp-1", role: "EMPLOYEE", branchId: "b-1" },
    });

    vi.mocked(usersApi.useUsers).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SalesHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Sales History" })).toBeTruthy();
    // useUsers should be called with enabled: false to prevent 403 Forbidden
    expect(usersApi.useUsers).toHaveBeenCalledWith({ enabled: false });
    // Employee dropdown filter should NOT be in document
    expect(screen.queryByText("All Staff")).toBeNull();
  });

  it("queries users and shows filter when logged in as an OWNER", () => {
    queryClient.setQueryData(["me"], {
      user: { id: "owner-1", role: "OWNER", branchId: null },
    });

    vi.mocked(usersApi.useUsers).mockReturnValue({
      data: [{ id: "u-1", name: "Abebe Employee", role: "EMPLOYEE" }],
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SalesHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole("heading", { level: 1, name: "Sales History" })).toBeTruthy();
    // useUsers should be called with enabled: true
    expect(usersApi.useUsers).toHaveBeenCalledWith({ enabled: true });
    // Employee dropdown filter SHOULD be in document
    expect(screen.getByText("All Staff")).toBeTruthy();
    expect(screen.getByText("Abebe Employee")).toBeTruthy();
  });
});
