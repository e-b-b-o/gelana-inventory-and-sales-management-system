// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Catalog } from "./Catalog";
import * as categoriesApi from "../api";
import * as productsApi from "../../products/api";

vi.mock("../../auth/api/auth", () => ({
  getMe: vi.fn(),
}));

vi.mock("../api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api")>();
  return {
    ...actual,
    useCategories: vi.fn(),
    useUpdateCategoryStatus: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  };
});

vi.mock("../../products/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../products/api")>();
  return {
    ...actual,
    useProducts: vi.fn(),
    useUpdateProductStatus: vi.fn().mockReturnValue({ mutateAsync: vi.fn(), isPending: false }),
  };
});

describe("Catalog Component - Product and Category Search", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();

    queryClient.setQueryData(["me"], {
      user: { id: "user-1", name: "Test Owner", role: "OWNER", branchId: null },
    });

    vi.mocked(categoriesApi.useCategories).mockReturnValue({
      data: [
        { id: "cat-1", name: "Writing Supplies", isActive: true, createdAt: "2026-01-01" },
        { id: "cat-2", name: "Paper Products", isActive: true, createdAt: "2026-01-01" },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(productsApi.useProducts).mockReturnValue({
      data: [
        {
          id: "prod-1",
          name: "Ballpoint Pen (Blue)",
          sku: "STN-PEN-01",
          categoryId: "cat-1",
          categoryName: "Writing Supplies",
          brand: "Gelana",
          description: null,
          imageUrl: null,
          unit: "Piece",
          defaultSellingPrice: "25.00",
          isActive: true,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders product search input, category filter dropdown, and products table", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Catalog />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByPlaceholderText(/Search products by name, SKU, or brand.../i)).toBeDefined();
    expect(screen.getByRole("combobox", { name: /Filter by category/i })).toBeDefined();
    expect(screen.getByText("Ballpoint Pen (Blue)")).toBeDefined();
    expect(screen.getByText("STN-PEN-01")).toBeDefined();
  });

  it("switches to Categories view and renders category search control", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Catalog />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const categoriesTab = screen.getByRole("button", { name: /Categories \(/i });
    fireEvent.click(categoriesTab);

    expect(screen.getByPlaceholderText(/Search categories by name.../i)).toBeDefined();
    expect(screen.getByText("Writing Supplies")).toBeDefined();
    expect(screen.getByText("Paper Products")).toBeDefined();
  });

  it("renders contextual empty state when no products match filters", () => {
    vi.mocked(productsApi.useProducts).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Catalog />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search products by name, SKU, or brand.../i);
    fireEvent.change(searchInput, { target: { value: "Unknown Product" } });

    expect(screen.getByText("No products found")).toBeDefined();
    expect(screen.getByText(/No products matched your search/i)).toBeDefined();
  });
});
