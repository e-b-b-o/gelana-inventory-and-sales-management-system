import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { useReturnDetails } from "./api";

export function ReturnDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: ret, isLoading, isError, error } = useReturnDetails(id);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="text-body-sm">Loading return transaction...</p>
      </div>
    );
  }

  if (isError || !ret) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-error/10 text-error p-6 rounded-xl text-center space-y-3">
          <h2 className="text-lg font-bold">Failed to load return</h2>
          <p className="text-body-md font-medium">{(error as any)?.message || "Return not found."}</p>
          <Link
            to="/sales/returns"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Returns History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-space-lg pb-12">
      {/* Breadcrumbs & Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
          <Link to="/sales" className="hover:text-primary transition-colors">Sales</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to="/sales/returns" className="hover:text-primary transition-colors">Returns</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-dark-slate font-mono">{ret.returnNumber}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/sales/returns"
              className="w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-sm"
              title="Back to Returns"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">
                  Return {ret.returnNumber}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {ret.status || "COMPLETED"}
                </span>
                {ret.isUnlinked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Unlinked Return
                  </span>
                )}
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                Processed on {format(new Date(ret.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Branch
          </span>
          <span className="text-body-md font-semibold text-dark-slate flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-slate-400">location_on</span>
            {ret.branch?.name || "Main Branch"}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Authorized Staff
          </span>
          <span className="text-body-md font-semibold text-dark-slate flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            {ret.createdBy?.name || "Staff"}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Return Date
          </span>
          <span className="text-body-md font-semibold text-dark-slate">
            {format(new Date(ret.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        <div>
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Original Sale
          </span>
          {ret.sale ? (
            <Link
              to={`/sales/${ret.sale.saleNumber}`}
              className="text-body-md font-bold text-primary hover:underline flex items-center gap-1 font-mono"
            >
              {ret.sale.saleNumber}
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </Link>
          ) : (
            <span className="text-body-sm font-medium text-slate-500 italic">None (Unlinked)</span>
          )}
        </div>
      </div>

      {/* Reason Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Reason for Return
        </span>
        <p className="text-body-md text-dark-slate font-medium">
          {ret.reason || "No reason specified."}
        </p>
      </div>

      {/* Items Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider">
            Returned Items ({ret.items?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-5">Item</th>
                <th className="py-3 px-4 text-center">Condition / Bucket</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-5 text-right">Refund Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ret.items?.map((item: any) => {
                const isSellable = item.condition === "SELLABLE";
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-dark-slate">{item.product?.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{item.product?.sku}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
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
                    <td className="py-4 px-4 text-center text-slate-600 font-medium">
                      {item.unit?.name || "Unit"}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-semibold text-dark-slate">
                      {item.enteredQuantity}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-slate-600">
                      ETB {parseFloat(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-4 px-5 text-right font-mono font-bold text-dark-slate">
                      ETB {parseFloat(item.refundAmount).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Refund Payment Method
          </span>
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="material-symbols-outlined text-[22px] text-primary">payments</span>
            <span className="font-semibold text-dark-slate">
              {ret.refundPaymentMethod?.name || "Cash"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Refund Issued
          </span>
          <div className="text-3xl font-bold font-mono text-primary mt-2">
            ETB {parseFloat(ret.refundAmount).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Ledger Audit Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="font-semibold text-dark-slate">Inventory Ledger Intact:</strong> Items marked Sellable were credited to available inventory via a <code className="px-1 py-0.5 bg-slate-200/70 rounded font-mono text-[11px]">RETURN_GOOD</code> movement. Damaged items were routed to quarantine via <code className="px-1 py-0.5 bg-slate-200/70 rounded font-mono text-[11px]">RETURN_DAMAGED</code>. WAC cost valuation was preserved without inflation.
        </p>
      </div>
    </div>
  );
}
