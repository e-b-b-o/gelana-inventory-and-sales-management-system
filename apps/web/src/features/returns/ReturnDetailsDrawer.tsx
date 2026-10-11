import { useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useReturnDetails } from "./api";

type Props = {
  returnId: string | null;
  onClose: () => void;
  onOpenSale?: (saleId: string) => void;
};

export function ReturnDetailsDrawer({ returnId, onClose, onOpenSale }: Props) {
  const { data: ret, isLoading, isError, error } = useReturnDetails(returnId || undefined);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (returnId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [returnId, onClose]);

  if (!returnId) return null;

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
        aria-labelledby="return-details-title"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant bg-white">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="return-details-title" className="text-headline-sm font-headline-sm text-on-surface">
                  Return Details
                </h2>
                {ret?.returnNumber && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-dark-slate border border-slate-200">
                    {ret.returnNumber}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {ret?.status || "COMPLETED"}
                </span>
                {ret?.isUnlinked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Unlinked Return
                  </span>
                )}
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                {ret?.createdAt ? format(new Date(ret.createdAt), "MMM d, yyyy h:mm a") : "Loading return details..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-slate-100 transition-colors"
            aria-label="Close return details drawer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-space-lg space-y-space-lg">
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-48 text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <p className="text-body-sm">Loading return details...</p>
            </div>
          )}

          {isError && (
            <div className="bg-error/10 text-error p-4 rounded-xl text-center text-body-md font-medium">
              {(error as any)?.message || "Failed to load return details."}
            </div>
          )}

          {ret && !isLoading && !isError && (
            <>
              {/* Metadata Card */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Branch
                  </span>
                  <span className="text-body-md font-medium text-dark-slate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                    {ret.branch?.name || "Branch"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Authorized By
                  </span>
                  <span className="text-body-md font-medium text-dark-slate flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    {ret.createdBy?.name || "Staff"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Return Date
                  </span>
                  <span className="text-body-md font-medium text-dark-slate">
                    {format(new Date(ret.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Original Sale
                  </span>
                  {ret.sale ? (
                    onOpenSale ? (
                      <button
                        onClick={() => onOpenSale(ret.sale.id)}
                        className="text-body-md font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        {ret.sale.saleNumber}
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </button>
                    ) : (
                      <Link
                        to={`/sales/${ret.sale.saleNumber}`}
                        className="text-body-md font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        {ret.sale.saleNumber}
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </Link>
                    )
                  ) : (
                    <span className="text-body-sm font-medium text-slate-500 italic">None (Unlinked)</span>
                  )}
                </div>
              </div>

              {/* Return Reason Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Reason for Return
                </span>
                <p className="text-sm text-dark-slate font-medium">
                  {ret.reason || "No reason specified."}
                </p>
              </div>

              {/* Items Returned Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider">
                    Returned Items ({ret.items?.length || 0})
                  </h3>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                        <th className="py-3 px-4">Item</th>
                        <th className="py-3 px-3 text-center">Condition / Bucket</th>
                        <th className="py-3 px-3 text-center">Unit</th>
                        <th className="py-3 px-3 text-right">Qty</th>
                        <th className="py-3 px-3 text-right">Unit Price</th>
                        <th className="py-3 px-4 text-right">Refund Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {ret.items?.map((item: any) => {
                        const isSellable = item.condition === "SELLABLE";
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-dark-slate">{item.product?.name}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{item.product?.sku}</div>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {isSellable ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Sellable (Restocked)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  Damaged (Quarantine)
                                </span>
                              )}
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
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-dark-slate">
                              ETB {parseFloat(item.refundAmount).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial and Refund Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Refund Method */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Refund Payment Method
                  </span>
                  <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg">
                    <span className="material-symbols-outlined text-[20px] text-primary">payments</span>
                    <span className="font-semibold text-dark-slate">
                      {ret.refundPaymentMethod?.name || "Cash"}
                    </span>
                  </div>
                </div>

                {/* Refund Total */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Total Refund Issued
                  </span>
                  <div className="text-2xl font-bold font-mono text-primary mt-2">
                    ETB {parseFloat(ret.refundAmount).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Inventory Ledger Guarantee */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">info</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="font-semibold text-dark-slate">Inventory Ledger Intact:</strong> Items marked Sellable were credited to available inventory via a <code className="px-1 py-0.5 bg-slate-200/70 rounded font-mono text-[11px]">RETURN_GOOD</code> movement. Damaged items were routed to quarantine via <code className="px-1 py-0.5 bg-slate-200/70 rounded font-mono text-[11px]">RETURN_DAMAGED</code>. WAC cost valuation was preserved without inflation.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
