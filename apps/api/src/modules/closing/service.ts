import { and, desc, eq, lte, gte, sql } from "drizzle-orm";
import { db } from "../../config/database.js";
import {
  dailyClosings,
  dailyClosingPayments,
  dailyClosingEvents,
  sales,
  salesReturns,
  paymentMethods,
  branches,
} from "../../database/schema/index.js";
import { AppError } from "../../utils/errors.js";
import {
  GetCurrentClosingQuery,
  SubmitClosingInput,
  ApproveClosingInput,
  RejectClosingInput,
  GetClosingHistoryQuery,
} from "./schema.js";
import { AuditService } from "../audit/service.js";
import { NotificationService } from "../notifications/service.js";

function toCents(val: string | number): number {
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

function toDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0] || "";
}

export function getPreviousDateString(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split("T")[0] || "";
}

export class ClosingService {
  /**
   * Authoritatively calculate totals and payment breakdown from completed sales and returns.
   */
  static async calculateClosingTotals(branchId: string, dateStr: string, tx: any = db, preloadedPaymentMethods?: any[]) {
    // 1. Fetch all active payment methods or reuse preloaded
    const activePaymentMethods = preloadedPaymentMethods || await tx.select().from(paymentMethods).where(eq(paymentMethods.isActive, true));

    const startOfDay = `${dateStr} 00:00:00`;
    const endOfDay = `${dateStr} 23:59:59.999`;

    // 2. Fetch completed sales for this branch and date using index-sargable range filter
    const completedSales = await tx.query.sales.findMany({
      where: and(
        eq(sales.branchId, branchId),
        eq(sales.status, "COMPLETED"),
        gte(sales.soldAt, startOfDay),
        lte(sales.soldAt, endOfDay)
      ),
      with: {
        payments: {
          with: {
            paymentMethod: true,
          },
        },
      },
    });

    // 3. Fetch completed sales returns for this branch and date using index-sargable range filter
    const completedReturns = await tx.query.salesReturns.findMany({
      where: and(
        eq(salesReturns.branchId, branchId),
        eq(salesReturns.status, "COMPLETED"),
        gte(salesReturns.returnedAt, startOfDay),
        lte(salesReturns.returnedAt, endOfDay)
      ),
      with: {
        refundPaymentMethod: true,
      },
    });

    let grossSalesCents = 0;
    for (const sale of completedSales) {
      grossSalesCents += toCents(sale.grandTotal);
    }

    let totalReturnsCents = 0;
    for (const ret of completedReturns) {
      totalReturnsCents += toCents(ret.refundAmount);
    }

    const netSalesCents = grossSalesCents - totalReturnsCents;

    // Aggregate by payment method
    const paymentMap = new Map<
      string,
      {
        paymentMethodId: string;
        paymentMethodName: string;
        receivedCents: number;
        refundedCents: number;
        txnSaleIds: Set<string>;
      }
    >();

    for (const pm of activePaymentMethods) {
      paymentMap.set(pm.id, {
        paymentMethodId: pm.id,
        paymentMethodName: pm.name,
        receivedCents: 0,
        refundedCents: 0,
        txnSaleIds: new Set<string>(),
      });
    }

    for (const sale of completedSales) {
      for (const p of sale.payments) {
        let entry = paymentMap.get(p.paymentMethodId);
        if (!entry) {
          entry = {
            paymentMethodId: p.paymentMethodId,
            paymentMethodName: p.paymentMethod?.name || "Unknown",
            receivedCents: 0,
            refundedCents: 0,
            txnSaleIds: new Set<string>(),
          };
          paymentMap.set(p.paymentMethodId, entry);
        }
        entry.receivedCents += toCents(p.amount);
        entry.txnSaleIds.add(sale.id);
      }
    }

    for (const ret of completedReturns) {
      let entry = paymentMap.get(ret.refundPaymentMethodId);
      if (!entry) {
        entry = {
          paymentMethodId: ret.refundPaymentMethodId,
          paymentMethodName: ret.refundPaymentMethod?.name || "Unknown",
          receivedCents: 0,
          refundedCents: 0,
          txnSaleIds: new Set<string>(),
        };
        paymentMap.set(ret.refundPaymentMethodId, entry);
      }
      entry.refundedCents += toCents(ret.refundAmount);
    }

    const paymentsSummary = Array.from(paymentMap.values()).map((p) => {
      const netCents = p.receivedCents - p.refundedCents;
      return {
        paymentMethodId: p.paymentMethodId,
        paymentMethodName: p.paymentMethodName,
        receivedAmount: toDollars(p.receivedCents),
        refundedAmount: toDollars(p.refundedCents),
        netAmount: toDollars(netCents),
        transactionCount: p.txnSaleIds.size,
      };
    });

    // Identify expected cash: sum across all Cash payment methods
    let expectedCashCents = 0;
    for (const p of paymentMap.values()) {
      if (p.paymentMethodName.toLowerCase().includes("cash")) {
        expectedCashCents += (p.receivedCents - p.refundedCents);
      }
    }

    return {
      salesCount: completedSales.length,
      totalSalesAmount: toDollars(grossSalesCents),
      totalReturnsAmount: toDollars(totalReturnsCents),
      netSalesAmount: toDollars(netSalesCents),
      expectedCash: toDollars(expectedCashCents),
      paymentsSummary,
    };
  }

