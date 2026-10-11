// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateSale, type CreateSalePayload } from "./index";
import * as api from "../../../lib/api";

vi.mock("../../../lib/api", () => ({
  fetchApi: vi.fn(),
}));

describe("useCreateSale mutation and query invalidation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const samplePayload: CreateSalePayload = {
    branchId: "branch-uuid-1",
    items: [
      {
        productId: "prod-1",
        unitId: "unit-1",
        quantity: 2,
        unitPrice: 100,
      },
    ],
    payments: [
      {
        paymentMethodId: "pm-cash",
        amount: 200,
      },
    ],
  };

  it("invalidates inventory balances, movements, and sales queries upon successful sale", async () => {
    vi.mocked(api.fetchApi).mockResolvedValueOnce({
      id: "sale-123",
      branchId: "branch-uuid-1",
      status: "COMPLETED",
    });

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    await result.current.mutateAsync(samplePayload);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "balances"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "movements"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sales"] });
    });
  });

  it("does not invalidate inventory queries when sale creation fails", async () => {
    vi.mocked(api.fetchApi).mockRejectedValueOnce(new Error("Insufficient stock for product"));

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    await expect(result.current.mutateAsync(samplePayload)).rejects.toThrow("Insufficient stock for product");

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("submits sales with line-item and sale-level discounts correctly", async () => {
    vi.mocked(api.fetchApi).mockResolvedValueOnce({
      id: "sale-discounted",
      grandTotal: "170.00",
    });

    const { result } = renderHook(() => useCreateSale(), { wrapper });

    const discountedPayload: CreateSalePayload = {
      branchId: "branch-uuid-1",
      saleDiscount: 10,
      items: [
        {
          productId: "prod-1",
          unitId: "unit-1",
          quantity: 2,
          unitPrice: 100,
          lineDiscount: 20,
        },
      ],
      payments: [
        {
          paymentMethodId: "pm-cash",
          amount: 170,
        },
      ],
    };

    await result.current.mutateAsync(discountedPayload);

    expect(api.fetchApi).toHaveBeenCalledWith("/sales", {
      method: "POST",
      body: JSON.stringify(discountedPayload),
    });
  });
});

describe("useSales query hook", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("fetches sales with query parameters correctly", async () => {
    const mockResponse = {
      data: [
        {
          id: "sale-1",
          saleNumber: "SAL-000001",
          grandTotal: "150.00",
        },
      ],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    };

    vi.mocked(api.fetchApi).mockResolvedValueOnce(mockResponse);

    const { useSales } = await import("./index");
    const { result } = renderHook(() => useSales({ branchId: "b-1", page: 2, search: "SAL" }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.fetchApi).toHaveBeenCalledWith("/sales?page=2&branchId=b-1&search=SAL");
    expect(result.current.data).toEqual(mockResponse);
  });
});

describe("useSaleDetails query hook (Slice 6.3)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("fetches sale details by id when id is provided", async () => {
    const mockSale = {
      id: "sale-999",
      saleNumber: "SAL-000999",
      subtotal: "200.00",
      saleDiscount: "10.00",
      grandTotal: "190.00",
      branch: { id: "b-1", name: "Main Branch" },
      createdBy: { id: "u-1", name: "Abebe G." },
      items: [
        {
          id: "item-1",
          productId: "p-1",
          enteredQuantity: 2,
          unitPrice: "100.00",
          lineDiscount: "0.00",
          lineTotal: "200.00",
          product: { name: "Paper", sku: "SKU-PAP" },
          unit: { name: "Ream" },
        },
      ],
      payments: [
        {
          id: "pay-1",
          amount: "190.00",
          paymentMethod: { name: "Cash" },
        },
      ],
    };

    vi.mocked(api.fetchApi).mockResolvedValueOnce(mockSale);

    const { useSaleDetails } = await import("./index");
    const { result } = renderHook(() => useSaleDetails("sale-999"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.fetchApi).toHaveBeenCalledWith("/sales/sale-999");
    expect(result.current.data).toEqual(mockSale);
  });

  it("does not fetch when id is undefined", async () => {
    const { useSaleDetails } = await import("./index");
    const { result } = renderHook(() => useSaleDetails(undefined), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(api.fetchApi).not.toHaveBeenCalled();
  });

  it("handles fetch failure gracefully", async () => {
    vi.mocked(api.fetchApi).mockRejectedValueOnce(new Error("Sale not found"));

    const { useSaleDetails } = await import("./index");
    const { result } = renderHook(() => useSaleDetails("nonexistent"), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Sale not found");
  });
});

