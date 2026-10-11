import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import {
  branches,
  inventoryBalances,
  products,
  productUnits,
  transferEvents,
  transferItems,
  transfers,
} from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import { InventoryService } from "../inventory/service.js";
import {
  ApproveTransferInput,
  ApproveTransferSchema,
  CreateTransferInput,
  CreateTransferSchema,
  DispatchTransferInput,
  DispatchTransferSchema,
  GetTransfersQuery,
  RejectTransferInput,
  RejectTransferSchema,
} from "./schema.js";

export class TransfersService {
  private static getActorId(user: any): string {
    const id = user.id || user.userId;
    if (!id) {
      throw new AppError("Authentication required: actor ID not found", 401, "AUTHENTICATION_ERROR");
    }
    return id;
  }

  static async createTransfer(rawInput: CreateTransferInput, user: any) {
    const input = CreateTransferSchema.parse(rawInput);
    const actorId = this.getActorId(user);

    // 1. Authorization: Employee can only create requests involving their assigned branch
    if (user.role === "EMPLOYEE") {
      if (!user.branchId) {
        throw new AppError("Employee must have an assigned branch", 403, "AUTHORIZATION_ERROR");
      }
      if (input.destinationBranchId !== user.branchId && input.sourceBranchId !== user.branchId) {
        throw new AppError(
          "You can only request transfers where your assigned branch is the destination or source",
          403,
          "AUTHORIZATION_ERROR"
        );
      }
    }

    // 2. Validate branches exist and are active
    const [sourceBranch] = await db
      .select()
      .from(branches)
      .where(and(eq(branches.id, input.sourceBranchId), eq(branches.isActive, true)))
      .limit(1);

    if (!sourceBranch) {
      throw new AppError("Source branch does not exist or is inactive", 400, "INVALID_BRANCH");
    }

    const [destinationBranch] = await db
      .select()
      .from(branches)
      .where(and(eq(branches.id, input.destinationBranchId), eq(branches.isActive, true)))
      .limit(1);

    if (!destinationBranch) {
      throw new AppError("Destination branch does not exist or is inactive", 400, "INVALID_BRANCH");
    }

    // 3. Validate products exist and are active
    const productIds = input.items.map((i) => i.productId);
    const existingProducts = await db
      .select()
      .from(products)
      .where(and(inArray(products.id, productIds), eq(products.isActive, true)));

    if (existingProducts.length !== productIds.length) {
      throw new AppError("One or more selected products are invalid or inactive", 400, "INVALID_PRODUCT");
    }

    // Query base units for products
    const baseUnits = await db
      .select()
      .from(productUnits)
      .where(and(inArray(productUnits.productId, productIds), eq(productUnits.isBase, true)));
    const baseUnitMap = new Map(baseUnits.map((u) => [u.productId, u.id]));

    // 4. Atomic transaction to create transfer and items
    return await db.transaction(async (tx) => {
      // Allocate human-readable transfer number: TRF-000001
      const seqResult = await tx.execute(sql`SELECT nextval('transfer_number_seq')`);
      const nextVal = (seqResult.rows[0] as any)?.nextval;
      if (!nextVal) {
        throw new AppError("Failed to generate transfer sequence number", 500);
      }
      const transferNumber = `TRF-${String(nextVal).padStart(6, "0")}`;

      const [transfer] = await tx
        .insert(transfers)
        .values({
          transferNumber,
          sourceBranchId: input.sourceBranchId,
          destinationBranchId: input.destinationBranchId,
          status: "REQUESTED",
          notes: input.notes || null,
          createdById: actorId,
        })
        .returning();

      if (!transfer) {
        throw new AppError("Failed to create transfer record", 500);
      }

      // Insert line items
      const itemsToInsert = input.items.map((item) => {
        return {
          transferId: transfer.id,
          productId: item.productId,
          unitId: baseUnitMap.get(item.productId) || null,
          requestedQuantity: item.requestedQuantity,
        };
      });

      const insertedItems = await tx.insert(transferItems).values(itemsToInsert).returning();

      // Record audit event
      await tx.insert(transferEvents).values({
        transferId: transfer.id,
        eventType: "REQUESTED",
        actorId,
        notes: input.notes ? `Requested: ${input.notes}` : "Transfer request submitted",
      });

      return {
        ...transfer,
        sourceBranch: { id: sourceBranch.id, name: sourceBranch.name, code: sourceBranch.code },
        destinationBranch: { id: destinationBranch.id, name: destinationBranch.name, code: destinationBranch.code },
        items: insertedItems,
      };
    });
  }

