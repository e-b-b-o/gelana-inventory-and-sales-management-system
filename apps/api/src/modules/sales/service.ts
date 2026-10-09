import { db } from "../../config/database.js";
import { sales, saleItems, salePayments } from "../../database/schema/sales.js";
import { productUnits, productUnitConversions } from "../../database/schema/productUnits.js";
import { inventoryBalances } from "../../database/schema/inventoryBalances.js";
import { paymentMethods } from "../../database/schema/paymentMethods.js";
import { eq, and, sql, isNull } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";
import { CreateSaleInput } from "./schema.js";
import { InventoryService } from "../inventory/service.js";
import { productPrices } from "../../database/schema/productPrices.js";

export class SalesService {
  static async createSale(input: CreateSaleInput, user: any) {
    // Basic delayed sale date validation
    let soldAt = new Date();
    if (input.soldAt) {
      soldAt = new Date(input.soldAt);
      if (soldAt > new Date()) {
        throw new AppError("Sale date cannot be in the future", 400);
      }
    }

    return db.transaction(async (tx) => {
      // 1. Idempotency check
      if (input.idempotencyKey) {
        const existingSale = await tx.query.sales.findFirst({
          where: eq(sales.idempotencyKey, input.idempotencyKey),
        });
        if (existingSale) {
          return existingSale;
        }
      }

      // 2. Process items
      let subtotal = 0;
      const processedItems = [];

      for (const item of input.items) {
        // Get unit info to determine base quantity
        const unit = await tx.query.productUnits.findFirst({
          where: eq(productUnits.id, item.unitId),
          with: { conversions: true },
        });

        if (!unit || unit.productId !== item.productId) {
          throw new AppError(`Invalid unit for product ${item.productId}`, 400);
        }

        let baseQuantity = item.quantity;
        if (!unit.isBase) {
          // Find active conversion
          const conversion = unit.conversions.find(c => !c.effectiveUntil);
          if (!conversion) {
            throw new AppError(`No active conversion found for unit ${unit.name}`, 400);
          }
          baseQuantity = item.quantity * Number(conversion.conversionQuantity);
        }

        // Get current WAC (requires FOR UPDATE to ensure inventory lock)
        const balances = await tx.select().from(inventoryBalances)
          .where(and(eq(inventoryBalances.branchId, input.branchId), eq(inventoryBalances.productId, item.productId)))
          .for('update');
        
        const balance = balances[0];
        if (!balance || balance.availableQuantity < baseQuantity) {
          throw new AppError(`Insufficient stock for product ${item.productId}`, 400);
        }

        // Get current active price from DB rather than trusting the client payload entirely.
        const activePrice = await tx.query.productPrices.findFirst({
          where: and(
            eq(productPrices.productUnitId, item.unitId),
            isNull(productPrices.effectiveUntil)
          )
        });

        if (!activePrice) {
          throw new AppError(`No active price found for unit ${item.unitId}`, 400);
        }

        const derivedUnitPrice = Number(activePrice.sellingPrice);
        const lineTotal = item.quantity * derivedUnitPrice;
        subtotal += lineTotal;

        processedItems.push({
          productId: item.productId,
          unitId: item.unitId,
          enteredQuantity: item.quantity,
          baseQuantity,
          unitPrice: derivedUnitPrice,
          unitCost: Number(balance.wac),
          lineTotal,
        });
      }

      const grandTotal = subtotal; // No discounts in 6.1

      // 3. Process payments and validate total
      let paymentTotal = 0;
      for (const payment of input.payments) {
        const pm = await tx.query.paymentMethods.findFirst({
          where: and(eq(paymentMethods.id, payment.paymentMethodId), eq(paymentMethods.isActive, true)),
        });
        if (!pm) {
          throw new AppError(`Invalid or inactive payment method ${payment.paymentMethodId}`, 400);
        }
        paymentTotal += payment.amount;
      }

      // Allow a small precision tolerance for JS floats, but ideally exactly equal
      if (Math.abs(paymentTotal - grandTotal) > 0.01) {
        throw new AppError(`Payment total (${paymentTotal}) does not match sale grand total (${grandTotal})`, 400);
      }

      // 4. Create Sale
      const seqResult = await tx.execute(sql`SELECT nextval('sale_number_seq')`);
      const nextVal = seqResult.rows[0]?.nextval;
      const saleNumber = `SAL-${String(nextVal).padStart(6, '0')}`;

      const [sale] = await tx.insert(sales).values({
        saleNumber,
        idempotencyKey: input.idempotencyKey || null,
        branchId: input.branchId,
        createdById: user.id || user.userId,
        soldAt: soldAt.toISOString(),
        subtotal: subtotal.toFixed(2),
        saleDiscount: "0",
        grandTotal: grandTotal.toFixed(2),
      }).returning();

      // 5. Insert Sale Items and Inventory Movements
      for (const pItem of processedItems) {
        await tx.insert(saleItems).values({
          saleId: sale!.id,
          productId: pItem.productId,
          unitId: pItem.unitId,
          enteredQuantity: pItem.enteredQuantity,
          baseQuantity: pItem.baseQuantity,
          unitPrice: pItem.unitPrice.toFixed(2),
          unitCost: pItem.unitCost.toFixed(2),
          lineTotal: pItem.lineTotal.toFixed(2),
        });

        // Deduct from inventory safely
        await InventoryService.recordMovement({
          branchId: input.branchId,
          productId: pItem.productId,
          movementType: "SALE",
          quantity: -pItem.baseQuantity, // Negative to deduct
          unitCost: 0, // Sales do not affect WAC in the balance projection
          referenceId: sale!.id,
          reason: `Sale ${saleNumber}`,
          createdById: user.id || user.userId,
          dbTx: tx,
        });
      }

      // 6. Insert Payments
      for (const payment of input.payments) {
        await tx.insert(salePayments).values({
          saleId: sale!.id,
          paymentMethodId: payment.paymentMethodId,
          amount: payment.amount.toFixed(2),
        });
      }

      return sale!;
    });
  }
}
