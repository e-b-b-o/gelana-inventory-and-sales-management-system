import { db } from "../../config/database.js";
import { paymentMethods } from "../../database/schema/paymentMethods.js";
import { eq, ilike } from "drizzle-orm";
import { CreatePaymentMethodInput, UpdatePaymentMethodInput, TogglePaymentMethodStatusInput } from "./schema.js";

export class PaymentMethodsService {
  async getPaymentMethods() {
    return await db.select().from(paymentMethods).orderBy(paymentMethods.createdAt);
  }

  async createPaymentMethod(data: CreatePaymentMethodInput) {
    // Check for duplicate name
    const existing = await db.select().from(paymentMethods).where(ilike(paymentMethods.name, data.name));
    if (existing.length > 0) {
      throw new Error(`Payment method with name '${data.name}' already exists`);
    }

    const inserted = await db.insert(paymentMethods).values(data).returning();
    if (inserted.length === 0) throw new Error("Failed to insert payment method");
    return inserted[0];
  }

  async updatePaymentMethod(id: string, data: UpdatePaymentMethodInput) {
    if (data.name) {
      const existing = await db.select().from(paymentMethods).where(ilike(paymentMethods.name, data.name));
      if (existing.length > 0 && existing[0]?.id !== id) {
        throw new Error(`Payment method with name '${data.name}' already exists`);
      }
    }

    const updatePayload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updated = await db
      .update(paymentMethods)
      .set(updatePayload)
      .where(eq(paymentMethods.id, id))
      .returning();

    if (updated.length === 0) throw new Error("Payment method not found");
    return updated[0];
  }

  async togglePaymentMethodStatus(id: string, data: TogglePaymentMethodStatusInput) {
    const updated = await db
      .update(paymentMethods)
      .set({
        isActive: data.isActive,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(paymentMethods.id, id))
      .returning();

    if (updated.length === 0) throw new Error("Payment method not found");
    return updated[0];
  }
}
