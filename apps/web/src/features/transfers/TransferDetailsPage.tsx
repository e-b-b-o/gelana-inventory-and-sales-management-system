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
  useReceiveTransfer,
  useResolveDiscrepancy,
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
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Form states
  const [approvalNotes, setApprovalNotes] = useState("");
  const [customApprovedQuantities, setCustomApprovedQuantities] = useState<Record<string, number>>({});
  const [rejectionReason, setRejectionReason] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [receivingNotes, setReceivingNotes] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [receiveItemData, setReceiveItemData] = useState<
    Record<string, { receivedQuantity: number; damagedQuantity: number; discrepancyReason: string }>
  >({});
  const [actionError, setActionError] = useState<string | null>(null);

  const approveMutation = useApproveTransfer();
  const rejectMutation = useRejectTransfer();
  const dispatchMutation = useDispatchTransfer();
  const receiveMutation = useReceiveTransfer();
  const resolveMutation = useResolveDiscrepancy();

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

  const isDestinationEmployee = user?.role === "EMPLOYEE" && user?.branchId === transfer.destinationBranchId;
  const canReceive = transfer.status === "DISPATCHED" && (isOwner || isDestinationEmployee);
  const canResolve = transfer.status === "DISCREPANCY" && isOwner;

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

  // Handle Open Receive
  const handleOpenReceiveModal = () => {
    setActionError(null);
    setReceivingNotes("");
    const initialMap: Record<
      string,
      { receivedQuantity: number; damagedQuantity: number; discrepancyReason: string }
    > = {};
    transfer.items.forEach((item: any) => {
      const dispatchedQty = item.dispatchedQuantity ?? item.approvedQuantity ?? item.requestedQuantity ?? 0;
      initialMap[item.id] = {
        receivedQuantity: dispatchedQty,
        damagedQuantity: 0,
        discrepancyReason: "",
      };
    });
    setReceiveItemData(initialMap);
    setShowReceiveModal(true);
  };

  // Handle Confirm Receive
  const handleConfirmReceive = () => {
    setActionError(null);
    for (const item of transfer.items) {
      const data = receiveItemData[item.id];
      if (!data) continue;
      const dispatchedQty = item.dispatchedQuantity ?? 0;
      if (data.receivedQuantity < 0 || data.damagedQuantity < 0) {
        setActionError(`Quantities cannot be negative for ${item.product?.name}`);
        return;
      }
      if (data.receivedQuantity + data.damagedQuantity > dispatchedQty) {
        setActionError(
          `Total received and damaged quantity (${data.receivedQuantity + data.damagedQuantity}) cannot exceed dispatched quantity (${dispatchedQty}) for ${item.product?.name}`
        );
        return;
      }
      const missing = dispatchedQty - (data.receivedQuantity + data.damagedQuantity);
      if ((missing > 0 || data.damagedQuantity > 0) && !data.discrepancyReason.trim() && !receivingNotes.trim()) {
        setActionError(`Please provide a discrepancy explanation for ${item.product?.name}`);
        return;
      }
    }

    const payloadItems = transfer.items.map((item: any) => {
      const data = receiveItemData[item.id] || {
        receivedQuantity: item.dispatchedQuantity ?? 0,
        damagedQuantity: 0,
        discrepancyReason: "",
      };
      return {
        itemId: item.id,
        receivedQuantity: data.receivedQuantity,
        damagedQuantity: data.damagedQuantity,
        discrepancyReason: data.discrepancyReason.trim() || undefined,
      };
    });

    receiveMutation.mutate(
      {
        id: transfer.id,
        payload: {
          items: payloadItems,
          notes: receivingNotes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setShowReceiveModal(false);
        },
        onError: (err: any) => {
          setActionError(err?.message || "Failed to receive transfer.");
        },
      }
    );
  };

  // Handle Confirm Resolve Discrepancy
  const handleConfirmResolve = () => {
    setActionError(null);
    if (!resolutionNotes.trim()) {
      setActionError("Please provide resolution notes explaining how this discrepancy was reviewed and closed.");
      return;
    }

    resolveMutation.mutate(
      {
        id: transfer.id,
        payload: {
          resolutionNotes: resolutionNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          setShowResolveModal(false);
        },
        onError: (err: any) => {
          setActionError(err?.message || "Failed to resolve discrepancy.");
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
      case "DISCREPANCY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF9C3] text-[#A16207] border border-[#E5DCBE]">
            <span className="w-2 h-2 rounded-full bg-[#A16207]" />
            Received — Discrepancy
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF8F1] text-[#0D824C] border border-[#A7E3C5]">
            <span className="material-symbols-outlined text-[14px]">check</span>
            Completed
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
  const isDiscrepancy = transfer.status === "DISCREPANCY";
  const isCompleted = transfer.status === "COMPLETED";
  const isRejected = transfer.status === "REJECTED";

  return (
    <div className="space-y-6">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Transfer Details</h1>
            <span className="px-2.5 py-0.5 rounded font-mono text-label-md font-label-md bg-surface-container-high text-on-surface border border-outline-variant">
              {transfer.transferNumber}
            </span>
            {getStatusBadge(transfer.status)}
          </div>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Review the transfer request, movement, received quantities, and audit trail.
          </p>
        </div>

        {/* State-aware Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
          {/* Owner actions for Requested */}
          {isOwner && isRequested && (
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

          {/* Owner action for Approved */}
          {isOwner && isApproved && (
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

          {/* Receive Action: Owner or authorized Destination Employee */}
          {canReceive && (
            <button
              onClick={handleOpenReceiveModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">archive</span>
              Receive Stock
            </button>
          )}

          {/* Review / Resolve Discrepancy: Owner only */}
          {canResolve && (
            <button
              onClick={() => {
                setActionError(null);
                setResolutionNotes("");
                setShowResolveModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">assignment_late</span>
              Review Discrepancy
            </button>
          )}
        </div>
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
      <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Source to Destination Route Visual */}
          <div className="lg:col-span-6 bg-slate-50 rounded-lg p-4 border border-slate-200/80">
            <div className="flex items-center justify-between gap-3">
              {/* Source Branch */}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Source Branch
                </span>
                <div className="flex items-center gap-1.5 mt-1 min-w-0">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                    storefront
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 truncate" title={transfer.sourceBranch?.name}>
                    {transfer.sourceBranch?.name}
                  </span>
                </div>
                {transfer.sourceBranch?.code && (
                  <span className="text-[11px] font-mono text-slate-400 font-medium block mt-0.5">
                    {transfer.sourceBranch.code}
                  </span>
                )}
              </div>

              {/* Centered Directional Indicator */}
              <div className="shrink-0 flex flex-col items-center justify-center px-2">
                <div className="flex items-center gap-1 text-primary">
                  <div className="w-3 sm:w-6 h-0.5 bg-primary/20" />
                  <span className="w-7 h-7 rounded-full bg-white border border-primary/20 shadow-xs flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </span>
                  <div className="w-3 sm:w-6 h-0.5 bg-primary/20" />
                </div>
                <span className="text-[10px] font-mono font-bold text-primary mt-1 whitespace-nowrap">
                  {transfer.sourceBranch?.code} → {transfer.destinationBranch?.code}
                </span>
              </div>

              {/* Destination Branch */}
              <div className="flex-1 min-w-0 text-right">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Destination Branch
                </span>
                <div className="flex items-center justify-end gap-1.5 mt-1 min-w-0">
                  <span className="text-sm sm:text-base font-bold text-slate-900 truncate" title={transfer.destinationBranch?.name}>
                    {transfer.destinationBranch?.name}
                  </span>
                  <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">
                    store
                  </span>
                </div>
                {transfer.destinationBranch?.code && (
                  <span className="text-[11px] font-mono text-slate-400 font-medium block mt-0.5">
                    {transfer.destinationBranch.code}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Transfer Summary Metadata */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x-0 sm:divide-x divide-slate-100">
            <div className="pl-0 sm:pl-2">
              <span className="text-xs text-slate-500 block">Transfer ID</span>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{transfer.transferNumber}</p>
            </div>
            <div className="sm:pl-3">
              <span className="text-xs text-slate-500 block">Requested By</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">{transfer.createdBy?.name || "Staff"}</p>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                {transfer.createdAt ? format(new Date(transfer.createdAt), "MMM d, h:mm a") : "-"}
              </span>
            </div>
            <div className="sm:pl-3">
              <span className="text-xs text-slate-500 block">Decision</span>
              {transfer.approvedBy ? (
                <>
                  <p className="text-sm font-semibold text-emerald-700 mt-0.5 truncate">
                    Approved by {transfer.approvedBy.name}
                  </p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {transfer.approvedAt ? format(new Date(transfer.approvedAt), "MMM d, h:mm a") : "-"}
                  </span>
                </>
              ) : transfer.rejectedBy ? (
                <>
                  <p className="text-sm font-semibold text-rose-700 mt-0.5 truncate">
                    Rejected by {transfer.rejectedBy.name}
                  </p>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {transfer.rejectedAt ? format(new Date(transfer.rejectedAt), "MMM d, h:mm a") : "-"}
                  </span>
                </>
              ) : (
                <p className="text-sm text-slate-400 mt-0.5">Pending Decision</p>
              )}
            </div>
            <div className="sm:pl-3">
              <span className="text-xs text-slate-500 block">Current State</span>
              <p className={`text-sm font-bold mt-0.5 ${
                isDiscrepancy ? "text-[#A16207]" : isCompleted ? "text-[#0D824C]" : "text-slate-900"
              }`}>
                {isDiscrepancy ? "Received — Discrepancy" : transfer.status}
              </p>
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
              isApproved || isDispatched || isDiscrepancy || isCompleted
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
                  isApproved || isDispatched || isDiscrepancy || isCompleted
                    ? "bg-emerald-600"
                    : isRejected
                    ? "bg-rose-600"
                    : "bg-amber-500"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isApproved || isDispatched || isDiscrepancy || isCompleted ? "check" : isRejected ? "close" : "hourglass_empty"}
                </span>
              </span>
              <span
                className={`text-xs font-semibold ${
                  isApproved || isDispatched || isDiscrepancy || isCompleted
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
              {isRejected ? "Rejected" : "Approved"}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {transfer.approvedAt
                ? format(new Date(transfer.approvedAt), "MMM d, h:mm a")
                : transfer.rejectedAt
                ? format(new Date(transfer.rejectedAt), "MMM d, h:mm a")
                : "Awaiting Owner"}
            </span>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {isApproved || isDispatched || isDiscrepancy || isCompleted
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
                : isDiscrepancy || isCompleted
                ? "bg-slate-50 border-slate-200"
                : isApproved
                ? "bg-amber-50/60 border-amber-200 border-2"
                : "bg-slate-50/40 border-slate-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                  isDiscrepancy || isCompleted
                    ? "bg-emerald-600"
                    : isDispatched
                    ? "bg-blue-600"
                    : "bg-slate-300 text-slate-600"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isDiscrepancy || isCompleted ? "check" : isDispatched ? "local_shipping" : "arrow_forward"}
                </span>
              </span>
              <span className={`text-xs font-semibold ${
                isDiscrepancy || isCompleted ? "text-emerald-700" : isDispatched ? "text-blue-700 font-bold" : "text-slate-500"
              }`}>
                Step 3 {isApproved ? "· Next" : isDispatched ? "· Active" : ""}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900">Dispatched</span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {transfer.dispatchedAt ? format(new Date(transfer.dispatchedAt), "MMM d, h:mm a") : "Pending dispatch"}
            </span>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {isDispatched || isDiscrepancy || isCompleted
                ? `Stock deducted from ${transfer.sourceBranch?.name}. Goods in transit.`
                : `Awaiting physical dispatch from source branch.`}
            </p>
          </div>

          {/* Step 4: Received */}
          <div
            className={`flex flex-col p-3 rounded-lg ${
              isDiscrepancy
                ? "bg-[#FFF8E7] border-2 border-[#A16207] shadow-xs"
                : isCompleted
                ? "bg-slate-50 border border-slate-200"
                : isDispatched
                ? "bg-amber-50/60 border-amber-200 border-2"
                : "bg-slate-50/40 border border-dashed border-slate-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                  isDiscrepancy
                    ? "bg-[#A16207]"
                    : isCompleted
                    ? "bg-emerald-600"
                    : isDispatched
                    ? "bg-amber-500"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isDiscrepancy ? "warning" : isCompleted ? "check" : isDispatched ? "hourglass_empty" : "archive"}
                </span>
              </span>
              <span
                className={`text-xs font-semibold ${
                  isDiscrepancy
                    ? "text-[#A16207] font-bold"
                    : isCompleted
                    ? "text-emerald-700"
                    : isDispatched
                    ? "text-amber-700 font-bold"
                    : "text-slate-400"
                }`}
              >
                Step 4 {isDispatched ? "· Next" : isDiscrepancy ? "· Active" : ""}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900">Received</span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {transfer.receivedAt ? format(new Date(transfer.receivedAt), "MMM d, h:mm a") : "Pending receipt"}
            </span>
            <p className={`text-[11px] mt-1 leading-snug ${
              isDiscrepancy ? "text-[#A16207] font-semibold" : "text-slate-600"
            }`}>
              {isDiscrepancy
                ? "Destination branch recorded count. Discrepancy noted."
                : isCompleted
                ? "Destination branch recorded full physical stock receipt."
                : "Destination branch records physical receipt."}
            </p>
          </div>

          {/* Step 5: Completed */}
          <div
            className={`flex flex-col p-3 rounded-lg ${
              isCompleted
                ? "bg-slate-50 border border-slate-200"
                : isDiscrepancy
                ? "bg-amber-50/40 border border-dashed border-amber-300"
                : "bg-slate-50/30 border border-dashed border-slate-200 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${
                  isCompleted ? "bg-emerald-600" : isDiscrepancy ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {isCompleted ? "check" : isDiscrepancy ? "hourglass_empty" : "verified"}
                </span>
              </span>
              <span
                className={`text-xs font-semibold ${
                  isCompleted ? "text-emerald-700 font-bold" : isDiscrepancy ? "text-amber-700" : "text-slate-400"
                }`}
              >
                Step 5 {isDiscrepancy ? "· Pending Review" : ""}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900">Completed</span>
            <span className="text-[11px] text-slate-500 mt-0.5">
              {transfer.closedAt ? format(new Date(transfer.closedAt), "MMM d, h:mm a") : "Pending"}
            </span>
            <p className="text-[11px] text-slate-600 mt-1 leading-snug">
              {isCompleted
                ? "Transfer successfully verified and finalized."
                : isDiscrepancy
                ? "Pending Owner review and discrepancy resolution."
                : "Final transfer closure."}
            </p>
          </div>
        </div>
      </section>

      {/* PROMINENT DISCREPANCY INVESTIGATION & EXPLANATION CARD */}
      {(transfer.hasDiscrepancy || isDiscrepancy) && (
        <section className="bg-[#FFF8E7] rounded-xl border border-[#E5DCBE] p-5 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DCBE]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FEF9C3] border border-[#A16207]/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#A16207] text-[24px]">report_problem</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Transfer Discrepancy Flagged
                </h3>
                <p className="text-xs text-[#666255] mt-0.5">
                  Physical receiving count at {transfer.destinationBranch?.name} does not match the quantity dispatched by {transfer.sourceBranch?.name}.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-[#FEF9C3] text-[#A16207]"
              }`}>
                {isCompleted ? "Status: Discrepancy Resolved" : "Status: Pending Owner Review"}
              </span>
              {canResolve && (
                <button
                  onClick={() => {
                    setActionError(null);
                    setResolutionNotes("");
                    setShowResolveModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">assignment_late</span>
                  Resolve Discrepancy
                </button>
              )}
            </div>
          </div>

          {/* Breakdown for each item with discrepancy */}
          <div className="space-y-3">
            {transfer.items
              .filter((it: any) => (it.missingQuantity ?? 0) > 0 || (it.damagedQuantity ?? 0) > 0)
              .map((it: any) => {
                const dispatched = it.dispatchedQuantity ?? 0;
                const received = it.receivedQuantity ?? 0;
                const damaged = it.damagedQuantity ?? 0;
                const missing = it.missingQuantity ?? 0;
                const diff = -(damaged + missing);

                return (
                  <div key={it.id} className="bg-white p-4 rounded-lg border border-[#E5DCBE] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{it.product?.name}</span>
                        <span className="text-xs font-mono text-slate-500 ml-2">SKU: {it.product?.sku || "-"}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200">
                          Dispatched: <strong>{dispatched}</strong>
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-50 border border-slate-200">
                          Received Good: <strong className="text-emerald-700">{received}</strong>
                        </span>
                        {damaged > 0 && (
                          <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Damaged: <strong>{damaged}</strong>
                          </span>
                        )}
                        {missing > 0 && (
                          <span className="px-2 py-1 rounded bg-rose-50 text-rose-800 border border-rose-200">
                            Missing: <strong>{missing}</strong>
                          </span>
                        )}
                        <span className="px-2 py-1 rounded bg-[#FEE4E2] text-[#D92D20] font-bold border border-[#D92D20]/20">
                          Total Difference: {diff}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-800">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">Explanation / Reason:</span>
                        <span>Reported by {transfer.receivedBy?.name || "Destination Staff"}</span>
                        {transfer.receivedAt && (
                          <span>• {format(new Date(transfer.receivedAt), "MMM d, yyyy h:mm a")}</span>
                        )}
                      </div>
                      <p className="italic font-medium">"{it.discrepancyReason || transfer.receivingNotes || "Discrepancy noted during receiving"}"</p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* If resolved, display resolution details */}
          {transfer.discrepancyResolutionNotes && (
            <div className="bg-emerald-50 p-3.5 rounded-lg border border-emerald-200 text-xs text-emerald-900">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Resolution by Owner ({transfer.discrepancyResolvedBy?.name || "Owner"} · {transfer.discrepancyResolvedAt ? format(new Date(transfer.discrepancyResolvedAt), "MMM d, yyyy h:mm a") : ""}):
              </span>
              <p className="italic">{transfer.discrepancyResolutionNotes}</p>
            </div>
          )}
        </section>
      )}

      {/* 4. TRANSFER ITEMS TABLE */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Transfer Items</h2>
            <p className="text-xs text-slate-500">
              Itemized line items verifying request, authorization, physical dispatch, and receiving count.
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
                <th className="py-3 px-4 text-right">Received</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfer.items.map((item: any) => {
                const reqQty = item.requestedQuantity;
                const appQty = item.approvedQuantity;
                const dispQty = item.dispatchedQuantity;
                const recQty = item.receivedQuantity;
                const damQty = item.damagedQuantity ?? 0;
                const misQty = item.missingQuantity ?? 0;
                const sourceAvail = item.sourceAvailableQuantity ?? 0;
                const hasItemDiscrepancy = damQty > 0 || misQty > 0;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/50 ${
                      hasItemDiscrepancy ? "bg-[#FFF8E7]/40 border-l-4 border-l-[#A16207]" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{item.product?.name || "Product"}</span>
                        {hasItemDiscrepancy && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF9C3] text-[#A16207]">
                            Discrepancy
                          </span>
                        )}
                      </div>
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
                    <td className="py-3.5 px-4 text-right font-bold">
                      {recQty !== null && recQty !== undefined ? (
                        <span className={hasItemDiscrepancy ? "text-[#ba1a1a]" : "text-slate-900"}>
                          {recQty}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {hasItemDiscrepancy ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEE4E2] text-[#D92D20]">
                          <span className="material-symbols-outlined text-[13px]">priority_high</span>
                          Discrepancy: -{damQty + misQty} Pcs
                        </span>
                      ) : isCompleted || (recQty !== null && recQty !== undefined) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EBF8F1] text-[#0D824C]">
                          <span className="material-symbols-outlined text-[13px]">check</span>
                          Complete · {recQty}/{dispQty}
                        </span>
                      ) : isDispatched ? (
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
            Requested, approved, dispatched, and received quantities are preserved. Immutable ledger guarantees.
          </span>
        </div>
      </section>

      {/* 5. OPERATIONAL DETAILS & TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Operational Records */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dispatch Notice Card */}
          {(isDispatched || isDiscrepancy || isCompleted) && transfer.dispatchedAt && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600 text-[20px]">local_shipping</span>
                  <h3 className="text-base font-bold text-slate-900">Dispatch Details</h3>
                </div>
                <span className="text-xs text-slate-500">
                  {format(new Date(transfer.dispatchedAt), "MMM d, yyyy h:mm a")}
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
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 text-xs">
                <p className="font-medium text-slate-700 mb-1.5">{transfer.sourceBranch?.name} stock decreased by dispatched quantities:</p>
                <div className="flex flex-wrap gap-2">
                  {transfer.items.map((item: any) => (
                    <span key={item.id} className="px-2 py-0.5 rounded bg-white text-rose-700 font-mono font-semibold border border-slate-200">
                      -{item.dispatchedQuantity || item.approvedQuantity || item.requestedQuantity} {item.unit?.name || "units"} ({item.product?.name})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Receiving Notice Card */}
          {transfer.receivedAt && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0D824C] text-[20px]">archive</span>
                  <h3 className="text-base font-bold text-slate-900">Receiving Details</h3>
                </div>
                <span className="text-xs text-slate-500">
                  {format(new Date(transfer.receivedAt), "MMM d, yyyy h:mm a")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Received By</span>
                  <span className="text-sm font-semibold text-slate-900">{transfer.receivedBy?.name || "Staff"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Destination Branch</span>
                  <span className="text-sm font-semibold text-slate-900">{transfer.destinationBranch?.name}</span>
                </div>
              </div>
              {transfer.receivingNotes && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold block text-slate-900 mb-0.5">Receiving Notes:</span>
                  {transfer.receivingNotes}
                </div>
              )}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60 text-xs">
                <p className="font-medium text-slate-700 mb-1.5">{transfer.destinationBranch?.name} stock increased by quantities received:</p>
                <div className="flex flex-wrap gap-2">
                  {transfer.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-white text-[#0D824C] font-mono font-semibold border border-slate-200">
                        +{item.receivedQuantity ?? 0} {item.unit?.name || "units"} ({item.product?.name})
                      </span>
                      {(item.damagedQuantity ?? 0) > 0 && (
                        <span className="px-2 py-0.5 rounded bg-[#FEF9C3] text-[#A16207] font-mono font-bold border border-[#E5DCBE]">
                          +{item.damagedQuantity} Quarantined
                        </span>
                      )}
                    </div>
                  ))}
                </div>
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
                      ev.eventType === "DISCREPANCY"
                        ? "bg-[#A16207]"
                        : ev.eventType === "DISCREPANCY_RESOLVED" || ev.eventType === "RECEIVED"
                        ? "bg-[#0D824C]"
                        : ev.eventType === "DISPATCHED"
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

      {/* RECEIVE MODAL */}
      {showReceiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">archive</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Receive Stock at {transfer.destinationBranch?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 shrink-0">
              Count goods received at destination branch. Good, sellable stock will immediately increase available inventory via{" "}
              <strong>TRANSFER_IN</strong>. Any damaged items are automatically quarantined. Missing items are accounted for in the discrepancy audit.
            </p>

            {/* Line items input */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-1 border border-slate-200 rounded-lg p-3 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Item-Level Physical Receiving Count
              </span>

              {transfer.items.map((item: any) => {
                const dispatchedQty = item.dispatchedQuantity ?? 0;
                const row = receiveItemData[item.id] || {
                  receivedQuantity: dispatchedQty,
                  damagedQuantity: 0,
                  discrepancyReason: "",
                };
                const totalAccounted = row.receivedQuantity + row.damagedQuantity;
                const missing = dispatchedQty - totalAccounted;
                const hasDiscrepancy = missing > 0 || row.damagedQuantity > 0;
                const isOver = totalAccounted > dispatchedQty;

                return (
                  <div
                    key={item.id}
                    className={`bg-white p-3 rounded-lg border text-xs space-y-2.5 transition-colors ${
                      isOver
                        ? "border-rose-300 bg-rose-50/20"
                        : hasDiscrepancy
                        ? "border-amber-300 bg-amber-50/20"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 block">{item.product?.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Dispatched: <strong>{dispatchedQty}</strong> {item.unit?.name || "units"}
                        </span>
                      </div>

                      {/* Inputs */}
                      <div className="flex items-center gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-emerald-800 block">
                            Good Qty
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={dispatchedQty}
                            value={row.receivedQuantity}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              setReceiveItemData({
                                ...receiveItemData,
                                [item.id]: {
                                  ...row,
                                  receivedQuantity: val,
                                },
                              });
                            }}
                            className="w-18 px-2 py-1 text-right border border-slate-200 rounded font-bold text-slate-900 focus:border-emerald-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-amber-800 block">
                            Damaged Qty
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={dispatchedQty}
                            value={row.damagedQuantity}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              setReceiveItemData({
                                ...receiveItemData,
                                [item.id]: {
                                  ...row,
                                  damagedQuantity: val,
                                },
                              });
                            }}
                            className="w-18 px-2 py-1 text-right border border-slate-200 rounded font-bold text-slate-900 focus:border-amber-500 outline-none"
                          />
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Difference</span>
                          <span
                            className={`font-mono font-bold text-xs ${
                              isOver
                                ? "text-rose-600"
                                : missing > 0
                                ? "text-rose-600"
                                : row.damagedQuantity > 0
                                ? "text-amber-700"
                                : "text-emerald-700"
                            }`}
                          >
                            {isOver ? `+${totalAccounted - dispatchedQty} Excess` : missing > 0 ? `-${missing} Missing` : "0 (Exact)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Discrepancy Reason input if missing or damaged */}
                    {hasDiscrepancy && (
                      <div className="pt-1.5 border-t border-slate-100">
                        <label className="block text-[11px] font-semibold text-[#A16207] mb-1">
                          Reason / Explanation for Damaged or Missing Stock <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={row.discrepancyReason}
                          onChange={(e) => {
                            setReceiveItemData({
                              ...receiveItemData,
                              [item.id]: {
                                ...row,
                                discrepancyReason: e.target.value,
                              },
                            });
                          }}
                          placeholder="e.g. 2 units broken in box, 1 unit missing from packaging..."
                          className="w-full bg-white border border-[#E5DCBE] rounded px-2.5 py-1 text-xs text-slate-900 outline-none focus:border-[#A16207]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="shrink-0">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Receiving Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={receivingNotes}
                onChange={(e) => setReceivingNotes(e.target.value)}
                placeholder="Driver sign-off, receiving dock condition, package seal status..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setShowReceiveModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={receiveMutation.isPending}
                onClick={handleConfirmReceive}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {receiveMutation.isPending ? "Recording Receipt..." : "Confirm Stock Receipt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE DISCREPANCY MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">assignment_late</span>
                <h3 className="text-lg font-bold text-slate-900">Resolve Transfer Discrepancy</h3>
              </div>
              <button
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              As the System Owner, review reported shortages and damaged goods. Resolving this discrepancy will finalize the transfer audit trail and close the transfer record.
            </p>

            {/* Discrepancy Items Summary */}
            <div className="space-y-2 max-h-48 overflow-y-auto border border-[#E5DCBE] rounded-lg p-3 bg-[#FFF8E7]/50 text-xs">
              <span className="text-[11px] font-bold text-[#A16207] uppercase tracking-wider block">
                Reported Discrepancies
              </span>
              {transfer.items
                .filter((it: any) => (it.missingQuantity ?? 0) > 0 || (it.damagedQuantity ?? 0) > 0)
                .map((it: any) => (
                  <div key={it.id} className="bg-white p-2.5 rounded border border-[#E5DCBE] space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>{it.product?.name}</span>
                      <span className="text-rose-600">
                        {it.missingQuantity > 0 ? `-${it.missingQuantity} Missing ` : ""}
                        {it.damagedQuantity > 0 ? `+${it.damagedQuantity} Damaged` : ""}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">
                      "{it.discrepancyReason || transfer.receivingNotes || "Discrepancy noted"}"
                    </p>
                  </div>
                ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Owner Resolution Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="State how this discrepancy was reviewed (e.g. Carrier reimbursed loss, damaged stock written off, supplier contacted)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resolveMutation.isPending || !resolutionNotes.trim()}
                onClick={handleConfirmResolve}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {resolveMutation.isPending ? "Closing Discrepancy..." : "Resolve & Close Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
