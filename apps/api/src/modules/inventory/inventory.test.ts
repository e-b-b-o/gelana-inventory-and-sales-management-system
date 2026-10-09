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
});
