import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import { useSaleDetails, useVoidSale, useCorrectSale } from "./api";

type Props = {
  saleId: string | null;
  onClose: () => void;
};

export function SaleDetailsDrawer({ saleId, onClose }: Props) {
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";

  const { data: sale, isLoading, isError, error } = useSaleDetails(saleId || undefined);

  // Void modal state
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState("");
  const [voidError, setVoidError] = useState<string | null>(null);

  // Note modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteReason, setNoteReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  const voidSaleMutation = useVoidSale(saleId || "");
  const correctSaleMutation = useCorrectSale(saleId || "");

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isVoidModalOpen && !isNoteModalOpen) {
        onClose();
      }
    };
    if (saleId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saleId, onClose, isVoidModalOpen, isNoteModalOpen]);

  if (!saleId) return null;

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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-scrim/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-container-lowest shadow-2xl z-50 flex flex-col border-l border-outline-variant transform transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sale-details-title"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant bg-white">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="sale-details-title" className="text-headline-sm font-headline-sm text-on-surface">
                  Sale Details
                </h2>
                {sale?.saleNumber && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-dark-slate border border-slate-200">
                    {sale.saleNumber}
                  </span>
                )}
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
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                {sale?.soldAt ? format(new Date(sale.soldAt), "MMM d, yyyy h:mm a") : "Loading transaction..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-slate-100 transition-colors"
            aria-label="Close sale details drawer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-space-lg space-y-space-lg">
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-48 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <p className="text-body-sm">Loading sale transaction details...</p>
            </div>
          )}

          {isError && (
            <div className="bg-error/10 text-error p-4 rounded-xl text-center text-body-md font-medium">
              {(error as any)?.message || "Failed to load sale details."}
            </div>
          )}

          {sale && !isLoading && !isError && (
            <>
              {/* Void Banner if Voided */}
              {isVoided && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-medium space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span className="material-symbols-outlined text-[20px]">cancel</span>
                    This transaction has been VOIDED
                  </div>
                  <p>Inventory deductions have been reversed back to stock. This transaction is immutable.</p>
                </div>
              )}

              {/* Action Toolbar (Void & Note) */}
              {!isVoided && (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNoteModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit_note</span>
                      Add Amendment Note
                    </button>
                  </div>

                  {isOwner && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={hasReturns}
                        onClick={() => setIsVoidModalOpen(true)}
                        title={hasReturns ? "Cannot void sale with existing returns." : "Void completed sale"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-error/30 text-error bg-white hover:bg-error/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                        Void Sale
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Branch
                  </span>
                  <span className="text-body-md font-medium text-dark-slate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                    {sale.branch?.name || "Main Branch"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Recorded By
                  </span>
                  <span className="text-body-md font-medium text-dark-slate flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {sale.createdBy?.name || "Staff"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Sale Date
                  </span>
                  <span className="text-body-md font-medium text-dark-slate">
                    {format(new Date(sale.soldAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Receipt #
                  </span>
                  <span className="text-body-md font-mono font-medium text-dark-slate">
                    {sale.saleNumber}
                  </span>
                </div>
              </div>

              {/* Sale Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider">
                    Sold Items ({sale.items?.length || 0})
                  </h3>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-3 text-center">Unit</th>
                        <th className="py-3 px-3 text-right">Qty</th>
                        <th className="py-3 px-3 text-right">Price</th>
                        {isOwner && <th className="py-3 px-3 text-right text-slate-500">Unit Cost</th>}
                        <th className="py-3 px-3 text-right">Discount</th>
                        <th className="py-3 px-4 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {sale.items?.map((item: any) => {
                        const lineDisc = parseFloat(item.lineDiscount) || 0;
                        const apportionedDisc = parseFloat(item.apportionedSaleDiscount) || 0;
                        const totalItemDisc = lineDisc + apportionedDisc;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-dark-slate">{item.product?.name}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{item.product?.sku}</div>
                            </td>
                            <td className="py-3.5 px-3 text-center text-slate-600 font-medium">
                              {item.unit?.name || "Unit"}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-semibold text-dark-slate">
                              {item.enteredQuantity}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                              ETB {parseFloat(item.unitPrice).toFixed(2)}
                            </td>
                            {isOwner && (
                              <td className="py-3.5 px-3 text-right font-mono text-slate-500 text-xs">
                                {item.unitCost ? `ETB ${parseFloat(item.unitCost).toFixed(2)}` : "-"}
                              </td>
                            )}
                            <td className="py-3.5 px-3 text-right font-mono text-xs">
                              {totalItemDisc > 0 ? (
                                <span className="text-amber-700 font-semibold">
                                  -ETB {totalItemDisc.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-dark-slate">
                              ETB {parseFloat(item.lineTotal).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals & Payments Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Financial Summary */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200">
                    Financial Summary
                  </h4>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Gross Subtotal</span>
                    <span className="font-mono font-semibold">ETB {parseFloat(sale.subtotal).toFixed(2)}</span>
                  </div>
                  {totalDiscounts > 0 && (
                    <div className="flex justify-between text-sm text-amber-700">
                      <span>Total Discounts Applied</span>
                      <span className="font-mono font-semibold">-ETB {totalDiscounts.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="font-bold text-dark-slate">Grand Total</span>
                    <span className="text-xl font-bold font-mono text-primary">
                      ETB {parseFloat(sale.grandTotal).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payments Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-200">
                    Payments Recorded ({sale.payments?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {sale.payments?.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex justify-between items-center text-sm p-2 rounded-lg bg-white border border-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
                          <span className="font-medium text-dark-slate">
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
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-dark-slate uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">assignment_return</span>
                      Returns Processed Against this Sale ({sale.returns.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {sale.returns.map((ret: any) => (
                      <div
                        key={ret.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">{ret.returnNumber}</span>
                            <span className="text-xs text-slate-500">
                              {ret.createdAt ? format(new Date(ret.createdAt), "MMM d, yyyy") : ""}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">Reason: {ret.reason}</p>
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

              {/* Corrections & Audit Trail */}
              {(sale.corrections || []).length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-dark-slate uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                    Audit Log & Corrections ({sale.corrections.length})
                  </h4>
                  <div className="space-y-2">
                    {sale.corrections.map((corr: any) => (
                      <div
                        key={corr.id}
                        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            corr.correctionType === "VOID"
                              ? "bg-error/10 text-error"
                              : "bg-slate-200 text-dark-slate"
                          }`}>
                            {corr.correctionType}
                          </span>
                          <span className="text-slate-500">
                            {corr.createdAt ? format(new Date(corr.createdAt), "MMM d, yyyy h:mm a") : ""}
                          </span>
                        </div>
                        <p className="text-dark-slate font-medium">Reason: {corr.reason}</p>
                        {corr.newState?.note && (
                          <p className="text-slate-600 italic">Note: "{corr.newState.note}"</p>
                        )}
                        <p className="text-slate-500 text-[11px]">Authorized by: {corr.createdBy?.name || "Staff"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Immutability Guarantee Note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">info</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="font-semibold text-dark-slate">Historical snapshot preserved:</strong> The selling prices, units, and payment allocations shown above were locked at transaction time. Completed sales are never hard-deleted; reversals are preserved via auditable void workflows.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* VOID CONFIRMATION MODAL */}
      {isVoidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="text-lg font-bold text-dark-slate">Void Sale {sale?.saleNumber}</h3>
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
    </>
  );
}
