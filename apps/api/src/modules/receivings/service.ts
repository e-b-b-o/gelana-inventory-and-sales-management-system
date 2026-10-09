import { db } from "../../config/database.js";
import { receivings, receivingItems } from "../../database/schema/receivings.js";
import { CreateReceivingDto, GetReceivingsQuery } from "./schema.js";
import { InventoryService } from "../inventory/service.js";
import { sql, and, eq } from "drizzle-orm";
import { AppError } from "../../utils/errors.js";

export class ReceivingsService {
  static async createReceiving(dto: CreateReceivingDto, userId: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new AppError("Receiving must contain at least one item", 400);
    }

    return await db.transaction(async (tx) => {
      // 1. Generate receiving voucher number
      const seqResult = await tx.execute(sql`SELECT nextval('receiving_number_seq')`);
      const nextVal = seqResult.rows[0]!.nextval;
      const receivingNumber = `RCV-${String(nextVal).padStart(6, '0')}`;
      
      // 2. Calculate total cost
      const totalCost = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
      
      // 3. Insert receiving header
      const [receiving] = await tx.insert(receivings).values({
        receivingNumber,
        branchId: dto.branchId,
        supplierId: dto.supplierId,
        invoiceNumber: dto.invoiceNumber || null,
        totalCost: totalCost.toFixed(2),
        receivedById: userId,
      }).returning();
      
      // 4. Process line items
      for (const item of dto.items) {
        // Insert receiving item record
        await tx.insert(receivingItems).values({
          receivingId: receiving!.id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost.toFixed(2),
        });
        
        // 5. Update inventory ledger and WAC atomically
        await InventoryService.recordMovement({
          branchId: dto.branchId,
          productId: item.productId,
          movementType: "RECEIVING",
          quantity: item.quantity,
          unitCost: item.unitCost,
          referenceId: receiving!.id,
          reason: dto.invoiceNumber ? `Invoice: ${dto.invoiceNumber}` : "Stock received",
          createdById: userId,
          dbTx: tx,
        });
      }
      
      return receiving;
    });
  }

  static async getReceivings(query: GetReceivingsQuery) {
    const { page, limit, branchId, supplierId } = query;
    const offset = (page - 1) * limit;

    const filters = [];
    if (branchId) filters.push(eq(receivings.branchId, branchId));
    if (supplierId) filters.push(eq(receivings.supplierId, supplierId));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.query.receivings.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (receivings, { desc }) => [desc(receivings.createdAt), desc(receivings.id)],
      with: {
        branch: { columns: { id: true, name: true } },
        supplier: { columns: { id: true, name: true } },
        receivedBy: { columns: { id: true, name: true } },
        items: true,
      },
    });

    const [countResult] = await db.select({ count: sql<number>`count(*)` })
      .from(receivings)
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

  static async getReceivingDetails(id: string) {
    const receiving = await db.query.receivings.findFirst({
      where: eq(receivings.id, id),
      with: {
        branch: { columns: { id: true, name: true } },
        supplier: { columns: { id: true, name: true, email: true, phoneNumber: true } },
        receivedBy: { columns: { id: true, name: true } },
        items: {
          with: {
            product: { columns: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    if (!receiving) {
      throw new AppError("Receiving not found", 404);
    }

    return receiving;
  }
}
