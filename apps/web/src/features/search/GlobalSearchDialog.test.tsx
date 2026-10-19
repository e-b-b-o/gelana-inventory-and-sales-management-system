// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import * as searchApi from "./api";

vi.mock("./api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api")>();
  return {
    ...actual,
    useGlobalSearchQuery: vi.fn(),
  };
});

describe("GlobalSearchDialog Component", () => {
  let queryClient: QueryClient;
  const mockOnClose = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("does not render when isOpen is false", () => {
    vi.mocked(searchApi.useGlobalSearchQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalSearchDialog isOpen={false} onClose={mockOnClose} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.queryByPlaceholderText(/Search pages, products/i)).toBeNull();
  });

  it("renders search input, idle state, and responds to typing", () => {
    vi.mocked(searchApi.useGlobalSearchQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalSearchDialog isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/Search pages, products/i);
    expect(input).toBeDefined();
    expect(screen.getByText("Global Application Search")).toBeDefined();

    fireEvent.change(input, { target: { value: "notebook" } });
    expect((input as HTMLInputElement).value).toBe("notebook");
  });

  it("displays categorized matching results and allows selection", () => {
    vi.mocked(searchApi.useGlobalSearchQuery).mockReturnValue({
      data: {
        query: "note",
        results: {
          navigation: [],
          products: [
            {
              id: "prod-1",
              title: "Hardcover Notebook",
              subtitle: "SKU: STN-NOTE-01 • Paper Products",
              type: "product",
              url: "/catalog",
              badge: "Active",
            },
          ],
          categories: [],
          sales: [],
          returns: [],
          transfers: [],
          closings: [],
        },
        totalCount: 1,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalSearchDialog isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/Search pages, products/i);
    fireEvent.change(input, { target: { value: "note" } });

    expect(screen.getByText("Hardcover Notebook")).toBeDefined();
    expect(screen.getByText("SKU: STN-NOTE-01 • Paper Products")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();

    fireEvent.click(screen.getByText("Hardcover Notebook"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("displays distinct empty state when no results match", () => {
    vi.mocked(searchApi.useGlobalSearchQuery).mockReturnValue({
      data: {
        query: "nonexistent",
        results: {
          navigation: [],
          products: [],
          categories: [],
          sales: [],
          returns: [],
          transfers: [],
          closings: [],
        },
        totalCount: 0,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalSearchDialog isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/Search pages, products/i);
    fireEvent.change(input, { target: { value: "nonexistent" } });

    expect(screen.getByText(/No results found for "nonexistent"/i)).toBeDefined();
  });

  it("displays distinct error state with a retry button when search request fails", () => {
    const mockRefetch = vi.fn();
    vi.mocked(searchApi.useGlobalSearchQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalSearchDialog isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/Search pages, products/i);
    fireEvent.change(input, { target: { value: "errorquery" } });

    expect(screen.getByText("Search request failed")).toBeDefined();
    const retryBtn = screen.getByRole("button", { name: /Retry Search/i });
    expect(retryBtn).toBeDefined();

    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("closes when user presses Escape", () => {
    vi.mocked(searchApi.useGlobalSearchQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <GlobalSearchDialog isOpen={true} onClose={mockOnClose} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const dialog = screen.getByRole("dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalled();
  });
});