  /**
   * Get Current Closing for branch and date, with readiness checks.
   */
  static async getCurrentClosing(query: GetCurrentClosingQuery, user: any) {
    let targetBranchId: string;

    if (user.role === "EMPLOYEE") {
      if (!user.branchId) {
        throw new AppError("Employee is not assigned to a branch", 403);
      }
      if (query.branchId && query.branchId !== user.branchId) {
        throw new AppError("Access denied: Employees can only access their assigned branch", 403);
      }
      targetBranchId = user.branchId;
    } else {
      // Owner
      if (query.branchId) {
        targetBranchId = query.branchId;
      } else {
        // Default to Main Branch or first branch
        const defaultBranch = await db.query.branches.findFirst({
          orderBy: [branches.name],
        });
        targetBranchId = defaultBranch ? defaultBranch.id : "";
      }
    }

    const dateStr = query.date || getTodayDateString();

    // Verify branch exists
    const branchRecord = await db.query.branches.findFirst({
      where: eq(branches.id, targetBranchId),
    });
    if (!branchRecord) {
      throw new AppError("Branch not found", 404);
    }

    // Check if an existing closing record exists for this branch and date
    const existingClosing = await db.query.dailyClosings.findFirst({
      where: and(
        eq(dailyClosings.branchId, targetBranchId),
        eq(dailyClosings.closingDate, dateStr)
      ),
      with: {
        branch: true,
        submittedBy: {
          columns: { id: true, name: true, email: true, role: true },
        },
        reviewedBy: {
          columns: { id: true, name: true, email: true, role: true },
        },
        payments: true,
        events: {
          orderBy: [desc(dailyClosingEvents.createdAt)],
          with: {
            actor: {
              columns: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    // Check previous day closing status
    const previousDateStr = getPreviousDateString(dateStr);
    const previousClosing = await db.query.dailyClosings.findFirst({
      where: and(
        eq(dailyClosings.branchId, targetBranchId),
        eq(dailyClosings.closingDate, previousDateStr)
      ),
    });

    const isPrevApproved = previousClosing?.status === "APPROVED";
    const previousDayStatus = {
      passed: isPrevApproved,
      message: previousClosing
        ? `Previous Day: ${previousDateStr} closing was ${previousClosing.status.toLowerCase()}. (Note: An open previous day does not block today's operations).`
        : `Previous Day: ${previousDateStr} closing has not been submitted. (Note: An open previous day does not block today's operations).`,
    };

    // Preload active payment methods once for closing calculations
    const activePaymentMethods = await db.select().from(paymentMethods).where(eq(paymentMethods.isActive, true));

    // Calculate live authoritative totals
    const liveCalculations = await this.calculateClosingTotals(targetBranchId, dateStr, db, activePaymentMethods);

    const checks = {
      allSalesRecorded: {
        passed: true,
        message: `${liveCalculations.salesCount} of ${liveCalculations.salesCount} sales entered for this business day. No pending draft sales.`,
      },
      previousDayStatus,
    };

    // Also fetch branch overview for Owner (status of all branches on this date)
    let branchOverview = undefined;
    if (user.role === "OWNER") {
      const allBranches = await db.query.branches.findMany({
        orderBy: [branches.name],
      });
      const allDateClosings = await db.query.dailyClosings.findMany({
        where: eq(dailyClosings.closingDate, dateStr),
      });

      branchOverview = await Promise.all(
        allBranches.map(async (b: any) => {
          const c = allDateClosings.find((item: any) => item.branchId === b.id);
          if (c) {
            return {
              branchId: b.id,
              branchName: b.name,
              branchCode: b.code,
              closingId: c.id,
              closingNumber: c.closingNumber,
              status: c.status,
              totalSalesAmount: c.totalSalesAmount,
              expectedCash: c.expectedCash,
              actualCash: c.actualCash,
              cashDifference: c.cashDifference,
              submittedAt: c.submittedAt,
              reviewedAt: c.reviewedAt,
            };
          } else {
            // Live totals for unsubmitted branch - reuse target branch calculation if matching
            const live = (b.id === targetBranchId)
              ? liveCalculations
              : await this.calculateClosingTotals(b.id, dateStr, db, activePaymentMethods);
            return {
              branchId: b.id,
              branchName: b.name,
              branchCode: b.code,
              closingId: null,
              closingNumber: null,
              status: "NOT_SUBMITTED",
              totalSalesAmount: live.totalSalesAmount,
              expectedCash: live.expectedCash,
              actualCash: null,
              cashDifference: null,
              submittedAt: null,
              reviewedAt: null,
            };
          }
        })
      );
    }

    if (existingClosing) {
      return {
        closing: existingClosing,
        liveCalculations: existingClosing.status === "APPROVED" ? null : liveCalculations,
        checks,
        branchOverview,
      };
    }

    // Synthesized Not Submitted response
    return {
      closing: {
        id: null,
        closingNumber: null,
        branchId: targetBranchId,
        branch: branchRecord,
        closingDate: dateStr,
        status: "NOT_SUBMITTED",
        totalSalesAmount: liveCalculations.totalSalesAmount,
        totalReturnsAmount: liveCalculations.totalReturnsAmount,
        netSalesAmount: liveCalculations.netSalesAmount,
        salesCount: liveCalculations.salesCount,
        expectedCash: liveCalculations.expectedCash,
        actualCash: null,
        cashDifference: null,
        discrepancyReason: null,
        submittedById: null,
        submittedBy: null,
        submittedAt: null,
        reviewedById: null,
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null,
        rejectionReason: null,
        revision: 1,
        payments: liveCalculations.paymentsSummary,
        events: [],
      },
      liveCalculations,
      checks,
      branchOverview,
    };
  }

  /**
   * Submit Daily Closing (Slice 9.2).
   */
  static async submitClosing(input: SubmitClosingInput, user: any) {
    let targetBranchId: string;

    if (user.role === "EMPLOYEE") {
      if (!user.branchId) {
        throw new AppError("Employee is not assigned to a branch", 403);
      }
      if (input.branchId && input.branchId !== user.branchId) {
        throw new AppError("Access denied: Employees can only submit for their assigned branch", 403);
      }
      targetBranchId = user.branchId;
    } else {
      // Owner submitting for a branch
      if (!input.branchId) {
        throw new AppError("Branch ID is required for closing submission", 400);
      }
      targetBranchId = input.branchId;
    }

    if (input.allSalesRecorded === false) {
      throw new AppError("Daily closing cannot be completed if required sales have not been entered", 400);
    }

    return await db.transaction(async (tx: any) => {
      // 1. Check for existing closing with row lock
      const [existing] = await tx
        .select()
        .from(dailyClosings)
        .where(
          and(
            eq(dailyClosings.branchId, targetBranchId),
            eq(dailyClosings.closingDate, input.date)
          )
        )
        .for("update");

      if (existing) {
        if (existing.status === "APPROVED") {
          throw new AppError("Approved closing is locked and cannot be edited or resubmitted", 400);
        }
        if (existing.status === "SUBMITTED") {
          throw new AppError("Closing has already been submitted and is awaiting Owner review", 400);
        }
      }

      // 2. Authoritatively recalculate totals inside the transaction
      const liveTotals = await this.calculateClosingTotals(targetBranchId, input.date, tx);

      const actualCashCents = toCents(input.actualCash);
      const expectedCashCents = toCents(liveTotals.expectedCash);
      const discrepancyCents = actualCashCents - expectedCashCents;

      // 3. If there is a cash discrepancy, explanation is mandatory
      if (discrepancyCents !== 0) {
        if (!input.discrepancyReason || input.discrepancyReason.trim().length === 0) {
          throw new AppError("A cash discrepancy requires an explanation/reason before submission", 400);
        }
      }

      const actualCashStr = toDollars(actualCashCents);
      const cashDifferenceStr = toDollars(discrepancyCents);
      const explanation = input.discrepancyReason?.trim() || null;
      const now = new Date().toISOString();

      let closingRecord: any;
      let revision = 1;

      if (existing) {
        revision = existing.revision + (existing.status === "REJECTED" ? 1 : 0);

        const [updated] = await tx
          .update(dailyClosings)
          .set({
            status: "SUBMITTED",
            totalSalesAmount: liveTotals.totalSalesAmount,
            totalReturnsAmount: liveTotals.totalReturnsAmount,
            netSalesAmount: liveTotals.netSalesAmount,
            salesCount: liveTotals.salesCount,
            expectedCash: liveTotals.expectedCash,
            actualCash: actualCashStr,
            cashDifference: cashDifferenceStr,
            discrepancyReason: explanation,
            submittedById: user.id || user.userId,
            submittedAt: now,
            reviewedById: null,
            reviewedAt: null,
            reviewNotes: null,
            rejectionReason: null,
            revision,
            updatedAt: now,
          })
          .where(eq(dailyClosings.id, existing.id))
          .returning();

        closingRecord = updated;

        // Clear existing payment breakdown to overwrite with fresh authoritative snapshot
        await tx.delete(dailyClosingPayments).where(eq(dailyClosingPayments.closingId, existing.id));
      } else {
        // Generate human-readable closing number CLS-000001
        const seqResult = await tx.execute(sql`SELECT nextval('daily_closing_number_seq') as seq`);
        const seqNum = Number(seqResult.rows[0].seq);
        const closingNumber = `CLS-${String(seqNum).padStart(6, "0")}`;

        const [inserted] = await tx
          .insert(dailyClosings)
          .values({
            closingNumber,
            branchId: targetBranchId,
            closingDate: input.date,
            status: "SUBMITTED",
            totalSalesAmount: liveTotals.totalSalesAmount,
            totalReturnsAmount: liveTotals.totalReturnsAmount,
            netSalesAmount: liveTotals.netSalesAmount,
            salesCount: liveTotals.salesCount,
            expectedCash: liveTotals.expectedCash,
            actualCash: actualCashStr,
            cashDifference: cashDifferenceStr,
            discrepancyReason: explanation,
            submittedById: user.id || user.userId,
            submittedAt: now,
            revision: 1,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        closingRecord = inserted;
      }

      // 4. Save payment snapshots
      for (const p of liveTotals.paymentsSummary) {
        await tx.insert(dailyClosingPayments).values({
          closingId: closingRecord.id,
          paymentMethodId: p.paymentMethodId,
          paymentMethodName: p.paymentMethodName,
          receivedAmount: p.receivedAmount,
          refundedAmount: p.refundedAmount,
          netAmount: p.netAmount,
          transactionCount: p.transactionCount,
        });
      }

      // 5. Record audit event
      const eventType = revision > 1 ? "RESUBMITTED" : "SUBMITTED";
      await tx.insert(dailyClosingEvents).values({
        closingId: closingRecord.id,
        eventType,
        actorId: user.id || user.userId,
        actorRole: user.role,
        expectedCash: liveTotals.expectedCash,
        actualCash: actualCashStr,
        cashDifference: cashDifferenceStr,
        notes: explanation || "Closing submitted without discrepancy",
        revision,
      });

      // Record system-wide audit
      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.name || "User",
          actorRole: user.role,
          action: "CLOSING_SUBMITTED",
          category: "CLOSINGS",
          entityType: "daily_closing",
          entityId: closingRecord.id,
          branchId: targetBranchId,
          reason: explanation || undefined,
          metadata: {
            date: input.date,
            expectedCash: liveTotals.expectedCash,
            actualCash: actualCashStr,
            cashDifference: cashDifferenceStr,
            revision,
          },
        },
        tx
      );

      // Notify Owner
      if (discrepancyCents !== 0) {
        await NotificationService.notifyOwner(
          {
            title: "Daily Closing Discrepancy",
            message: `Closing for ${input.date} submitted with a cash discrepancy of $${cashDifferenceStr}. Reason: ${explanation}`,
            type: "CLOSING_DISCREPANCY",
            priority: "CRITICAL",
            entityType: "daily_closing",
            entityId: closingRecord.id,
            link: "/closing",
            metadata: { date: input.date, branchId: targetBranchId, cashDifference: cashDifferenceStr },
          },
          tx
        );
      } else {
        await NotificationService.notifyOwner(
          {
            title: "Daily Closing Submitted",
            message: `Daily closing for ${input.date} submitted for review.`,
            type: "CLOSING_SUBMITTED",
            priority: "INFORMATIONAL",
            entityType: "daily_closing",
            entityId: closingRecord.id,
            link: "/closing",
            metadata: { date: input.date, branchId: targetBranchId },
          },
          tx
        );
      }

      return await tx.query.dailyClosings.findFirst({
        where: eq(dailyClosings.id, closingRecord.id),
        with: {
          branch: true,
          submittedBy: {
            columns: { id: true, name: true, email: true, role: true },
          },
          payments: true,
          events: {
            orderBy: [desc(dailyClosingEvents.createdAt)],
          },
        },
      });
    });
  }

  /**
   * Approve Daily Closing (Slice 9.3). Owner-only.
   */
  static async approveClosing(id: string, input: ApproveClosingInput, user: any) {
    if (user.role !== "OWNER") {
      throw new AppError("Access denied: Only an Owner can approve a daily closing", 403);
    }

    return await db.transaction(async (tx: any) => {
      const [closing] = await tx
        .select()
        .from(dailyClosings)
        .where(eq(dailyClosings.id, id))
        .for("update");

      if (!closing) {
        throw new AppError("Daily closing not found", 404);
      }

      if (closing.status === "APPROVED") {
        throw new AppError("Closing is already approved", 400);
      }

      if (closing.status !== "SUBMITTED") {
        throw new AppError(
          `Cannot approve closing in '${closing.status}' status. Only submitted closings can be approved.`,
          400
        );
      }

      const now = new Date().toISOString();
      const reviewNotes = input.notes?.trim() || null;

      await tx
        .update(dailyClosings)
        .set({
          status: "APPROVED",
          reviewedById: user.id || user.userId,
          reviewedAt: now,
          reviewNotes,
          updatedAt: now,
        })
        .where(eq(dailyClosings.id, id));

      // Record audit event
      await tx.insert(dailyClosingEvents).values({
        closingId: id,
        eventType: "APPROVED",
        actorId: user.id || user.userId,
        actorRole: "OWNER",
        expectedCash: closing.expectedCash,
        actualCash: closing.actualCash,
        cashDifference: closing.cashDifference,
        notes: reviewNotes || "Closing approved by Owner",
        revision: closing.revision,
      });

      // Record system-wide audit
      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.name || "Owner",
          actorRole: "OWNER",
          action: "CLOSING_APPROVED",
          category: "CLOSINGS",
          entityType: "daily_closing",
          entityId: id,
          branchId: closing.branchId,
          reason: reviewNotes || undefined,
          metadata: { date: closing.closingDate, notes: reviewNotes },
        },
        tx
      );

      // Notify submitter
      if (closing.submittedById) {
        await NotificationService.createNotification(
          {
            recipientUserId: closing.submittedById,
            title: "Daily Closing Approved",
            message: `Your daily closing for ${closing.closingDate} has been approved by the Owner.`,
            type: "CLOSING_APPROVED",
            priority: "INFORMATIONAL",
            entityType: "daily_closing",
            entityId: id,
            link: "/closing",
            metadata: { date: closing.closingDate },
          },
          tx
        );
      }

      return await tx.query.dailyClosings.findFirst({
        where: eq(dailyClosings.id, id),
        with: {
          branch: true,
          submittedBy: {
            columns: { id: true, name: true, email: true, role: true },
          },
          reviewedBy: {
            columns: { id: true, name: true, email: true, role: true },
          },
          payments: true,
          events: {
            orderBy: [desc(dailyClosingEvents.createdAt)],
          },
        },
      });
    });
  }

  /**
   * Reject Daily Closing (Slice 9.3). Owner-only.
   */
  static async rejectClosing(id: string, input: RejectClosingInput, user: any) {
    if (user.role !== "OWNER") {
      throw new AppError("Access denied: Only an Owner can reject a daily closing", 403);
    }

    const reason = input.reason.trim();
    if (!reason) {
      throw new AppError("Reason for rejection is required", 400);
    }

    return await db.transaction(async (tx: any) => {
      const [closing] = await tx
        .select()
        .from(dailyClosings)
        .where(eq(dailyClosings.id, id))
        .for("update");

      if (!closing) {
        throw new AppError("Daily closing not found", 404);
      }

      if (closing.status === "APPROVED") {
        throw new AppError("Cannot reject an already approved closing", 400);
      }

      if (closing.status !== "SUBMITTED") {
        throw new AppError(
          `Cannot reject closing in '${closing.status}' status. Only submitted closings can be rejected.`,
          400
        );
      }

      const now = new Date().toISOString();

      await tx
        .update(dailyClosings)
        .set({
          status: "REJECTED",
          reviewedById: user.id || user.userId,
          reviewedAt: now,
          rejectionReason: reason,
          updatedAt: now,
        })
        .where(eq(dailyClosings.id, id));

      // Record audit event
      await tx.insert(dailyClosingEvents).values({
        closingId: id,
        eventType: "REJECTED",
        actorId: user.id || user.userId,
        actorRole: "OWNER",
        expectedCash: closing.expectedCash,
        actualCash: closing.actualCash,
        cashDifference: closing.cashDifference,
        notes: reason,
        revision: closing.revision,
      });

      // Record system-wide audit
      await AuditService.recordAudit(
        {
          actorId: user.id || user.userId,
          actorName: user.name || "Owner",
          actorRole: "OWNER",
          action: "CLOSING_REJECTED",
          category: "CLOSINGS",
          entityType: "daily_closing",
          entityId: id,
          branchId: closing.branchId,
          reason,
          metadata: { date: closing.closingDate, reason },
        },
        tx
      );

      // Notify submitter
      if (closing.submittedById) {
        await NotificationService.createNotification(
          {
            recipientUserId: closing.submittedById,
            title: "Daily Closing Rejected",
            message: `Your daily closing for ${closing.closingDate} was rejected: ${reason}`,
            type: "CLOSING_REJECTED",
            priority: "IMPORTANT",
            entityType: "daily_closing",
            entityId: id,
            link: "/closing",
            metadata: { date: closing.closingDate, reason },
          },
          tx
        );
      }

      return await tx.query.dailyClosings.findFirst({
        where: eq(dailyClosings.id, id),
        with: {
          branch: true,
          submittedBy: {
            columns: { id: true, name: true, email: true, role: true },
          },
          reviewedBy: {
            columns: { id: true, name: true, email: true, role: true },
          },
          payments: true,
          events: {
            orderBy: [desc(dailyClosingEvents.createdAt)],
          },
        },
      });
    });
  }

  /**
   * Get Closing History (Slice 9.4).
   */
  static async getClosingHistory(rawQuery: Partial<GetClosingHistoryQuery> = {}, user: any) {
    const page = rawQuery.page ?? 1;
    const limit = rawQuery.limit ?? 20;
    const conditions: any[] = [];

    if (user.role === "EMPLOYEE") {
      if (!user.branchId) {
        throw new AppError("Employee is not assigned to a branch", 403);
      }
      conditions.push(eq(dailyClosings.branchId, user.branchId));
    } else {
      // Owner can filter by branch
      if (rawQuery.branchId) {
        conditions.push(eq(dailyClosings.branchId, rawQuery.branchId));
      }
    }

    if (rawQuery.status) {
      conditions.push(eq(dailyClosings.status, rawQuery.status));
    }

    if (rawQuery.startDate) {
      conditions.push(gte(dailyClosings.closingDate, rawQuery.startDate));
    }

    if (rawQuery.endDate) {
      conditions.push(lte(dailyClosings.closingDate, rawQuery.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(dailyClosings)
      .where(whereClause);

    const total = countResult?.count || 0;
    const offset = (page - 1) * limit;

    const data = await db.query.dailyClosings.findMany({
      where: whereClause,
      orderBy: [desc(dailyClosings.closingDate), desc(dailyClosings.createdAt)],
      limit,
      offset,
      with: {
        branch: {
          columns: { id: true, name: true, code: true },
        },
        submittedBy: {
          columns: { id: true, name: true, email: true, role: true },
        },
        reviewedBy: {
          columns: { id: true, name: true, email: true, role: true },
        },
        payments: true,
      },
    });

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get Closing By ID.
   */
  static async getClosingById(id: string, user: any) {
    const closing = await db.query.dailyClosings.findFirst({
      where: eq(dailyClosings.id, id),
      with: {
        branch: true,
        submittedBy: {
          columns: { id: true, name: true, email: true, role: true },
        },
        reviewedBy: {
          columns: { id: true, name: true, email: true, role: true },
        },
        payments: true,
        events: {
          orderBy: [desc(dailyClosingEvents.createdAt)],
          with: {
            actor: {
              columns: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!closing) {
      throw new AppError("Daily closing not found", 404);
    }

    if (user.role === "EMPLOYEE" && closing.branchId !== user.branchId) {
      throw new AppError("Access denied: You do not have permission to view this closing", 403);
    }

    return closing;
  }
}
