// @vitest-environment jsdom
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useCreateTransfer,
  useTransfers,
  useTransferDetails,
  useApproveTransfer,
  useRejectTransfer,
  useDispatchTransfer,
} from "./index";
import * as api from "../../../lib/api";

vi.mock("../../../lib/api", () => ({
  fetchApi: vi.fn(),
}));

describe("Transfers API Hooks", () => {
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
  });

  afterEach(() => {
    cleanup();
  });

  describe("useCreateTransfer mutation", () => {
    it("calls POST /transfers and invalidates transfers and inventory caches on success", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const mockResponse = { data: { id: "trf-1", transferNumber: "TRF-000001", status: "REQUESTED" } };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useCreateTransfer(), {
        wrapper: createWrapper(),
      });

      const payload = {
        sourceBranchId: "branch-1",
        destinationBranchId: "branch-2",
        items: [{ productId: "prod-1", requestedQuantity: 10 }],
        notes: "Restock branch 2",
      };

      result.current.mutate(payload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.fetchApi).toHaveBeenCalledWith("/transfers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transfers"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "balances"] });
    });
  });

  describe("useTransfers query", () => {
    it("fetches list of transfers with query params", async () => {
      const mockResponse = {
        data: [{ id: "trf-1", transferNumber: "TRF-000001", status: "REQUESTED" }],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(
        () => useTransfers({ status: "REQUESTED", search: "TRF-001" }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.fetchApi).toHaveBeenCalledWith(
        expect.stringContaining("/transfers?status=REQUESTED&search=TRF-001")
      );
      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe("useTransferDetails query", () => {
    it("fetches single transfer details and unwraps data", async () => {
      const mockDetails = {
        id: "trf-1",
        transferNumber: "TRF-000001",
        status: "APPROVED",
        items: [],
      };
      vi.mocked(api.fetchApi).mockResolvedValueOnce({ data: mockDetails });

      const { result } = renderHook(() => useTransferDetails("trf-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.fetchApi).toHaveBeenCalledWith("/transfers/trf-1");
      expect(result.current.data).toEqual(mockDetails);
    });

    it("remains idle when id is undefined", () => {
      const { result } = renderHook(() => useTransferDetails(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe("idle");
      expect(api.fetchApi).not.toHaveBeenCalled();
    });
  });

  describe("useApproveTransfer mutation", () => {
    it("calls POST /transfers/:id/approve and invalidates transfer caches", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const mockResponse = { data: { id: "trf-1", status: "APPROVED" } };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useApproveTransfer(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: "trf-1",
        payload: { notes: "Approved full quantity" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.fetchApi).toHaveBeenCalledWith("/transfers/trf-1/approve", {
        method: "POST",
        body: JSON.stringify({ notes: "Approved full quantity" }),
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transfers"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transfer-details", "trf-1"] });
    });
  });

  describe("useRejectTransfer mutation", () => {
    it("calls POST /transfers/:id/reject with reason and invalidates transfer caches", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const mockResponse = { data: { id: "trf-1", status: "REJECTED" } };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRejectTransfer(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: "trf-1",
        payload: { reason: "Insufficient available stock at source" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.fetchApi).toHaveBeenCalledWith("/transfers/trf-1/reject", {
        method: "POST",
        body: JSON.stringify({ reason: "Insufficient available stock at source" }),
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transfers"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transfer-details", "trf-1"] });
    });
  });

  describe("useDispatchTransfer mutation", () => {
    it("calls POST /transfers/:id/dispatch and invalidates transfer, balance, and movement caches", async () => {
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const mockResponse = { data: { id: "trf-1", status: "DISPATCHED" } };
      vi.mocked(api.fetchApi).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useDispatchTransfer(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: "trf-1",
        payload: { notes: "Dispatched with driver Abebe" },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(api.fetchApi).toHaveBeenCalledWith("/transfers/trf-1/dispatch", {
        method: "POST",
        body: JSON.stringify({ notes: "Dispatched with driver Abebe" }),
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transfers"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["transfer-details", "trf-1"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "balances"] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["inventory", "movements"] });
    });
  });
});
