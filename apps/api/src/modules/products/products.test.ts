import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductsService } from "./service.js";
import { db } from "../../config/database.js";
import { products } from "../../database/schema/products.js";
import { categories } from "../../database/schema/categories.js";

vi.mock("../../config/database.js", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    execute: vi.fn(),
    transaction: vi.fn(),
  },
}));

describe("ProductsService", () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService();
    vi.clearAllMocks();
  });

  describe("createProduct", () => {
    it("should create a product with generated SKU", async () => {
      // Mock category lookup
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: "cat-1", isActive: true }]),
        }),
      } as any);

      const mockInsertedProduct = { id: "prod-1", sku: "PRD-000042", name: "Test Product" };

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        const mockTx = {
          execute: vi.fn().mockResolvedValue({
            rows: [{ nextval: "42" }],
          }),
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockInsertedProduct]),
            }),
          }),
        };
        return cb(mockTx as any);
      });

      const data = {
        name: "Test Product",
        categoryId: "cat-1",
        unit: "Piece",
        defaultSellingPrice: 100,
        isActive: true,
      };

      const result = await service.createProduct(data);

      expect(result).toEqual(mockInsertedProduct);
    });

    it("should reject creation if category is inactive", async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: "cat-1", isActive: false }]),
        }),
      } as any);

      const data = {
        name: "Test Product",
        categoryId: "cat-1",
        unit: "Piece",
        defaultSellingPrice: 100,
        isActive: true,
      };

      await expect(service.createProduct(data)).rejects.toThrow("Cannot assign inactive category to a new product");
    });
  });

  describe("updateProduct", () => {
    it("should allow updating product details", async () => {
      const mockUpdatedProduct = { id: "prod-1", name: "Updated Name" };
      
      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        const mockTx = {
          select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
              where: vi.fn()
                .mockResolvedValueOnce([{ id: "cat-1", isActive: true }]) // category
                .mockResolvedValueOnce([{ id: "prod-1", categoryId: "cat-1" }]) // current product
                .mockResolvedValueOnce([{ id: "unit-1", isBase: true }]) // base unit
                .mockResolvedValueOnce([{ id: "price-1", sellingPrice: "100" }]), // current price
            }),
          }),
          update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockUpdatedProduct]),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockResolvedValue(true),
          })
        };
        return cb(mockTx as any);
      });

      const result = await service.updateProduct("prod-1", { name: "Updated Name", categoryId: "cat-1" });
      expect(result).toEqual(mockUpdatedProduct);
    });
  });
});
