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

  describe("Slice 8.5 — Receive Transfer", () => {
    let dispatchedTransferId: string;
    let transferItemId1: string;

    beforeEach(async () => {
      const transfer = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [{ productId: product1Id, requestedQuantity: 20 }],
        },
        { id: ownerId, role: "OWNER" }
      );
      await TransfersService.approveTransfer(transfer.id, {}, { id: ownerId, role: "OWNER" });
      await TransfersService.dispatchTransfer(transfer.id, {}, { id: ownerId, role: "OWNER" });

      dispatchedTransferId = transfer.id;
      const [item] = await db.select().from(transferItems).where(eq(transferItems.transferId, transfer.id));
      transferItemId1 = item!.id;
    });

    it("should successfully receive full dispatched stock at destination branch by authorized destination employee", async () => {
      const res = await TransfersService.receiveTransfer(
        dispatchedTransferId,
        {
          items: [
            {
              itemId: transferItemId1,
              receivedQuantity: 20,
              damagedQuantity: 0,
            },
          ],
          notes: "Received in pristine condition",
        },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );

      expect(res.status).toBe("COMPLETED");
      expect(res.hasDiscrepancy).toBe(false);
      expect(res.receivedById).toBe(destEmployeeId);
      expect(res.closedById).toBe(destEmployeeId);

      // Verify destination inventory balance increased
      const [destBalance] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, destBranchId), eq(inventoryBalances.productId, product1Id)));
      expect(destBalance!.availableQuantity).toBe(20);
      expect(destBalance!.damagedQuantity).toBe(0);
      // Destination WAC should remain initial 0.00 (not modified by transfer)
      expect(destBalance!.wac).toBe("0.00");

      // Verify ledger movement
      const [movement] = await db
        .select()
        .from(inventoryMovements)
        .where(and(eq(inventoryMovements.referenceId, dispatchedTransferId), eq(inventoryMovements.movementType, "TRANSFER_IN")));
      expect(movement).toBeDefined();
      expect(movement!.quantity).toBe(20);
      expect(movement!.branchId).toBe(destBranchId);

      // Verify source inventory was not touched again (still 30 available)
      const [srcBalance] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, sourceBranchId), eq(inventoryBalances.productId, product1Id)));
      expect(srcBalance!.availableQuantity).toBe(30);

      // Verify audit event
      const events = await db.select().from(transferEvents).where(eq(transferEvents.transferId, dispatchedTransferId));
      expect(events.some((e) => e.eventType === "RECEIVED")).toBe(true);
    });

    it("should allow Owner to receive stock for destination branch", async () => {
      const res = await TransfersService.receiveTransfer(
        dispatchedTransferId,
        {
          items: [{ itemId: transferItemId1, receivedQuantity: 20, damagedQuantity: 0 }],
        },
        { id: ownerId, role: "OWNER" }
      );

      expect(res.status).toBe("COMPLETED");
      expect(res.receivedById).toBe(ownerId);
    });

    it("should reject receiving before dispatch (e.g. APPROVED or REQUESTED transfer)", async () => {
      const newTransfer = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [{ productId: product1Id, requestedQuantity: 5 }],
        },
        { id: ownerId, role: "OWNER" }
      );
      const [item] = await db.select().from(transferItems).where(eq(transferItems.transferId, newTransfer.id));

      await expect(
        TransfersService.receiveTransfer(
          newTransfer.id,
          { items: [{ itemId: item!.id, receivedQuantity: 5, damagedQuantity: 0 }] },
          { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
        )
      ).rejects.toThrow('Cannot receive transfer with status "REQUESTED"');
    });

    it("should reject receiving by employee not assigned to destination branch", async () => {
      // Source employee attempts to receive
      await expect(
        TransfersService.receiveTransfer(
          dispatchedTransferId,
          { items: [{ itemId: transferItemId1, receivedQuantity: 20, damagedQuantity: 0 }] },
          { id: sourceEmployeeId, role: "EMPLOYEE", branchId: sourceBranchId }
        )
      ).rejects.toThrow("Only employees assigned to the destination branch can receive this transfer");

      // Other branch employee attempts to receive
      await expect(
        TransfersService.receiveTransfer(
          dispatchedTransferId,
          { items: [{ itemId: transferItemId1, receivedQuantity: 20, damagedQuantity: 0 }] },
          { id: otherEmployeeId, role: "EMPLOYEE", branchId: otherBranchId }
        )
      ).rejects.toThrow("Only employees assigned to the destination branch can receive this transfer");
    });

    it("should reject invalid item IDs in receive payload", async () => {
      await expect(
        TransfersService.receiveTransfer(
          dispatchedTransferId,
          { items: [{ itemId: crypto.randomUUID(), receivedQuantity: 20, damagedQuantity: 0 }] },
          { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
        )
      ).rejects.toThrow("Invalid item ID in receive payload");
    });

    it("should reject excess quantities above dispatched amount", async () => {
      await expect(
        TransfersService.receiveTransfer(
          dispatchedTransferId,
          { items: [{ itemId: transferItemId1, receivedQuantity: 25, damagedQuantity: 0 }] },
          { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
        )
      ).rejects.toThrow(/cannot exceed dispatched quantity/);
    });

    it("should prevent duplicate receiving on already completed transfer", async () => {
      await TransfersService.receiveTransfer(
        dispatchedTransferId,
        { items: [{ itemId: transferItemId1, receivedQuantity: 20, damagedQuantity: 0 }] },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );

      await expect(
        TransfersService.receiveTransfer(
          dispatchedTransferId,
          { items: [{ itemId: transferItemId1, receivedQuantity: 20, damagedQuantity: 0 }] },
          { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
        )
      ).rejects.toThrow('Cannot receive transfer with status "COMPLETED"');
    });

    it("should hide cost information from employee in getTransferById", async () => {
      const transfer = await TransfersService.getTransferById(
        dispatchedTransferId,
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );

      expect(transfer.estimatedTotalCost).toBeUndefined();
      expect(transfer.items[0]?.sourceUnitCost).toBeUndefined();
    });
  });

  describe("Slice 8.6 — Transfer Discrepancy Handling", () => {
    let dispatchedTransferId: string;
    let transferItemId1: string;

    beforeEach(async () => {
      const transfer = await TransfersService.createTransfer(
        {
          sourceBranchId,
          destinationBranchId: destBranchId,
          items: [{ productId: product1Id, requestedQuantity: 20 }],
        },
        { id: ownerId, role: "OWNER" }
      );
      await TransfersService.approveTransfer(transfer.id, {}, { id: ownerId, role: "OWNER" });
      await TransfersService.dispatchTransfer(transfer.id, {}, { id: ownerId, role: "OWNER" });

      dispatchedTransferId = transfer.id;
      const [item] = await db.select().from(transferItems).where(eq(transferItems.transferId, transfer.id));
      transferItemId1 = item!.id;
    });

    it("should record discrepancy status and movements when goods are damaged and missing", async () => {
      // Dispatched 20: 14 good, 4 damaged, 2 missing
      const res = await TransfersService.receiveTransfer(
        dispatchedTransferId,
        {
          items: [
            {
              itemId: transferItemId1,
              receivedQuantity: 14,
              damagedQuantity: 4,
              discrepancyReason: "Box crushed during transit, 2 units missing entirely",
            },
          ],
          notes: "Driver noted damaged package upon arrival",
        },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );

      expect(res.status).toBe("DISCREPANCY");
      expect(res.hasDiscrepancy).toBe(true);
      expect(res.closedById).toBeNull();

      // Destination inventory balances:
      // Available +14, Damaged +4
      const [destBalance] = await db
        .select()
        .from(inventoryBalances)
        .where(and(eq(inventoryBalances.branchId, destBranchId), eq(inventoryBalances.productId, product1Id)));
      expect(destBalance!.availableQuantity).toBe(14);
      expect(destBalance!.damagedQuantity).toBe(4);

      // Verify transfer_items quantities
      const [item] = await db.select().from(transferItems).where(eq(transferItems.id, transferItemId1));
      expect(item!.receivedQuantity).toBe(14);
      expect(item!.damagedQuantity).toBe(4);
      expect(item!.missingQuantity).toBe(2);
      expect(item!.discrepancyReason).toBe("Box crushed during transit, 2 units missing entirely");

      // Verify inventory movements:
      // 1 TRANSFER_IN for 14
      const [goodMov] = await db
        .select()
        .from(inventoryMovements)
        .where(and(eq(inventoryMovements.referenceId, dispatchedTransferId), eq(inventoryMovements.movementType, "TRANSFER_IN")));
      expect(goodMov!.quantity).toBe(14);

      // 1 TRANSFER_DAMAGED for 4
      const [damagedMov] = await db
        .select()
        .from(inventoryMovements)
        .where(and(eq(inventoryMovements.referenceId, dispatchedTransferId), eq(inventoryMovements.movementType, "TRANSFER_DAMAGED")));
      expect(damagedMov!.quantity).toBe(4);

      // Missing units (2) do NOT generate destination movements
      const movements = await db
        .select()
        .from(inventoryMovements)
        .where(eq(inventoryMovements.referenceId, dispatchedTransferId));
      // Expected movements: 1 TRANSFER_OUT at source (from dispatch), 1 TRANSFER_IN, 1 TRANSFER_DAMAGED at destination
      expect(movements).toHaveLength(3);

      // Audit event
      const events = await db.select().from(transferEvents).where(eq(transferEvents.transferId, dispatchedTransferId));
      expect(events.some((e) => e.eventType === "DISCREPANCY")).toBe(true);
    });

    it("should require a discrepancy reason when there is damage or shortage", async () => {
      await expect(
        TransfersService.receiveTransfer(
          dispatchedTransferId,
          {
            items: [
              {
                itemId: transferItemId1,
                receivedQuantity: 15,
                damagedQuantity: 0,
                // no discrepancyReason and no notes
              },
            ],
          },
          { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
        )
      ).rejects.toThrow("A discrepancy reason is required when there is damaged or missing stock");
    });

    it("should reject non-Owner attempting to resolve discrepancy (403)", async () => {
      // First receive with discrepancy
      await TransfersService.receiveTransfer(
        dispatchedTransferId,
        {
          items: [
            {
              itemId: transferItemId1,
              receivedQuantity: 18,
              damagedQuantity: 2,
              discrepancyReason: "2 units broken",
            },
          ],
        },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );

      // Employee tries to resolve
      await expect(
        TransfersService.resolveDiscrepancy(
          dispatchedTransferId,
          { resolutionNotes: "Approved write-off" },
          { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
        )
      ).rejects.toThrow("Only the Owner can review and resolve transfer discrepancies");
    });

    it("should allow Owner to resolve discrepancy and close the transfer", async () => {
      // 1. Receive with discrepancy
      await TransfersService.receiveTransfer(
        dispatchedTransferId,
        {
          items: [
            {
              itemId: transferItemId1,
              receivedQuantity: 18,
              damagedQuantity: 2,
              discrepancyReason: "2 units broken",
            },
          ],
        },
        { id: destEmployeeId, role: "EMPLOYEE", branchId: destBranchId }
      );

      // 2. Owner resolves discrepancy
      const res = await TransfersService.resolveDiscrepancy(
        dispatchedTransferId,
        { resolutionNotes: "Carrier reimbursed for broken items. Discrepancy acknowledged." },
        { id: ownerId, role: "OWNER" }
      );

      expect(res.status).toBe("COMPLETED");
      expect(res.discrepancyResolvedById).toBe(ownerId);
      expect(res.closedById).toBe(ownerId);
      expect(res.discrepancyResolutionNotes).toBe("Carrier reimbursed for broken items. Discrepancy acknowledged.");

      // Check audit event
      const events = await db.select().from(transferEvents).where(eq(transferEvents.transferId, dispatchedTransferId));
      expect(events.some((e) => e.eventType === "DISCREPANCY_RESOLVED")).toBe(true);

      // Attempting to resolve again should fail
      await expect(
        TransfersService.resolveDiscrepancy(
          dispatchedTransferId,
          { resolutionNotes: "Again" },
          { id: ownerId, role: "OWNER" }
        )
      ).rejects.toThrow('Cannot resolve discrepancy for transfer with status "COMPLETED"');
    });
  });
});

