// @vitest-environment jsdom
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Login } from "./Login";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { login } from "../api/auth";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/auth", () => ({
  login: vi.fn(),
}));

const createTestClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={createTestClient()}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it("renders the login form correctly", () => {
    renderComponent();
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Sign In/i })).toBeTruthy();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderComponent();
    await user.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.queryByText("Invalid email address")).toBeTruthy();
      expect(screen.queryByText("Password is required")).toBeTruthy();
    });
  });

  it("calls login API on successful validation", async () => {
    const user = userEvent.setup();
    vi.mocked(login).mockResolvedValueOnce({ user: { id: "1" } } as any);
    renderComponent();
    
    await user.type(screen.getByLabelText("Email"), "test@gelana.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalled();
    });
  });

  it("displays error message when login fails", async () => {
    const user = userEvent.setup();
    vi.mocked(login).mockRejectedValueOnce(new Error("Invalid credentials"));
    renderComponent();

    await user.type(screen.getByLabelText("Email"), "test@gelana.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: /Sign In/i }));

    await waitFor(() => {
      expect(screen.queryByText("Invalid credentials")).toBeTruthy();
    });
  });
});
