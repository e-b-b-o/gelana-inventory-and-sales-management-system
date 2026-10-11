// @vitest-environment jsdom
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppShell } from "../layout/AppShell";
import * as authApi from "../../features/auth/api/auth";

vi.mock("../../features/auth/api/auth", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("AppShell and Routing behavior", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders Employee navigation items for EMPLOYEE role", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: { name: "John Doe", role: "EMPLOYEE", branchId: "123" },
    });
    
    const router = createMemoryRouter([
      {
        path: "/",
        element: <AppShell />,
        children: [{ index: true, element: <div>Dashboard Content</div> }]
      }
    ]);

    render(
      <QueryClientProvider client={createTestClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    // Wait for the query to resolve
    await waitFor(() => {
      expect(screen.queryByText("Dashboard Content")).toBeTruthy();
    });

    expect(screen.queryByText("John Doe")).toBeTruthy();
    expect(screen.queryByText("employee")).toBeTruthy();
    expect(screen.queryByText("Products & Categories")).toBeTruthy();
    expect(screen.queryByText("Suppliers")).toBeNull();
    expect(screen.queryByText("Users & Branches")).toBeNull();
  });

  it("renders Owner navigation items for OWNER role", async () => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: { name: "Jane Boss", role: "OWNER", branchId: null },
    });
    
    const router = createMemoryRouter([
      {
        path: "/",
        element: <AppShell />,
        children: [{ index: true, element: <div>Dashboard Content</div> }]
      }
    ]);

    render(
      <QueryClientProvider client={createTestClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Dashboard Content")).toBeTruthy();
    });

    expect(screen.queryByText("Jane Boss")).toBeTruthy();
    expect(screen.queryByText("owner")).toBeTruthy();
    expect(screen.queryByText("Products & Categories")).toBeTruthy();
  });

  describe("Transfers routing resolution", () => {
    beforeEach(() => {
      vi.mocked(authApi.getMe).mockResolvedValue({
        user: { id: "owner-1", name: "Jane Boss", role: "OWNER", branchId: null },
      });
    });

    it("resolves /transfers/new to NewTransferPage without rendering 404 fallback", async () => {
      const { routes } = await import("./index");
      const memoryRouter = createMemoryRouter(routes, {
        initialEntries: ["/transfers/new"],
      });

      render(
        <QueryClientProvider client={createTestClient()}>
          <RouterProvider router={memoryRouter} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText("New Transfer Request")).toBeTruthy();
      });

      // Verify that the 404 error fallback is NOT rendered
      expect(screen.queryByText("Page not found")).toBeNull();
      expect(screen.queryByText("We couldn't find the page you're looking for.")).toBeNull();
      expect(screen.getByText("Submit Transfer Request")).toBeTruthy();
    });

    it("resolves /transfers to TransfersListPage with exactly one New Transfer button", async () => {
      const { routes } = await import("./index");
      const memoryRouter = createMemoryRouter(routes, {
        initialEntries: ["/transfers"],
      });

      render(
        <QueryClientProvider client={createTestClient()}>
          <RouterProvider router={memoryRouter} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText("Stock Transfers")).toBeTruthy();
      });

      const newTransferLinks = screen.getAllByRole("link", { name: /New Transfer/i });
      expect(newTransferLinks.length).toBe(1);
      expect(newTransferLinks[0].getAttribute("href")).toBe("/transfers/new");
      // Verify no duplicate creation entry points
      expect(screen.queryByText("Create Transfer Request")).toBeNull();
    });

    it("renders NotFoundPage for genuinely unknown routes", async () => {
      const { routes } = await import("./index");
      const memoryRouter = createMemoryRouter(routes, {
        initialEntries: ["/genuinely-unknown-transfers-path"],
      });

      render(
        <QueryClientProvider client={createTestClient()}>
          <RouterProvider router={memoryRouter} />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.queryByText("Page not found")).toBeTruthy();
      });
    });
  });
});
