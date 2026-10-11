import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import { useSaleDetails, useVoidSale, useCorrectSale } from "./api";

export function SaleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";

  const { data: sale, isLoading, isError, error } = useSaleDetails(id);

  // Void modal state
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [voidError, setVoidError] = useState<string | null>(null);

  // Note modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteReason, setNoteReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  const voidSaleMutation = useVoidSale(sale?.id || id || "");
  const correctSaleMutation = useCorrectSale(sale?.id || id || "");

  const totalLineDiscounts = (sale?.items || []).reduce(
    (sum: number, it: any) => sum + (parseFloat(it.lineDiscount) || 0),
    0
  );
  const saleDiscount = parseFloat(sale?.saleDiscount) || 0;
  const totalDiscounts = totalLineDiscounts + saleDiscount;

  const isVoided = sale?.status === "VOIDED";
  const hasReturns = (sale?.returns || []).length > 0;

  const handleConfirmVoid = async () => {
    setVoidError(null);
    if (!voidReason.trim()) {
      setVoidError("A mandatory void reason is required.");
      return;
    }

    try {
      await voidSaleMutation.mutateAsync({ reason: voidReason.trim() });
      setIsVoidModalOpen(false);
      setVoidReason("");
      alert(`Sale ${sale?.saleNumber} has been successfully voided and inventory reversed.`);
    } catch (err: any) {
      setVoidError(err?.message || "Failed to void sale.");
    }
  };

  const handleConfirmAddNote = async () => {
    setNoteError(null);
    if (!noteReason.trim()) {
      setNoteError("A reason for this amendment/note is required.");
      return;
    }

    try {
      await correctSaleMutation.mutateAsync({
        reason: noteReason.trim(),
        note: noteText.trim() || undefined,
      });
      setIsNoteModalOpen(false);
      setNoteReason("");
      setNoteText("");
      alert("Note added to sale audit trail successfully.");
    } catch (err: any) {
      setNoteError(err?.message || "Failed to add note.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-body-sm">Loading sale transaction details...</p>
      </div>
    );
  }

  if (isError || !sale) {
    return (
      <div className="space-y-4">
        <Link
          to="/sales"
          className="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-primary hover:underline group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Back to Sales History
        </Link>
        <div className="bg-error/10 text-error p-6 rounded-xl text-center">
          <span className="material-symbols-outlined text-4xl mb-2">error</span>
          <h2 className="text-lg font-bold">Failed to load sale</h2>
          <p className="text-sm mt-1">{(error as any)?.message || "Sale not found or unauthorized."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-space-lg pb-12">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/sales"
          className="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-primary hover:underline mb-2 group"
        >
          <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          Back to Sales History
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Sale Details</h1>
            <span className="px-2.5 py-0.5 rounded font-mono text-label-md font-label-md bg-surface-container-high text-on-surface border border-outline-variant">
              {sale.saleNumber}
            </span>
            {isVoided ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                VOIDED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Completed
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isVoided && (
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                Add Note
              </button>
            )}

            {isOwner && !isVoided && (
              <button
                type="button"
                disabled={hasReturns}
                onClick={() => setIsVoidModalOpen(true)}
                title={hasReturns ? "Cannot void sale with existing returns." : "Void completed sale"}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-error/30 text-error bg-white hover:bg-error/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                Void Sale
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Void Banner if Voided */}
      {isVoided && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-medium space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">cancel</span>
            This transaction has been VOIDED
          </div>
          <p>Inventory deductions have been reversed back into available stock. Financial and sales metrics treat this transaction as voided.</p>
        </div>
      )}

      {/* Metadata Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="text-label-lg font-label-lg font-semibold text-dark-slate">Sale Information</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Branch</span>
            <span className="text-body-md font-medium text-dark-slate flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
              {sale.branch?.name || "Main Branch"}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sold By</span>
            <span className="text-body-md font-medium text-dark-slate flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {sale.createdBy?.name || "Staff"}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sale Date</span>
            <span className="text-body-md font-medium text-dark-slate">
              {format(new Date(sale.soldAt), "MMMM d, yyyy h:mm a")}
            </span>
          </div>
          <div>
            <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Receipt #</span>
            <span className="text-body-md font-mono font-medium text-dark-slate">
              {sale.saleNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Sold Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-label-lg font-label-lg font-bold text-dark-slate uppercase tracking-wider">
            Sold Items ({sale.items?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-5">Item</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                {isOwner && <th className="py-3 px-4 text-right text-slate-500">Unit Cost</th>}
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-5 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items?.map((item: any) => {
                const lineDisc = parseFloat(item.lineDiscount) || 0;
                const apportionedDisc = parseFloat(item.apportionedSaleDiscount) || 0;
                const totalItemDisc = lineDisc + apportionedDisc;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-dark-slate">{item.product?.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{item.product?.sku}</div>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-600 font-medium">
                      {item.unit?.name || "Unit"}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-dark-slate">
                      {item.enteredQuantity}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-600">
                      ETB {parseFloat(item.unitPrice).toFixed(2)}
                    </td>
                    {isOwner && (
                      <td className="py-4 px-4 text-right font-mono text-slate-500 text-xs">
                        {item.unitCost ? `ETB ${parseFloat(item.unitCost).toFixed(2)}` : "-"}
                      </td>
                    )}
                    <td className="py-4 px-4 text-right font-mono text-xs">
                      {totalItemDisc > 0 ? (
                        <span className="text-amber-700 font-semibold">
                          -ETB {totalItemDisc.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-dark-slate">
                      ETB {parseFloat(item.lineTotal).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financials & Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-label-lg font-label-lg font-bold text-dark-slate uppercase tracking-wider pb-2 border-b border-slate-100">
            Financial Summary
          </h2>
          <div className="flex justify-between text-sm text-slate-600">
            <span>Gross Subtotal</span>
            <span className="font-mono font-semibold">ETB {parseFloat(sale.subtotal).toFixed(2)}</span>
          </div>
          {totalDiscounts > 0 && (
            <div className="flex justify-between text-sm text-amber-700">
              <span>Total Discounts</span>
              <span className="font-mono font-semibold">-ETB {totalDiscounts.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base pt-3 border-t border-slate-200">
            <span className="font-bold text-dark-slate">Grand Total</span>
            <span className="text-2xl font-bold font-mono text-primary">
              ETB {parseFloat(sale.grandTotal).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-label-lg font-label-lg font-bold text-dark-slate uppercase tracking-wider pb-2 border-b border-slate-100">
            Payments Recorded ({sale.payments?.length || 0})
          </h2>
          <div className="space-y-2.5">
            {sale.payments?.map((payment: any) => (
              <div
                key={payment.id}
                className="flex justify-between items-center text-sm p-3 rounded-lg bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                  <span className="font-semibold text-dark-slate">
                    {payment.paymentMethod?.name || "Payment"}
                  </span>
                </div>
                <span className="font-mono font-bold text-dark-slate">
                  ETB {parseFloat(payment.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Linked Returns Section */}
      {hasReturns && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-primary text-[20px]">assignment_return</span>
            Returns Processed Against this Sale ({sale.returns.length})
          </h3>
          <div className="space-y-2.5">
            {sale.returns.map((ret: any) => (
              <div
                key={ret.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{ret.returnNumber}</span>
                    <span className="text-xs text-slate-500">
                      {ret.createdAt ? format(new Date(ret.createdAt), "MMMM d, yyyy") : ""}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Reason: {ret.reason}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-dark-slate">
                    Refund: ETB {parseFloat(ret.refundAmount).toFixed(2)}
                  </div>
                  <Link
                    to={`/sales/returns/${ret.id}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    View Return Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corrections & Audit Log */}
      {(sale.corrections || []).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-primary text-[20px]">history</span>
            Audit Log & Corrections ({sale.corrections.length})
          </h3>
          <div className="space-y-2.5">
            {sale.corrections.map((corr: any) => (
              <div
                key={corr.id}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${
                    corr.correctionType === "VOID"
                      ? "bg-error/10 text-error"
                      : "bg-slate-200 text-dark-slate"
                  }`}>
                    {corr.correctionType}
                  </span>
                  <span className="text-slate-500">
                    {corr.createdAt ? format(new Date(corr.createdAt), "MMMM d, yyyy h:mm a") : ""}
                  </span>
                </div>
                <p className="text-dark-slate font-medium text-sm">Reason: {corr.reason}</p>
                {corr.newState?.note && (
                  <p className="text-slate-600 italic">Note: "{corr.newState.note}"</p>
                )}
                <p className="text-slate-500 text-xs">Authorized by: {corr.createdBy?.name || "Staff"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Guarantee Note */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="font-semibold text-dark-slate">Historical snapshot preserved:</strong> The selling prices, units, and payment allocations shown above were locked at transaction time. Completed sales are never hard-deleted; reversals are preserved via auditable void workflows.
        </p>
      </div>

      {/* VOID CONFIRMATION MODAL */}
      {isVoidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="text-lg font-bold text-dark-slate">Void Sale {sale.saleNumber}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Voiding this sale will mark the transaction as <strong>VOIDED</strong>, atomically reverse all deducted inventory back into stock via an <strong>ADJUSTMENT</strong> ledger movement, and record an audit entry.
            </p>

            {voidError && (
              <div className="p-2.5 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-semibold">
                {voidError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mandatory Reason for Void *
              </label>
              <textarea
                rows={3}
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="Reason (e.g. Card declined post-transaction, clerk error, fraudulent transaction)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-dark-slate focus:border-error focus:bg-white outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={voidSaleMutation.isPending}
                onClick={() => setIsVoidModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={voidSaleMutation.isPending || !voidReason.trim()}
                onClick={handleConfirmVoid}
                className="px-4 py-2 rounded-lg bg-error hover:bg-error/90 text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {voidSaleMutation.isPending ? "Voiding..." : "Confirm & Void Sale"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NOTE MODAL */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-3xl">edit_note</span>
              <h3 className="text-lg font-bold text-dark-slate">Add Amendment Note</h3>
            </div>

            {noteError && (
              <div className="p-2.5 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-semibold">
                {noteError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Reason for Amendment *
              </label>
              <input
                type="text"
                value={noteReason}
                onChange={(e) => setNoteReason(e.target.value)}
                placeholder="e.g. Customer clarification, receipt reprint..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-dark-slate focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Note Content
              </label>
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Additional audit notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-dark-slate focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={correctSaleMutation.isPending}
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={correctSaleMutation.isPending || !noteReason.trim()}
                onClick={handleConfirmAddNote}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {correctSaleMutation.isPending ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
