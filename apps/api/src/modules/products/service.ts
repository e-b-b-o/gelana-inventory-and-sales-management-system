import { db } from "../../config/database.js";
import { products } from "../../database/schema/products.js";
import { categories } from "../../database/schema/categories.js";
import { eq } from "drizzle-orm";
import { CreateProductInput, UpdateProductInput, ToggleProductStatusInput } from "./schema.js";
import { sql } from "drizzle-orm";

export class ProductsService {
  async getProducts() {
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
        unit: products.unit,
        defaultSellingPrice: products.defaultSellingPrice,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(products.createdAt);
  }

  async createProduct(data: CreateProductInput) {
    // 1. Verify category exists and is active
    const categoryResult = await db.select().from(categories).where(eq(categories.id, data.categoryId));
    if (categoryResult.length === 0) {
      throw new Error("Category not found");
    }
    if (categoryResult[0] && !categoryResult[0].isActive) {
      throw new Error("Cannot assign inactive category to a new product");
    }

    // 2. Generate SKU
    const result = await db.execute<{ nextval: string }>(sql`SELECT nextval('product_sku_seq') as nextval`);
    // @ts-ignore
    const seqValue = result.rows[0].nextval;
    const sku = `PRD-${String(seqValue).padStart(6, '0')}`;

    const newProduct = {
      ...data,
      defaultSellingPrice: String(data.defaultSellingPrice),
      sku,
    };

    const inserted = await db.insert(products).values(newProduct).returning();
    return inserted[0];
  }

  async updateProduct(id: string, data: UpdateProductInput) {
    if (data.categoryId) {
      const categoryResult = await db.select().from(categories).where(eq(categories.id, data.categoryId));
      if (categoryResult.length === 0) {
        throw new Error("Category not found");
      }
      
      const currentProduct = await db.select().from(products).where(eq(products.id, id));
      if (currentProduct.length === 0) {
        throw new Error("Product not found");
      }

      // Existing products may retain an inactive category, but if changing category, it must be active.
      if (currentProduct[0] && currentProduct[0].categoryId !== data.categoryId && categoryResult[0] && !categoryResult[0].isActive) {
        throw new Error("Cannot assign inactive category to product");
      }
    }

    const updatePayload: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    if (data.defaultSellingPrice !== undefined) {
      updatePayload.defaultSellingPrice = String(data.defaultSellingPrice);
    }

    const updated = await db
      .update(products)
      .set(updatePayload)
      .where(eq(products.id, id))
      .returning();

    if (updated.length === 0) throw new Error("Product not found");
    return updated[0];
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
}
