export const API_URL = import.meta.env?.VITE_API_URL || "/api/v1";

export class ApiError extends Error {
  statusCode: number;
  status: number;
  code?: string;
  details?: any;
  retryAfter?: number;

  constructor(message: string, statusCode: number, code?: string, details?: any, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.status = statusCode;
    this.code = code;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

export function buildApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const base = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  return `${base}${normalizedEndpoint}`;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = buildApiUrl(endpoint);
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const retryAfterHeader = res.headers.get("retry-after") || res.headers.get("Retry-After");
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;

    let message = "Request failed";
    let code: string | undefined = undefined;
    let details: any = undefined;

    if (typeof data?.error === "string") {
      message = data.error;
    } else if (data?.error && typeof data.error === "object") {
      message = data.error.message || message;
      code = data.error.code;
      details = data.error.details;
    } else if (typeof data?.message === "string") {
      message = data.message;
    } else if (res.status === 429) {
      message = "Too many requests, please try again later";
    } else if (res.status === 401) {
      message = "Authentication required";
    } else if (res.status === 403) {
      message = "Access denied";
    } else if (res.status === 404) {
      message = "Resource not found";
    }

    const error = new ApiError(message, res.status, code, details, retryAfter);
    if (data?.error && typeof data.error === "object") {
      Object.assign(error, data.error);
    }
    throw error;
  }

  return data;
}
