import { db } from "../../config/database.js";
import { sales, saleItems, salePayments } from "../../database/schema/sales.js";
import { saleCorrections } from "../../database/schema/saleCorrections.js";
import { productUnits } from "../../database/schema/productUnits.js";
import { inventoryBalances } from "../../database/schema/inventoryBalances.js";
import { paymentMethods } from "../../database/schema/paymentMethods.js";

import { eq, and, or, sql, isNull, gte, lte, ilike } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";
import { CreateSaleInput, GetSalesQuery, GetSalesQuerySchema, VoidSaleInput, CorrectSaleInput } from "./schema.js";
import { InventoryService } from "../inventory/service.js";
import { productPrices } from "../../database/schema/productPrices.js";
import { AuditService } from "../audit/service.js";
import { NotificationService } from "../notifications/service.js";



function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

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

    // Role check: Only Owner can authorize or apply discounts
    const isOwner = user?.role === "OWNER";
    const hasSaleDiscount = (input.saleDiscount ?? 0) > 0;
    const hasLineDiscount = input.items.some(i => (i.lineDiscount ?? 0) > 0);

    if (!isOwner && (hasSaleDiscount || hasLineDiscount)) {
      throw new AppError("Only owners can apply discounts", 403, "FORBIDDEN");
    }

    return db.transaction(async (tx) => {
      // 1. Idempotency check
      if (input.idempotencyKey) {
        const existingSale = await tx.query.sales.findFirst({
          where: eq(sales.idempotencyKey, input.idempotencyKey),
          with: {
            items: true,
            payments: true,
          }
        });
        if (existingSale) {
          const branchMatches = existingSale.branchId === input.branchId;
          const saleDiscountMatches = Math.abs(Number(existingSale.saleDiscount) - (input.saleDiscount ?? 0)) < 0.01;
          const itemsMatch = existingSale.items.length === input.items.length && input.items.every(item => {
            const existing = existingSale.items.find(ei => ei.productId === item.productId && ei.unitId === item.unitId);
            return existing && existing.enteredQuantity === item.quantity && Math.abs(Number(existing.lineDiscount) - (item.lineDiscount ?? 0)) < 0.01;
          });
          const paymentsMatch = existingSale.payments.length === input.payments.length && input.payments.every(p => {
            const existing = existingSale.payments.find(ep => ep.paymentMethodId === p.paymentMethodId);
            return existing && Math.abs(Number(existing.amount) - p.amount) < 0.01;
          });

          if (branchMatches && saleDiscountMatches && itemsMatch && paymentsMatch) {
            return existingSale;
          } else {
            throw new AppError("Idempotency key already used with different payload", 409, "IDEMPOTENCY_CONFLICT");
          }
        }
      }

      // 2. Process items
      let grossSubtotal = 0;
      const processedItems = [];

      for (const item of input.items) {
        const lineDiscount = round2(item.lineDiscount ?? 0);
        if (lineDiscount < 0) {
          throw new AppError("Line discount cannot be negative", 400);
        }

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

        // Get current active price from DB rather than trusting the client payload
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
        const grossLineAmount = round2(item.quantity * derivedUnitPrice);

        if (lineDiscount > grossLineAmount) {
          throw new AppError(`Line discount (${lineDiscount}) cannot exceed gross line amount (${grossLineAmount})`, 400);
        }

        const netLineAmount = round2(grossLineAmount - lineDiscount);
        grossSubtotal = round2(grossSubtotal + grossLineAmount);

        processedItems.push({
          productId: item.productId,
          unitId: item.unitId,
          enteredQuantity: item.quantity,
          baseQuantity,
          unitPrice: derivedUnitPrice,
          unitCost: Number(balance.wac),
          grossLineAmount,
          lineDiscount,
          netLineAmount,
          lineTotal: netLineAmount,
        });
      }

      // 3. Process sale-level discount and proportional allocation
      const saleDiscount = round2(input.saleDiscount ?? 0);
      if (saleDiscount < 0) {
        throw new AppError("Sale discount cannot be negative", 400);
      }

      const eligibleSaleAmount = round2(processedItems.reduce((sum, item) => sum + item.netLineAmount, 0));

      if (saleDiscount > eligibleSaleAmount) {
        throw new AppError(`Sale discount (${saleDiscount}) cannot exceed eligible sale amount (${eligibleSaleAmount})`, 400);
      }

      const itemApportionedSaleDiscounts: number[] = Array.from({ length: processedItems.length }, () => 0);
      if (saleDiscount > 0 && eligibleSaleAmount > 0 && processedItems.length > 0) {
        let allocatedSum = 0;
        for (let i = 0; i < processedItems.length; i++) {
          const item = processedItems[i]!;
          const rawAlloc = (saleDiscount * item.netLineAmount) / eligibleSaleAmount;
          const roundedAlloc = round2(rawAlloc);
          itemApportionedSaleDiscounts[i] = roundedAlloc;
          allocatedSum = round2(allocatedSum + roundedAlloc);
        }

        const remainder = round2(saleDiscount - allocatedSum);
        if (Math.abs(remainder) > 0.0001) {
          // Find line with highest netLineAmount (with stable tie-breaker: first index)
          let highestIdx = 0;
          let highestNet = processedItems[0]!.netLineAmount;
          for (let i = 1; i < processedItems.length; i++) {
            if (processedItems[i]!.netLineAmount > highestNet) {
              highestNet = processedItems[i]!.netLineAmount;
              highestIdx = i;
            }
          }
          itemApportionedSaleDiscounts[highestIdx] = round2((itemApportionedSaleDiscounts[highestIdx] ?? 0) + remainder);
        }
      }

      const grandTotal = round2(eligibleSaleAmount - saleDiscount);
      if (grandTotal < 0) {
        throw new AppError("Grand total cannot be negative", 400);
      }

      // 4. Process payments and validate total
      let paymentTotal = 0;
      for (const payment of input.payments) {
        const pm = await tx.query.paymentMethods.findFirst({
          where: and(eq(paymentMethods.id, payment.paymentMethodId), eq(paymentMethods.isActive, true)),
        });
        if (!pm) {
          throw new AppError(`Invalid or inactive payment method ${payment.paymentMethodId}`, 400);
        }
        paymentTotal = round2(paymentTotal + payment.amount);
      }

      if (Math.abs(paymentTotal - grandTotal) > 0.01) {
        throw new AppError(`Payment total (${paymentTotal.toFixed(2)}) does not match sale grand total (${grandTotal.toFixed(2)})`, 400);
      }

      // 5. Create Sale
      const seqResult = await tx.execute(sql`SELECT nextval('sale_number_seq')`);
      const nextVal = seqResult.rows[0]?.nextval;
      const saleNumber = `SAL-${String(nextVal).padStart(6, '0')}`;

      const [sale] = await tx.insert(sales).values({
        saleNumber,
        idempotencyKey: input.idempotencyKey || null,
        branchId: input.branchId,
        createdById: user.id || user.userId,
        soldAt: soldAt.toISOString(),
        subtotal: grossSubtotal.toFixed(2),
        saleDiscount: saleDiscount.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
      }).returning();

      // 6. Insert Sale Items and Inventory Movements
      for (let i = 0; i < processedItems.length; i++) {
        const pItem = processedItems[i]!;
        await tx.insert(saleItems).values({
          saleId: sale!.id,
          productId: pItem.productId,
          unitId: pItem.unitId,
          enteredQuantity: pItem.enteredQuantity,
          baseQuantity: pItem.baseQuantity,
          unitPrice: pItem.unitPrice.toFixed(2),
          unitCost: pItem.unitCost.toFixed(2),
          lineDiscount: pItem.lineDiscount.toFixed(2),
          lineTotal: pItem.lineTotal.toFixed(2),
          apportionedSaleDiscount: (itemApportionedSaleDiscounts[i] ?? 0).toFixed(2),
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

      // 7. Insert Payments
      for (const payment of input.payments) {
        await tx.insert(salePayments).values({
          saleId: sale!.id,
          paymentMethodId: payment.paymentMethodId,
          amount: payment.amount.toFixed(2),
        });
      }

      // 8. Record audit log
      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.name || "User",
          actorRole: user.role,
          action: "SALE_CREATED",
          category: "SALES_RETURNS",
          entityType: "sale",
          entityId: sale!.id,
          branchId: sale!.branchId,
          metadata: {
            saleNumber: sale!.saleNumber,
            grandTotal: sale!.grandTotal,
            itemCount: input.items.length,
          },
        },
        tx
      );

      return sale!;
    });
  }

  static async getSales(query: GetSalesQuery, user: any) {
    const isOwner = user?.role === "OWNER";
    const userId = user?.id || user?.userId;
    const userBranchId = user?.branchId;

    const queryParams = GetSalesQuerySchema.parse(query);
    const page = queryParams.page;
    const limit = queryParams.limit;
    const offset = (page - 1) * limit;

    const filters = [];


    // Authorization & Scoping:
    if (!isOwner) {
      // Employee is restricted strictly to their own sales and assigned branch
      filters.push(eq(sales.createdById, userId));
      if (userBranchId) {
        filters.push(eq(sales.branchId, userBranchId));
      }
    } else {
      // Owner can filter by branchId and employeeId
      if (queryParams.branchId) {
        filters.push(eq(sales.branchId, queryParams.branchId));
      }
      if (queryParams.employeeId) {
        filters.push(eq(sales.createdById, queryParams.employeeId));
      }
    }

    // Date range filters
    if (queryParams.startDate) {
      const start = new Date(queryParams.startDate);
      if (!isNaN(start.getTime())) {
        filters.push(gte(sales.soldAt, start.toISOString()));
      }
    }
    if (queryParams.endDate) {
      const end = new Date(queryParams.endDate);
      if (!isNaN(end.getTime())) {
        if (queryParams.endDate.length === 10) {
          end.setUTCHours(23, 59, 59, 999);
        }
        filters.push(lte(sales.soldAt, end.toISOString()));
      }
    }

    // Search filter (by sale number)
    if (queryParams.search && queryParams.search.trim()) {
      filters.push(ilike(sales.saleNumber, `%${queryParams.search.trim()}%`));
    }


    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.query.sales.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (sales, { desc }) => [desc(sales.soldAt), desc(sales.createdAt)],
      with: {
        branch: { columns: { id: true, name: true, code: true } },
        createdBy: { columns: { id: true, name: true, email: true } },
        items: {
          with: {
            product: { columns: { id: true, name: true, sku: true } },
            unit: { columns: { id: true, name: true } },
          },
        },
        payments: {
          with: {
            paymentMethod: { columns: { id: true, name: true } },
          },
        },
      },
    });

    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(sales)
      .where(whereClause);

    const total = Number(countResult?.count || 0);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getSaleById(id: string, user: any) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const whereCond = isUuid ? or(eq(sales.id, id), eq(sales.saleNumber, id)) : eq(sales.saleNumber, id);

    const sale = await db.query.sales.findFirst({
      where: whereCond,
      with: {
        branch: { columns: { id: true, name: true, code: true } },
        createdBy: { columns: { id: true, name: true, email: true } },
        items: {
          with: {
            product: { columns: { id: true, name: true, sku: true, brand: true } },
            unit: { columns: { id: true, name: true } },
          },
        },
        payments: {
          with: {
            paymentMethod: { columns: { id: true, name: true } },
          },
        },
        returns: {
          with: {
            createdBy: { columns: { id: true, name: true } },
            items: {
              with: {
                product: { columns: { id: true, name: true, sku: true } },
                unit: { columns: { id: true, name: true } },
              },
            },
          },
        },
        corrections: {
          with: {
            createdBy: { columns: { id: true, name: true } },
          },
        },
      },
    });

    if (!sale) {
      throw new AppError("Sale not found", 404);
    }

    // Role-based data scoping
    if (user.role !== "OWNER") {
      const userBranchId = user.branchId;
      if (sale.createdById !== user.id || (userBranchId && sale.branchId !== userBranchId)) {
        throw new AppError("Not authorized to view this sale", 403);
      }
    }

    // If not OWNER, nullify unitCost (WAC cost snapshot) to protect business margins
    const sanitizedItems = sale.items.map((item) => ({
      ...item,
      unitCost: user.role === "OWNER" ? item.unitCost : null,
    }));

    return {
      ...sale,
      items: sanitizedItems,
    };
  }

  static async voidSale(id: string, input: VoidSaleInput, user: any) {
    if (user.role !== "OWNER") {
      throw new AppError("Only owners are permitted to void sales", 403, "FORBIDDEN");
    }

    if (!input.reason || !input.reason.trim()) {
      throw new AppError("Void reason is required", 400);
    }

    return db.transaction(async (tx) => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const whereCond = isUuid ? or(eq(sales.id, id), eq(sales.saleNumber, id)) : eq(sales.saleNumber, id);

      const sale = await tx.query.sales.findFirst({
        where: whereCond,
        with: {
          items: true,
          returns: true,
        },
      });

      if (!sale) {
        throw new AppError("Sale not found", 404);
      }

      if (sale.status === "VOIDED") {
        throw new AppError("Sale is already voided", 400);
      }

      if (sale.returns && sale.returns.length > 0) {
        throw new AppError("Cannot void a sale that has returns recorded against it", 400);
      }

      // Update sale status to VOIDED
      await tx.update(sales)
        .set({ status: "VOIDED" })
        .where(eq(sales.id, sale.id));

      // Record audit correction
      await tx.insert(saleCorrections).values({
        saleId: sale.id,
        correctionType: "VOID",
        reason: input.reason.trim(),
        createdById: user.id || user.userId,
        previousState: { status: sale.status },
        newState: { status: "VOIDED" },
      });

      // Compensating inventory movements for each sale item (reversing sale deduction)
      for (const item of sale.items) {
        await InventoryService.recordMovement({
          branchId: sale.branchId,
          productId: item.productId,
          movementType: "ADJUSTMENT",
          quantity: item.baseQuantity, // Positive quantity restores available stock
          unitCost: 0,
          referenceId: sale.id,
          reason: `Void sale ${sale.saleNumber}: ${input.reason.trim()}`,
          createdById: user.id || user.userId,
          dbTx: tx,
        });

      }

      // Record system-wide audit
      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.name || "Owner",
          actorRole: user.role,
          action: "SALE_VOIDED",
          category: "SALES_RETURNS",
          entityType: "sale",
          entityId: sale.id,
          branchId: sale.branchId,
          reason: input.reason.trim(),
          metadata: {
            saleNumber: sale.saleNumber,
            grandTotal: sale.grandTotal,
            reason: input.reason.trim(),
          },
        },
        tx
      );

      // Notify Owner
      await NotificationService.notifyOwner(
        {
          title: "Sale Voided",
          message: `Sale ${sale.saleNumber} was voided. Reason: ${input.reason.trim()}`,
          type: "SALE_VOID",
          priority: "CRITICAL",
          entityType: "sale",
          entityId: sale.id,
          link: "/sales",
          metadata: { saleNumber: sale.saleNumber, branchId: sale.branchId },
        },
        tx
      );

      return {
        success: true,
        message: `Sale ${sale.saleNumber} has been successfully voided`,
        saleId: sale.id,
      };
    });
  }

  static async correctSale(id: string, input: CorrectSaleInput, user: any) {
    return db.transaction(async (tx) => {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const whereCond = isUuid ? or(eq(sales.id, id), eq(sales.saleNumber, id)) : eq(sales.saleNumber, id);

      const sale = await tx.query.sales.findFirst({
        where: whereCond,
      });

      if (!sale) {
        throw new AppError("Sale not found", 404);
      }

      if (sale.status === "VOIDED") {
        throw new AppError("Cannot amend a voided sale", 400);
      }

      if (user.role !== "OWNER" && sale.createdById !== (user.id || user.userId)) {
        throw new AppError("Not authorized to amend this sale", 403);
      }

      const [correction] = await tx.insert(saleCorrections).values({
        saleId: sale.id,
        correctionType: "EDIT_NOTE",
        reason: input.reason.trim(),
        createdById: user.id || user.userId,
        previousState: {},
        newState: { note: input.note || null },
      }).returning();

      // Record system-wide audit
      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.name || "User",
          actorRole: user.role,
          action: "SALE_CORRECTED",
          category: "SALES_RETURNS",
          entityType: "sale",
          entityId: sale.id,
          branchId: sale.branchId,
          reason: input.reason.trim(),
          metadata: {
            saleNumber: sale.saleNumber,
            reason: input.reason.trim(),
          },
        },
        tx
      );

      return correction;
    });
  }

  static async getSaleCorrections(id: string, user: any) {
    const sale = await this.getSaleById(id, user);
    const corrections = await db.query.saleCorrections.findMany({
      where: eq(saleCorrections.saleId, sale.id),
      orderBy: (sc, { desc }) => [desc(sc.createdAt)],
      with: {
        createdBy: { columns: { id: true, name: true, email: true } },
      },
    });
    return corrections;
  }
}


