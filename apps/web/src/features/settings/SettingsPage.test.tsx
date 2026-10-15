// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsPage } from "./SettingsPage";
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
        <MemoryRouter initialEntries={["/settings"]}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    ),
  };
}

describe("SettingsPage Profile Flow", () => {
  const mockUser = {
    id: "user-123",
    name: "John Doe",
    email: "john@gelana.com",
    role: "EMPLOYEE" as const,
    branchId: "branch-1",
    branchName: "Downtown Branch",
    createdAt: "2026-01-15T08:00:00Z",
  };

  beforeEach(() => {
    vi.mocked(authApi.getMe).mockResolvedValue({ user: mockUser });
    vi.mocked(apiModule.fetchApi).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint === "/settings/profile" && (!options || !options.method || options.method === "GET")) {
        return { data: mockUser };
      }
      if (endpoint === "/settings/profile" && options?.method === "PATCH") {
        const body = JSON.parse(options.body);
        return { success: true, data: { ...mockUser, name: body.name } };
      }
      if (endpoint.startsWith("/settings/account-requests")) {
        return { data: [] };
      }
      if (endpoint.startsWith("/settings/notification-preferences")) {
        return { data: [] };
      }
      return { data: null };
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("loads and displays saved profile information in read-only mode by default without edit inputs", async () => {
    renderWithClient(<SettingsPage />);

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "John Doe" })).toBeTruthy();
    });

    // Saved information is displayed
    expect(screen.getByRole("heading", { name: "John Doe" })).toBeTruthy();
    expect(screen.getAllByText("john@gelana.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Branch Employee")).toBeTruthy();
    expect(screen.getByText("Downtown Branch")).toBeTruthy();
    expect(screen.getByText("Active & In Good Standing")).toBeTruthy();

    // The prominent Edit Profile button is present
    const editBtn = screen.getByRole("button", { name: /Edit Profile/i });
    expect(editBtn).toBeTruthy();

    // The display name input should NOT be in the document initially
    expect(screen.queryByPlaceholderText("Enter your full name")).toBeNull();
    expect(screen.queryByRole("button", { name: /Save Changes/i })).toBeNull();
  });

  it("clicking Edit Profile opens the populated edit form with protected fields locked", async () => {
    renderWithClient(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "John Doe" })).toBeTruthy();
    });

    const editBtn = screen.getByRole("button", { name: /Edit Profile/i });
    fireEvent.click(editBtn);

    // Edit form is now displayed
    const nameInput = screen.getByPlaceholderText("Enter your full name") as HTMLInputElement;
    expect(nameInput).toBeTruthy();
    expect(nameInput.value).toBe("John Doe");

    // Email, Role, Branch are shown as read-only/disabled
    const emailInput = screen.getByDisplayValue("john@gelana.com") as HTMLInputElement;
    expect(emailInput.disabled).toBe(true);

    // Save and Cancel buttons exist
    expect(screen.getByRole("button", { name: /Save Changes/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeTruthy();
  });

  it("clicking Cancel discards edits and returns to the read-only profile overview", async () => {
    renderWithClient(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "John Doe" })).toBeTruthy();
    });

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /Edit Profile/i }));

    const nameInput = screen.getByPlaceholderText("Enter your full name");
    fireEvent.change(nameInput, { target: { value: "Discarded Name" } });

    // Click cancel
    const cancelBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    // Returns to read-only overview
    expect(screen.queryByPlaceholderText("Enter your full name")).toBeNull();
    expect(screen.getByRole("button", { name: /Edit Profile/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "John Doe" })).toBeTruthy();
    expect(apiModule.fetchApi).not.toHaveBeenCalledWith(
      "/settings/profile",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("submitting valid display name update saves changes, persists to DB, and returns to read-only view", async () => {
    renderWithClient(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "John Doe" })).toBeTruthy();
    });

    // Enter edit mode
    fireEvent.click(screen.getByRole("button", { name: /Edit Profile/i }));

    const nameInput = screen.getByPlaceholderText("Enter your full name");
    fireEvent.change(nameInput, { target: { value: "Jane Smith" } });

    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(apiModule.fetchApi).toHaveBeenCalledWith(
        "/settings/profile",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ name: "Jane Smith" }),
        })
      );
    });

    // Successful update returns to read-only overview with success message
    await waitFor(() => {
      expect(screen.getByText("Profile updated successfully.")).toBeTruthy();
    });

    expect(screen.queryByPlaceholderText("Enter your full name")).toBeNull();
  });

  it("shows validation error and prevents submission when display name is too short", async () => {
    renderWithClient(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "John Doe" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Edit Profile/i }));

    const nameInput = screen.getByPlaceholderText("Enter your full name");
    fireEvent.change(nameInput, { target: { value: "A" } });

    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    // Validation feedback shown
    expect(screen.getByText("Display name must be at least 2 characters.")).toBeTruthy();
    expect(apiModule.fetchApi).not.toHaveBeenCalledWith(
      "/settings/profile",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("displays server error feedback and preserves user input if the update request fails", async () => {
    vi.mocked(apiModule.fetchApi).mockImplementation(async (endpoint: string, options?: any) => {
      if (endpoint === "/settings/profile" && options?.method === "PATCH") {
        throw new Error("Database connection timed out");
      }
      if (endpoint === "/settings/profile") {
        return { data: mockUser };
      }
      return { data: [] };
    });

    renderWithClient(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "John Doe" })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /Edit Profile/i }));

    const nameInput = screen.getByPlaceholderText("Enter your full name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "New Desired Name" } });

    const saveBtn = screen.getByRole("button", { name: /Save Changes/i });
    fireEvent.click(saveBtn);

    // Server error displayed
    await waitFor(() => {
      expect(screen.getByText("Database connection timed out")).toBeTruthy();
    });

    // Form stays in edit mode and user input is preserved
    expect(nameInput.value).toBe("New Desired Name");
  });
});
