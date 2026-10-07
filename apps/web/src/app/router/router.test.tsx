import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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
    expect(screen.queryByText("EMPLOYEE")).toBeTruthy();
    expect(screen.queryByText("Products & Categories")).toBeTruthy();
    expect(screen.queryByText("Suppliers")).toBeNull();
    expect(screen.queryByText("Users")).toBeNull();
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
    expect(screen.queryByText("OWNER")).toBeTruthy();
    expect(screen.queryByText("Products & Categories")).toBeTruthy();
  });
});
