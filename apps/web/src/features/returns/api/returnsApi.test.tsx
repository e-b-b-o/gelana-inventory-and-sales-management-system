// @vitest-environment jsdom
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCreateReturn, useReturns, useReturnDetails } from "./index";
import { useVoidSale, useCorrectSale, useSaleCorrections } from "../../sales/api";
import * as api from "../../../lib/api";

vi.mock("../../../lib/api", () => ({
  fetchApi: vi.fn(),
}));

describe("Returns and Void API Hooks", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
  });

  describe("useCreateReturn mutation", () => {
    it("calls POST /returns and invalidates relevant caches upon successful return", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const mockResponse = { id: "ret-123", returnNumber: "RET-000001" };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreateReturn(), {
        wrapper: createWrapper(),
      });

      const payload = {
        saleId: "sale-1",
        reason: "Customer change of mind",
        refundPaymentMethodId: "pm-1",
        items: [
          {
            saleItemId: "item-1",
            productId: "prod-1",
            unitId: "unit-1",
            quantity: 2,
            condition: "SELLABLE" as const,
          },
        ],
      };

      await result.current.mutateAsync(payload);

      expect(api.fetchApi).toHaveBeenCalledWith("/returns", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Assert invalidations
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["returns"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sales"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sale-details"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "balances"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "movements"] });
    });
  });

  describe("useReturns query hook", () => {
    it("fetches returns list with query parameters", async () => {
      const mockData = {
        data: [{ id: "ret-1", returnNumber: "RET-000001", refundAmount: "40.00" }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockData);

      const { result } = renderHook(
        () => useReturns({ branchId: "b-1", isUnlinked: false, page: 1, limit: 20 }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.fetchApi).toHaveBeenCalledWith("/returns?page=1&limit=20&branchId=b-1&isUnlinked=false");
      expect(result.current.data).toEqual(mockData);
    });
  });

  describe("useReturnDetails query hook", () => {
    it("fetches return details by ID when provided", async () => {
      const mockReturn = {
        id: "ret-1",
        returnNumber: "RET-000001",
        refundAmount: "100.00",
        items: [],
      };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockReturn);

      const { result } = renderHook(() => useReturnDetails("ret-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.fetchApi).toHaveBeenCalledWith("/returns/ret-1");
      expect(result.current.data).toEqual(mockReturn);
    });

    it("does not fetch when id is undefined", async () => {
      const { result } = renderHook(() => useReturnDetails(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(api.fetchApi).not.toHaveBeenCalled();
    });
  });

  describe("useVoidSale mutation", () => {
    it("calls POST /sales/:id/void and invalidates sales and inventory caches", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const mockResponse = { success: true, message: "Sale voided" };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useVoidSale("sale-99"), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ reason: "Duplicate transaction" });

      expect(api.fetchApi).toHaveBeenCalledWith("/sales/sale-99/void", {
        method: "POST",
        body: JSON.stringify({ reason: "Duplicate transaction" }),
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sale-details", "sale-99"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sales"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "balances"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "movements"] });
    });
  });

  describe("useCorrectSale mutation", () => {
    it("calls POST /sales/:id/corrections and invalidates corrections cache", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const mockCorrection = { id: "corr-1", correctionType: "EDIT_NOTE" };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockCorrection);

      const { result } = renderHook(() => useCorrectSale("sale-99"), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ reason: "Typo in memo", note: "Correct customer name" });

      expect(api.fetchApi).toHaveBeenCalledWith("/sales/sale-99/corrections", {
        method: "POST",
        body: JSON.stringify({ reason: "Typo in memo", note: "Correct customer name" }),
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sale-details", "sale-99"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sales"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["sale-corrections", "sale-99"] });
    });
  });

  describe("useSaleCorrections query hook", () => {
    it("fetches sale corrections audit list for a sale", async () => {
      const mockCorrections = [{ id: "c-1", correctionType: "VOID", reason: "Order cancelled" }];
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockCorrections);

      const { result } = renderHook(() => useSaleCorrections("sale-99"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.fetchApi).toHaveBeenCalledWith("/sales/sale-99/corrections");
      expect(result.current.data).toEqual(mockCorrections);
    });
  });
});