  static async getTransfers(query: GetTransfersQuery, user: any) {
    const actorId = this.getActorId(user);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    // Role-based visibility
    if (user.role === "EMPLOYEE") {
      if (!user.branchId) {
        throw new AppError("Employee must have an assigned branch", 403, "AUTHORIZATION_ERROR");
      }
      conditions.push(
        or(
          eq(transfers.sourceBranchId, user.branchId),
          eq(transfers.destinationBranchId, user.branchId),
          eq(transfers.createdById, actorId)
        )
      );
    } else {
      if (query.sourceBranchId) {
        conditions.push(eq(transfers.sourceBranchId, query.sourceBranchId));
      }
      if (query.destinationBranchId) {
        conditions.push(eq(transfers.destinationBranchId, query.destinationBranchId));
      }
    }

    if (query.status) {
      conditions.push(eq(transfers.status, query.status));
    }

    if (query.search) {
      conditions.push(ilike(transfers.transferNumber, `%${query.search.trim()}%`));
    }

    if (query.startDate) {
      conditions.push(sql`${transfers.createdAt} >= ${query.startDate}`);
    }

    if (query.endDate) {
      conditions.push(sql`${transfers.createdAt} <= ${query.endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count query
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(transfers)
      .where(whereClause);

    const total = countResult?.count || 0;

    // Records query
    const rows = await db.query.transfers.findMany({
      where: whereClause,
      with: {
        sourceBranch: {
          columns: { id: true, name: true, code: true },
        },
        destinationBranch: {
          columns: { id: true, name: true, code: true },
        },
        createdBy: {
          columns: { id: true, name: true, email: true },
        },
        approvedBy: {
          columns: { id: true, name: true },
        },
        rejectedBy: {
          columns: { id: true, name: true },
        },
        dispatchedBy: {
          columns: { id: true, name: true },
        },
        items: true,
      },
      orderBy: [desc(transfers.createdAt)],
      limit,
      offset,
    });

    const data = rows.map((t) => ({
      ...t,
      itemCount: t.items.length,
      totalRequestedQuantity: t.items.reduce((sum, item) => sum + item.requestedQuantity, 0),
      totalDispatchedQuantity: t.items.reduce((sum, item) => sum + (item.dispatchedQuantity || 0), 0),
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTransferById(id: string, user: any) {
    const actorId = this.getActorId(user);

    const transfer = await db.query.transfers.findFirst({
      where: or(eq(transfers.id, id), eq(transfers.transferNumber, id)),
      with: {
        sourceBranch: true,
        destinationBranch: true,
        createdBy: {
          columns: { id: true, name: true, email: true, role: true },
        },
        approvedBy: {
          columns: { id: true, name: true, email: true },
        },
        rejectedBy: {
          columns: { id: true, name: true, email: true },
        },
        dispatchedBy: {
          columns: { id: true, name: true, email: true },
        },
        items: {
          with: {
            product: {
              columns: { id: true, name: true, sku: true },
            },
            unit: {
              columns: { id: true, name: true, isBase: true },
            },
          },
        },
        events: {
          with: {
            actor: {
              columns: { id: true, name: true, role: true },
            },
          },
          orderBy: [desc(transferEvents.createdAt)],
        },
      },
    });

    if (!transfer) {
      throw new AppError("Transfer not found", 404, "NOT_FOUND");
    }

    // Role-based authorization
    if (user.role === "EMPLOYEE") {
      if (
        transfer.sourceBranchId !== user.branchId &&
        transfer.destinationBranchId !== user.branchId &&
        transfer.createdById !== actorId
      ) {
        throw new AppError("You do not have permission to view this transfer", 403, "AUTHORIZATION_ERROR");
      }
    }

    // Augment items with current source stock available
    const productIds = transfer.items.map((i) => i.productId);
    const balances = await db
      .select()
      .from(inventoryBalances)
      .where(and(eq(inventoryBalances.branchId, transfer.sourceBranchId), inArray(inventoryBalances.productId, productIds)));

    const balanceMap = new Map(balances.map((b) => [b.productId, b]));

    let estimatedTotalCost = 0;
    const enrichedItems = transfer.items.map((item) => {
      const b = balanceMap.get(item.productId);
      const sourceAvailableQuantity = b ? b.availableQuantity : 0;
      const wac = b ? Number(b.wac) : 0;
      const unitCost = item.sourceUnitCost ? Number(item.sourceUnitCost) : wac;

      const qtyForCost = item.dispatchedQuantity ?? item.approvedQuantity ?? item.requestedQuantity;
      estimatedTotalCost += unitCost * qtyForCost;

      return {
        ...item,
        sourceAvailableQuantity,
        sourceUnitCost: user.role === "OWNER" ? unitCost.toFixed(2) : undefined,
      };
    });

    return {
      ...transfer,
      items: enrichedItems,
      estimatedTotalCost: user.role === "OWNER" ? estimatedTotalCost.toFixed(2) : undefined,
    };
  }

  static async approveTransfer(id: string, rawInput: ApproveTransferInput, user: any) {
    const input = ApproveTransferSchema.parse(rawInput);
    const actorId = this.getActorId(user);

    if (user.role !== "OWNER") {
      throw new AppError("Only the Owner can approve transfer requests", 403, "AUTHORIZATION_ERROR");
    }

    return await db.transaction(async (tx) => {
      // Row lock the transfer
      const [transfer] = await tx
        .select()
        .from(transfers)
        .where(eq(transfers.id, id))
        .for("update");

      if (!transfer) {
        throw new AppError("Transfer not found", 404, "NOT_FOUND");
      }

      if (transfer.status !== "REQUESTED") {
        throw new AppError(
          `Cannot approve transfer with status "${transfer.status}". Only REQUESTED transfers can be approved.`,
          400,
          "INVALID_STATE_TRANSITION"
        );
      }

      const existingItems = await tx
        .select()
        .from(transferItems)
        .where(eq(transferItems.transferId, transfer.id));

      const inputItemMap = new Map(input.items?.map((i) => [i.productId, i.approvedQuantity]));

      for (const item of existingItems) {
        let approvedQty = item.requestedQuantity;
        if (inputItemMap.has(item.productId)) {
          const specifiedQty = inputItemMap.get(item.productId)!;
          if (specifiedQty <= 0) {
            throw new AppError("Approved quantity must be positive", 400, "INVALID_QUANTITY");
          }
          if (specifiedQty > item.requestedQuantity) {
            throw new AppError(
              `Approved quantity (${specifiedQty}) cannot exceed requested quantity (${item.requestedQuantity})`,
              400,
              "INVALID_QUANTITY"
            );
          }
          approvedQty = specifiedQty;
        }

        await tx
          .update(transferItems)
          .set({ approvedQuantity: approvedQty })
          .where(eq(transferItems.id, item.id));
      }

      const now = new Date().toISOString();
      const [updatedTransfer] = await tx
        .update(transfers)
        .set({
          status: "APPROVED",
          approvedById: actorId,
          approvedAt: now,
          approvalNotes: input.notes || null,
          updatedAt: now,
        })
        .where(eq(transfers.id, transfer.id))
        .returning();

      if (!updatedTransfer) {
        throw new AppError("Failed to update transfer status", 500);
      }

      await tx.insert(transferEvents).values({
        transferId: transfer.id,
        eventType: "APPROVED",
        actorId,
        notes: input.notes ? `Approved: ${input.notes}` : "Transfer request approved by Owner",
      });

      return updatedTransfer;
    });
  }

  static async rejectTransfer(id: string, rawInput: RejectTransferInput, user: any) {
    const input = RejectTransferSchema.parse(rawInput);
    const actorId = this.getActorId(user);

    if (user.role !== "OWNER") {
      throw new AppError("Only the Owner can reject transfer requests", 403, "AUTHORIZATION_ERROR");
    }

    return await db.transaction(async (tx) => {
      // Row lock the transfer
      const [transfer] = await tx
        .select()
        .from(transfers)
        .where(eq(transfers.id, id))
        .for("update");

      if (!transfer) {
        throw new AppError("Transfer not found", 404, "NOT_FOUND");
      }

      if (transfer.status !== "REQUESTED") {
        throw new AppError(
          `Cannot reject transfer with status "${transfer.status}". Only REQUESTED transfers can be rejected.`,
          400,
          "INVALID_STATE_TRANSITION"
        );
      }

      const now = new Date().toISOString();
      const [updatedTransfer] = await tx
        .update(transfers)
        .set({
          status: "REJECTED",
          rejectedById: actorId,
          rejectedAt: now,
          rejectionReason: input.reason,
          updatedAt: now,
        })
        .where(eq(transfers.id, transfer.id))
        .returning();

      if (!updatedTransfer) {
        throw new AppError("Failed to update transfer status", 500);
      }

      await tx.insert(transferEvents).values({
        transferId: transfer.id,
        eventType: "REJECTED",
        actorId,
        notes: `Rejected: ${input.reason}`,
      });

      return updatedTransfer;
    });
  }

  static async dispatchTransfer(id: string, rawInput: DispatchTransferInput, user: any) {
    const input = DispatchTransferSchema.parse(rawInput);
    const actorId = this.getActorId(user);

    if (user.role !== "OWNER") {
      throw new AppError("Only the Owner can dispatch transfers", 403, "AUTHORIZATION_ERROR");
    }

    return await db.transaction(async (tx) => {
      // 1. Row lock the transfer
      const [transfer] = await tx
        .select()
        .from(transfers)
        .where(eq(transfers.id, id))
        .for("update");

      if (!transfer) {
        throw new AppError("Transfer not found", 404, "NOT_FOUND");
      }

      if (transfer.status !== "APPROVED") {
        throw new AppError(
          `Cannot dispatch transfer with status "${transfer.status}". Only APPROVED transfers can be dispatched.`,
          400,
          "INVALID_STATE_TRANSITION"
        );
      }

      const [destBranch] = await tx
        .select()
        .from(branches)
        .where(eq(branches.id, transfer.destinationBranchId))
        .limit(1);

      // 2. Fetch items to dispatch
      const items = await tx
        .select()
        .from(transferItems)
        .where(eq(transferItems.transferId, transfer.id));

      if (items.length === 0) {
        throw new AppError("Transfer has no items to dispatch", 400, "EMPTY_TRANSFER");
      }

      // 3. Validate stock availability at source branch for all products
      for (const item of items) {
        const qtyToDispatch = item.approvedQuantity || item.requestedQuantity;
        if (qtyToDispatch <= 0) {
          throw new AppError("Dispatch quantity must be positive", 400, "INVALID_QUANTITY");
        }

        const [balance] = await tx
          .select()
          .from(inventoryBalances)
          .where(and(eq(inventoryBalances.branchId, transfer.sourceBranchId), eq(inventoryBalances.productId, item.productId)))
          .for("update");

        const available = balance ? balance.availableQuantity : 0;
        if (available < qtyToDispatch) {
          const [prod] = await tx.select().from(products).where(eq(products.id, item.productId)).limit(1);
          const prodName = prod ? prod.name : item.productId;
          throw new AppError(
            `Insufficient available stock at source branch for product "${prodName}". Available: ${available}, Required: ${qtyToDispatch}`,
            400,
            "INSUFFICIENT_STOCK"
          );
        }
      }

      // 4. Deduct stock from source branch and record immutable ledger movements
      for (const item of items) {
        const qtyToDispatch = item.approvedQuantity || item.requestedQuantity;

        const [balance] = await tx
          .select()
          .from(inventoryBalances)
          .where(and(eq(inventoryBalances.branchId, transfer.sourceBranchId), eq(inventoryBalances.productId, item.productId)));

        const sourceWac = balance ? Number(balance.wac) : 0;

        await InventoryService.recordMovement({
          branchId: transfer.sourceBranchId,
          productId: item.productId,
          movementType: "TRANSFER_OUT",
          quantity: -qtyToDispatch,
          unitCost: sourceWac,
          referenceId: transfer.id,
          reason: `Transfer ${transfer.transferNumber} dispatch to ${destBranch ? destBranch.name : "destination branch"}`,
          createdById: actorId,
          dbTx: tx,
        });

        // Update item with dispatched quantity and captured source cost
        await tx
          .update(transferItems)
          .set({
            dispatchedQuantity: qtyToDispatch,
            sourceUnitCost: sourceWac.toFixed(2),
          })
          .where(eq(transferItems.id, item.id));
      }

      // 5. Update transfer status
      const now = new Date().toISOString();
      const [updatedTransfer] = await tx
        .update(transfers)
        .set({
          status: "DISPATCHED",
          dispatchedById: actorId,
          dispatchedAt: now,
          dispatchNotes: input.notes || null,
          updatedAt: now,
        })
        .where(eq(transfers.id, transfer.id))
        .returning();

      if (!updatedTransfer) {
        throw new AppError("Failed to update transfer status", 500);
      }

      // 6. Record audit event
      await tx.insert(transferEvents).values({
        transferId: transfer.id,
        eventType: "DISPATCHED",
        actorId,
        notes: input.notes ? `Dispatched: ${input.notes}` : "Stock dispatched from source branch",
      });

      return updatedTransfer;
    });
  }
}
