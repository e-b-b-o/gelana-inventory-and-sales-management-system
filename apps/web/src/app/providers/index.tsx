import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

export const shouldRetry = (failureCount: number, error: any): boolean => {
  const status = error?.statusCode ?? error?.status;
  // Never retry authentication or permission failures or missing resources
  if (status === 401 || status === 403 || status === 404) {
    return false;
  }
  // Bounded retry for rate limiting: at most 1 retry
  if (status === 429) {
    return failureCount < 1;
  }
  // Bounded retry for network/5xx server errors: at most 2 retries
  return failureCount < 2;
};

export const calculateRetryDelay = (attemptIndex: number, error: any): number => {
  if (error?.retryAfter && !isNaN(Number(error.retryAfter))) {
    const seconds = Number(error.retryAfter);
    return Math.max(1000, Math.min(seconds * 1000, 30000));
  }
  return Math.min(1000 * 2 ** attemptIndex, 10000);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: calculateRetryDelay,
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute default freshness prevents spamming API on page switches
    },
  },
});

export function Providers({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
