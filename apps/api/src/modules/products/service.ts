import { db } from "../../config/database.js";
import { products } from "../../database/schema/products.js";
import { categories } from "../../database/schema/categories.js";
import { eq } from "drizzle-orm";
import { CreateProductInput, UpdateProductInput, ToggleProductStatusInput } from "./schema.js";
import { sql } from "drizzle-orm";

export class ProductsService {
  async getProducts() {
    const { productUnits } = await import("../../database/schema/productUnits.js");
    const { productPrices } = await import("../../database/schema/productPrices.js");
    const { eq, and, isNull } = await import("drizzle-orm");

    return await db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        categoryId: products.categoryId,
        categoryName: categories.name,
        brand: products.brand,
        description: products.description,
        imageUrl: products.imageUrl,
        unit: productUnits.name,
        defaultSellingPrice: productPrices.sellingPrice,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(
        productUnits,
        and(eq(products.id, productUnits.productId), eq(productUnits.isBase, true))
      )
      .leftJoin(
        productPrices,
        and(eq(productUnits.id, productPrices.productUnitId), isNull(productPrices.effectiveUntil))
      )
      .orderBy(products.createdAt);
  }

  async createProduct(data: CreateProductInput) {
    const { productUnits, productUnitConversions } = await import("../../database/schema/productUnits.js");

    // 1. Verify category exists and is active
    const categoryResult = await db.select().from(categories).where(eq(categories.id, data.categoryId));
    if (categoryResult.length === 0) {
      throw new Error("Category not found");
    }
    if (categoryResult[0] && !categoryResult[0].isActive) {
      throw new Error("Cannot assign inactive category to a new product");
    }

    return await db.transaction(async (tx) => {
      // 2. Generate SKU
      const result = await tx.execute<{ nextval: string }>(sql`SELECT nextval('product_sku_seq') as nextval`);
      // @ts-ignore
      const seqValue = result.rows[0].nextval;
      const sku = `PRD-${String(seqValue).padStart(6, '0')}`;

      const { defaultSellingPrice, unit, ...productData } = data;
      
      const newProduct = {
        ...productData,
        sku,
      };

      const insertedProduct = await tx.insert(products).values(newProduct).returning();
      const product = insertedProduct[0];
      if (!product) throw new Error("Failed to insert product");

      // 3. Create BASE unit and conversion
      const [newUnit] = await tx.insert(productUnits).values({
        productId: product.id,
        name: data.unit, // Legacy field acts as the base unit name
        isBase: true,
        isActive: true,
      }).returning();

      await tx.insert(productUnitConversions).values({
        productUnitId: newUnit!.id,
        conversionQuantity: "1",
      });

      // 4. Create initial product price
      const { productPrices } = await import("../../database/schema/productPrices.js");
      await tx.insert(productPrices).values({
        productUnitId: newUnit!.id,
        sellingPrice: String(data.defaultSellingPrice),
      });

      return product;
    });
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    const { productUnits } = await import("../../database/schema/productUnits.js");
    const { productPrices } = await import("../../database/schema/productPrices.js");
    const { eq, and, isNull } = await import("drizzle-orm");

    return await db.transaction(async (tx) => {
      if (data.categoryId) {
        const categoryResult = await tx.select().from(categories).where(eq(categories.id, data.categoryId));
        if (categoryResult.length === 0) {
          throw new Error("Category not found");
        }
        
        const currentProduct = await tx.select().from(products).where(eq(products.id, id));
        if (currentProduct.length === 0) {
          throw new Error("Product not found");
        }

        if (currentProduct[0] && currentProduct[0].categoryId !== data.categoryId && categoryResult[0] && !categoryResult[0].isActive) {
          throw new Error("Cannot assign inactive category to product");
        }
      }

      const updatePayload: any = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      // Remove fields not belonging to products table
      delete updatePayload.defaultSellingPrice;
      delete updatePayload.unit;

      const updated = await tx
        .update(products)
        .set(updatePayload)
        .where(eq(products.id, id))
        .returning();

      if (updated.length === 0) throw new Error("Product not found");

      // Handle base unit name update
      if (data.unit !== undefined) {
        await tx.update(productUnits)
          .set({ name: data.unit, updatedAt: new Date().toISOString() })
          .where(and(eq(productUnits.productId, id), eq(productUnits.isBase, true)));
      }

      // Handle base unit price update
      if (data.defaultSellingPrice !== undefined) {
        const baseUnit = await tx.select().from(productUnits).where(and(eq(productUnits.productId, id), eq(productUnits.isBase, true)));
        if (baseUnit.length > 0) {
          const unitId = baseUnit[0]!.id;
          const currentPrice = await tx.select().from(productPrices).where(and(eq(productPrices.productUnitId, unitId), isNull(productPrices.effectiveUntil)));
          
          if (currentPrice.length === 0 || Number(currentPrice[0]!.sellingPrice) !== Number(data.defaultSellingPrice)) {
            // Close old price
            if (currentPrice.length > 0) {
              await tx.update(productPrices).set({ effectiveUntil: new Date().toISOString() }).where(eq(productPrices.id, currentPrice[0]!.id));
            }
            // Open new price
            await tx.insert(productPrices).values({
              productUnitId: unitId,
              sellingPrice: String(data.defaultSellingPrice)
            });
          }
        }
      }

      return updated[0];
    });
  }

