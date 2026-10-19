import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { app } from "../../app.js";
import type { Server } from "http";

describe("Production API Routing & CORS", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to get server port");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("responds to /api/v1/health with 200 OK", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      status: "ok",
      message: "Gelana API is running",
    });
  });

  it("allows CORS from Vercel deployments (*.vercel.app)", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://gelana-preview-xyz.vercel.app",
        "Access-Control-Request-Method": "GET",
      },
    });
    expect(res.headers.get("access-control-allow-origin")).toBe("https://gelana-preview-xyz.vercel.app");
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("allows CORS from localhost default origins", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
      },
    });
    expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:5173");
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("denies CORS from untrusted third-party origins", async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://malicious-external-site.com",
        "Access-Control-Request-Method": "GET",
      },
    });
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });
});
