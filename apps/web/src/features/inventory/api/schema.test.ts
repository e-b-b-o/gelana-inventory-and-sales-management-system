import { describe, it, expect } from "vitest";
import { GetBalancesResponseSchema, InventoryProductSchema } from "./schema";

describe("Inventory Schema Validation", () => {
  const baseValidProduct = {
    id: "bfdf9b7f-d769-4175-89c4-c6468f6f9f45",
    sku: "PRD-000003",
    name: "Premium Coffee Pen",
    category: "Office Stationery",
    brand: "BIC",
    baseUnit: "Piece",
    altUnit: "Box",
    sellingPrice: "10.00",
    totalAvailable: 50,
    totalDamaged: 2,
    status: "instock",
    units: [
      {
        id: "unit-1",
        name: "Piece",
        isBase: true,
        sellingPrice: "10.00",
        conversionQuantity: "1",
      },
      {
        id: "unit-2",
        name: "Box",
        isBase: false,
        sellingPrice: "100.00",
        conversionQuantity: "12.0000",
      },
    ],
    balances: [
      {
        branchId: "branch-1",
        branchName: "Main Branch",
        availableQuantity: 50,
        damagedQuantity: 2,
        minimumStockQuantity: 10,
        wac: "8.5000",
      },
    ],
  };

  it("should successfully parse response with string conversionQuantity", () => {
    const payload = {
      data: [baseValidProduct],
    };

    const result = GetBalancesResponseSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data[0].units?.[0].conversionQuantity).toBe("1");
      expect(result.data.data[0].units?.[1].conversionQuantity).toBe("12.0000");
    }
  });

  it("should accept null or omitted conversionQuantity", () => {
    const productWithNullConversion = {
      ...baseValidProduct,
      units: [
        {
          id: "unit-1",
          name: "Piece",
          isBase: true,
          sellingPrice: "10.00",
          conversionQuantity: null,
        },
        {
          id: "unit-2",
          name: "Box",
          isBase: false,
          sellingPrice: "100.00",
        },
      ],
    };

    const result = InventoryProductSchema.safeParse(productWithNullConversion);
    expect(result.success).toBe(true);
  });

  it("should reject non-string malformed conversionQuantity", () => {
    const invalidProduct = {
      ...baseValidProduct,
      units: [
        {
          id: "unit-1",
          name: "Piece",
          isBase: true,
          sellingPrice: "10.00",
          conversionQuantity: { invalid: true },
        },
      ],
    };

    const result = InventoryProductSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
  });

  it("should enforce correct types for other numeric fields in contract", () => {
    // sellingPrice and wac must be strings (fixed-point decimals)
    // totalAvailable, totalDamaged, and availableQuantity must be numbers (integers)
    const productWithNumberPrice = {
      ...baseValidProduct,
      sellingPrice: 10, // Invalid: should be string
    };
    expect(InventoryProductSchema.safeParse(productWithNumberPrice).success).toBe(false);

    const productWithStringQuantity = {
      ...baseValidProduct,
      totalAvailable: "50", // Invalid: should be number
    };
    expect(InventoryProductSchema.safeParse(productWithStringQuantity).success).toBe(false);
  });
});
