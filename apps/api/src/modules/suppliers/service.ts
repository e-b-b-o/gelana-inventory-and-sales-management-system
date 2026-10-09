import { db } from "../../config/database.js";
import { suppliers } from "../../database/schema/suppliers.js";
import { eq, ilike } from "drizzle-orm";
import { CreateSupplierInput, UpdateSupplierInput, ToggleSupplierStatusInput } from "./schema.js";

export class SuppliersService {
  async getSuppliers() {
    return await db.select().from(suppliers).orderBy(suppliers.createdAt);
  }

  async createSupplier(data: CreateSupplierInput) {
    // Check for duplicate name
    const existing = await db.select().from(suppliers).where(ilike(suppliers.name, data.name));
    if (existing.length > 0) {
      throw new Error(`Supplier with name '${data.name}' already exists`);
    }

    const inserted = await db.insert(suppliers).values(data).returning();
    if (inserted.length === 0) throw new Error("Failed to insert supplier");
    return inserted[0];
  }

  async updateSupplier(id: string, data: UpdateSupplierInput) {
    if (data.name) {
      const existing = await db.select().from(suppliers).where(ilike(suppliers.name, data.name));
      if (existing.length > 0 && existing[0]?.id !== id) {
        throw new Error(`Supplier with name '${data.name}' already exists`);
      }
    }

    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updated = await db
      .update(suppliers)
      .set(updatePayload)
      .where(eq(suppliers.id, id))
      .returning();

    if (updated.length === 0) throw new Error("Supplier not found");
    return updated[0];
  }

  async toggleSupplierStatus(id: string, data: ToggleSupplierStatusInput) {
    const updated = await db
      .update(suppliers)
      .set({
        isActive: data.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(suppliers.id, id))
      .returning();

    if (updated.length === 0) throw new Error("Supplier not found");
    return updated[0];
  }
}
