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

      // Mock SKU sequence
      vi.mocked(db.execute).mockResolvedValue({
        rows: [{ nextval: "42" }],
      } as any);

      // Mock product insertion
      const mockInsertedProduct = { id: "prod-1", sku: "PRD-000042", name: "Test Product" };
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockInsertedProduct]),
        }),
      } as any);

      const data = {
        name: "Test Product",
        categoryId: "cat-1",
        unit: "Piece",
        defaultSellingPrice: 100,
        isActive: true,
      };

      const result = await service.createProduct(data);

      expect(result).toEqual(mockInsertedProduct);
      expect(db.execute).toHaveBeenCalled();
      expect(db.insert).toHaveBeenCalled();
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
      // Mock category lookup
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: "cat-1", isActive: true }]),
        }),
      } as any);

      // Mock current product lookup
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: "prod-1", categoryId: "cat-1" }]),
        }),
      } as any);

      const mockUpdatedProduct = { id: "prod-1", name: "Updated Name" };
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedProduct]),
          }),
        }),
      } as any);

      const result = await service.updateProduct("prod-1", { name: "Updated Name", categoryId: "cat-1" });
      expect(result).toEqual(mockUpdatedProduct);
    });
  });
});
