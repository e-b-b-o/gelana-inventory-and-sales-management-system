import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentMethodsService } from "./service.js";
import { db } from "../../config/database.js";

vi.mock("../../config/database.js", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

describe("PaymentMethodsService", () => {
  let service: PaymentMethodsService;

  beforeEach(() => {
    service = new PaymentMethodsService();
    vi.clearAllMocks();
  });

  describe("createPaymentMethod", () => {
    it("should create a payment method successfully", async () => {
      // Mock no existing
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const mockMethod = { id: "pm-1", name: "Credit Card", isActive: true };
      
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockMethod]),
        }),
      } as any);

      const data = {
        name: "Credit Card",
        isActive: true,
      };

      const result = await service.createPaymentMethod(data);

      expect(result).toEqual(mockMethod);
      expect(db.insert).toHaveBeenCalled();
    });

    it("should reject creation if name already exists", async () => {
      // Mock existing
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ id: "pm-2", name: "Cash" }]),
        }),
      } as any);

      const data = {
        name: "Cash",
        isActive: true,
      };

      await expect(service.createPaymentMethod(data)).rejects.toThrow("already exists");
    });
  });

  describe("updatePaymentMethod", () => {
    it("should allow updating name", async () => {
      // Mock no duplicate name
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      } as any);

      const mockUpdated = { id: "pm-1", name: "Bank Transfer" };
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdated]),
          }),
        }),
      } as any);

      const data = {
        name: "Bank Transfer",
      };

      const result = await service.updatePaymentMethod("pm-1", data);

      expect(result).toEqual(mockUpdated);
    });
  });
});
