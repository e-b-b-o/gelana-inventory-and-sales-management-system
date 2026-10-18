import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ClosingService, getTodayDateString } from "./service.js";
import { db } from "../../config/database.js";
import {
  users,
  branches,
  paymentMethods,
  sales,
  salePayments,
  salesReturns,
  dailyClosings,
  dailyClosingPayments,
  dailyClosingEvents,
} from "../../database/schema/index.js";
import { sql } from "drizzle-orm";
import crypto from "crypto";

describe("Milestone 9 — Daily Closing Service (Slices 9.1 – 9.4)", () => {
  let branchAId: string;
  let branchBId: string;
  let ownerId: string;
  let employeeAId: string;
  let employeeBId: string;
  let cashMethodId: string;
  let bankMethodId: string;
  let telebirrMethodId: string;
  let todayStr: string;

  let ownerUser: any;
  let employeeAUser: any;
  let employeeBUser: any;

  beforeEach(async () => {
    todayStr = getTodayDateString();
    branchAId = crypto.randomUUID();
    branchBId = crypto.randomUUID();
    ownerId = crypto.randomUUID();
    employeeAId = crypto.randomUUID();
    employeeBId = crypto.randomUUID();
    cashMethodId = crypto.randomUUID();
    bankMethodId = crypto.randomUUID();
    telebirrMethodId = crypto.randomUUID();

    // Create test branches
    await db.insert(branches).values([
      { id: branchAId, name: "Closing Test Branch A", code: `CA-${branchAId.substring(0, 4)}` },
      { id: branchBId, name: "Closing Test Branch B", code: `CB-${branchBId.substring(0, 4)}` },
    ]);

    // Create test users
    await db.insert(users).values([
      {
        id: ownerId,
        email: `owner-${ownerId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Closing Test Owner",
        role: "OWNER",
      },
      {
        id: employeeAId,
        email: `empA-${employeeAId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Closing Employee A",
        role: "EMPLOYEE",
        branchId: branchAId,
      },
      {
        id: employeeBId,
        email: `empB-${employeeBId.substring(0, 6)}@test.com`,
        passwordHash: "hash",
        name: "Closing Employee B",
        role: "EMPLOYEE",
        branchId: branchBId,
      },
    ]);

    ownerUser = { id: ownerId, role: "OWNER" };
    employeeAUser = { id: employeeAId, role: "EMPLOYEE", branchId: branchAId };
    employeeBUser = { id: employeeBId, role: "EMPLOYEE", branchId: branchBId };

    // Create test payment methods
    await db.insert(paymentMethods).values([
      { id: cashMethodId, name: `Cash-${cashMethodId.substring(0, 4)}`, isActive: true },
      { id: bankMethodId, name: `Bank-${bankMethodId.substring(0, 4)}`, isActive: true },
      { id: telebirrMethodId, name: `Telebirr-${telebirrMethodId.substring(0, 4)}`, isActive: true },
    ]);
  });

  afterEach(async () => {
    // Clean up created fixtures only
    await db.delete(dailyClosingEvents).where(sql`closing_id IN (SELECT id FROM daily_closings WHERE branch_id IN (${branchAId}, ${branchBId}))`);
    await db.delete(dailyClosingPayments).where(sql`closing_id IN (SELECT id FROM daily_closings WHERE branch_id IN (${branchAId}, ${branchBId}))`);
    await db.delete(dailyClosings).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(salesReturns).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(salePayments).where(sql`sale_id IN (SELECT id FROM sales WHERE branch_id IN (${branchAId}, ${branchBId}))`);
    await db.delete(sales).where(sql`branch_id IN (${branchAId}, ${branchBId})`);
    await db.delete(paymentMethods).where(sql`id IN (${cashMethodId}, ${bankMethodId}, ${telebirrMethodId})`);
    await db.delete(users).where(sql`id IN (${ownerId}, ${employeeAId}, ${employeeBId})`);
    await db.delete(branches).where(sql`id IN (${branchAId}, ${branchBId})`);
  });

  // Helper to create a completed sale with payments
  async function createTestSale(
    branchId: string,
    soldAt: string,
    grandTotal: string,
    paymentsList: Array<{ methodId: string; amount: string }>,
    status: "COMPLETED" | "VOIDED" = "COMPLETED"
  ) {
    const saleId = crypto.randomUUID();
    const saleNumber = `SAL-${crypto.randomInt(100000, 999999)}`;
    await db.insert(sales).values({
      id: saleId,
      saleNumber,
      branchId,
      createdById: employeeAId,
      soldAt,
      grandTotal,
      subtotal: grandTotal,
      status,
    });

    for (const p of paymentsList) {
      await db.insert(salePayments).values({
        id: crypto.randomUUID(),
        saleId,
        paymentMethodId: p.methodId,
        amount: p.amount,
      });
    }

    return saleId;
  }

  // Helper to create a completed sales return
  async function createTestReturn(
    branchId: string,
    returnedAt: string,
    refundAmount: string,
    refundMethodId: string
  ) {
    const returnId = crypto.randomUUID();
    const returnNumber = `RET-${crypto.randomInt(100000, 999999)}`;
    await db.insert(salesReturns).values({
      id: returnId,
      returnNumber,
      branchId,
      createdById: employeeAId,
      returnedAt,
      refundAmount,
      refundPaymentMethodId: refundMethodId,
      status: "COMPLETED",
      reason: "Test Return Refund",
    });
    return returnId;
  }

  describe("Slice 9.1 — Current Closing & Calculations", () => {
    it("should allow employee to view current closing for their assigned branch only", async () => {
      const res = await ClosingService.getCurrentClosing({ branchId: branchAId }, employeeAUser);
      expect(res.closing.branchId).toBe(branchAId);
      expect(res.closing.status).toBe("NOT_SUBMITTED");
      expect(res.checks.allSalesRecorded.passed).toBe(true);
      expect(res.checks.previousDayStatus).toBeDefined();

      // Attempting to access Branch B as Employee A must fail with 403 Forbidden
      await expect(
        ClosingService.getCurrentClosing({ branchId: branchBId }, employeeAUser)
      ).rejects.toThrow(/Access denied: Employees can only access their assigned branch/);
    });

    it("should allow Owner to view any branch closing or branch overview across all branches", async () => {
      const res = await ClosingService.getCurrentClosing({ branchId: branchBId }, ownerUser);
      expect(res.closing.branchId).toBe(branchBId);
      expect(res.branchOverview).toBeDefined();
      expect(res.branchOverview!.length).toBeGreaterThanOrEqual(2);
    });

    it("should calculate expected cash authoritatively from cash sales minus cash returns with mixed payment methods", async () => {
      // Sale 1: Cash 300, Bank 200 (Total 500)
      await createTestSale(branchAId, `${todayStr}T10:00:00Z`, "500.00", [
        { methodId: cashMethodId, amount: "300.00" },
        { methodId: bankMethodId, amount: "200.00" },
      ]);

      // Sale 2: Cash 150, Telebirr 100 (Total 250)
      await createTestSale(branchAId, `${todayStr}T11:00:00Z`, "250.00", [
        { methodId: cashMethodId, amount: "150.00" },
        { methodId: telebirrMethodId, amount: "100.00" },
      ]);

      // Sale 3: VOIDED sale (Cash 500) - MUST NOT be counted
      await createTestSale(
        branchAId,
        `${todayStr}T12:00:00Z`,
        "500.00",
        [{ methodId: cashMethodId, amount: "500.00" }],
        "VOIDED"
      );

      // Return 1: Cash Refund 50.00
      await createTestReturn(branchAId, `${todayStr}T13:00:00Z`, "50.00", cashMethodId);

      // Total Gross Sales = 500 + 250 = 750.00
      // Total Cash Received = 300 + 150 = 450.00
      // Total Cash Refunded = 50.00
      // Expected Cash = 450.00 - 50.00 = 400.00
      // Total Returns Amount = 50.00
      // Net Sales = 750.00 - 50.00 = 700.00

      const res = await ClosingService.getCurrentClosing({ branchId: branchAId, date: todayStr }, employeeAUser);
      expect(res.closing.salesCount).toBe(2);
      expect(res.closing.totalSalesAmount).toBe("750.00");
      expect(res.closing.totalReturnsAmount).toBe("50.00");
      expect(res.closing.netSalesAmount).toBe("700.00");
      expect(res.closing.expectedCash).toBe("400.00");

      const cashSummary = res.closing.payments.find((p: any) => p.paymentMethodId === cashMethodId);
      expect(cashSummary).toBeDefined();
      expect(cashSummary!.receivedAmount).toBe("450.00");
      expect(cashSummary!.refundedAmount).toBe("50.00");
      expect(cashSummary!.netAmount).toBe("400.00");
    });

    it("should never leak cost, WAC, or gross profit fields to employee or closing responses", async () => {
      const res = await ClosingService.getCurrentClosing({ branchId: branchAId }, employeeAUser);
      expect((res.closing as any).unitCost).toBeUndefined();
      expect((res.closing as any).wac).toBeUndefined();
      expect((res.closing as any).grossProfit).toBeUndefined();
      expect((res.closing as any).costOfGoodsSold).toBeUndefined();
    });
  });

  describe("Slice 9.2 — Closing Submission", () => {
    it("should block submission if allSalesRecorded is false (unentered sales remaining)", async () => {
      await expect(
        ClosingService.submitClosing(
          {
            branchId: branchAId,
            date: todayStr,
            actualCash: 0,
            allSalesRecorded: false,
          },
          employeeAUser
        )
      ).rejects.toThrow(/Daily closing cannot be completed if required sales have not been entered/);
    });

    it("should reject submission when there is a cash discrepancy and no explanation is provided", async () => {
      // Create a sale for 200 Cash
      await createTestSale(branchAId, `${todayStr}T09:00:00Z`, "200.00", [
        { methodId: cashMethodId, amount: "200.00" },
      ]);

      // Expected Cash is 200.00. Enter 150.00 (discrepancy of -50.00) without explanation
      await expect(
        ClosingService.submitClosing(
          {
            branchId: branchAId,
            date: todayStr,
            actualCash: 150.0,
            discrepancyReason: "   ", // whitespace only
            allSalesRecorded: true,
          },
          employeeAUser
        )
      ).rejects.toThrow(/A cash discrepancy requires an explanation\/reason before submission/);
    });

    it("should successfully submit closing when discrepancy is explained, locking from duplicate submission", async () => {
      // Sale: 200.00 Cash
      await createTestSale(branchAId, `${todayStr}T09:00:00Z`, "200.00", [
        { methodId: cashMethodId, amount: "200.00" },
      ]);

      const submitted = await ClosingService.submitClosing(
        {
          branchId: branchAId,
          date: todayStr,
          actualCash: 190.0,
          discrepancyReason: "10 Birr shortage due to small change shortage.",
          allSalesRecorded: true,
        },
        employeeAUser
      );

      expect(submitted.status).toBe("SUBMITTED");
      expect(submitted.closingNumber).toMatch(/^CLS-\d{6}$/);
      expect(submitted.expectedCash).toBe("200.00");
      expect(submitted.actualCash).toBe("190.00");
      expect(submitted.cashDifference).toBe("-10.00");
      expect(submitted.discrepancyReason).toBe("10 Birr shortage due to small change shortage.");
      expect(submitted.submittedById).toBe(employeeAId);
      expect(submitted.revision).toBe(1);

      // Verifying event logged
      expect(submitted.events).toHaveLength(1);
      expect(submitted.events[0].eventType).toBe("SUBMITTED");
      expect(submitted.events[0].notes).toBe("10 Birr shortage due to small change shortage.");

      // Attempting to submit again while in SUBMITTED status must be rejected
      await expect(
        ClosingService.submitClosing(
          {
            branchId: branchAId,
            date: todayStr,
            actualCash: 200.0,
            allSalesRecorded: true,
          },
          employeeAUser
        )
      ).rejects.toThrow(/Closing has already been submitted and is awaiting Owner review/);
    });

    it("should prevent employee from submitting for a branch other than their assigned branch", async () => {
      await expect(
        ClosingService.submitClosing(
          {
            branchId: branchBId, // Employee A assigned to Branch A
            date: todayStr,
            actualCash: 100.0,
            allSalesRecorded: true,
          },
          employeeAUser
        )
      ).rejects.toThrow(/Access denied: Employees can only submit for their assigned branch/);
    });
  });

  describe("Slice 9.3 — Owner Review (Approval & Rejection Workflow)", () => {
    it("should prevent employees from approving or rejecting closings", async () => {
      await createTestSale(branchAId, `${todayStr}T10:00:00Z`, "100.00", [
        { methodId: cashMethodId, amount: "100.00" },
      ]);

      const submitted = await ClosingService.submitClosing(
        {
          branchId: branchAId,
          date: todayStr,
          actualCash: 100.0,
          allSalesRecorded: true,
        },
        employeeAUser
      );

      // Employee cannot approve
      await expect(
        ClosingService.approveClosing(submitted.id, { notes: "Trying to self-approve" }, employeeAUser)
      ).rejects.toThrow(/Access denied: Only an Owner can approve a daily closing/);

      // Employee cannot reject
      await expect(
        ClosingService.rejectClosing(submitted.id, { reason: "Self rejection" }, employeeAUser)
      ).rejects.toThrow(/Access denied: Only an Owner can reject a daily closing/);
    });

    it("should allow Owner to approve a submitted closing, locking it against edits", async () => {
      await createTestSale(branchAId, `${todayStr}T10:00:00Z`, "150.00", [
        { methodId: cashMethodId, amount: "150.00" },
      ]);

      const submitted = await ClosingService.submitClosing(
        {
          branchId: branchAId,
          date: todayStr,
          actualCash: 150.0,
          allSalesRecorded: true,
        },
        employeeAUser
      );

      const approved = await ClosingService.approveClosing(
        submitted.id,
        { notes: "All cash reconciled correctly." },
        ownerUser
      );

      expect(approved.status).toBe("APPROVED");
      expect(approved.reviewedById).toBe(ownerId);
      expect(approved.reviewNotes).toBe("All cash reconciled correctly.");

      // Verify audit trail
      expect(approved.events).toHaveLength(2); // SUBMITTED, APPROVED
      expect(approved.events[0].eventType).toBe("APPROVED");

      // Once approved, normal editing or resubmitting is prohibited
      await expect(
        ClosingService.submitClosing(
          {
            branchId: branchAId,
            date: todayStr,
            actualCash: 160.0,
            allSalesRecorded: true,
          },
          employeeAUser
        )
      ).rejects.toThrow(/Approved closing is locked and cannot be edited or resubmitted/);

      // Cannot re-approve an already approved closing
      await expect(
        ClosingService.approveClosing(submitted.id, {}, ownerUser)
      ).rejects.toThrow(/Closing is already approved/);
    });

    it("should allow Owner to reject with reason, and allow employee to correct and resubmit with audit continuity", async () => {
      await createTestSale(branchAId, `${todayStr}T10:00:00Z`, "300.00", [
        { methodId: cashMethodId, amount: "300.00" },
      ]);

      // 1. Employee submits initial closing
      const submitted = await ClosingService.submitClosing(
        {
          branchId: branchAId,
          date: todayStr,
          actualCash: 250.0,
          discrepancyReason: "Short 50 Birr",
          allSalesRecorded: true,
        },
        employeeAUser
      );

      // 2. Owner rejects requiring recount
      const rejected = await ClosingService.rejectClosing(
        submitted.id,
        { reason: "Please recount the cash drawer; drawer 2 had uncounted bills." },
        ownerUser
      );

      expect(rejected.status).toBe("REJECTED");
      expect(rejected.rejectionReason).toBe("Please recount the cash drawer; drawer 2 had uncounted bills.");
      expect(rejected.reviewedById).toBe(ownerId);

      // Rejection feedback is visible to employee in current closing view
      const empView = await ClosingService.getCurrentClosing({ branchId: branchAId, date: todayStr }, employeeAUser);
      expect(empView.closing.status).toBe("REJECTED");
      expect(empView.closing.rejectionReason).toBe("Please recount the cash drawer; drawer 2 had uncounted bills.");

      // 3. Employee recounts and resubmits (Revision 2)
      const resubmitted = await ClosingService.submitClosing(
        {
          branchId: branchAId,
          date: todayStr,
          actualCash: 300.0,
          discrepancyReason: "Recounted drawer 2 as instructed. Cash is now fully balanced.",
          allSalesRecorded: true,
        },
        employeeAUser
      );

      expect(resubmitted.status).toBe("SUBMITTED");
      expect(resubmitted.revision).toBe(2);
      expect(resubmitted.actualCash).toBe("300.00");
      expect(resubmitted.cashDifference).toBe("0.00");

      // Verify audit events preservation: SUBMITTED -> REJECTED -> RESUBMITTED
      const events = resubmitted.events;
      expect(events).toHaveLength(3);
      expect(events[0].eventType).toBe("RESUBMITTED");
      expect(events[1].eventType).toBe("REJECTED");
      expect(events[2].eventType).toBe("SUBMITTED");

      // 4. Owner approves resubmission
      const finalApproval = await ClosingService.approveClosing(
        resubmitted.id,
        { notes: "Verified recount. Approved." },
        ownerUser
      );

      expect(finalApproval.status).toBe("APPROVED");
      expect(finalApproval.events).toHaveLength(4); // SUBMITTED, REJECTED, RESUBMITTED, APPROVED
    });
  });

  describe("Slice 9.4 — Closing History", () => {
    it("should scope history to employee's assigned branch only", async () => {
      // Create closing for Branch A
      await ClosingService.submitClosing(
        { branchId: branchAId, date: todayStr, actualCash: 0, allSalesRecorded: true },
        employeeAUser
      );

      // Create closing for Branch B
      await ClosingService.submitClosing(
        { branchId: branchBId, date: todayStr, actualCash: 0, allSalesRecorded: true },
        employeeBUser
      );

      // Employee A queries history: must only see Branch A
      const empAHistory = await ClosingService.getClosingHistory({}, employeeAUser);
      expect(empAHistory.data.every((c: any) => c.branchId === branchAId)).toBe(true);
      expect(empAHistory.data.some((c: any) => c.branchId === branchBId)).toBe(false);

      // Employee A tries to filter for Branch B: still only gets Branch A
      const empATrick = await ClosingService.getClosingHistory({ branchId: branchBId }, employeeAUser);
      expect(empATrick.data.every((c: any) => c.branchId === branchAId)).toBe(true);
    });

    it("should allow Owner to view closings across all branches with filters and pagination", async () => {
      // Submit closing for Branch A
      await ClosingService.submitClosing(
        { branchId: branchAId, date: todayStr, actualCash: 0, allSalesRecorded: true },
        employeeAUser
      );

      // Submit closing for Branch B
      await ClosingService.submitClosing(
        { branchId: branchBId, date: todayStr, actualCash: 0, allSalesRecorded: true },
        employeeBUser
      );

      // Owner queries without branch: gets both
      const ownerHistory = await ClosingService.getClosingHistory({ limit: 10, page: 1 }, ownerUser);
      const branchIds = ownerHistory.data.map((c: any) => c.branchId);
      expect(branchIds).toContain(branchAId);
      expect(branchIds).toContain(branchBId);

      // Owner filters by Branch A
      const branchAOnly = await ClosingService.getClosingHistory({ branchId: branchAId }, ownerUser);
      expect(branchAOnly.data.every((c: any) => c.branchId === branchAId)).toBe(true);

      // Owner filters by status
      const submittedOnly = await ClosingService.getClosingHistory({ status: "SUBMITTED" }, ownerUser);
      expect(submittedOnly.data.every((c: any) => c.status === "SUBMITTED")).toBe(true);
    });

    it("should retrieve full closing detail by ID with authorization check", async () => {
      const submitted = await ClosingService.submitClosing(
        { branchId: branchAId, date: todayStr, actualCash: 0, allSalesRecorded: true },
        employeeAUser
      );

      // Owner can get it
      const detail = await ClosingService.getClosingById(submitted.id, ownerUser);
      expect(detail.id).toBe(submitted.id);
      expect(detail.branch.id).toBe(branchAId);

      // Employee A can get it
      const empDetail = await ClosingService.getClosingById(submitted.id, employeeAUser);
      expect(empDetail.id).toBe(submitted.id);

      // Employee B cannot get Branch A's closing (403)
      await expect(
        ClosingService.getClosingById(submitted.id, employeeBUser)
      ).rejects.toThrow(/Access denied: You do not have permission to view this closing/);
    });
  });
});
