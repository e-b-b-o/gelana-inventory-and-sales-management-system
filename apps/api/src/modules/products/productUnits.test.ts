import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductsService } from "./service.js";
import { db } from "../../config/database.js";

vi.mock("../../config/database.js", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    execute: vi.fn(),
    transaction: vi.fn(),
  },
}));

describe("ProductsService - Product Units", () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService();
    vi.clearAllMocks();
  });

  describe("createProductUnit", () => {
    it("should create an alternate product unit with conversion quantity", async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn()
            .mockResolvedValueOnce([{ id: "prod-1", isActive: true }]) // Product exists
            .mockResolvedValueOnce([]), // Unit name doesn't exist
        }),
      } as any);

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        const mockTx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{ id: "unit-1", name: "Box", isBase: false, isActive: true }]),
            }),
          }),
        };
        return cb(mockTx as any);
      });

      const data = {
        name: "Box",
        conversionQuantity: 12,
        isActive: true,
      };

      const result = await service.createProductUnit("prod-1", data);
      expect(result).toMatchObject({
        id: "unit-1",
        name: "Box",
        isBase: false,
        isActive: true,
        conversionQuantity: "12",
      });
    });
  });
});
