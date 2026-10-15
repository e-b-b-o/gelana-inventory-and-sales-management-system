import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchApi, ApiError } from "./api";
import { shouldRetry, calculateRetryDelay } from "../app/providers";

describe("API Client & Error Handling", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns JSON data on successful response", async () => {
    const mockData = { id: "123", name: "Test" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockData),
    });

    const result = await fetchApi("/test");
    expect(result).toEqual(mockData);
  });

  it("throws ApiError with statusCode 401 for unauthorized requests", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({
        error: { code: "AUTHENTICATION_ERROR", message: "Authentication required" },
      }),
    });

    try {
      await fetchApi("/auth/me");
      expect.fail("Should have thrown");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe("AUTHENTICATION_ERROR");
      expect(err.message).toBe("Authentication required");
    }
  });

  it("throws ApiError with statusCode 403 for forbidden requests", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({
        error: { code: "FORBIDDEN", message: "Forbidden: Cannot view inventory for other branches" },
      }),
    });

    try {
      await fetchApi("/users");
      expect.fail("Should have thrown");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe("FORBIDDEN");
      expect(err.message).toBe("Forbidden: Cannot view inventory for other branches");
    }
  });

  it("parses Retry-After header and message on 429 Too Many Requests", async () => {
    const headers = new Headers();
    headers.set("retry-after", "45");

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers,
      json: vi.fn().mockResolvedValue({
        error: "Too many requests, please try again later",
      }),
    });

    try {
      await fetchApi("/closings/history");
      expect.fail("Should have thrown");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.statusCode).toBe(429);
      expect(err.retryAfter).toBe(45);
      expect(err.message).toBe("Too many requests, please try again later");
    }
  });
});

describe("TanStack Query Retry & Backoff Configuration", () => {
  it("never retries on 401 Unauthorized", () => {
    expect(shouldRetry(0, { statusCode: 401 })).toBe(false);
    expect(shouldRetry(1, { status: 401 })).toBe(false);
  });

  it("never retries on 403 Forbidden", () => {
    expect(shouldRetry(0, { statusCode: 403 })).toBe(false);
    expect(shouldRetry(1, { status: 403 })).toBe(false);
  });

  it("never retries on 404 Not Found", () => {
    expect(shouldRetry(0, { statusCode: 404 })).toBe(false);
  });

  it("bounds 429 Rate Limit retries to at most 1 attempt", () => {
    expect(shouldRetry(0, { statusCode: 429 })).toBe(true);
    expect(shouldRetry(1, { statusCode: 429 })).toBe(false);
    expect(shouldRetry(2, { statusCode: 429 })).toBe(false);
  });

  it("allows up to 2 retries on 500 server errors", () => {
    expect(shouldRetry(0, { statusCode: 500 })).toBe(true);
    expect(shouldRetry(1, { statusCode: 500 })).toBe(true);
    expect(shouldRetry(2, { statusCode: 500 })).toBe(false);
  });

  it("respects Retry-After when calculating retry delay", () => {
    const errorWithRetryAfter = { statusCode: 429, retryAfter: 15 };
    const delay = calculateRetryDelay(0, errorWithRetryAfter);
    expect(delay).toBe(15000); // 15 seconds in ms
  });

  it("bounds Retry-After between 1s and 30s", () => {
    expect(calculateRetryDelay(0, { retryAfter: 0 })).toBe(1000);
    expect(calculateRetryDelay(0, { retryAfter: 120 })).toBe(30000);
  });

  it("uses exponential backoff when Retry-After is absent", () => {
    expect(calculateRetryDelay(0, {})).toBe(1000);
    expect(calculateRetryDelay(1, {})).toBe(2000);
    expect(calculateRetryDelay(2, {})).toBe(4000);
    expect(calculateRetryDelay(3, {})).toBe(8000);
    expect(calculateRetryDelay(4, {})).toBe(10000); // capped at 10s
  });
});
