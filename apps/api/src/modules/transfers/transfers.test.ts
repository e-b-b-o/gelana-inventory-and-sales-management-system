import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TransfersService } from "./service.js";
import { db } from "../../config/database.js";
import {
  branches,
  categories,
  products,
  productUnits,
  inventoryBalances,
  inventoryMovements,
  transfers,
  transferItems,
  transferEvents,
  users,
} from "../../database/schema/index.js";
import { and, eq, or, sql } from "drizzle-orm";
import crypto from "crypto";

describe("Transfers Workflow (Slices 8.1 - 8.4)", () => {
  let sourceBranchId: string;
  let destBranchId: string;
  let otherBranchId: string;
  let categoryId: string;
  let product1Id: string;
  let product2Id: string;
  let unit1Id: string;
  let unit2Id: string;
  let ownerId: string;
  let sourceEmployeeId: string;
  let destEmployeeId: string;
  let otherEmployeeId: string;

  beforeEach(async () => {
    sourceBranchId = crypto.randomUUID();
    destBranchId = crypto.randomUUID();
    otherBranchId = crypto.randomUUID();
    categoryId = crypto.randomUUID();
    product1Id = crypto.randomUUID();
    product2Id = crypto.randomUUID();
    unit1Id = crypto.randomUUID();
    unit2Id = crypto.randomUUID();
    ownerId = crypto.randomUUID();
    sourceEmployeeId = crypto.randomUUID();
    destEmployeeId = crypto.randomUUID();
    otherEmployeeId = crypto.randomUUID();

    // 1. Branches
    await db.insert(branches).values([
      { id: sourceBranchId, name: "Source Branch", code: `SRC-${sourceBranchId.substring(0, 4)}`, isActive: true },
      { id: destBranchId, name: "Destination Branch", code: `DST-${destBranchId.substring(0, 4)}`, isActive: true },
      { id: otherBranchId, name: "Other Branch", code: `OTH-${otherBranchId.substring(0, 4)}`, isActive: true },
    ]);

    // 2. Users
    await db.insert(users).values([
      { id: ownerId, email: `owner-${ownerId}@test.com`, passwordHash: "hash", name: "System Owner", role: "OWNER" },
      { id: sourceEmployeeId, email: `emp-src-${sourceEmployeeId}@test.com`, passwordHash: "hash", name: "Source Employee", role: "EMPLOYEE", branchId: sourceBranchId },
      { id: destEmployeeId, email: `emp-dst-${destEmployeeId}@test.com`, passwordHash: "hash", name: "Dest Employee", role: "EMPLOYEE", branchId: destBranchId },
      { id: otherEmployeeId, email: `emp-oth-${otherEmployeeId}@test.com`, passwordHash: "hash", name: "Other Employee", role: "EMPLOYEE", branchId: otherBranchId },
    ]);

    // 3. Category & Products
    await db.insert(categories).values({
      id: categoryId,
      name: `Transfer Cat ${categoryId.substring(0, 4)}`,
    });

    await db.insert(products).values([
      { id: product1Id, name: "A4 Paper", sku: `SKU-P1-${product1Id.substring(0, 6)}`, categoryId, isActive: true },
      { id: product2Id, name: "Ballpoint Pen", sku: `SKU-P2-${product2Id.substring(0, 6)}`, categoryId, isActive: true },
    ]);

    await db.insert(productUnits).values([
      { id: unit1Id, productId: product1Id, name: "Ream", isBase: true },
      { id: unit2Id, productId: product2Id, name: "Box", isBase: true },
    ]);

    // 4. Initial inventory balances at source branch
    await db.insert(inventoryBalances).values([
      {
        branchId: sourceBranchId,
        productId: product1Id,
        availableQuantity: 50,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        wac: "15.00",
      },
      {
        branchId: sourceBranchId,
        productId: product2Id,
        availableQuantity: 20,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        wac: "8.50",
      },
      {
        branchId: destBranchId,
        productId: product1Id,
        availableQuantity: 0,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        wac: "0.00",
      },
      {
        branchId: destBranchId,
        productId: product2Id,
        availableQuantity: 0,
        damagedQuantity: 0,
        inTransitQuantity: 0,
        wac: "0.00",
      },
    ]);
  });

  afterEach(async () => {
    // Clean up in reverse dependency order
    await db.delete(transferEvents).where(
      sql`transfer_id IN (SELECT id FROM transfers WHERE source_branch_id IN (${sourceBranchId}, ${destBranchId}, ${otherBranchId}))`
    );
    await db.delete(transferItems).where(
      sql`transfer_id IN (SELECT id FROM transfers WHERE source_branch_id IN (${sourceBranchId}, ${destBranchId}, ${otherBranchId}))`
    );
    await db.delete(transfers).where(
      or(
        eq(transfers.sourceBranchId, sourceBranchId),
        eq(transfers.sourceBranchId, destBranchId),
        eq(transfers.sourceBranchId, otherBranchId)
      )
    );
    await db.delete(inventoryMovements).where(
      or(
        eq(inventoryMovements.branchId, sourceBranchId),
        eq(inventoryMovements.branchId, destBranchId),
        eq(inventoryMovements.branchId, otherBranchId)
      )
    );
    await db.delete(inventoryBalances).where(
      or(
        eq(inventoryBalances.branchId, sourceBranchId),
        eq(inventoryBalances.branchId, destBranchId),
        eq(inventoryBalances.branchId, otherBranchId)
      )
    );
    await db.delete(productUnits).where(or(eq(productUnits.id, unit1Id), eq(productUnits.id, unit2Id)));
    await db.delete(products).where(or(eq(products.id, product1Id), eq(products.id, product2Id)));
    await db.delete(categories).where(eq(categories.id, categoryId));
    await db.delete(users).where(or(
      eq(users.id, ownerId),
      eq(users.id, sourceEmployeeId),
      eq(users.id, destEmployeeId),
      eq(users.id, otherEmployeeId)
    ));
    await db.delete(branches).where(or(
      eq(branches.id, sourceBranchId),
      eq(branches.id, destBranchId),
      eq(branches.id, otherBranchId)
    ));
  });

  describe("Slice 8.1 — Transfer Request Creation", () => {
    it("should create a valid transfer request with multiple products without mutating inventory", async () => {
      const result = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [
            { productId: product1Id, requestedQuantity: 10 },
            { productId: product2Id, requestedQuantity: 5 },
          ],
          notes: "Need stock for weekend sale",
        },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.transferNumber).toMatch(/^TRF-\d{6}$/);
      expect(result.status).toBe("REQUESTED");
      expect(result.sourceBranchId).toBe(sourceBranchId);
      expect(result.destinationBranchId).toBe(destBranchId);
      expect(result.items).toHaveLength(2);

      // Verify NO inventory deduction occurred on request
      const [srcBal1] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, sourceBranchId), eq(inventoryBalances.productId, product1Id)));
      expect(srcBal1!.availableQuantity).toBe(50); // Untouched

      const [srcBal2] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, sourceBranchId), eq(inventoryBalances.productId, product2Id)));
      expect(srcBal2!.availableQuantity).toBe(20); // Untouched

      // Verify no ledger movements created
      const movements = await db
        .select()
        .from(inventoryMovements)
        .where(eq(inventoryMovements.referenceId, result.id));
      expect(movements).toHaveLength(0);

      // Verify audit event recorded
      const events = await db
        .select()
        .from(transferEvents)
        .where(eq(transferEvents.transferId, result.id));
      expect(events).toHaveLength(1);
      expect(events[0]!.eventType).toBe("REQUESTED");
      expect(events[0]!.actorId).toBe(destEmployeeId);
    });

    it("should allow Owner to create a transfer between any branches directly", async () => {
      const result = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [{ productId: product1Id, requestedQuantity: 15 }],
        },
        { id: ownerId, role: "OWNER" }
      );

      expect(result.status).toBe("REQUESTED");
      expect(result.createdById).toBe(ownerId);
    });

    it("should reject transfer request when employee belongs to an unrelated branch", async () => {
      await expect(
        TransfersService.createTransfer(
          {
            sourceBranchId,
            destinationBranchId: destBranchId,
            items: [{ productId: product1Id, requestedQuantity: 5 }],
          },
          { id: otherEmployeeId, role: "EMPLOYEE", branchId: otherBranchId }
        )
      ).rejects.toThrow("You can only request transfers where your assigned branch is the destination or source");
    });

    it("should reject transfer request with identical source and destination branches", async () => {
      // Caught at service / schema level
      await expect(
        TransfersService.createTransfer(
          {
            sourceBranchId,
            destinationBranchId: sourceBranchId,
            items: [{ productId: product1Id, requestedQuantity: 5 }],
          },
          { id: ownerId, role: "OWNER" }
        )
      ).rejects.toThrow();
    });

    it("should reject duplicate product lines in items array", async () => {
      await expect(
        TransfersService.createTransfer(
          {
            sourceBranchId,
            destinationBranchId: destBranchId,
            items: [
              { productId: product1Id, requestedQuantity: 5 },
              { productId: product1Id, requestedQuantity: 10 },
            ],
          },
          { id: ownerId, role: "OWNER" }
        )
      ).rejects.toThrow();
    });

    it("should reject non-existent or inactive products", async () => {
      const fakeProductId = crypto.randomUUID();
      await expect(
        TransfersService.createTransfer(
          {
            sourceBranchId,
            destinationBranchId: destBranchId,
            items: [{ productId: fakeProductId, requestedQuantity: 5 }],
          },
          { id: ownerId, role: "OWNER" }
        )
      ).rejects.toThrow("One or more selected products are invalid or inactive");
    });
  });

  describe("Slice 8.2 — Transfer Details", () => {
    let createdTransferId: string;

    beforeEach(async () => {
      const transfer = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [
            { productId: product1Id, requestedQuantity: 20 },
            { productId: product2Id, requestedQuantity: 10 },
          ],
          notes: "Initial inventory restock",
        },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );
      createdTransferId = transfer.id;
    });

    it("should return complete transfer details with items, source stock, and history for Owner", async () => {
      const details = await TransfersService.getTransferById(createdTransferId, {
        id: ownerId,
        role: "OWNER",
      });

      expect(details).toBeDefined();
      expect(details.id).toBe(createdTransferId);
      expect(details.status).toBe("REQUESTED");
      expect(details.notes).toBe("Initial inventory restock");
      expect(details.sourceBranch.name).toBe("Source Branch");
      expect(details.destinationBranch.name).toBe("Destination Branch");
      expect(details.createdBy.name).toBe("Dest Employee");
      expect(details.items).toHaveLength(2);

      // Verify current source available stock is augmented
      const paperItem = details.items.find((i) => i.productId === product1Id);
      expect(paperItem?.sourceAvailableQuantity).toBe(50);
      expect(paperItem?.requestedQuantity).toBe(20);

      // Verify Owner sees cost estimation
      expect(details.estimatedTotalCost).toBeDefined();

      // Verify audit timeline contains initial creation event
      expect(details.events.length).toBeGreaterThanOrEqual(1);
      expect(details.events[0]!.eventType).toBe("REQUESTED");
    });

    it("should allow assigned branch employee to view transfer details", async () => {
      const details = await TransfersService.getTransferById(createdTransferId, {
        id: sourceEmployeeId,
        role: "EMPLOYEE",
        branchId: sourceBranchId,
      });

      expect(details.id).toBe(createdTransferId);
      // Cost basis hidden from employees
      expect(details.estimatedTotalCost).toBeUndefined();
    });

    it("should deny access (403) to an employee from an unrelated branch", async () => {
      await expect(
        TransfersService.getTransferById(createdTransferId, {
          id: otherEmployeeId,
          role: "EMPLOYEE",
          branchId: otherBranchId,
        })
      ).rejects.toThrow("You do not have permission to view this transfer");
    });

    it("should return 404 for a non-existent transfer ID", async () => {
      const fakeId = crypto.randomUUID();
      await expect(
        TransfersService.getTransferById(fakeId, { id: ownerId, role: "OWNER" })
      ).rejects.toThrow("Transfer not found");
    });

    it("should perform a pure read without mutating any database records", async () => {
      const beforeDetails = await TransfersService.getTransferById(createdTransferId, { id: ownerId, role: "OWNER" });
      const afterDetails = await TransfersService.getTransferById(createdTransferId, { id: ownerId, role: "OWNER" });

      expect(beforeDetails.updatedAt).toBe(afterDetails.updatedAt);
      expect(beforeDetails.events.length).toBe(afterDetails.events.length);
    });
  });

  describe("Slice 8.3 — Approval / Rejection", () => {
    let transferId: string;

    beforeEach(async () => {
      const transfer = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [
            { productId: product1Id, requestedQuantity: 20 },
            { productId: product2Id, requestedQuantity: 10 },
          ],
        },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );
      transferId = transfer.id;
    });

    it("should allow Owner to approve a pending transfer request without mutating stock", async () => {
      const approved = await TransfersService.approveTransfer(
        transferId,
        { notes: "All quantities approved" },
        { id: ownerId, role: "OWNER" }
      );

      expect(approved.status).toBe("APPROVED");
      expect(approved.approvedById).toBe(ownerId);
      expect(approved.approvedAt).toBeDefined();
      expect(approved.approvalNotes).toBe("All quantities approved");

      // Verify items have approvedQuantity set
      const items = await db.select().from(transferItems).where(eq(transferItems.transferId, transferId));
      expect(items.find((i) => i.productId === product1Id)?.approvedQuantity).toBe(20);
      expect(items.find((i) => i.productId === product2Id)?.approvedQuantity).toBe(10);

      // Verify NO inventory changes occurred on approval
      const [srcBal] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, sourceBranchId), eq(inventoryBalances.productId, product1Id)));
      expect(srcBal!.availableQuantity).toBe(50); // Still 50

      // Verify audit event
      const events = await db.select().from(transferEvents).where(eq(transferEvents.transferId, transferId));
      expect(events.some((e) => e.eventType === "APPROVED")).toBe(true);
    });

    it("should allow Owner to approve partial quantities (less than requested)", async () => {
      await TransfersService.approveTransfer(
        transferId,
        {
          notes: "Approved 15 reams instead of 20 due to source constraints",
          items: [
            { productId: product1Id, approvedQuantity: 15 },
            { productId: product2Id, approvedQuantity: 10 },
          ],
        },
        { id: ownerId, role: "OWNER" }
      );

      const items = await db.select().from(transferItems).where(eq(transferItems.transferId, transferId));
      const paper = items.find((i) => i.productId === product1Id);
      expect(paper?.requestedQuantity).toBe(20); // Preserved!
      expect(paper?.approvedQuantity).toBe(15);  // Adjusted!
    });

    it("should reject employee attempt to approve transfer (403)", async () => {
      await expect(
        TransfersService.approveTransfer(
          transferId,
          {},
          { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
        )
      ).rejects.toThrow("Only the Owner can approve transfer requests");
    });

    it("should allow Owner to reject transfer with mandatory reason", async () => {
      const rejected = await TransfersService.rejectTransfer(
        transferId,
        { reason: "Branch 1 has low stock for planned promotion" },
        { id: ownerId, role: "OWNER" }
      );

      expect(rejected.status).toBe("REJECTED");
      expect(rejected.rejectedById).toBe(ownerId);
      expect(rejected.rejectionReason).toBe("Branch 1 has low stock for planned promotion");

      // Verify audit event
      const events = await db.select().from(transferEvents).where(eq(transferEvents.transferId, transferId));
      expect(events.some((e) => e.eventType === "REJECTED")).toBe(true);
    });

    it("should prevent repeated approval on already approved transfer", async () => {
      await TransfersService.approveTransfer(transferId, {}, { id: ownerId, role: "OWNER" });

      await expect(
        TransfersService.approveTransfer(transferId, {}, { id: ownerId, role: "OWNER" })
      ).rejects.toThrow('Cannot approve transfer with status "APPROVED"');
    });

    it("should prevent rejecting an already approved transfer", async () => {
      await TransfersService.approveTransfer(transferId, {}, { id: ownerId, role: "OWNER" });

      await expect(
        TransfersService.rejectTransfer(transferId, { reason: "Changed mind" }, { id: ownerId, role: "OWNER" })
      ).rejects.toThrow('Cannot reject transfer with status "APPROVED"');
    });
  });

  describe("Slice 8.4 — Dispatch", () => {
    let approvedTransferId: string;

    beforeEach(async () => {
      const transfer = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [
            { productId: product1Id, requestedQuantity: 20 },
            { productId: product2Id, requestedQuantity: 10 },
          ],
        },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );
      approvedTransferId = transfer.id;

      await TransfersService.approveTransfer(approvedTransferId, {}, { id: ownerId, role: "OWNER" });
    });

    it("should dispatch approved transfer, decrement source stock, record TRANSFER_OUT movement, and preserve WAC", async () => {
      const dispatched = await TransfersService.dispatchTransfer(
        approvedTransferId,
        { notes: "Dispatched via vehicle delivery" },
        { id: ownerId, role: "OWNER" }
      );

      expect(dispatched.status).toBe("DISPATCHED");
      expect(dispatched.dispatchedById).toBe(ownerId);
      expect(dispatched.dispatchedAt).toBeDefined();
      expect(dispatched.dispatchNotes).toBe("Dispatched via vehicle delivery");

      // 1. Check source balances: availableQuantity decremented
      const [srcBal1] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, sourceBranchId), eq(inventoryBalances.productId, product1Id)));
      expect(srcBal1!.availableQuantity).toBe(30); // 50 - 20 = 30
      expect(srcBal1!.wac).toBe("15.00"); // WAC preserved

      const [srcBal2] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, sourceBranchId), eq(inventoryBalances.productId, product2Id)));
      expect(srcBal2!.availableQuantity).toBe(10); // 20 - 10 = 10
      expect(srcBal2!.wac).toBe("8.50"); // WAC preserved

      // 2. Check destination balances: stock NOT yet added (prompt 1 boundary)
      const [dstBal1] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, destBranchId), eq(inventoryBalances.productId, product1Id)));
      expect(dstBal1!.availableQuantity).toBe(0); // Destination not received yet

      // 3. Check ledger movements: TRANSFER_OUT created with negative quantities
      const movements = await db
        .select()
        .from(inventoryMovements)
        .where(and(eq(inventoryMovements.referenceId, approvedTransferId), eq(inventoryMovements.branchId, sourceBranchId)));

      expect(movements).toHaveLength(2);
      expect(movements.every((m) => m.movementType === "TRANSFER_OUT")).toBe(true);

      const m1 = movements.find((m) => m.productId === product1Id);
      expect(m1?.quantity).toBe(-20);
      expect(m1?.unitCost).toBe("15.00");

      const m2 = movements.find((m) => m.productId === product2Id);
      expect(m2?.quantity).toBe(-10);
      expect(m2?.unitCost).toBe("8.50");

      // 4. Check transfer_items updated with dispatched quantities and costs
      const items = await db.select().from(transferItems).where(eq(transferItems.transferId, approvedTransferId));
      expect(items.find((i) => i.productId === product1Id)?.dispatchedQuantity).toBe(20);
      expect(items.find((i) => i.productId === product1Id)?.sourceUnitCost).toBe("15.00");

      // 5. Audit event recorded
      const events = await db.select().from(transferEvents).where(eq(transferEvents.transferId, approvedTransferId));
      expect(events.some((e) => e.eventType === "DISPATCHED")).toBe(true);
    });

    it("should prevent dispatch if source branch has insufficient stock", async () => {
      // Reduce source stock manually so that 20 reams cannot be fulfilled
      await db
        .update(inventoryBalances)
        .set({ availableQuantity: 5 })
        .where(and(eq(inventoryBalances.branchId, sourceBranchId), eq(inventoryBalances.productId, product1Id)));

      await expect(
        TransfersService.dispatchTransfer(approvedTransferId, {}, { id: ownerId, role: "OWNER" })
      ).rejects.toThrow(/Insufficient available stock at source branch for product "A4 Paper"/);

      // Verify status is STILL APPROVED, not dispatched
      const [transfer] = await db.select().from(transfers).where(eq(transfers.id, approvedTransferId));
      expect(transfer!.status).toBe("APPROVED");

      // Verify no movements recorded
      const movements = await db
        .select()
        .from(inventoryMovements)
        .where(eq(inventoryMovements.referenceId, approvedTransferId));
      expect(movements).toHaveLength(0);
    });

    it("should prevent dispatching an unapproved (REQUESTED) transfer", async () => {
      const pendingTransfer = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [{ productId: product1Id, requestedQuantity: 5 }],
        },
        { id: ownerId, role: "OWNER" }
      );

      await expect(
        TransfersService.dispatchTransfer(pendingTransfer.id, {}, { id: ownerId, role: "OWNER" })
      ).rejects.toThrow('Cannot dispatch transfer with status "REQUESTED"');
    });

    it("should prevent dispatching a rejected transfer", async () => {
      const pendingTransfer = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [{ productId: product1Id, requestedQuantity: 5 }],
        },
        { id: ownerId, role: "OWNER" }
      );

      await TransfersService.rejectTransfer(pendingTransfer.id, { reason: "Out of stock" }, { id: ownerId, role: "OWNER" });

      await expect(
        TransfersService.dispatchTransfer(pendingTransfer.id, {}, { id: ownerId, role: "OWNER" })
      ).rejects.toThrow('Cannot dispatch transfer with status "REJECTED"');
    });

    it("should prevent duplicate dispatch on an already dispatched transfer", async () => {
      await TransfersService.dispatchTransfer(approvedTransferId, {}, { id: ownerId, role: "OWNER" });

      await expect(
        TransfersService.dispatchTransfer(approvedTransferId, {}, { id: ownerId, role: "OWNER" })
      ).rejects.toThrow('Cannot dispatch transfer with status "DISPATCHED"');
    });

    it("should reject employee attempt to dispatch transfer (403)", async () => {
      await expect(
        TransfersService.dispatchTransfer(
          approvedTransferId,
          {},
          { id: sourceEmployeeId, role: "EMPLOYEE", branchId: sourceBranchId }
        )
      ).rejects.toThrow("Only the Owner can dispatch transfers");
    });
  });
});
