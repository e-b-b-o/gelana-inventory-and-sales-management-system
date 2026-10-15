// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function TestWrapper({ children, initialEntries = ["/"] }: { children: ReactNode; initialEntries?: string[] }) {
  return (
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Sidebar Navigation Grouping", () => {
  afterEach(() => {
    cleanup();
  });

  const dummyLogout = { mutate: vi.fn() };
  const ownerUser = { name: "Alice Owner", role: "OWNER" };
  const employeeUser = { name: "Bob Employee", role: "EMPLOYEE" };


  it("renders Sales as an expandable group with New Sale and Sales History", () => {
    render(
      <TestWrapper>
        <Sidebar isOwner={true} logoutMutation={dummyLogout} user={ownerUser} />
      </TestWrapper>
    );

    // Sales group header exists
    const salesGroupButton = screen.getByRole("button", { name: /sales/i });
    expect(salesGroupButton).toBeTruthy();
    expect(salesGroupButton.getAttribute("aria-expanded")).toBe("false");

    // Initially collapsed on dashboard route
    expect(screen.queryByText("New Sale")).toBeNull();
    expect(screen.queryByText("Sales History")).toBeNull();
    expect(screen.queryByText("Returns")).toBeNull();

    // Clicking expands the group
    fireEvent.click(salesGroupButton);
    expect(salesGroupButton.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("New Sale")).toBeTruthy();
    expect(screen.getByText("Sales History")).toBeTruthy();
    expect(screen.getByText("Returns")).toBeTruthy();

    // Clicking again collapses the group
    fireEvent.click(salesGroupButton);
    expect(salesGroupButton.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("New Sale")).toBeNull();
  });


  it("auto-expands Sales and highlights parent and active child when on /sales/new", () => {
    render(
      <TestWrapper initialEntries={["/sales/new"]}>
        <Sidebar isOwner={false} logoutMutation={dummyLogout} user={employeeUser} />
      </TestWrapper>
    );

    const salesGroupButton = screen.getByRole("button", { name: /sales/i });
    expect(salesGroupButton.getAttribute("aria-expanded")).toBe("true");

    // Parent group should have active styles (text-primary)
    expect(salesGroupButton.className).toContain("text-primary");

    // Child links visible
    const newSaleLink = screen.getByText("New Sale").closest("a");
    const salesHistoryLink = screen.getByText("Sales History").closest("a");

    expect(newSaleLink).toBeTruthy();
    expect(salesHistoryLink).toBeTruthy();

    // New Sale child link has active brand styling (bg-primary/10 text-primary), while Sales History does not
    expect(newSaleLink?.className).toContain("bg-primary/10");
    expect(newSaleLink?.className).toContain("text-primary");
    expect(salesHistoryLink?.className).not.toContain("bg-primary/10");
  });

  it("supports collapsing into compact icon rail and expanding back", () => {
    const onToggle = vi.fn();
    const queryClient = createTestQueryClient();
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar
            isOwner={true}
            logoutMutation={dummyLogout}
            user={ownerUser}
            isCollapsed={false}
            onToggleCollapse={onToggle}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const collapseBtn = screen.getByRole("button", { name: /collapse sidebar/i });
    expect(collapseBtn).toBeTruthy();
    fireEvent.click(collapseBtn);
    expect(onToggle).toHaveBeenCalledTimes(1);

    // Rerender as collapsed
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/"]}>
          <Sidebar
            isOwner={true}
            logoutMutation={dummyLogout}
            user={ownerUser}
            isCollapsed={true}
            onToggleCollapse={onToggle}
          />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const expandBtn = screen.getByRole("button", { name: /expand sidebar/i });
    expect(expandBtn).toBeTruthy();
  });

  it("renders Inventory as standalone item for Employee and expandable group for Owner", () => {
    // For employee: only 1 inventory item is visible, so it should render as a link, not an accordion button
    const { unmount } = render(
      <TestWrapper>
        <Sidebar isOwner={false} logoutMutation={dummyLogout} user={employeeUser} />
      </TestWrapper>
    );

    const inventoryLink = screen.getByRole("link", { name: /inventory/i });
    expect(inventoryLink.getAttribute("href")).toBe("/inventory");
    unmount();

    // For owner: both Current Inventory and Movements exist, so it renders as an expandable group
    render(
      <TestWrapper>
        <Sidebar isOwner={true} logoutMutation={dummyLogout} user={ownerUser} />
      </TestWrapper>
    );

    const inventoryGroupButton = screen.getByRole("button", { name: /inventory/i });
    expect(inventoryGroupButton).toBeTruthy();
    fireEvent.click(inventoryGroupButton);

    expect(screen.getByText("Current Inventory")).toBeTruthy();
    expect(screen.getByText("Movements")).toBeTruthy();
  });

  it("renders flyout submenus and active brand highlights when collapsed", () => {
    render(
      <TestWrapper initialEntries={["/sales/new"]}>
        <Sidebar
          isOwner={true}
          logoutMutation={dummyLogout}
          user={ownerUser}
          isCollapsed={true}
        />
      </TestWrapper>
    );

    // Sales group button is highlighted with active brand styling (bg-primary/10 text-primary)
    const salesGroupBtn = screen.getByRole("button", { name: /sales/i });
    expect(salesGroupBtn).toBeTruthy();
    expect(salesGroupBtn.className).toContain("bg-primary/10");
    expect(salesGroupBtn.className).toContain("text-primary");
    expect(salesGroupBtn.getAttribute("aria-expanded")).toBe("false");

    // Clicking the parent button opens the flyout submenu
    fireEvent.click(salesGroupBtn);
    expect(screen.getByRole("button", { name: /sales/i }).getAttribute("aria-expanded")).toBe("true");

    // Flyout submenu is present in portal with accessible menu role
    const flyoutMenu = screen.getByRole("menu", { name: /sales sub-menu/i });
    expect(flyoutMenu).toBeTruthy();

    // Child menu items exist in flyout with active styling on active route
    const newSaleItem = screen.getByRole("menuitem", { name: /new sale/i });
    expect(newSaleItem).toBeTruthy();
    expect(newSaleItem.className).toContain("bg-primary/10");
    expect(newSaleItem.className).toContain("text-primary");

    // Clicking again toggles the flyout closed
    fireEvent.click(salesGroupBtn);
    expect(salesGroupBtn.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menu", { name: /sales sub-menu/i })).toBeNull();
  });

  it("navigates and closes the flyout when a child is selected", () => {
    render(
      <TestWrapper initialEntries={["/"]}>
        <Sidebar
          isOwner={true}
          logoutMutation={dummyLogout}
          user={ownerUser}
          isCollapsed={true}
        />
      </TestWrapper>
    );

    const salesGroupBtn = screen.getByRole("button", { name: /sales/i });
    fireEvent.click(salesGroupBtn);

    const salesHistoryItem = screen.getByRole("menuitem", { name: /sales history/i });
    expect(salesHistoryItem).toBeTruthy();

    fireEvent.click(salesHistoryItem);
    // Menu should be closed after selecting child
    expect(screen.queryByRole("menu", { name: /sales sub-menu/i })).toBeNull();
  });

  it("closes the flyout on outside click or Escape key", () => {
    render(
      <TestWrapper initialEntries={["/"]}>
        <Sidebar
          isOwner={true}
          logoutMutation={dummyLogout}
          user={ownerUser}
          isCollapsed={true}
        />
      </TestWrapper>
    );

    const salesGroupBtn = screen.getByRole("button", { name: /sales/i });

    // Open via click
    fireEvent.click(salesGroupBtn);
    expect(screen.getByRole("menu", { name: /sales sub-menu/i })).toBeTruthy();

    // Press Escape to close
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu", { name: /sales sub-menu/i })).toBeNull();

    // Open again
    fireEvent.click(salesGroupBtn);
    expect(screen.getByRole("menu", { name: /sales sub-menu/i })).toBeTruthy();

    // Click outside to close
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu", { name: /sales sub-menu/i })).toBeNull();
  });

  it("supports keyboard navigation inside the flyout with ArrowDown and ArrowUp", () => {
    render(
      <TestWrapper initialEntries={["/"]}>
        <Sidebar
          isOwner={true}
          logoutMutation={dummyLogout}
          user={ownerUser}
          isCollapsed={true}
        />
      </TestWrapper>
    );

    const salesGroupBtn = screen.getByRole("button", { name: /sales/i });
    fireEvent.click(salesGroupBtn);

    const flyoutMenu = screen.getByRole("menu", { name: /sales sub-menu/i });
    const items = screen.getAllByRole("menuitem");
    expect(items.length).toBe(3);

    // Initial focus on first item
    items[0].focus();
    expect(document.activeElement).toBe(items[0]);

    // ArrowDown moves focus to next item
    fireEvent.keyDown(flyoutMenu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(items[1]);

    // ArrowDown again moves to third item
    fireEvent.keyDown(flyoutMenu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(items[2]);

    // ArrowDown wraps to first item
    fireEvent.keyDown(flyoutMenu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(items[0]);

    // ArrowUp wraps to last item
    fireEvent.keyDown(flyoutMenu, { key: "ArrowUp" });
    expect(document.activeElement).toBe(items[2]);
  });

  it("allows single-page items to navigate directly on click when collapsed", () => {
    render(
      <TestWrapper initialEntries={["/"]}>
        <Sidebar
          isOwner={true}
          logoutMutation={dummyLogout}
          user={ownerUser}
          isCollapsed={true}
        />
      </TestWrapper>
    );

    // Single-page items render as direct links with tooltips
    const transfersLink = screen.getByRole("link", { name: /transfers/i });
    expect(transfersLink).toBeTruthy();
    expect(transfersLink.getAttribute("href")).toBe("/transfers");

    const catalogLink = screen.getByRole("link", { name: /products & categories/i });
    expect(catalogLink).toBeTruthy();
    expect(catalogLink.getAttribute("href")).toBe("/catalog");
  });

  it("renders Daily Closing multi-page group flyout and highlights active child", () => {
    render(
      <TestWrapper initialEntries={["/daily-closing/history"]}>
        <Sidebar
          isOwner={true}
          logoutMutation={dummyLogout}
          user={ownerUser}
          isCollapsed={true}
        />
      </TestWrapper>
    );

    // Parent group button is highlighted
    const closingGroupBtn = screen.getByRole("button", { name: /daily closing/i });
    expect(closingGroupBtn).toBeTruthy();
    expect(closingGroupBtn.className).toContain("text-primary");

    // Click to open flyout
    fireEvent.click(closingGroupBtn);

    const flyout = screen.getByRole("menu", { name: /daily closing sub-menu/i });
    expect(flyout).toBeTruthy();

    const currentClosingItem = screen.getByRole("menuitem", { name: /current closing/i });
    const closingHistoryItem = screen.getByRole("menuitem", { name: /closing history/i });

    expect(currentClosingItem).toBeTruthy();
    expect(closingHistoryItem).toBeTruthy();

    // Closing History is the active destination
    expect(closingHistoryItem.className).toContain("bg-primary/10");
    expect(closingHistoryItem.className).toContain("text-primary");
    expect(currentClosingItem.className).not.toContain("bg-primary/10");
  });
});

