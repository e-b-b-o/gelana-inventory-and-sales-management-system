import { db } from "../../config/database.js";
import { products, inventoryBalances } from "../../database/schema/index.js";
import { eq, and, ilike, or } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";
import { GetBalancesQuery, GetMovementsQuery, RecordMovementParams, CreateOpeningStockInput, CreateAdjustmentInput, SubmitStocktakeInput, CreateDisposalInput } from "./schema.js";
import { inventoryMovements } from "../../database/schema/inventoryMovements.js";
import { sql } from "drizzle-orm";
import { AuditService } from "../audit/service.js";
import { NotificationService } from "../notifications/service.js";

export class InventoryService {
  static async getBalances(query: GetBalancesQuery, user: any) {
    let targetBranchId = query.branchId;

    if (user.role === "EMPLOYEE") {
      if (query.branchId && query.branchId !== user.branchId) {
        throw new AppError("Forbidden: Cannot view inventory for other branches", 403);
      }
      targetBranchId = user.branchId;
    }

    const { categoryId, brand, status, search, page, limit } = query;
    const offset = (page - 1) * limit;

    const whereConditions = [];
    
    // Only fetch active products
    whereConditions.push(eq(products.isActive, true));

    if (categoryId) {
      whereConditions.push(eq(products.categoryId, categoryId));
    }
    
    if (brand) {
      whereConditions.push(ilike(products.brand, `%${brand}%`));
    }

    if (search) {
      whereConditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.sku, `%${search}%`)
        )
      );
    }

    if (status) {
      if (status === "damaged") {
        whereConditions.push(
          sql`EXISTS (SELECT 1 FROM ${inventoryBalances} WHERE ${inventoryBalances.productId} = ${products.id} ${targetBranchId ? sql`AND ${inventoryBalances.branchId} = ${targetBranchId}` : sql``} AND ${inventoryBalances.damagedQuantity} > 0)`
        );
      } else if (status === "outofstock") {
        whereConditions.push(
          sql`EXISTS (SELECT 1 FROM ${inventoryBalances} WHERE ${inventoryBalances.productId} = ${products.id} ${targetBranchId ? sql`AND ${inventoryBalances.branchId} = ${targetBranchId}` : sql``} AND ${inventoryBalances.availableQuantity} = 0)`
        );
      } else if (status === "lowstock") {
        whereConditions.push(
          sql`EXISTS (SELECT 1 FROM ${inventoryBalances} WHERE ${inventoryBalances.productId} = ${products.id} ${targetBranchId ? sql`AND ${inventoryBalances.branchId} = ${targetBranchId}` : sql``} AND ${inventoryBalances.availableQuantity} > 0 AND ${inventoryBalances.availableQuantity} <= ${inventoryBalances.minimumStockQuantity})`
        );
      } else if (status === "instock") {
        whereConditions.push(
          sql`EXISTS (SELECT 1 FROM ${inventoryBalances} WHERE ${inventoryBalances.productId} = ${products.id} ${targetBranchId ? sql`AND ${inventoryBalances.branchId} = ${targetBranchId}` : sql``} AND ${inventoryBalances.availableQuantity} > ${inventoryBalances.minimumStockQuantity})`
        );
      }
    }

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // We fetch products with their balances, units, prices
    const productsData = await db.query.products.findMany({
      where,
      limit,
      offset,
      with: {
        category: true,
        units: {
          with: {
            conversions: true,
            prices: {
              where: (prices: any, { isNull }: any) => isNull(prices.effectiveUntil)
            }
          }
        },
        inventoryBalances: targetBranchId 
          ? { 
              where: (balances: any, { eq }: any) => eq(balances.branchId, targetBranchId),
              with: { branch: true } 
            }
          : { with: { branch: true } }
      }
    });

    try {
      const mappedData = productsData.map((p: any) => {
        const baseUnit = p.units.find((u: any) => u.isBase);
        const altUnit = p.units.find((u: any) => !u.isBase && u.isActive);
        const activePrice = baseUnit?.prices?.[0] || altUnit?.prices?.[0];

        const totalAvailable = p.inventoryBalances.reduce((sum: number, b: any) => sum + b.availableQuantity, 0);
        const totalMinimum = p.inventoryBalances.reduce((sum: number, b: any) => sum + b.minimumStockQuantity, 0);
        const totalDamaged = p.inventoryBalances.reduce((sum: number, b: any) => sum + b.damagedQuantity, 0);

        let calculatedStatus = "instock";
        if (totalAvailable === 0) calculatedStatus = "outofstock";
        else if (totalAvailable <= totalMinimum) calculatedStatus = "lowstock";

        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category?.name || "Unknown",
          brand: p.brand,
          baseUnit: baseUnit?.name || "Unit",
          altUnit: altUnit?.name || null,
          sellingPrice: activePrice?.sellingPrice || "0",
          totalAvailable,
          totalDamaged,
          status: calculatedStatus,
          units: p.units.map((u: any) => ({
            id: u.id,
            name: u.name,
            isBase: u.isBase,
            sellingPrice: u.prices?.[0]?.sellingPrice || "0",
            conversionQuantity: u.conversions?.find((c: any) => !c.effectiveUntil)?.conversionQuantity ?? (u.isBase ? "1" : null)
          })),
          balances: p.inventoryBalances.map((b: any) => ({
            branchId: b.branchId,
            branchName: b.branch?.name || b.branchId,
            availableQuantity: b.availableQuantity,
            damagedQuantity: b.damagedQuantity,
            minimumStockQuantity: b.minimumStockQuantity,
            wac: b.wac
          }))
        };
      });

      return {
        data: mappedData
      };
    } catch (e) {
      console.error("Error in getBalances mapping:", e);
      throw e;
    }
  }

  static async recordMovement(params: RecordMovementParams) {
    const executeLogic = async (tx: any) => {
      // 1. Atomically ensure balance row exists (handles concurrent initializations)
      await tx
        .insert(inventoryBalances)
        .values({
          branchId: params.branchId,
          productId: params.productId,
          availableQuantity: 0,
          damagedQuantity: 0,
          inTransitQuantity: 0,
          wac: "0",
        })
        .onConflictDoNothing();

      // 2. Fetch current balance with row-level lock (prevents race conditions and lost updates)
      const existingBalances = await tx
        .select()
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.branchId, params.branchId),
            eq(inventoryBalances.productId, params.productId)
          )
        )
        .for("update");
      
      const balance = existingBalances[0];
      if (!balance) {
        throw new AppError("Failed to lock inventory balance record", 500);
      }

      const { movementType, quantity, unitCost } = params;

      let newAvailable = balance.availableQuantity;
      let newDamaged = balance.damagedQuantity;
      let newInTransit = balance.inTransitQuantity;
      let newWac = Number(balance.wac);

      // 2. Update buckets
      switch (movementType) {
        case "OPENING_STOCK":
        case "RECEIVING":
        case "ADJUSTMENT":
        case "SALE":
        case "TRANSFER_OUT":
        case "RETURN_GOOD":
          newAvailable += quantity;
          break;
        case "DISPOSAL":
        case "RETURN_DAMAGED":
        case "TRANSFER_DAMAGED":
          newDamaged += quantity;
          break;
        case "TRANSFER_IN":
          // Special case: completes a transfer. quantity is added to available, subtracted from inTransit if tracked
          newAvailable += quantity;
          if (newInTransit >= quantity) {
            newInTransit -= quantity;
          }
          break;
      }

      // 3. Negative inventory constraint (strictly enforced: no negative stock in online-only architecture)
      if (newAvailable < 0) {
        throw new AppError("Insufficient available inventory", 400);
      }
      if (newDamaged < 0) {
        throw new AppError("Insufficient damaged inventory", 400);
      }
      if (newInTransit < 0) {
        throw new AppError("Insufficient in-transit inventory", 400);
      }

      // 4. Update WAC
      const changesWac = movementType === "OPENING_STOCK" || movementType === "RECEIVING";
      if (changesWac) {
        const currentQty = balance.availableQuantity;
        const currentWac = Number(balance.wac);
        const newTotalQty = currentQty + quantity;

        if (newTotalQty > 0) {
          // New WAC = ((Current Qty * Current WAC) + (New Qty * New Unit Cost)) / (Current Qty + New Qty)
          // Note: if quantity is negative (which shouldn't happen for cost-bearing events normally, but just in case), math still works
          newWac = ((currentQty * currentWac) + (quantity * unitCost)) / newTotalQty;
        } else {
          // Fallback if somehow we hit 0 or negative after a cost-bearing event
          newWac = unitCost;
        }
      }

      // 5. Update balance
      await tx.update(inventoryBalances)
        .set({
          availableQuantity: newAvailable,
          damagedQuantity: newDamaged,
          inTransitQuantity: newInTransit,
          wac: newWac.toFixed(2),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(inventoryBalances.id, balance.id));

      // 6. Generate human-readable transaction ID
      const prefixMap: Record<string, string> = {
        "OPENING_STOCK": "OPN",
        "SALE": "SAL",
        "RECEIVING": "REC",
        "ADJUSTMENT": "ADJ",
        "TRANSFER_OUT": "TRO",
        "TRANSFER_IN": "TRI",
        "RETURN_GOOD": "RTG",
        "RETURN_DAMAGED": "RTD",
        "DISPOSAL": "DSP"
      };
      const prefix = prefixMap[movementType] || "MOV";
      const seqResult = await tx.execute(sql`SELECT nextval('transaction_id_seq')`);
      const nextVal = seqResult.rows[0].nextval;
      const transactionId = `${prefix}-${String(nextVal).padStart(6, '0')}`;

      // 7. Insert ledger movement
      const [movement] = await tx.insert(inventoryMovements).values({
        transactionId,
        branchId: params.branchId,
        productId: params.productId,
        movementType,
        quantity,
        unitCost: unitCost.toFixed(2),
        referenceId: params.referenceId,
        reason: params.reason,
        createdById: params.createdById,
      }).returning();

      // 8. Low-stock alert on reduction
      if (quantity < 0 && newAvailable <= (balance.minimumStockQuantity > 0 ? balance.minimumStockQuantity : 5)) {
        await NotificationService.notifyOwner(
          {
            title: "Low Stock Alert",
            message: `Available stock dropped to ${newAvailable} units at branch.`,
            type: "LOW_STOCK",
            priority: newAvailable <= 0 ? "CRITICAL" : "IMPORTANT",
            entityType: "product",
            entityId: params.productId,
            link: "/inventory",
            metadata: { branchId: params.branchId, availableQuantity: newAvailable },
          },
          tx
        );
      }

      return movement;
    };

    if (params.dbTx) {
      return executeLogic(params.dbTx);
    } else {
      return db.transaction(executeLogic);
    }
  }

  static async getMovements(query: GetMovementsQuery, user: any) {
    let targetBranchId = query.branchId;

    if (user.role === "EMPLOYEE") {
      if (query.branchId && query.branchId !== user.branchId) {
        throw new AppError("Forbidden: Cannot view movements for other branches", 403);
      }
      targetBranchId = user.branchId;
    }

    const { productId, movementType, startDate, endDate, page, limit } = query;
    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (targetBranchId) {
      whereConditions.push(eq(inventoryMovements.branchId, targetBranchId));
    }
    if (productId) {
      whereConditions.push(eq(inventoryMovements.productId, productId));
    }
    if (movementType) {
      whereConditions.push(eq(inventoryMovements.movementType, movementType));
    }
    if (startDate) {
      whereConditions.push(sql`${inventoryMovements.createdAt} >= ${startDate}`);
    }
    if (endDate) {
      whereConditions.push(sql`${inventoryMovements.createdAt} <= ${endDate}`);
    }

    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [movementsData, countResult] = await Promise.all([
      db.query.inventoryMovements.findMany({
        where,
        limit,
        offset,
        orderBy: (movements, { desc }) => [desc(movements.createdAt)],
        with: {
          product: {
            with: {
              category: true,
              units: true
            }
          },
          branch: true,
          createdBy: true
        }
      }),
      db.execute(sql`
        SELECT count(*) 
        FROM ${inventoryMovements} 
        ${where ? sql`WHERE ${where}` : sql``}
      `)
    ]);

    const totalCount = Number(countResult.rows[0]?.count || 0);

    return {
      data: movementsData.map((m: any) => {
        const baseUnit = m.product.units.find((u: any) => u.isBase)?.name || "Unit";
        return {
          id: m.id,
          transactionId: m.transactionId,
          branchName: m.branch.name,
          productName: m.product.name,
          productSku: m.product.sku,
          categoryName: m.product.category.name,
          baseUnit,
          movementType: m.movementType,
          quantity: m.quantity,
          unitCost: m.unitCost,
          reason: m.reason,
          createdBy: m.createdBy.name,
          createdAt: m.createdAt,
        };
      }),
      meta: {
        totalItems: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }

  static async createOpeningStock(input: CreateOpeningStockInput, user: any) {
    if (user.role !== "OWNER") {
      throw new AppError("Forbidden: Only owners can record opening stock", 403);
    }

    if (input.quantity <= 0) {
      throw new AppError("Opening stock quantity must be positive", 400);
    }
    
    if (input.unitCost <= 0) {
      throw new AppError("Estimated unit cost must be greater than zero", 400);
    }

    return db.transaction(async (tx) => {
      // Check for existing opening stock movement
      const existing = await tx.select().from(inventoryMovements)
        .where(
          and(
            eq(inventoryMovements.branchId, input.branchId),
            eq(inventoryMovements.productId, input.productId),
            eq(inventoryMovements.movementType, "OPENING_STOCK")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new AppError("Opening stock has already been recorded for this product and branch.", 409);
      }

      // Record the movement
      const movement = await this.recordMovement({
        branchId: input.branchId,
        productId: input.productId,
        movementType: "OPENING_STOCK",
        quantity: input.quantity,
        unitCost: input.unitCost,
        createdById: user.id || user.userId,
        dbTx: tx,
      });

      // Record system-wide audit
      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.name || "Owner",
          actorRole: user.role,
          action: "OPENING_STOCK_RECORDED",
          category: "INVENTORY",
          entityType: "product",
          entityId: input.productId,
          branchId: input.branchId,
          metadata: {
            quantity: input.quantity,
            unitCost: input.unitCost,
          },
        },
        tx
      );

      return movement;
    });
  }

  static async createAdjustment(input: CreateAdjustmentInput, user: any) {
    if (user.role !== "OWNER") {
      throw new AppError("Forbidden: Only owners can record stock adjustments", 403);
    }

    if (input.quantityDelta === 0) {
      throw new AppError("Adjustment quantity cannot be zero", 400);
    }

    return db.transaction(async (tx) => {
      // Record the movement
      const movement = await this.recordMovement({
        branchId: input.branchId,
        productId: input.productId,
        movementType: "ADJUSTMENT",
        quantity: input.quantityDelta,
        unitCost: 0, // Adjustments do not carry cost and do not affect WAC
        reason: input.reason,
        createdById: user.id || user.userId,
        dbTx: tx,
      });

      // Record system-wide audit
      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.name || "Owner",
          actorRole: user.role,
          action: "STOCK_ADJUSTED",
          category: "INVENTORY",
          entityType: "product",
          entityId: input.productId,
          branchId: input.branchId,
          reason: input.reason,
          metadata: {
            quantityDelta: input.quantityDelta,
            reason: input.reason,
          },
        },
        tx
      );

      // Notification
      await NotificationService.notifyOwner(
        {
          title: "Stock Adjustment Recorded",
          message: `Stock adjusted by ${input.quantityDelta > 0 ? "+" : ""}${input.quantityDelta}. Reason: ${input.reason}`,
          type: "STOCK_ADJUSTMENT",
          priority: "INFORMATIONAL",
          entityType: "product",
          entityId: input.productId,
          link: "/inventory",
          metadata: { branchId: input.branchId, quantityDelta: input.quantityDelta },
        },
        tx
      );

      return movement;
    });
  }

  static async submitStocktake(input: SubmitStocktakeInput, user: { id?: string; userId?: string; role: string; branchId?: string }) {
    if (user.role !== "OWNER") {
      throw new AppError("Forbidden: Only owners can perform stocktakes", 403);
    }

    return db.transaction(async (tx) => {
      const movements = [];
      
      for (const item of input.items) {
        // Get the current authoritative system balance (with row-level lock FOR UPDATE)
        const currentBalances = await tx.select()
          .from(inventoryBalances)
          .where(
            and(
              eq(inventoryBalances.branchId, input.branchId),
              eq(inventoryBalances.productId, item.productId)
            )
          )
          .for('update');
          
        const currentSystemQuantity = currentBalances.length > 0 ? currentBalances[0]!.availableQuantity : 0;
        
        const variance = item.physicalCount - currentSystemQuantity;
        
        // Only record a movement if there's an actual variance
        if (variance !== 0) {
          const movement = await this.recordMovement({
            branchId: input.branchId,
            productId: item.productId,
            movementType: "ADJUSTMENT",
            quantity: variance,
            unitCost: 0, // Adjustments do not carry cost and do not affect WAC
            reason: input.reason ? `Stocktake Variance: ${input.reason}` : "Stocktake Variance",
            createdById: (user.id || user.userId) as string,
            dbTx: tx,
          });
          movements.push(movement);
        }
      }

      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.role === "OWNER" ? "Owner" : "User",
          actorRole: user.role,
          action: "STOCKTAKE_SUBMITTED",
          category: "INVENTORY",
          entityType: "branch",
          entityId: input.branchId,
          branchId: input.branchId,
          reason: input.reason,
          metadata: {
            itemCount: input.items.length,
            adjustedCount: movements.length,
          },
        },
        tx
      );
      
      return movements;
    });
  }

  static async createDisposal(input: CreateDisposalInput, user: { id?: string; userId?: string; role: string; branchId?: string }) {
    if (user.role !== "OWNER") {
      throw new AppError("Forbidden: Only owners can dispose of stock", 403);
    }

    return db.transaction(async (tx) => {
      // 1. Get the current authoritative system balance (with row-level lock FOR UPDATE)
      const currentBalances = await tx.select()
        .from(inventoryBalances)
        .where(
          and(
            eq(inventoryBalances.branchId, input.branchId),
            eq(inventoryBalances.productId, input.productId)
          )
        )
        .for('update');
        
      const balance = currentBalances[0];
      
      if (!balance || balance.damagedQuantity < input.quantity) {
        throw new AppError("Insufficient damaged inventory to dispose", 400);
      }
      
      // 2. Record disposal movement (quantity must be negative for disposal)
      const movement = await this.recordMovement({
        branchId: input.branchId,
        productId: input.productId,
        movementType: "DISPOSAL",
        quantity: -Math.abs(input.quantity),
        unitCost: 0, // Disposal does not affect WAC directly in this projection
        reason: input.reason,
        createdById: (user.id || user.userId) as string,
        dbTx: tx,
      });

      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.role === "OWNER" ? "Owner" : "User",
          actorRole: user.role,
          action: "STOCK_DISPOSED",
          category: "INVENTORY",
          entityType: "product",
          entityId: input.productId,
          branchId: input.branchId,
          reason: input.reason,
          metadata: {
            quantity: input.quantity,
            reason: input.reason,
          },
        },
        tx
      );

      return movement;
    });
  }
}
