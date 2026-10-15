import { db } from "../../config/database.js";
import { salesReturns, salesReturnItems } from "../../database/schema/returns.js";

import { sales, saleItems } from "../../database/schema/sales.js";
import { productUnits } from "../../database/schema/productUnits.js";
import { paymentMethods } from "../../database/schema/paymentMethods.js";
import { branches } from "../../database/schema/branches.js";
import { eq, and, or, sql, gte, lte, ilike } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";
import { CreateReturnInput, GetReturnsQuery } from "./schema.js";
import { InventoryService } from "../inventory/service.js";
import { AuditService } from "../audit/service.js";
import { NotificationService } from "../notifications/service.js";

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export class ReturnsService {
  static async createReturn(input: CreateReturnInput, user: any) {
    return await db.transaction(async (tx) => {
      let branchId: string;
      const isUnlinked = Boolean(input.isUnlinked || !input.saleId);

      // 1. Authorization: unlinked return requires OWNER
      if (isUnlinked) {
        if (user.role !== "OWNER") {
          throw new AppError("Only owners can authorize returns without an original sale", 403, "FORBIDDEN");
        }
        if (!input.branchId) {
          throw new AppError("Branch ID is required for returns without an original sale", 400);
        }
        const branchExists = await tx.query.branches.findFirst({ where: eq(branches.id, input.branchId) });
        if (!branchExists) {
          throw new AppError("Branch not found", 404);
        }
        branchId = input.branchId;
      } else {
        // Linked return: load original sale
        const sale = await tx.query.sales.findFirst({
          where: eq(sales.id, input.saleId!),
          with: { items: true },
        });

        if (!sale) {
          throw new AppError("Original sale not found", 404);
        }

        if (sale.status === "VOIDED") {
          throw new AppError("Cannot process return for a voided sale", 400);
        }

        // Employee can only process return in their assigned branch
        if (user.role !== "OWNER") {
          const userBranchId = user.branchId;
          if (userBranchId && sale.branchId !== userBranchId) {
            throw new AppError("Not authorized to process returns for this branch", 403);
          }
        }

        branchId = sale.branchId;
      }

      // 2. Validate refund payment method
      const pMethod = await tx.query.paymentMethods.findFirst({
        where: and(eq(paymentMethods.id, input.refundPaymentMethodId), eq(paymentMethods.isActive, true)),
      });
      if (!pMethod) {
        throw new AppError("Invalid or inactive refund payment method", 400);
      }

      // 3. Process each returned item and validate returnable quantities
      const processedItems: {
        saleItemId?: string;
        productId: string;
        unitId: string;
        enteredQuantity: number;
        baseQuantity: number;
        unitPrice: number;
        unitCost: number;
        condition: "SELLABLE" | "DAMAGED";
        refundAmount: number;
      }[] = [];

      let totalRefund = 0;

      for (const item of input.items) {
        // Verify product unit
        const unit = await tx.query.productUnits.findFirst({
          where: eq(productUnits.id, item.unitId),
          with: { conversions: true },
        });

        if (!unit || unit.productId !== item.productId) {
          throw new AppError(`Invalid unit for product ${item.productId}`, 400);
        }

        let baseQuantity = item.quantity;
        if (!unit.isBase) {
          const conversion = unit.conversions.find((c) => !c.effectiveUntil);
          if (!conversion) {
            throw new AppError(`No active conversion found for unit ${unit.name}`, 400);
          }
          baseQuantity = item.quantity * Number(conversion.conversionQuantity);
        }

        let unitPrice = 0;
        let unitCost = 0;
        let itemRefund = 0;

        if (!isUnlinked && input.saleId) {
          // Linked return: match against sale item
          const originalSaleItems = await tx.select().from(saleItems).where(eq(saleItems.saleId, input.saleId));
          const matchedSaleItem = originalSaleItems.find(
            (si) => si.id === item.saleItemId || (si.productId === item.productId && si.unitId === item.unitId)
          );

          if (!matchedSaleItem) {
            throw new AppError(`Item for product ${item.productId} was not part of the original sale`, 400);
          }

          // Check how many have already been returned for this sale item
          const [priorReturns] = await tx
            .select({
              totalReturned: sql<number>`COALESCE(SUM(entered_quantity), 0)`,
            })
            .from(salesReturnItems)
            .where(eq(salesReturnItems.saleItemId, matchedSaleItem.id));

          const alreadyReturned = Number(priorReturns?.totalReturned || 0);
          const remainingReturnable = matchedSaleItem.enteredQuantity - alreadyReturned;

          if (item.quantity > remainingReturnable) {
            throw new AppError(
              `Cannot return ${item.quantity}. Only ${remainingReturnable} remaining returnable for this item.`,
              400
            );
          }

          unitPrice = Number(matchedSaleItem.unitPrice);
          unitCost = Number(matchedSaleItem.unitCost);

          // Net refund calculation: (lineTotal - apportionedSaleDiscount) / enteredQty
          const netLineTotal = Number(matchedSaleItem.lineTotal) - Number(matchedSaleItem.apportionedSaleDiscount);
          const unitRefundRate = netLineTotal / matchedSaleItem.enteredQuantity;
          const maxEligibleRefund = round2(item.quantity * unitRefundRate);

          if (item.refundAmount !== undefined) {
            if (item.refundAmount > maxEligibleRefund) {
              throw new AppError(
                `Refund amount (${item.refundAmount}) exceeds maximum eligible amount (${maxEligibleRefund})`,
                400
              );
            }
            itemRefund = round2(item.refundAmount);
          } else {
            itemRefund = maxEligibleRefund;
          }

          processedItems.push({
            saleItemId: matchedSaleItem.id,
            productId: item.productId,
            unitId: item.unitId,
            enteredQuantity: item.quantity,
            baseQuantity,
            unitPrice,
            unitCost,
            condition: item.condition,
            refundAmount: itemRefund,
          });
        } else {
          // Unlinked return (Owner authorized)
          itemRefund = item.refundAmount !== undefined ? round2(item.refundAmount) : 0;
          processedItems.push({
            productId: item.productId,
            unitId: item.unitId,
            enteredQuantity: item.quantity,
            baseQuantity,
            unitPrice: 0,
            unitCost: 0,
            condition: item.condition,
            refundAmount: itemRefund,
          });
        }

        totalRefund += itemRefund;
      }

      // 4. Generate Return Number (RET-000001)
      const seqResult = await tx.execute(sql`SELECT nextval('return_number_seq')`);
      const nextSeq = seqResult.rows[0]?.nextval;
      const returnNumber = `RET-${String(nextSeq).padStart(6, "0")}`;

      const createdById = user.id || user.userId;

      // 5. Insert sales_returns
      const [newReturn] = await tx
        .insert(salesReturns)
        .values({
          returnNumber,
          saleId: isUnlinked ? null : input.saleId,
          branchId,
          createdById,
          refundAmount: round2(totalRefund).toFixed(2),
          refundPaymentMethodId: input.refundPaymentMethodId,
          status: "COMPLETED",
          reason: input.reason.trim(),
          isUnlinked,
        })
        .returning();

      if (!newReturn) {
        throw new AppError("Failed to create return record", 500);
      }

      // 6. Insert sales_return_items and record inventory movements
      for (const pItem of processedItems) {
        await tx.insert(salesReturnItems).values({
          returnId: newReturn.id,
          saleItemId: pItem.saleItemId || null,
          productId: pItem.productId,
          unitId: pItem.unitId,
          enteredQuantity: pItem.enteredQuantity,
          baseQuantity: pItem.baseQuantity,
          unitPrice: pItem.unitPrice.toFixed(2),
          condition: pItem.condition,
          refundAmount: pItem.refundAmount.toFixed(2),
        });

        // Record movement based on condition:
        // SELLABLE -> RETURN_GOOD (restocks available quantity)
        // DAMAGED -> RETURN_DAMAGED (adds to damaged quantity, does NOT increase sellable)
        const movementType = pItem.condition === "SELLABLE" ? "RETURN_GOOD" : "RETURN_DAMAGED";
        const movementReason = `Return ${returnNumber}: ${pItem.condition === "SELLABLE" ? "Sellable Restock" : "Damaged Return"}`;

        await InventoryService.recordMovement({
          branchId,
          productId: pItem.productId,
          movementType,
          quantity: pItem.baseQuantity,
          unitCost: pItem.unitCost,
          referenceId: newReturn.id,
          reason: movementReason,
          createdById,
        });
      }

      // Record system-wide audit
      await AuditService.recordAudit(
        {
          actorId: createdById,
          actorName: user.name || "User",
          actorRole: user.role,
          action: "RETURN_PROCESSED",
          category: "SALES_RETURNS",
          entityType: "return",
          entityId: newReturn.id,
          branchId,
          reason: input.reason,
          metadata: {
            returnNumber: newReturn.returnNumber,
            refundAmount: newReturn.refundAmount,
            itemCount: input.items.length,
            isUnlinked,
          },
        },
        tx
      );

      // Notify Owner of return
      await NotificationService.notifyOwner(
        {
          title: "Sales Return Processed",
          message: `Return ${newReturn.returnNumber} processed for $${newReturn.refundAmount}. Reason: ${input.reason}`,
          type: "RETURN_RECEIVED",
          priority: "IMPORTANT",
          entityType: "return",
          entityId: newReturn.id,
          link: "/returns",
          metadata: { returnNumber: newReturn.returnNumber, refundAmount: newReturn.refundAmount },
        },
        tx
      );

      return newReturn;

    });
  }

  static async getReturns(queryParams: GetReturnsQuery, user: any) {
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 20;
    const offset = (page - 1) * limit;

    const filters = [];

    // Role-based branch scoping
    if (user.role !== "OWNER") {
      const userBranchId = user.branchId;
      if (userBranchId) {
        filters.push(eq(salesReturns.branchId, userBranchId));
      }
    } else {
      if (queryParams.branchId) {
        filters.push(eq(salesReturns.branchId, queryParams.branchId));
      }
    }

    if (queryParams.saleId) {
      filters.push(eq(salesReturns.saleId, queryParams.saleId));
    }

    if (queryParams.startDate) {
      const start = new Date(queryParams.startDate);
      if (!isNaN(start.getTime())) {
        filters.push(gte(salesReturns.returnedAt, start.toISOString()));
      }
    }

    if (queryParams.endDate) {
      const end = new Date(queryParams.endDate);
      if (!isNaN(end.getTime())) {
        if (queryParams.endDate.length === 10) {
          end.setUTCHours(23, 59, 59, 999);
        }
        filters.push(lte(salesReturns.returnedAt, end.toISOString()));
      }
    }

    if (queryParams.search && queryParams.search.trim()) {
      filters.push(ilike(salesReturns.returnNumber, `%${queryParams.search.trim()}%`));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.query.salesReturns.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (salesReturns, { desc }) => [desc(salesReturns.returnedAt), desc(salesReturns.createdAt)],
      with: {
        branch: { columns: { id: true, name: true, code: true } },
        createdBy: { columns: { id: true, name: true, email: true } },
        refundPaymentMethod: { columns: { id: true, name: true } },
        sale: { columns: { id: true, saleNumber: true, soldAt: true, grandTotal: true } },
        items: {
          with: {
            product: { columns: { id: true, name: true, sku: true, brand: true } },
            unit: { columns: { id: true, name: true } },
          },
        },
      },
    });

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesReturns)
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

  static async getReturnById(id: string, user: any) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const whereCond = isUuid
      ? or(eq(salesReturns.id, id), eq(salesReturns.returnNumber, id))
      : eq(salesReturns.returnNumber, id);

    const returnRecord = await db.query.salesReturns.findFirst({
      where: whereCond,
      with: {
        branch: { columns: { id: true, name: true, code: true } },
        createdBy: { columns: { id: true, name: true, email: true } },
        refundPaymentMethod: { columns: { id: true, name: true } },
        sale: {
          columns: { id: true, saleNumber: true, soldAt: true, grandTotal: true },
          with: {
            branch: { columns: { id: true, name: true } },
            createdBy: { columns: { id: true, name: true } },
          },
        },
        items: {
          with: {
            product: { columns: { id: true, name: true, sku: true, brand: true } },
            unit: { columns: { id: true, name: true } },
            saleItem: { columns: { id: true, enteredQuantity: true, unitPrice: true, lineTotal: true } },
          },
        },
      },
    });

    if (!returnRecord) {
      throw new AppError("Return not found", 404);
    }

    // Role-based scoping: non-owners can only view returns in their assigned branch
    if (user.role !== "OWNER") {
      const userBranchId = user.branchId;
      if (userBranchId && returnRecord.branchId !== userBranchId) {
        throw new AppError("Not authorized to view this return", 403);
      }
    }

    return returnRecord;
  }
}
