import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getMe } from "../auth/api/auth";
import {
  useTransferDetails,
  useApproveTransfer,
  useRejectTransfer,
  useDispatchTransfer,
} from "./api";

export function TransferDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const user = userResponse?.user;
  const isOwner = user?.role === "OWNER";

  const { data: transfer, isLoading, isError, error } = useTransferDetails(id);

  // Modals state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // Form states
  const [approvalNotes, setApprovalNotes] = useState("");
  const [customApprovedQuantities, setCustomApprovedQuantities] = useState<Record<string, number>>({});
  const [rejectionReason, setRejectionReason] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  const approveMutation = useApproveTransfer();
  const rejectMutation = useRejectTransfer();
  const dispatchMutation = useDispatchTransfer();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-slate-500">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Loading transfer details...</p>
      </div>
    );
  }

  if (isError || !transfer) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-center max-w-lg mx-auto">
          <span className="material-symbols-outlined text-4xl mb-2 text-rose-600">error</span>
          <h2 className="text-lg font-bold mb-1">Transfer Not Found or Access Denied</h2>
          <p className="text-sm text-rose-700 mb-4">
            {(error as any)?.message || "The requested transfer record could not be found or you lack permission to view it."}
          </p>
          <Link
            to="/transfers"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-rose-300 text-rose-700 font-semibold text-sm hover:bg-rose-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Transfers
          </Link>
        </div>
      </div>
    );
  }

  // Handle Approve
  const handleOpenApproveModal = () => {
    setActionError(null);
    setApprovalNotes("");
    const initialMap: Record<string, number> = {};
    transfer.items.forEach((item: any) => {
      initialMap[item.productId] = item.approvedQuantity || item.requestedQuantity;
    });
    setCustomApprovedQuantities(initialMap);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    setActionError(null);
    const itemsPayload = transfer.items.map((item: any) => ({
      productId: item.productId,
      approvedQuantity: customApprovedQuantities[item.productId] || item.requestedQuantity,
    }));

    approveMutation.mutate(
      {
        id: transfer.id,
        payload: {
          notes: approvalNotes.trim() || undefined,
          items: itemsPayload,
        },
      },
      {
        onSuccess: () => {
          setShowApproveModal(false);
        },
        onError: (err: any) => {
          setActionError(err?.message || "Failed to approve transfer.");
        },
      }
    );
  };

  // Handle Reject
  const handleConfirmReject = () => {
    setActionError(null);
    if (!rejectionReason.trim() || rejectionReason.trim().length < 3) {
      setActionError("Please provide a valid rejection reason (minimum 3 characters).");
      return;
    }

    rejectMutation.mutate(
      {
        id: transfer.id,
        payload: {
          reason: rejectionReason.trim(),
        },
      },
      {
        onSuccess: () => {
          setShowRejectModal(false);
        },
        onError: (err: any) => {
          setActionError(err?.message || "Failed to reject transfer.");
        },
      }
    );
  };

  // Handle Dispatch
  const handleConfirmDispatch = () => {
    setActionError(null);
    dispatchMutation.mutate(
      {
        id: transfer.id,
        payload: {
          notes: dispatchNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowDispatchModal(false);
        },
        onError: (err: any) => {
          setActionError(err?.message || "Failed to dispatch transfer.");
        },
      }
    );
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Requested
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[14px]">check</span>
            Approved
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
            Dispatched (In Transit)
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {s}
          </span>
        );
    }
  };

  const isRequested = transfer.status === "REQUESTED";
  const isApproved = transfer.status === "APPROVED";
  const isDispatched = transfer.status === "DISPATCHED";
  const isRejected = transfer.status === "REJECTED";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Link
            to="/transfers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mb-2 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Transfers
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transfer Details</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {transfer.transferNumber}
            </span>
            {getStatusBadge(transfer.status)}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Review the transfer request, authorization, physical stock movement, and audit timeline.
          </p>
        </div>

        {/* State-aware Action Buttons (Owner only) */}
        {isOwner && (
          <div className="flex items-center gap-2.5 shrink-0 self-start">
            {isRequested && (
              <>
                <button
                  onClick={() => {
                    setActionError(null);
                    setRejectionReason("");
                    setShowRejectModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-300 text-rose-700 bg-white hover:bg-rose-50 text-sm font-semibold transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Reject Request
                </button>

                <button
                  onClick={handleOpenApproveModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Approve Transfer
                </button>
              </>
            )}

            {isApproved && (
              <button
                onClick={() => {
                  setActionError(null);
                  setDispatchNotes("");
                  setShowDispatchModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                Dispatch Stock
              </button>
            )}
          </div>
        )}
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-rose-600 text-xl shrink-0">error</span>
          <div>
            <p className="font-semibold">Action Failed</p>
            <p className="mt-0.5">{actionError}</p>
          </div>
        </div>
      )}

      {/* 2. TRANSFER DIRECTION & SUMMARY CARD */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 bg-slate-50 rounded-lg p-4 border border-slate-200/80 flex items-center justify-between gap-4">
            <div className="flex flex-col items-start min-w-[110px]">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Source Branch</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                <span className="text-base font-bold text-slate-900">{transfer.sourceBranch?.name}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center px-2">
              <div className="w-full flex items-center relative">
                <div className="h-0.5 w-full bg-primary/30" />
                <div className="absolute left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1 text-[11px] font-bold text-primary shadow-xs">
                  <span>
                    {transfer.sourceBranch?.code} → {transfer.destinationBranch?.code}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end min-w-[110px]">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Destination Branch</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-bold text-slate-900">{transfer.destinationBranch?.name}</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">store</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x-0 sm:divide-x divide-slate-100">
            <div className="pl-2">
              <span className="text-xs text-slate-500 block">Transfer ID</span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{transfer.transferNumber}</p>
            </div>
            <div className="sm:pl-4">
              <span className="text-xs text-slate-500 block">Requested By</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{transfer.createdBy?.name || "Staff"}</p>
              <span className="text-[11px] text-slate-400">
                {transfer.createdAt ? format(new Date(transfer.createdAt), "MMM d, h:mm a") : "-"}
              </span>
            </div>
            <div className="sm:pl-4">
              <span className="text-xs text-slate-500 block">Decision</span>
              {transfer.approvedBy ? (
                <>
                  <p className="text-sm font-semibold text-emerald-700 mt-0.5">Approved by {transfer.approvedBy.name}</p>
                  <span className="text-[11px] text-slate-400">
                    {transfer.approvedAt ? format(new Date(transfer.approvedAt), "MMM d, h:mm a") : "-"}
                  </span>
                </>
              ) : transfer.rejectedBy ? (
                <>
                  <p className="text-sm font-semibold text-rose-700 mt-0.5">Rejected by {transfer.rejectedBy.name}</p>
                  <span className="text-[11px] text-slate-400">
                    {transfer.rejectedAt ? format(new Date(transfer.rejectedAt), "MMM d, h:mm a") : "-"}
                  </span>
                </>
              ) : (
                <p className="text-sm text-slate-400 mt-0.5">Pending Owner Decision</p>
              )}
            </div>
            <div className="sm:pl-4">
              <span className="text-xs text-slate-500 block">Current State</span>
              <p className="text-sm font-bold mt-0.5 text-slate-900">{transfer.status}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL LIFECYCLE PROGRESS STEPPER */}
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Transfer Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Step 1: Requested */}
          <div className="flex flex-col bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">check</span>
              </span>
              <span className="text-xs font-semibold text-emerald-700">Step 1</span>
            </div>
            <span className="text-sm font-bold text-slate-900">Requested</span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {transfer.createdAt ? format(new Date(transfer.createdAt), "MMM d, h:mm a") : "-"}
            </span>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              Submitted by {transfer.createdBy?.name || "Staff"}.
            </p>
          </div>

          {/* Step 2: Approved / Rejected */}
          <div
            className={`flex flex-col p-3 rounded-lg border ${
              isApproved || isDispatched
                ? "bg-slate-50 border-slate-200"
                : isRejected
                ? "bg-rose-50 border-rose-200"
                : isRequested
                ? "bg-amber-50/60 border-amber-200 border-2"
                : "bg-slate-50/40 border-slate-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                  isApproved || isDispatched
                    ? "bg-emerald-600"
                    : isRejected
                    ? "bg-rose-600"
                    : "bg-amber-500"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isApproved || isDispatched ? "check" : isRejected ? "close" : "hourglass_empty"}
                </span>
              </span>
              <span
                className={`text-xs font-semibold ${
                  isApproved || isDispatched
                    ? "text-emerald-700"
                    : isRejected
                    ? "text-rose-700"
                    : "text-amber-700"
                }`}
              >
                Step 2 {isRequested ? "· Active" : ""}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {isRejected ? "Rejected" : isApproved || isDispatched ? "Approved" : "Approval Pending"}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {transfer.approvedAt
                ? format(new Date(transfer.approvedAt), "MMM d, h:mm a")
                : transfer.rejectedAt
                ? format(new Date(transfer.rejectedAt), "MMM d, h:mm a")
                : "Awaiting Owner"}
            </span>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {isApproved || isDispatched
                ? `Owner approved requested stock. Note: stock not yet moved.`
                : isRejected
                ? `Request rejected by Owner.`
                : `Owner decision required.`}
            </p>
          </div>

          {/* Step 3: Dispatched */}
          <div
            className={`flex flex-col p-3 rounded-lg border ${
              isDispatched
                ? "bg-blue-50 border-blue-200 border-2"
                : isApproved
                ? "bg-amber-50/60 border-amber-200 border-2"
                : "bg-slate-50/40 border-slate-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                  isDispatched ? "bg-blue-600" : "bg-slate-300 text-slate-600"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isDispatched ? "local_shipping" : "arrow_forward"}
                </span>
              </span>
              <span className={`text-xs font-semibold ${isDispatched ? "text-blue-700 font-bold" : "text-slate-500"}`}>
                Step 3 {isApproved ? "· Next" : isDispatched ? "· Active" : ""}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900">Dispatched</span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {transfer.dispatchedAt ? format(new Date(transfer.dispatchedAt), "MMM d, h:mm a") : "Pending dispatch"}
            </span>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {isDispatched
                ? `Stock deducted from ${transfer.sourceBranch?.name}. Goods in transit.`
                : `Awaiting physical dispatch from source branch.`}
            </p>
          </div>

          {/* Step 4: Received (Future Prompt 2) */}
          <div className="flex flex-col bg-slate-50/30 p-3 rounded-lg border border-dashed border-slate-200 opacity-60">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span className="text-xs font-semibold text-slate-400">Step 4</span>
            </div>
            <span className="text-sm font-bold text-slate-400">Received</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Pending receipt</span>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Destination branch records physical receipt.
            </p>
          </div>

          {/* Step 5: Completed (Future Prompt 2) */}
          <div className="flex flex-col bg-slate-50/30 p-3 rounded-lg border border-dashed border-slate-200 opacity-60">
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                5
              </span>
              <span className="text-xs font-semibold text-slate-400">Step 5</span>
            </div>
            <span className="text-sm font-bold text-slate-400">Completed</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Pending</span>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Final transfer closure.
            </p>
          </div>
        </div>
      </section>

      {/* 4. TRANSFER ITEMS TABLE */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Transfer Items</h2>
            <p className="text-xs text-slate-500">
              Itemized line items verifying request, authorization, and dispatch quantities.
            </p>
          </div>
          <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 self-start">
            <span className="material-symbols-outlined text-[16px] text-primary">inventory_2</span>
            <span>{transfer.items.length} {transfer.items.length === 1 ? "Product Line" : "Product Lines"}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-center">Source Avail</th>
                <th className="py-3 px-4 text-right">Requested</th>
                <th className="py-3 px-4 text-right">Approved</th>
                <th className="py-3 px-4 text-right">Dispatched</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfer.items.map((item: any) => {
                const reqQty = item.requestedQuantity;
                const appQty = item.approvedQuantity;
                const dispQty = item.dispatchedQuantity;
                const sourceAvail = item.sourceAvailableQuantity ?? 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.product?.name || "Product"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {item.product?.sku || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.unit?.name || "Piece"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {sourceAvail} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                      {reqQty}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      {appQty !== null && appQty !== undefined ? (
                        <span className={appQty < reqQty ? "text-amber-600 font-bold" : "text-emerald-700 font-bold"}>
                          {appQty}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {dispQty !== null && dispQty !== undefined ? (
                        <span className="text-blue-700 font-bold">{dispQty}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isDispatched ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Dispatched · {dispQty}/{appQty || reqQty}
                        </span>
                      ) : isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Approved · {appQty}/{reqQty}
                        </span>
                      ) : isRejected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Approval
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-600">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0">verified_user</span>
          <span>
            Requested, approved, and dispatched quantities are preserved. Immutable ledger guarantees.
          </span>
        </div>
      </section>

      {/* 5. OPERATIONAL DETAILS & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Dispatch details or Rejection details or Request Notes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dispatch Notice Card */}
          {isDispatched && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">local_shipping</span>
                  <h3 className="text-base font-bold text-slate-900">Dispatch Details</h3>
                </div>
                <span className="text-xs text-slate-500">
                  {transfer.dispatchedAt ? format(new Date(transfer.dispatchedAt), "MMM d, yyyy h:mm a") : "-"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Dispatched By</span>
                  <span className="text-sm font-semibold text-slate-900">{transfer.dispatchedBy?.name || "Owner"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Source Branch</span>
                  <span className="text-sm font-semibold text-slate-900">{transfer.sourceBranch?.name}</span>
                </div>
              </div>
              {transfer.dispatchNotes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold block text-slate-900 mb-0.5">Dispatch Notes:</span>
                  {transfer.dispatchNotes}
                </div>
              )}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">info</span>
                <span>Stock has been deducted from source available inventory and is currently in transit.</span>
              </div>
            </div>
          )}

          {/* Rejection Notice Card */}
          {isRejected && (
            <div className="bg-rose-50 rounded-xl border border-rose-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[20px]">cancel</span>
                  <h3 className="text-base font-bold text-rose-900">Rejection Details</h3>
                </div>
                <span className="text-xs text-rose-700">
                  {transfer.rejectedAt ? format(new Date(transfer.rejectedAt), "MMM d, yyyy h:mm a") : "-"}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-rose-600 block">Rejected By:</span>
                <span className="text-sm font-semibold text-rose-900">{transfer.rejectedBy?.name || "Owner"}</span>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-rose-200">
                <span className="text-xs font-bold text-rose-900 block mb-1">Reason for Rejection:</span>
                <p className="text-sm text-slate-800 italic">"{transfer.rejectionReason}"</p>
              </div>
              <p className="text-xs text-rose-600">
                Rejected requests remain permanently in history. No stock was deducted or transferred.
              </p>
            </div>
          )}

          {/* Approval Notes Card */}
          {transfer.approvalNotes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                Approval Notes
              </h3>
              <p className="text-xs text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                {transfer.approvalNotes}
              </p>
            </div>
          )}

          {/* Request Notes Card */}
          {transfer.notes && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">notes</span>
                Request Creator Notes
              </h3>
              <p className="text-xs text-slate-700 p-3 rounded-lg bg-slate-50 border border-slate-200">
                {transfer.notes}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Audit Timeline & Cost Basis */}
        <div className="lg:col-span-5 space-y-6">
          {/* Transfer History / Timeline Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">history</span>
              Transfer History
            </h3>
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {transfer.events?.map((ev: any) => (
                <div key={ev.id} className="relative">
                  <div
                    className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      ev.eventType === "DISPATCHED"
                        ? "bg-blue-600"
                        : ev.eventType === "APPROVED"
                        ? "bg-emerald-600"
                        : ev.eventType === "REJECTED"
                        ? "bg-rose-600"
                        : "bg-primary"
                    }`}
                  />
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-900">{ev.eventType}</span>
                    <span className="text-slate-400">
                      {ev.createdAt ? format(new Date(ev.createdAt), "h:mm a") : "-"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {ev.notes || `Event triggered by ${ev.actor?.name || "Staff"}`}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    By {ev.actor?.name || "Staff"} · {ev.createdAt ? format(new Date(ev.createdAt), "MMM d, yyyy") : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Cost Basis (Owner only) */}
          {isOwner && transfer.estimatedTotalCost !== undefined && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Estimated Cost Basis
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Owner view · Source WAC
                </span>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-900">
                    ETB {Number(transfer.estimatedTotalCost).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Valuation based on Weighted Average Cost (WAC) at source branch. Stock movements preserve historical cost.
                </p>
              </div>
            </div>
          )}

          {/* Related Operational Views */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Related Operational Views
            </span>
            <Link
              to="/inventory/movements"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 hover:text-primary transition-colors border border-slate-200/60"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">timeline</span>
                View Related Stock Movements
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
            <Link
              to="/inventory"
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 hover:text-primary transition-colors border border-slate-200/60"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-slate-500">storefront</span>
                Current Branch Inventory
              </span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
                <h3 className="text-lg font-bold text-slate-900">Approve Transfer Request</h3>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Authorize stock movement from <strong>{transfer.sourceBranch?.name}</strong> to{" "}
              <strong>{transfer.destinationBranch?.name}</strong>. Approval authorizes the transfer but does NOT deduct stock until physical dispatch.
            </p>

            {/* Line items quantity adjustment */}
            <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Quantities to Approve (Partial Approval Allowed)
              </span>
              {transfer.items.map((item: any) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 text-xs bg-white p-2 rounded border border-slate-200">
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 block truncate">{item.product?.name}</span>
                    <span className="text-slate-500 text-[11px]">Requested: {item.requestedQuantity} units</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label className="text-[11px] text-slate-500">Approve:</label>
                    <input
                      type="number"
                      min="1"
                      max={item.requestedQuantity}
                      value={customApprovedQuantities[item.productId] ?? item.requestedQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 1;
                        setCustomApprovedQuantities({
                          ...customApprovedQuantities,
                          [item.productId]: Math.min(val, item.requestedQuantity),
                        });
                      }}
                      className="w-16 px-2 py-1 text-right border border-slate-200 rounded font-bold text-slate-900 focus:border-primary outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Approval Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Optional notes for destination branch or audit..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={approveMutation.isPending}
                onClick={handleConfirmApprove}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {approveMutation.isPending ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-2xl">cancel</span>
                <h3 className="text-lg font-bold text-slate-900">Reject Transfer Request</h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Rejecting this request will permanently prevent it from being dispatched. The request and rejection reason will be preserved in history.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Reason for Rejection <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State the operational reason for rejecting this transfer..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectMutation.isPending || !rejectionReason.trim()}
                onClick={handleConfirmReject}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISPATCH MODAL */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">local_shipping</span>
                <h3 className="text-lg font-bold text-slate-900">Dispatch Stock from Source</h3>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">inventory</span>
                Immediate Inventory Deduction
              </p>
              <p>
                Dispatching will record an immutable <strong>TRANSFER_OUT</strong> ledger movement and deduct stock from{" "}
                <strong>{transfer.sourceBranch?.name}</strong>. Goods will be in transit until received at destination.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Quantities Being Dispatched
              </span>
              {transfer.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-1 border-b border-slate-200/50 last:border-0">
                  <span className="font-medium text-slate-800">{item.product?.name}</span>
                  <span className="font-bold text-slate-900">
                    {item.approvedQuantity || item.requestedQuantity} {item.unit?.name || "units"}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Dispatch Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="Driver name, vehicle number, or dispatch notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dispatchMutation.isPending}
                onClick={handleConfirmDispatch}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {dispatchMutation.isPending ? "Dispatching..." : "Confirm Physical Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
