import { describe, it, expect, vi, beforeEach } from "vitest";
import { InventoryService } from "./service.js";
import { db } from "../../config/database.js";

vi.mock("../../config/database.js", () => {
  return {
    db: {
      query: {
        products: {
          findMany: vi.fn(),
        },
      },
    },
  };
});

describe("InventoryService", () => {
  const mockOwner = {
    id: "owner-1",
    email: "owner@gelana.com",
    role: "OWNER",
    branchId: null,
  };

  const mockEmployee = {
    id: "employee-1",
    email: "emp@gelana.com",
    role: "EMPLOYEE",
    branchId: "branch-1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow OWNER to fetch balances without branch restriction", async () => {
    // Mock the DB response
    (db.query.products.findMany as any).mockResolvedValueOnce([]);

    const query = { page: 1, limit: 50 };
    const result = await InventoryService.getBalances(query, mockOwner);

    expect(result.data).toEqual([]);
    
    // Check if db.query was called correctly (without branch constraint overriding targetBranchId)
    const callArgs = (db.query.products.findMany as any).mock.calls[0][0];
    expect(callArgs.with.inventoryBalances).toEqual({ with: { branch: true } }); // Owner didn't provide branchId
  });

  it("should restrict EMPLOYEE to their assigned branch", async () => {
    (db.query.products.findMany as any).mockResolvedValueOnce([]);

    const query = { page: 1, limit: 50 };
    const result = await InventoryService.getBalances(query, mockEmployee);

    expect(result.data).toEqual([]);
    
    const callArgs = (db.query.products.findMany as any).mock.calls[0][0];
    
    // Since employee didn't provide branchId, targetBranchId becomes branch-1
    // inventoryBalances should have a where clause
    expect(typeof callArgs.with.inventoryBalances).toBe("object");
  });

  it("should throw 403 if EMPLOYEE requests a different branch", async () => {
    const query = { page: 1, limit: 50, branchId: "branch-2" };

    await expect(InventoryService.getBalances(query, mockEmployee)).rejects.toThrow("Forbidden");
  });

  it("should properly serialize product units and conversionQuantity as strings", async () => {
    const mockProductsData = [
      {
        id: "prod-1",
        sku: "SKU-001",
        name: "Test Pen",
        brand: "Bic",
        category: { name: "Stationery" },
        units: [
          {
            id: "u-1",
            name: "Piece",
            isBase: true,
            isActive: true,
            prices: [{ sellingPrice: "10.00" }],
            conversions: [], // No explicit conversion row, should default to "1" for base
          },
          {
            id: "u-2",
            name: "Pack",
            isBase: false,
            isActive: true,
            prices: [{ sellingPrice: "100.00" }],
            conversions: [{ conversionQuantity: "12.0000", effectiveUntil: null }],
          },
        ],
        inventoryBalances: [
          {
            branchId: "branch-1",
            branch: { name: "Branch 1" },
            availableQuantity: 24,
            damagedQuantity: 0,
            minimumStockQuantity: 5,
            wac: "7.5000",
          },
        ],
      },
    ];

    (db.query.products.findMany as any).mockResolvedValueOnce(mockProductsData);

    const result = await InventoryService.getBalances({ page: 1, limit: 50 }, mockOwner);

    expect(result.data).toHaveLength(1);
    const item = result.data[0];
    expect(item).toBeDefined();
    expect(item!.sellingPrice).toBe("10.00");
    expect(item!.units).toHaveLength(2);
    expect(item!.units[0].conversionQuantity).toBe("1");
    expect(typeof item!.units[0].conversionQuantity).toBe("string");
    expect(item!.units[1].conversionQuantity).toBe("12.0000");
    expect(typeof item!.units[1].conversionQuantity).toBe("string");
  });
});

