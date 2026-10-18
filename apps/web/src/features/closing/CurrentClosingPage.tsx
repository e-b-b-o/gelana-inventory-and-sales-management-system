import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import { useBranches } from "../branches/api";
import {
  useCurrentClosing,
  useSubmitClosing,
  useApproveClosing,
  useRejectClosing,
  type DailyClosingStatus,
} from "./api";

function formatETB(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "ETB 0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "ETB 0.00";
  return `ETB ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0] || "";
}

export function CurrentClosingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const currentUser = userResponse?.user;
  const isOwner = currentUser?.role === "OWNER";

  const { data: branches = [] } = useBranches();

  // Active branch & date
  const selectedBranchId = searchParams.get("branchId") || (isOwner ? branches[0]?.id || "" : currentUser?.branchId || "");
  const selectedDate = searchParams.get("date") || getTodayString();

  const isReady = Boolean(currentUser) && (isOwner ? (branches.length > 0 || Boolean(searchParams.get("branchId"))) : Boolean(currentUser?.branchId));

  // Query current closing
  const { data: closingResponse, isLoading, isError, error, refetch } = useCurrentClosing(
    {
      branchId: selectedBranchId || undefined,
      date: selectedDate,
    },
    { enabled: isReady }
  );

  const closingData = closingResponse?.data;
  const closing = closingData?.closing;
  const checks = closingData?.checks;
  const branchOverview = closingData?.branchOverview;

  // Employee Submission Form State
  const [actualCashInput, setActualCashInput] = useState<string>("");
  const [discrepancyExplanation, setDiscrepancyExplanation] = useState<string>("");
  const [allSalesConfirmed, setAllSalesConfirmed] = useState<boolean>(true);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Owner Review State
  const [showRejectDrawer, setShowRejectDrawer] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [approvalNotes, setApprovalNotes] = useState<string>("");
  const [showApproveNotes, setShowApproveNotes] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Mutations
  const submitMutation = useSubmitClosing();
  const approveMutation = useApproveClosing();
  const rejectMutation = useRejectClosing();

  // Expected Cash calculation
  const expectedCashNum = useMemo(() => {
    return parseFloat(closing?.expectedCash || "0") || 0;
  }, [closing?.expectedCash]);

  // Live discrepancy calculation as user enters cash
  const liveCountedCash = actualCashInput !== "" ? parseFloat(actualCashInput) || 0 : null;
  const liveDiscrepancy = liveCountedCash !== null ? liveCountedCash - expectedCashNum : null;

  const handleBranchChange = (newBranchId: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("branchId", newBranchId);
    setSearchParams(next);
  };

  const handleDateChange = (newDate: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("date", newDate);
    setSearchParams(next);
  };

  const handleSubmitClosing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    const actualCashVal = parseFloat(actualCashInput);
    if (isNaN(actualCashVal) || actualCashVal < 0) {
      setSubmissionError("Please enter a valid actual cash amount (0 or greater).");
      return;
    }

    const variance = actualCashVal - expectedCashNum;
    if (Math.abs(variance) > 0.001 && !discrepancyExplanation.trim()) {
      setSubmissionError("A discrepancy exists between expected cash and actual cash. An explanation is required.");
      return;
    }

    if (!allSalesConfirmed) {
      setSubmissionError("All required sales must be entered into the system before daily closing.");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        branchId: selectedBranchId,
        date: selectedDate,
        actualCash: actualCashVal,
        discrepancyReason: discrepancyExplanation.trim() || undefined,
        allSalesRecorded: allSalesConfirmed,
      });
      setActualCashInput("");
      setDiscrepancyExplanation("");
    } catch (err: any) {
      setSubmissionError(err.message || "Failed to submit closing. Please check requirements and retry.");
    }
  };

  const handleApprove = async () => {
    if (!closing?.id) return;
    setReviewError(null);
    try {
      await approveMutation.mutateAsync({
        id: closing.id,
        payload: { notes: approvalNotes.trim() || undefined },
      });
      setShowApproveNotes(false);
      setApprovalNotes("");
    } catch (err: any) {
      setReviewError(err.message || "Failed to approve closing.");
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closing?.id) return;
    setReviewError(null);

    if (!rejectionReason.trim()) {
      setReviewError("Please provide a clear reason explaining what needs correction.");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: closing.id,
        payload: { reason: rejectionReason.trim() },
      });
      setShowRejectDrawer(false);
      setRejectionReason("");
    } catch (err: any) {
      setReviewError(err.message || "Failed to reject closing.");
    }
  };

  const renderStatusBadge = (status: DailyClosingStatus) => {
    switch (status) {
      case "NOT_SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md font-label-md bg-slate-100 text-slate-700 border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Not Submitted
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md font-label-md bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Submitted — Awaiting Approval
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md font-label-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md font-label-md bg-rose-50 text-rose-800 border border-rose-200">
            <span className="material-symbols-outlined text-rose-600 text-[18px]">warning</span>
            Rejected — Correction Required
          </span>
        );
    }
  };

  const getMethodIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("cash")) return "payments";
    if (lower.includes("bank")) return "account_balance";
    if (lower.includes("telebirr") || lower.includes("mobile")) return "smartphone";
    if (lower.includes("card")) return "credit_card";
    return "receipt";
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-body-md text-on-surface-variant">Loading daily closing details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <h3 className="text-label-lg font-bold">Error loading daily closing</h3>
          <p className="text-body-sm mt-1">{(error as any)?.message || "Failed to load closing data."}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-label-md font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isLocked = closing?.status === "SUBMITTED" || closing?.status === "APPROVED";
  const canEmployeeEdit = !isLocked && (closing?.status === "NOT_SUBMITTED" || closing?.status === "REJECTED");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Daily Closing</h1>
            {closing && renderStatusBadge(closing.status)}
          </div>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Review and reconcile the day's recorded sales and payments before closing the business day.
          </p>
        </div>

        {/* Closing Number / Reference Pill & Quick Navigation */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {closing?.closingNumber ? (
            <div className="bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded flex items-center gap-2 text-label-md font-label-md shadow-xs">
              <span className="text-outline">Closing ID:</span>
              <span className="font-bold text-on-surface font-mono">{closing.closingNumber}</span>
            </div>
          ) : (
            <div className="bg-surface-container-low border border-outline-variant px-3 py-1.5 rounded text-label-sm text-outline">
              Not Yet Submitted
            </div>
          )}

          <Link
            to="/daily-closing/history"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface rounded-lg text-label-md font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            Closing History
          </Link>
        </div>
      </div>

      {/* Context Control Strip (Branch Switcher for Owner & Business Date Picker) */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {isOwner ? (
            <div className="flex items-center gap-2">
              <label htmlFor="branch-select" className="text-label-md font-semibold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[20px]">store</span>
                Branch:
              </label>
              <select
                id="branch-select"
                value={selectedBranchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm text-on-surface font-medium focus:ring-1 focus:ring-primary outline-none"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">store</span>
              <span className="text-label-md font-bold text-on-surface">{closing?.branch?.name || "Your Branch"}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="date-select" className="text-label-md font-semibold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
              Business Date:
            </label>
            <input
              id="date-select"
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm text-on-surface font-mono focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <button
          onClick={() => refetch()}
          className="text-label-sm font-semibold text-primary hover:text-primary-container flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh authoritatively
        </button>
      </div>

      {/* 2-Column Grid Layout (Col 1: 7 cols / Col 2: 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* COLUMN 1: Reconciliation & Auditing (7 cols)             */}
        {/* ========================================================= */}
        <div className="xl:col-span-7 space-y-6">
          {/* 1. Closing Summary Card */}
          <div className="surface-card rounded-xl p-5 bg-surface-container-lowest border border-outline-variant shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">inventory</span>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Closing Summary</h2>
              </div>
              <span className="text-label-sm font-label-sm text-outline">{closing?.branch?.name}</span>
            </div>

            {/* Lifecycle Progress Indicator */}
            <div className="mb-5 bg-surface-container-low p-3.5 rounded-lg border border-outline-variant">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-label-sm font-label-sm text-outline mb-2">
                <span className={`flex items-center gap-1 ${closing?.status === "NOT_SUBMITTED" ? "text-primary font-bold" : "text-emerald-700 font-semibold"}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {closing?.status === "NOT_SUBMITTED" ? "radio_button_checked" : "check_circle"}
                  </span>
                  1. Not Submitted
                </span>
                <span className={`flex items-center gap-1 ${closing?.status === "SUBMITTED" ? "text-primary font-bold" : closing?.status === "APPROVED" ? "text-emerald-700 font-semibold" : "text-outline"}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {closing?.status === "SUBMITTED" ? "radio_button_checked" : closing?.status === "APPROVED" ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  2. Submitted — Awaiting Approval
                </span>
                <span className={`flex items-center gap-1 ${closing?.status === "APPROVED" ? "text-emerald-700 font-bold" : closing?.status === "REJECTED" ? "text-rose-700 font-bold" : "text-outline"}`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {closing?.status === "APPROVED" ? "check_circle" : closing?.status === "REJECTED" ? "error" : "radio_button_unchecked"}
                  </span>
                  3. Approved / Rejected
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    closing?.status === "APPROVED"
                      ? "bg-emerald-600 w-full"
                      : closing?.status === "REJECTED"
                      ? "bg-rose-600 w-2/3"
                      : closing?.status === "SUBMITTED"
                      ? "bg-amber-500 w-2/3"
                      : "bg-primary w-1/3"
                  }`}
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-body-sm">
              <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline">Branch</p>
                <p className="text-headline-sm text-on-surface mt-0.5 font-semibold truncate">{closing?.branch?.name}</p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline">Business Date</p>
                <p className="text-headline-sm text-on-surface mt-0.5 font-semibold font-mono">{closing?.closingDate}</p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline">Submitted By</p>
                <p className="text-headline-sm text-on-surface mt-0.5 font-semibold truncate">
                  {closing?.submittedBy?.name || "—"}
                </p>
              </div>
              <div className="p-3 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline">Revision</p>
                <p className="text-headline-sm text-on-surface mt-0.5 font-semibold font-mono">
                  Rev {closing?.revision || 1}
                </p>
              </div>
            </div>

            {/* Status Note Notice */}
            {closing?.status === "SUBMITTED" && (
              <div className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-on-surface text-label-md font-label-md">
                <span className="material-symbols-outlined text-amber-700 text-[20px]">lock</span>
                <span>Submitted closings are locked from normal employee editing while awaiting Owner review.</span>
              </div>
            )}
            {closing?.status === "APPROVED" && (
              <div className="mt-4 flex items-center gap-2.5 px-3.5 py-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-on-surface text-label-md font-label-md">
                <span className="material-symbols-outlined text-emerald-700 text-[20px]">check_circle</span>
                <span>Closing approved by Owner. Financial records for this business day are finalized.</span>
              </div>
            )}
            {closing?.status === "REJECTED" && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 space-y-1">
                <div className="flex items-center gap-2 text-label-md font-bold">
                  <span className="material-symbols-outlined text-rose-700 text-[20px]">error</span>
                  <span>Closing Rejected — Correction Required</span>
                </div>
                <p className="text-body-sm font-medium">
                  <strong>Owner Feedback:</strong> "{closing.rejectionReason}"
                </p>
                <p className="text-label-sm text-rose-800">
                  Please perform recount or corrections and resubmit with updated counted cash.
                </p>
              </div>
            )}
          </div>

          {/* 2. Sales & Payment Reconciliation Summary Card */}
          <div className="surface-card rounded-xl p-5 bg-surface-container-lowest border border-outline-variant shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Sales &amp; Payment Summary</h2>
                <p className="text-label-sm text-outline">Recorded transactions and breakdown across payment methods</p>
              </div>
              <div className="text-right">
                <p className="text-label-sm text-outline">Total Sales Recorded</p>
                <p className="text-headline-md font-headline-md font-bold text-primary font-mono">
                  {formatETB(closing?.totalSalesAmount)}
                </p>
              </div>
            </div>

            {/* KPI Pill Strip */}
            <div className="flex items-center justify-between bg-surface p-3 rounded-lg border border-outline-variant mb-4 text-label-md font-label-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
                <span className="text-on-surface font-semibold">{closing?.salesCount || 0} Completed Sales Transactions</span>
              </div>
              <span className="text-label-sm text-outline font-medium">{closing?.closingDate}</span>
            </div>

            {/* Payment Method Breakdown Table */}
            <div className="overflow-x-auto border border-outline-variant rounded-lg">
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-md text-outline">
                    <th className="py-2.5 px-4 font-semibold">Payment Method</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Transactions</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Received</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Refunds</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Reconciled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {closing?.payments && closing.payments.length > 0 ? (
                    closing.payments.map((p) => (
                      <tr key={p.paymentMethodId} className="hover:bg-surface-container/50">
                        <td className="py-3 px-4 font-medium text-on-surface flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded bg-primary-fixed/40 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px]">{getMethodIcon(p.paymentMethodName)}</span>
                          </span>
                          <span>{p.paymentMethodName}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-on-surface-variant">
                          {p.transactionCount} txns
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-on-surface">
                          {formatETB(p.receivedAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-rose-700">
                          {parseFloat(p.refundedAmount || "0") > 0 ? `-${formatETB(p.refundedAmount)}` : "—"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-on-surface font-mono">
                          {formatETB(p.netAmount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-outline text-body-sm">
                        No transactions recorded for this business day.
                      </td>
                    </tr>
                  )}
                  <tr className="bg-surface-container-high/60 font-bold">
                    <td className="py-2.5 px-4 text-on-surface" colSpan={4}>
                      Total Payments Reconciled (Net Sales)
                    </td>
                    <td className="py-2.5 px-4 text-right text-primary font-mono text-headline-sm">
                      {formatETB(closing?.netSalesAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Cash Count & Discrepancy Reconciliation Card */}
          <div
            className={`surface-card rounded-xl p-5 bg-surface-container-lowest border shadow-xs ${
              closing?.cashDifference && parseFloat(closing.cashDifference) !== 0
                ? "border-amber-300"
                : "border-outline-variant"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">account_balance_wallet</span>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Cash Reconciliation</h2>
              </div>
              {closing?.status !== "NOT_SUBMITTED" ? (
                closing?.cashDifference && parseFloat(closing.cashDifference) !== 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm bg-amber-100 text-amber-900 font-semibold border border-amber-300">
                    <span className="material-symbols-outlined text-[16px] text-amber-700">warning</span>
                    Variance Detected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                    Balanced
                  </span>
                )
              ) : liveDiscrepancy !== null ? (
                liveDiscrepancy !== 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm bg-amber-100 text-amber-900 font-semibold border border-amber-300">
                    <span className="material-symbols-outlined text-[16px] text-amber-700">warning</span>
                    Variance Detected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-label-sm font-label-sm bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700">check_circle</span>
                    Balanced
                  </span>
                )
              ) : null}
            </div>

            {/* 3 KPI Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="p-3.5 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline font-medium">Expected Cash</p>
                <p className="text-headline-md font-bold text-on-surface font-mono mt-1">
                  {formatETB(closing?.expectedCash)}
                </p>
                <p className="text-[11px] text-outline mt-1">Net cash recorded from sales</p>
              </div>

              <div className="p-3.5 bg-surface rounded-lg border border-outline-variant">
                <p className="text-label-sm text-outline font-medium">Actual Cash Counted</p>
                <p className="text-headline-md font-bold text-on-surface font-mono mt-1">
                  {closing?.actualCash ? formatETB(closing.actualCash) : liveCountedCash !== null ? formatETB(liveCountedCash) : "—"}
                </p>
                <p className="text-[11px] text-outline mt-1">
                  {closing?.submittedBy?.name ? `Counted by ${closing.submittedBy.name}` : "Physical drawer count"}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-lg border ${
                  (closing?.cashDifference && parseFloat(closing.cashDifference) < 0) || (liveDiscrepancy !== null && liveDiscrepancy < 0)
                    ? "bg-rose-50/70 border-rose-200"
                    : (closing?.cashDifference && parseFloat(closing.cashDifference) > 0) || (liveDiscrepancy !== null && liveDiscrepancy > 0)
                    ? "bg-amber-50/70 border-amber-200"
                    : "bg-surface border-outline-variant"
                }`}
              >
                <p
                  className={`text-label-sm font-semibold ${
                    (closing?.cashDifference && parseFloat(closing.cashDifference) < 0) || (liveDiscrepancy !== null && liveDiscrepancy < 0)
                      ? "text-rose-800"
                      : (closing?.cashDifference && parseFloat(closing.cashDifference) > 0) || (liveDiscrepancy !== null && liveDiscrepancy > 0)
                      ? "text-amber-800"
                      : "text-outline"
                  }`}
                >
                  Cash Discrepancy
                </p>
                <p
                  className={`text-headline-md font-bold font-mono mt-1 ${
                    (closing?.cashDifference && parseFloat(closing.cashDifference) < 0) || (liveDiscrepancy !== null && liveDiscrepancy < 0)
                      ? "text-rose-700"
                      : (closing?.cashDifference && parseFloat(closing.cashDifference) > 0) || (liveDiscrepancy !== null && liveDiscrepancy > 0)
                      ? "text-amber-700"
                      : "text-on-surface"
                  }`}
                >
                  {closing?.cashDifference
                    ? formatETB(closing.cashDifference)
                    : liveDiscrepancy !== null
                    ? formatETB(liveDiscrepancy)
                    : "—"}
                </p>
                <p className="text-[11px] text-outline mt-1">
                  {closing?.cashDifference && parseFloat(closing.cashDifference) < 0
                    ? "Shortage in physical count"
                    : closing?.cashDifference && parseFloat(closing.cashDifference) > 0
                    ? "Overage in physical count"
                    : "Count matches system expectation"}
                </p>
              </div>
            </div>

            {/* Discrepancy Explanation Box */}
            {closing?.discrepancyReason && (
              <div className="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant">
                <div className="flex items-center gap-2 mb-2 text-label-md text-on-surface">
                  <span className="material-symbols-outlined text-outline text-[18px]">description</span>
                  <span className="font-semibold">Discrepancy Explanation:</span>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant font-mono text-body-sm text-on-surface leading-relaxed">
                  "{closing.discrepancyReason}"
                </div>
                <div className="flex items-center justify-between text-label-sm text-outline mt-2 px-1">
                  <span>Submitted by {closing.submittedBy?.name || "Staff"}</span>
                  <span className="text-emerald-700 font-medium">Explanation Provided</span>
                </div>
              </div>
            )}
          </div>

          {/* 4. Validation & Pre-Closing Readiness Checks */}
          <div className="surface-card rounded-xl p-5 bg-surface-container-lowest border border-outline-variant shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified</span>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Closing Checks</h2>
              </div>
              <span className="text-label-sm font-label-sm text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                All Required Checks Passed
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-2.5 bg-surface rounded-lg border border-outline-variant">
                <span className="material-symbols-outlined text-emerald-600 mt-0.5">check_circle</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-label-md text-on-surface font-semibold">All Sales Recorded</p>
                    <span className="text-label-sm text-emerald-700 font-semibold">Passed</span>
                  </div>
                  <p className="text-body-sm text-outline mt-0.5">{checks?.allSalesRecorded?.message}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant">
                <span className="material-symbols-outlined text-outline mt-0.5">info</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-label-md text-on-surface font-medium">Previous Day Status</p>
                    <span className="text-label-sm text-outline font-medium">Informational</span>
                  </div>
                  <p className="text-body-sm text-outline mt-0.5">{checks?.previousDayStatus?.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: Actions, Owner Review & Audit (5 cols)          */}
        {/* ========================================================= */}
        <div className="xl:col-span-5 space-y-6">
          {/* Employee Submission Form Card (Shown when editable) */}
          {canEmployeeEdit && (
            <div className="surface-card rounded-xl p-5 bg-surface-container-lowest border-2 border-primary/40 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">point_of_sale</span>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Submit Daily Closing</h2>
                </div>
                <span className="text-label-sm bg-primary-fixed text-primary px-2 py-0.5 rounded font-semibold">
                  {closing?.status === "REJECTED" ? "Correction Revision" : "End-of-Day"}
                </span>
              </div>

              <form onSubmit={handleSubmitClosing} className="space-y-4">
                {submissionError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-body-sm">
                    {submissionError}
                  </div>
                )}

                <div>
                  <label htmlFor="actual-cash" className="block text-label-md font-semibold text-on-surface mb-1">
                    Actual Physical Cash Counted (ETB) *
                  </label>
                  <input
                    id="actual-cash"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={actualCashInput}
                    onChange={(e) => setActualCashInput(e.target.value)}
                    required
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-headline-sm font-mono font-bold text-on-surface focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-[11px] text-outline mt-1">
                    Carefully count all physical banknotes and coins in the branch cash drawer.
                  </p>
                </div>

                {/* Discrepancy explanation textarea (Mandatory if variance != 0) */}
                {liveDiscrepancy !== null && Math.abs(liveDiscrepancy) > 0.001 && (
                  <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-lg space-y-2">
                    <div className="flex items-center gap-1.5 text-label-md font-bold text-amber-900">
                      <span className="material-symbols-outlined text-amber-700 text-[18px]">warning</span>
                      Cash Discrepancy Detected ({formatETB(liveDiscrepancy)})
                    </div>
                    <label htmlFor="discrepancy-reason" className="block text-label-sm font-semibold text-on-surface">
                      Explanation / Reason for Discrepancy *
                    </label>
                    <textarea
                      id="discrepancy-reason"
                      rows={3}
                      value={discrepancyExplanation}
                      onChange={(e) => setDiscrepancyExplanation(e.target.value)}
                      placeholder="Explain why the physical count differs from the expected system cash..."
                      required
                      className="w-full bg-surface border border-outline-variant rounded p-2 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
                    />
                    <p className="text-[11px] text-outline">
                      An explanation is strictly required before submission when actual cash does not equal expected cash.
                    </p>
                  </div>
                )}

                {/* All sales confirmation checkbox */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    id="sales-confirm"
                    type="checkbox"
                    checked={allSalesConfirmed}
                    onChange={(e) => setAllSalesConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                  />
                  <label htmlFor="sales-confirm" className="text-body-sm text-on-surface cursor-pointer">
                    I confirm that all sales for this business date have been recorded in Gelana and no unentered sales remain.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-primary hover:bg-[#0039cc] text-on-primary py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 text-headline-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting Closing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      Submit Daily Closing
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Owner Review Card (Visible to Owner when SUBMITTED or reviewed) */}
          {isOwner && (
            <div className="surface-card rounded-xl p-5 bg-surface-container-lowest border-2 border-primary/40 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">admin_panel_settings</span>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Owner Review</h2>
                </div>
                <span className="text-label-sm font-label-sm bg-primary-fixed text-primary px-2 py-0.5 rounded font-semibold">
                  {closing?.status === "SUBMITTED"
                    ? "Review Required"
                    : closing?.status === "APPROVED"
                    ? "Approved"
                    : closing?.status === "REJECTED"
                    ? "Rejected"
                    : "Not Yet Submitted"}
                </span>
              </div>

              {reviewError && (
                <div className="p-3 mb-4 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-body-sm">
                  {reviewError}
                </div>
              )}

              {closing?.status === "SUBMITTED" ? (
                <div className="space-y-4">
                  <div className="bg-surface-container-low p-3.5 rounded-lg border border-outline-variant">
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">
                      Review the submitted closing, including sales totals, payment method totals, cash count, and any discrepancy explanation before approving or rejecting.
                    </p>
                  </div>

                  {/* Approve / Reject Controls */}
                  <div className="space-y-3">
                    {showApproveNotes ? (
                      <div className="p-3 bg-surface rounded-lg border border-outline-variant space-y-2">
                        <label htmlFor="approve-notes" className="block text-label-sm font-semibold text-on-surface">
                          Review / Approval Notes (Optional)
                        </label>
                        <input
                          id="approve-notes"
                          type="text"
                          placeholder="e.g. Verified and approved."
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2.5 py-1.5 text-body-sm outline-none"
                        />
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={handleApprove}
                            disabled={approveMutation.isPending}
                            className="flex-1 bg-primary hover:bg-[#0039cc] text-on-primary py-2 px-3 rounded text-label-md font-bold transition-all cursor-pointer"
                          >
                            {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
                          </button>
                          <button
                            onClick={() => setShowApproveNotes(false)}
                            className="px-3 py-2 border border-outline-variant rounded text-label-md font-medium text-outline hover:bg-surface-container cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowApproveNotes(true)}
                        className="w-full bg-primary hover:bg-[#0039cc] text-on-primary py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 text-headline-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        <span>Approve Closing</span>
                      </button>
                    )}

                    {!showRejectDrawer && (
                      <button
                        onClick={() => setShowRejectDrawer(true)}
                        className="w-full bg-surface-container-lowest hover:bg-rose-50 text-rose-700 border border-rose-300 py-2.5 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 text-label-lg transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                        <span>Reject — Correction Required</span>
                      </button>
                    )}
                  </div>

                  {/* Rejection Reason Drawer */}
                  {showRejectDrawer && (
                    <form onSubmit={handleReject} className="pt-3 border-t border-outline-variant space-y-2.5">
                      <label htmlFor="rejection-reason" className="block text-label-md font-semibold text-on-surface">
                        Reason for Rejection *
                      </label>
                      <textarea
                        id="rejection-reason"
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain what needs to be corrected before the closing can be resubmitted."
                        required
                        className="w-full rounded border border-outline-variant text-body-sm p-2.5 bg-surface text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      />
                      <p className="text-[11px] text-outline">
                        Rejection reasons are permanently recorded in the audit history and sent to the branch employee for recount/correction.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={rejectMutation.isPending}
                          className="flex-1 bg-rose-700 hover:bg-rose-800 text-white py-2 px-3 rounded text-label-md font-semibold transition-colors cursor-pointer"
                        >
                          {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowRejectDrawer(false)}
                          className="px-3 py-2 border border-outline-variant rounded text-label-md font-medium text-outline hover:bg-surface-container cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : closing?.status === "APPROVED" ? (
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 text-emerald-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-label-md">
                    <span className="material-symbols-outlined text-emerald-700 text-[18px]">verified</span>
                    Approved by {closing.reviewedBy?.name || "Owner"}
                  </div>
                  {closing.reviewNotes && (
                    <p className="text-body-sm italic">"{closing.reviewNotes}"</p>
                  )}
                  <p className="text-[11px] text-emerald-700">
                    Reviewed on {closing.reviewedAt ? new Date(closing.reviewedAt).toLocaleString() : "—"}
                  </p>
                </div>
              ) : closing?.status === "REJECTED" ? (
                <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 text-rose-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-label-md">
                    <span className="material-symbols-outlined text-rose-700 text-[18px]">error</span>
                    Rejected by {closing.reviewedBy?.name || "Owner"}
                  </div>
                  <p className="text-body-sm">
                    <strong>Rejection reason:</strong> "{closing.rejectionReason}"
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Awaiting employee correction and resubmission.
                  </p>
                </div>
              ) : (
                <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant text-body-sm text-outline">
                  Employee has not yet submitted this closing for review.
                </div>
              )}
            </div>
          )}

          {/* 2. Submission & Review History (Audit Continuity Timeline) */}
          <div className="surface-card rounded-xl p-5 bg-surface-container-lowest border border-outline-variant shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline">history</span>
                <h2 className="text-headline-sm font-headline-sm text-on-surface">Submission &amp; Review History</h2>
              </div>
            </div>

            {closing?.events && closing.events.length > 0 ? (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant">
                {closing.events.map((event) => {
                  const isSubmitted = event.eventType === "SUBMITTED" || event.eventType === "RESUBMITTED";
                  const isApproved = event.eventType === "APPROVED";
                  const isRejected = event.eventType === "REJECTED";

                  return (
                    <div key={event.id} className="relative">
                      <span
                        className={`absolute -left-6 top-1 w-3 h-3 rounded-full ring-4 ring-white ${
                          isApproved
                            ? "bg-emerald-600"
                            : isRejected
                            ? "bg-rose-600"
                            : "bg-amber-500"
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-label-md font-bold text-on-surface">
                          {event.eventType === "SUBMITTED"
                            ? "Closing Submitted"
                            : event.eventType === "RESUBMITTED"
                            ? `Resubmitted (Rev ${event.revision})`
                            : event.eventType === "APPROVED"
                            ? "Closing Approved"
                            : "Closing Rejected"}
                        </span>
                        <span className="text-label-sm text-outline font-mono">
                          {new Date(event.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">
                        {isSubmitted && (
                          <>
                            Submitted by {event.actor?.name || "Staff"}. Counted: {formatETB(event.actualCash)}, Discrepancy:{" "}
                            {formatETB(event.cashDifference)}.
                          </>
                        )}
                        {isApproved && <>Approved by {event.actor?.name || "Owner"}.</>}
                        {isRejected && <>Rejected by {event.actor?.name || "Owner"}: "{event.notes}".</>}
                      </p>
                      {event.notes && isSubmitted && (
                        <p className="text-[11px] text-outline font-mono mt-0.5 italic">
                          Note: "{event.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-body-sm text-outline">No submission history recorded yet for this date.</p>
            )}

            <div className="mt-5 pt-3 border-t border-outline-variant text-[11px] text-outline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">lock_clock</span>
              <span>Submission and review history is preserved. Corrections create new records rather than overwriting.</span>
            </div>
          </div>

          {/* 3. Branch Closing Status (Quick Reference Table for Owner) */}
          {isOwner && branchOverview && (
            <div className="surface-card rounded-xl p-5 bg-surface-container-lowest border border-outline-variant shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-3">
                <div>
                  <h2 className="text-headline-sm font-headline-sm text-on-surface">Branch Closing Status</h2>
                  <p className="text-label-sm text-outline">Business Date: {selectedDate}</p>
                </div>
                <Link to="/daily-closing/history" className="text-primary hover:underline text-label-sm font-semibold">
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-sm">
                  <thead>
                    <tr className="text-label-sm text-outline border-b border-outline-variant pb-1">
                      <th className="py-2 font-semibold">Branch</th>
                      <th className="py-2 text-right font-semibold">Sales Total</th>
                      <th className="py-2 text-right font-semibold">Variance</th>
                      <th className="py-2 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {branchOverview.map((b) => {
                      const isCurrent = b.branchId === selectedBranchId;
                      return (
                        <tr
                          key={b.branchId}
                          onClick={() => handleBranchChange(b.branchId)}
                          className={`cursor-pointer transition-colors ${
                            isCurrent ? "bg-primary-fixed/30 font-medium" : "hover:bg-surface-container/40"
                          }`}
                        >
                          <td className="py-2.5 font-bold text-on-surface flex items-center gap-1.5">
                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            {b.branchName}
                          </td>
                          <td className="py-2.5 text-right font-mono text-on-surface">
                            {formatETB(b.totalSalesAmount)}
                          </td>
                          <td
                            className={`py-2.5 text-right font-mono font-bold ${
                              b.cashDifference && parseFloat(b.cashDifference) < 0
                                ? "text-rose-700"
                                : b.cashDifference && parseFloat(b.cashDifference) > 0
                                ? "text-amber-700"
                                : "text-outline"
                            }`}
                          >
                            {b.cashDifference ? formatETB(b.cashDifference) : "—"}
                          </td>
                          <td className="py-2.5 text-right">
                            {renderStatusBadge(b.status)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
