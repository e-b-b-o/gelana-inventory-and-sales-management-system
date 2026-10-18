// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar";

describe("Sidebar Responsive Behavior", () => {
  afterEach(() => {
    cleanup();
  });

  const queryClient = new QueryClient();
  const mockLogout = { mutate: vi.fn(), isPending: false };
  const mockUser = { name: "Dawit", role: "OWNER" };

  it("renders collapsed desktop sidebar as a rail, but renders full readable drawer when mobile is open", () => {
    const handleCloseMobile = vi.fn();

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar
            isOwner={true}
            logoutMutation={mockLogout}
            user={mockUser}
            isCollapsed={true}
            isMobileOpen={false}
            onCloseMobile={handleCloseMobile}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Desktop collapsed rail: -translate-x-full on mobile, visible on md:
    const aside = screen.getByRole("complementary", { hidden: true }) || document.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside?.className).toContain("-translate-x-full");

    // Re-render with mobile drawer open
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar
            isOwner={true}
            logoutMutation={mockLogout}
            user={mockUser}
            isCollapsed={true}
            isMobileOpen={true}
            onCloseMobile={handleCloseMobile}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Mobile drawer should now slide in
    expect(aside?.className).toContain("translate-x-0");

    // Effective collapsed is false on mobile, so Dashboard label is visible
    expect(screen.getByText("Dashboard")).toBeDefined();

    // Close button should be present and call onCloseMobile
    const closeBtn = screen.getByTitle("Close navigation");
    expect(closeBtn).toBeDefined();
    fireEvent.click(closeBtn);
    expect(handleCloseMobile).toHaveBeenCalledTimes(1);
  });
});
