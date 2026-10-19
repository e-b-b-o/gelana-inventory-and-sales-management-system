import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query cannot be empty").max(100, "Search query is too long"),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

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
