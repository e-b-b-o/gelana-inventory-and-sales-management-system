import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../lib/api";

export type SearchResultType =
  | "navigation"
  | "product"
  | "category"
  | "sale"
  | "return"
  | "transfer"
  | "closing";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  type: SearchResultType;
  url: string;
  badge?: string;
  metadata?: Record<string, string | number | null | undefined>;
}

export interface SearchGroupedResults {
  navigation: SearchResultItem[];
  products: SearchResultItem[];
  categories: SearchResultItem[];
  sales: SearchResultItem[];
  returns: SearchResultItem[];
  transfers: SearchResultItem[];
  closings: SearchResultItem[];
}

export interface SearchResponse {
  query: string;
  results: SearchGroupedResults;
  totalCount: number;
}

export async function searchGlobal(query: string, signal?: AbortSignal): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      query: "",
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
    };
  }

  return fetchApi(`/search?q=${encodeURIComponent(trimmed)}&limit=8`, { signal });
}

export function useGlobalSearchQuery(query: string, enabled = true) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["global-search", trimmed],
    queryFn: ({ signal }) => searchGlobal(trimmed, signal),
    enabled: enabled && trimmed.length > 0,
    staleTime: 30 * 1000,
    retry: 1,
  });
}
