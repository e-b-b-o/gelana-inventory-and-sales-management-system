import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchQuerySchema } from "./schema.js";
import { SearchService } from "./service.js";
import { db } from "../../config/database.js";

vi.mock("../../config/database.js", () => ({
  db: {
    select: vi.fn(),
  },
}));

describe("Global Search Module", () => {
  describe("searchQuerySchema Validation", () => {
    it("accepts valid query string and applies default limit", () => {
      const result = searchQuerySchema.safeParse({ q: "notebook" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.q).toBe("notebook");
        expect(result.data.limit).toBe(10);
      }
    });

    it("accepts valid query with custom limit", () => {
      const result = searchQuerySchema.safeParse({ q: "pen", limit: "25" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
      }
    });

    it("rejects empty query", () => {
      const result = searchQuerySchema.safeParse({ q: "" });
      expect(result.success).toBe(false);
    });

    it("rejects whitespace-only query", () => {
      const result = searchQuerySchema.safeParse({ q: "   " });
      expect(result.success).toBe(false);
    });

    it("rejects excessively long query", () => {
      const result = searchQuerySchema.safeParse({ q: "a".repeat(101) });
      expect(result.success).toBe(false);
    });
  });

  describe("SearchService Role Scoping & Navigation", () => {
    let service: SearchService;

    beforeEach(() => {
      service = new SearchService();
      vi.clearAllMocks();

      // Default mock for DB selects returning empty arrays
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);
    });

    it("returns empty result structure when query is blank", async () => {
      const res = await service.search("   ", { id: "user-1", role: "EMPLOYEE", branchId: "b-1" });
      expect(res.totalCount).toBe(0);
      expect(res.results.navigation).toHaveLength(0);
      expect(res.results.products).toHaveLength(0);
    });

    it("returns authorized navigation destinations for EMPLOYEE and hides admin/financial routes", async () => {
      const employeeUser = { id: "emp-1", role: "EMPLOYEE", branchId: "branch-main" };
      const res = await service.search("report", employeeUser);

      // Reports are ownerOnly: true, employee should receive 0 results
      expect(res.results.navigation.some((n) => n.url.startsWith("/reports"))).toBe(false);
      expect(res.results.navigation.some((n) => n.url.startsWith("/users"))).toBe(false);
      expect(res.results.navigation.some((n) => n.url.startsWith("/receivings"))).toBe(false);
    });

    it("returns owner-only destinations when user has OWNER role", async () => {
      const ownerUser = { id: "owner-1", role: "OWNER", branchId: null };
      const res = await service.search("report", ownerUser);

      const reportNav = res.results.navigation.find((n) => n.url === "/reports");
      expect(reportNav).toBeDefined();
      expect(reportNav?.title).toBe("Reports & Analytics");
    });

    it("allows employee to navigate to core permitted destinations like sales and catalog", async () => {
      const employeeUser = { id: "emp-1", role: "EMPLOYEE", branchId: "branch-main" };
      const res = await service.search("catalog", employeeUser);

      const catalogNav = res.results.navigation.find((n) => n.url === "/catalog");
      expect(catalogNav).toBeDefined();
      expect(catalogNav?.title).toBe("Product Catalog");
    });
  });
});
