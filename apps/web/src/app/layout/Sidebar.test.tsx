// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "./Sidebar";

describe("Sidebar Navigation Grouping", () => {
  afterEach(() => {
    cleanup();
  });

  const dummyLogout = { mutate: vi.fn() };
  const ownerUser = { name: "Alice Owner", role: "OWNER" };
  const employeeUser = { name: "Bob Employee", role: "EMPLOYEE" };


  it("renders Sales as an expandable group with New Sale and Sales History", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar isOwner={true} logoutMutation={dummyLogout} user={ownerUser} />
      </MemoryRouter>
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
      <MemoryRouter initialEntries={["/sales/new"]}>
        <Sidebar isOwner={false} logoutMutation={dummyLogout} user={employeeUser} />
      </MemoryRouter>
    );

    const salesGroupButton = screen.getByRole("button", { name: /sales/i });
    expect(salesGroupButton.getAttribute("aria-expanded")).toBe("true");

    // Parent group should have active styles (border-primary, text-primary)
    expect(salesGroupButton.className).toContain("border-primary");
    expect(salesGroupButton.className).toContain("text-primary");

    // Child links visible
    const newSaleLink = screen.getByText("New Sale").closest("a");
    const salesHistoryLink = screen.getByText("Sales History").closest("a");

    expect(newSaleLink).toBeTruthy();
    expect(salesHistoryLink).toBeTruthy();

    // New Sale child link has active styling, while Sales History does not
    expect(newSaleLink?.className).toContain("bg-primary-fixed");
    expect(newSaleLink?.className).toContain("text-primary");
    expect(salesHistoryLink?.className).not.toContain("bg-primary-fixed");
  });

  it("renders Inventory as standalone item for Employee and expandable group for Owner", () => {
    // For employee: only 1 inventory item is visible, so it should render as a link, not an accordion button
    const { unmount } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar isOwner={false} logoutMutation={dummyLogout} user={employeeUser} />
      </MemoryRouter>
    );

    const inventoryLink = screen.getByRole("link", { name: /inventory/i });
    expect(inventoryLink.getAttribute("href")).toBe("/inventory");
    unmount();

    // For owner: both Current Inventory and Movements exist, so it renders as an expandable group
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar isOwner={true} logoutMutation={dummyLogout} user={ownerUser} />
      </MemoryRouter>
    );

    const inventoryGroupButton = screen.getByRole("button", { name: /inventory/i });
    expect(inventoryGroupButton).toBeTruthy();
    fireEvent.click(inventoryGroupButton);

    expect(screen.getByText("Current Inventory")).toBeTruthy();
    expect(screen.getByText("Movements")).toBeTruthy();
  });
});
