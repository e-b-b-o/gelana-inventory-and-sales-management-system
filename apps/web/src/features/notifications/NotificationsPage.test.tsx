// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationsPage } from "./NotificationsPage";
import * as apiModule from "../../lib/api";
import * as authApi from "../auth/api/auth";

vi.mock("../../lib/api", () => ({
  fetchApi: vi.fn(),
  API_URL: "http://localhost:3000/api/v1",
}));

vi.mock("../auth/api/auth", () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/notifications"]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    ),
  };
}

describe("NotificationsPage", () => {
  const mockNotifications = [
    {
      id: "notif-1",
      userId: "user-1",
      title: "Stock Transfer Dispatched",
      message: "Transfer TR-001 has been dispatched to your branch",
      type: "TRANSFER_DISPATCHED",
      priority: "IMPORTANT" as const,
      isRead: false,
      readAt: null,
      entityType: "transfer",
      entityId: "tr-1",
      link: "/transfers/tr-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "notif-2",
      userId: "user-1",
      title: "Critical Stock Discrepancy",
      message: "Physical inventory variance exceeds acceptable limits",
      type: "STOCK_DISCREPANCY",
      priority: "CRITICAL" as const,
      isRead: false,
      readAt: null,
      entityType: "inventory_movement",
      entityId: "inv-1",
      link: "/inventory/movements",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "notif-3",
      userId: "user-1",
      title: "Daily Closing Approved",
      message: "Closing for 2026-10-17 has been approved by Owner",
      type: "CLOSING_APPROVED",
      priority: "INFORMATIONAL" as const,
      isRead: true,
      readAt: new Date().toISOString(),
      entityType: "daily_closing",
      entityId: "cls-1",
      link: "/daily-closing/history",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.mocked(authApi.getMe).mockResolvedValue({
      user: { id: "user-1", name: "Jane Employee", role: "EMPLOYEE", branchId: "b-1" },
    });

    vi.mocked(apiModule.fetchApi).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint === "/notifications/unread-count") {
        return { unreadCount: 2 };
      }
      if (endpoint.startsWith("/notifications") && (!options || !options.method || options.method === "GET")) {
        const url = new URL(`http://localhost${endpoint}`);
        const priority = url.searchParams.get("priority");
        const isRead = url.searchParams.get("isRead");

        let items = [...mockNotifications];
        if (priority === "CRITICAL") {
          items = items.filter((n) => n.priority === "CRITICAL");
        }
        if (isRead === "false") {
          items = items.filter((n) => !n.isRead);
        }

        return {
          data: items,
          pagination: {
            page: 1,
            limit: 20,
            total: items.length,
            totalPages: 1,
          },
        };
      }
      if (endpoint === "/notifications/mark-all-read" && options?.method === "POST") {
        return { success: true, updatedCount: 2 };
      }
      if (endpoint.endsWith("/read") && options?.method === "PATCH") {
        return { success: true, data: { ...mockNotifications[0], isRead: true } };
      }
      return { data: null };
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders notifications list with priority badges, titles, and unread count badge", async () => {
    renderWithClient(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Stock Transfer Dispatched")).toBeTruthy();
    });

    expect(screen.getByText("Critical Stock Discrepancy")).toBeTruthy();
    expect(screen.getByText("Daily Closing Approved")).toBeTruthy();

    // Priority badges
    expect(screen.getByText("Critical")).toBeTruthy();
    expect(screen.getByText("Important")).toBeTruthy();
    expect(screen.getByText("Notice")).toBeTruthy();

    // Header unread badge
    expect(screen.getByText("2 unread")).toBeTruthy();

    // Deep link present
    const viewLinks = screen.getAllByRole("link", { name: /View Record/i });
    expect(viewLinks.length).toBe(3);
    expect(viewLinks[0].getAttribute("href")).toBe("/transfers/tr-1");
  });

  it("filters to unread notifications only when Unread tab is clicked", async () => {
    renderWithClient(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Stock Transfer Dispatched")).toBeTruthy();
    });

    const unreadTab = screen.getByRole("button", { name: /Unread Only/i });
    fireEvent.click(unreadTab);

    await waitFor(() => {
      expect(apiModule.fetchApi).toHaveBeenCalledWith(
        expect.stringContaining("isRead=false")
      );
    });
  });

  it("filters to critical alerts only when Critical Alerts tab is clicked", async () => {
    renderWithClient(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Stock Transfer Dispatched")).toBeTruthy();
    });

    const criticalTab = screen.getByRole("button", { name: /Critical Alerts/i });
    fireEvent.click(criticalTab);

    await waitFor(() => {
      expect(apiModule.fetchApi).toHaveBeenCalledWith(
        expect.stringContaining("priority=CRITICAL")
      );
    });
  });

  it("marks individual notification as read when checkmark button is clicked", async () => {
    renderWithClient(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Stock Transfer Dispatched")).toBeTruthy();
    });

    const markReadButtons = screen.getAllByTitle("Mark as read");
    expect(markReadButtons.length).toBe(2); // notif-1 and notif-2 are unread

    fireEvent.click(markReadButtons[0]);

    await waitFor(() => {
      expect(apiModule.fetchApi).toHaveBeenCalledWith(
        "/notifications/notif-1/read",
        expect.objectContaining({ method: "PATCH" })
      );
    });
  });

  it("marks all notifications as read when Mark all as read button is clicked", async () => {
    renderWithClient(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Stock Transfer Dispatched")).toBeTruthy();
    });

    const markAllBtn = screen.getByRole("button", { name: /Mark all as read/i });
    expect((markAllBtn as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(markAllBtn);

    await waitFor(() => {
      expect(apiModule.fetchApi).toHaveBeenCalledWith(
        "/notifications/mark-all-read",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("renders empty state message when no notifications exist", async () => {
    vi.mocked(apiModule.fetchApi).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/notifications/unread-count") {
        return { unreadCount: 0 };
      }
      if (endpoint.startsWith("/notifications")) {
        return {
          data: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
        };
      }
      return { data: null };
    });

    renderWithClient(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("No notifications found")).toBeTruthy();
    });

    expect(screen.getByText(/When system events or alerts occur/i)).toBeTruthy();
  });

  it("renders error state with retry button when query fails", async () => {
    vi.mocked(apiModule.fetchApi).mockImplementation(async (endpoint: string) => {
      if (endpoint === "/notifications/unread-count") return { unreadCount: 0 };
      if (endpoint.startsWith("/notifications")) {
        throw new Error("Network error connecting to notification service");
      }
      return { data: null };
    });

    renderWithClient(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load notifications")).toBeTruthy();
    });

    expect(screen.getByText("Network error connecting to notification service")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Retry/i })).toBeTruthy();
  });
});
