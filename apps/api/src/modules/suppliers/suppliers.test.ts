import { describe, it, expect, vi, beforeEach } from "vitest";
import { SuppliersService } from "./service.js";
import { db } from "../../config/database.js";

vi.mock("../../config/database.js", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe("SuppliersService", () => {
  let service: SuppliersService;

  beforeEach(() => {
    service = new SuppliersService();
    vi.clearAllMocks();
  });

  describe("createSupplier", () => {
    it("should create a supplier successfully", async () => {
      // Mock no existing supplier
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const mockSupplier = { id: "supp-1", name: "Test Supplier", isActive: true };
      
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSupplier]),
        }),
      } as any);

      const data = {
        name: "Test Supplier",
        isActive: true,
      };

      const result = await service.createSupplier(data);

      expect(result).toEqual(mockSupplier);
      expect(db.insert).toHaveBeenCalled();
    });

    it("should reject creation if name already exists", async () => {
      // Mock existing supplier
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: "supp-2", name: "Test Supplier" }]),
        }),
      } as any);

      const data = {
        name: "Test Supplier",
        isActive: true,
      };

      await expect(service.createSupplier(data)).rejects.toThrow("already exists");
    });
  });

  describe("updateSupplier", () => {
    it("should allow updating supplier details", async () => {
      // Mock no duplicate name
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const mockUpdatedSupplier = { id: "supp-1", name: "Updated Name" };
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedSupplier]),
          }),
        }),
      } as any);

      const data = {
        name: "Updated Name",
      };

      const result = await service.updateSupplier("supp-1", data);

      expect(result).toEqual(mockUpdatedSupplier);
    });
  });
});
