// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "./Header";

describe("Header Breadcrumbs", () => {
  afterEach(() => {
    cleanup();
  });

  const user = { name: "Dawit", role: "OWNER" };

  it("renders Product Details generic label when product name is not yet loaded and never renders raw UUID", () => {
    const queryClient = new QueryClient();
    const testUuid = "2360dbd5-00e3-4180-bc8f-87d2ba3a3099";

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/catalog/${testUuid}`]}>
          <Header user={user} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Must show Product Details
    expect(screen.getByText("Product Details")).toBeDefined();
    // Must NOT display raw UUID
    expect(screen.queryByText(testUuid)).toBeNull();
    expect(screen.queryByText("2360dbd5 00e3 4180 bc8f 87d2ba3a3099")).toBeNull();

    // Intermediate crumb "Product Catalog" must be a clickable link to /catalog
    const catalogLink = screen.getByRole("link", { name: "Product Catalog" });
    expect(catalogLink.getAttribute("href")).toBe("/catalog");
  });

  it("resolves and displays product name when available in queryClient cache", () => {
    const queryClient = new QueryClient();
    const testUuid = "2360dbd5-00e3-4180-bc8f-87d2ba3a3099";

    // Seed query cache with product
    queryClient.setQueryData(["products"], [
      {
        id: testUuid,
        name: "Standard Cement 50kg",
        sku: "CEM-001",
        unit: "Bag",
        defaultSellingPrice: 850,
        isActive: true,
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/catalog/${testUuid}`]}>
          <Header user={user} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Standard Cement 50kg")).toBeDefined();
    expect(screen.queryByText(testUuid)).toBeNull();
  });

  it("renders Transfer Details or transfer number and provides clickable breadcrumb back to /transfers", () => {
    const queryClient = new QueryClient();
    const transferId = "8a72b841-5c3b-4654-8c4d-91b7e6c0c29a";

    // Seed query cache with transfer details
    queryClient.setQueryData(["transfer-details", transferId], {
      id: transferId,
      transferNumber: "TRF-000042",
      status: "REQUESTED",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/transfers/${transferId}`]}>
          <Header user={user} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Renders human-readable transfer number
    expect(screen.getByText("TRF-000042")).toBeDefined();
    expect(screen.queryByText(transferId)).toBeNull();

    // Renders clickable link to Transfers
    const transfersLink = screen.getByRole("link", { name: "Transfers" });
    expect(transfersLink.getAttribute("href")).toBe("/transfers");
  });

  it("renders fallback Transfer Details label when transfer details are still loading", () => {
    const queryClient = new QueryClient();
    const transferId = "9c23b841-5c3b-4654-8c4d-91b7e6c0c29a";

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/transfers/${transferId}`]}>
          <Header user={user} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Transfer Details")).toBeDefined();
    expect(screen.queryByText(transferId)).toBeNull();

    const transfersLink = screen.getByRole("link", { name: "Transfers" });
    expect(transfersLink.getAttribute("href")).toBe("/transfers");
  });

  it("handles sales detail breadcrumbs with clickable /sales link and human-readable label", () => {
    const queryClient = new QueryClient();
    const saleId = "11111111-2222-3333-4444-555555555555";

    queryClient.setQueryData(["sale-details", saleId], {
      id: saleId,
      saleNumber: "SAL-000109",
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/sales/${saleId}`]}>
          <Header user={user} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("SAL-000109")).toBeDefined();
    expect(screen.queryByText(saleId)).toBeNull();

    const salesLink = screen.getByRole("link", { name: "Sales" });
    expect(salesLink.getAttribute("href")).toBe("/sales");
  });

  it("handles returns detail breadcrumbs with nested clickable parent links", () => {
    const queryClient = new QueryClient();
    const returnId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/sales/returns/${returnId}`]}>
          <Header user={user} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText("Return Details")).toBeDefined();
    expect(screen.queryByText(returnId)).toBeNull();

    const salesLink = screen.getByRole("link", { name: "Sales" });
    expect(salesLink.getAttribute("href")).toBe("/sales");

    const returnsLink = screen.getByRole("link", { name: "Returns" });
    expect(returnsLink.getAttribute("href")).toBe("/sales/returns");
  });
});