  async toggleProductStatus(id: string, data: ToggleProductStatusInput) {
    const updated = await db
      .update(products)
      .set({
        isActive: data.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(products.id, id))
      .returning();

    if (updated.length === 0) throw new Error("Product not found");
    return updated[0];
  }

  // --- Product Units ---

  async getProductUnits(productId: string) {
    const { productUnits, productUnitConversions } = await import("../../database/schema/productUnits.js");
    const { productPrices } = await import("../../database/schema/productPrices.js");
    const { eq, and, isNull } = await import("drizzle-orm");

    return await db
      .select({
        id: productUnits.id,
        productId: productUnits.productId,
        name: productUnits.name,
        isBase: productUnits.isBase,
        isActive: productUnits.isActive,
        conversionQuantity: productUnitConversions.conversionQuantity,
        sellingPrice: productPrices.sellingPrice,
      })
      .from(productUnits)
      .innerJoin(
        productUnitConversions, 
        and(
          eq(productUnits.id, productUnitConversions.productUnitId),
          isNull(productUnitConversions.effectiveUntil)
        )
      )
      .leftJoin(
        productPrices,
        and(
          eq(productUnits.id, productPrices.productUnitId),
          isNull(productPrices.effectiveUntil)
        )
      )
      .where(eq(productUnits.productId, productId))
      .orderBy(productUnits.createdAt);
  }

  async createProductUnit(productId: string, data: any) {
    const { productUnits, productUnitConversions } = await import("../../database/schema/productUnits.js");
    const { eq, and } = await import("drizzle-orm");

    // 1. Verify product exists
    const productResult = await db.select().from(products).where(eq(products.id, productId));
    if (productResult.length === 0) throw new Error("Product not found");

    // 2. Check for name uniqueness
    const existingUnit = await db.select().from(productUnits).where(
      and(
        eq(productUnits.productId, productId),
        eq(productUnits.name, data.name)
      )
    );
    if (existingUnit.length > 0) throw new Error(`Unit name '${data.name}' already exists for this product`);

    // 3. Create unit and conversion in a transaction
    return await db.transaction(async (tx) => {
      const [newUnit] = await tx.insert(productUnits).values({
        productId,
        name: data.name,
        isBase: false, // Alternate units only through this endpoint. Base units created via backfill/future product creation.
        isActive: data.isActive !== undefined ? data.isActive : true,
      }).returning();

      await tx.insert(productUnitConversions).values({
        productUnitId: newUnit!.id,
        conversionQuantity: String(data.conversionQuantity),
      });

      return {
        ...newUnit,
        conversionQuantity: String(data.conversionQuantity),
      };
    });
  }

  async updateProductUnit(productId: string, unitId: string, data: any) {
    const { productUnits, productUnitConversions } = await import("../../database/schema/productUnits.js");
    const { eq, and, isNull, ne } = await import("drizzle-orm");

    return await db.transaction(async (tx) => {
      const existing = await tx.select().from(productUnits).where(
        and(eq(productUnits.id, unitId), eq(productUnits.productId, productId))
      );
      if (existing.length === 0) throw new Error("Unit not found");
      const unit = existing[0];
      if (!unit) throw new Error("Unit not found");

      if (data.name && data.name !== unit.name) {
        const nameCheck = await tx.select().from(productUnits).where(
          and(
            eq(productUnits.productId, productId),
            eq(productUnits.name, data.name),
            ne(productUnits.id, unitId)
          )
        );
        if (nameCheck.length > 0) throw new Error(`Unit name '${data.name}' already exists for this product`);
        
        await tx.update(productUnits)
          .set({ name: data.name, updatedAt: new Date().toISOString() })
          .where(eq(productUnits.id, unitId));
        unit.name = data.name;
      }

      let currentConversionQty = null;

      if (data.conversionQuantity !== undefined) {
        if (unit.isBase && Number(data.conversionQuantity) !== 1) {
          throw new Error("Base unit conversion quantity must be exactly 1");
        }

        const currentConversion = await tx.select().from(productUnitConversions).where(
          and(
            eq(productUnitConversions.productUnitId, unitId),
            isNull(productUnitConversions.effectiveUntil)
          )
        );

        if (currentConversion.length > 0 && Number(currentConversion[0]!.conversionQuantity) !== Number(data.conversionQuantity)) {
          // Close old conversion
          await tx.update(productUnitConversions)
            .set({ effectiveUntil: new Date().toISOString() })
            .where(eq(productUnitConversions.id, currentConversion[0]!.id));
          
          // Open new conversion
          await tx.insert(productUnitConversions).values({
            productUnitId: unitId,
            conversionQuantity: String(data.conversionQuantity),
          });
          currentConversionQty = String(data.conversionQuantity);
        } else {
          currentConversionQty = currentConversion[0]?.conversionQuantity;
        }
      } else {
        const currentConversion = await tx.select().from(productUnitConversions).where(
          and(
            eq(productUnitConversions.productUnitId, unitId),
            isNull(productUnitConversions.effectiveUntil)
          )
        );
        currentConversionQty = currentConversion[0]?.conversionQuantity;
      }

      return {
        ...unit,
        conversionQuantity: currentConversionQty,
      };
    });
  }

  async toggleProductUnitStatus(productId: string, unitId: string, data: any) {
    const { productUnits } = await import("../../database/schema/productUnits.js");
    const { eq, and } = await import("drizzle-orm");

    const existing = await db.select().from(productUnits).where(
      and(eq(productUnits.id, unitId), eq(productUnits.productId, productId))
    );
    if (existing.length === 0) throw new Error("Unit not found");
    const unit = existing[0];
    if (!unit) throw new Error("Unit not found");

    if (unit.isBase && !data.isActive) {
      // Check if product is active
      const product = await db.select().from(products).where(eq(products.id, productId));
      if (product[0] && product[0].isActive) {
        throw new Error("Cannot deactivate the BASE unit of an active product");
      }
    }

    const updated = await db
      .update(productUnits)
      .set({
        isActive: data.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(productUnits.id, unitId))
      .returning();

    return updated[0];
  }

  // --- Product Prices ---

  async getProductUnitPrices(productId: string, unitId: string) {
    const { productPrices } = await import("../../database/schema/productPrices.js");
    const { eq, and } = await import("drizzle-orm");

    return await db
      .select({
        id: productPrices.id,
        productUnitId: productPrices.productUnitId,
        sellingPrice: productPrices.sellingPrice,
        effectiveFrom: productPrices.effectiveFrom,
        effectiveUntil: productPrices.effectiveUntil,
      })
      .from(productPrices)
      .where(eq(productPrices.productUnitId, unitId))
      .orderBy(productPrices.effectiveFrom);
  }

  async setProductUnitPrice(productId: string, unitId: string, data: any) {
    const { productUnits } = await import("../../database/schema/productUnits.js");
    const { productPrices } = await import("../../database/schema/productPrices.js");
    const { eq, and, isNull } = await import("drizzle-orm");

    return await db.transaction(async (tx) => {
      // 1. Verify unit belongs to product
      const existing = await tx.select().from(productUnits).where(
        and(eq(productUnits.id, unitId), eq(productUnits.productId, productId))
      );
      if (existing.length === 0) throw new Error("Unit not found");

      // 2. Find current active price
      const currentPrice = await tx.select().from(productPrices).where(
        and(eq(productPrices.productUnitId, unitId), isNull(productPrices.effectiveUntil))
      );

      // If price is the same, do nothing
      if (currentPrice.length > 0 && Number(currentPrice[0]!.sellingPrice) === Number(data.sellingPrice)) {
        return currentPrice[0];
      }

      // 3. Close current active price
      if (currentPrice.length > 0) {
        await tx.update(productPrices)
          .set({ effectiveUntil: new Date().toISOString() })
          .where(eq(productPrices.id, currentPrice[0]!.id));
      }

      // 4. Insert new price
      const [newPrice] = await tx.insert(productPrices).values({
        productUnitId: unitId,
        sellingPrice: String(data.sellingPrice),
      }).returning();

      // If this is the base unit, also update the main product updated_at to reflect change?
      // Not strictly necessary, but good practice.
      
      return newPrice;
    });
  }
}
