import { useReceivingDetails } from "../api";
import { format } from "date-fns";

type Props = {
  receivingId: string | null;
  onClose: () => void;
};

export function ReceivingDetailsDrawer({ receivingId, onClose }: Props) {
  const { data: receiving, isLoading, isError } = useReceivingDetails(receivingId || undefined);

  if (!receivingId) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-scrim/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-container-lowest shadow-2xl z-50 flex flex-col border-l border-outline-variant transform transition-transform duration-300">
        <div className="flex items-center justify-between px-4 sm:px-space-lg py-space-md border-b border-outline-variant bg-white">
          <div>
            <h2 className="text-headline-sm font-headline-sm text-on-surface">Receiving Details</h2>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              {receiving?.receivingNumber || "Loading..."}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-space-lg">
          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {isError && (
            <div className="bg-error/10 text-error p-4 rounded-xl text-center text-body-md font-medium">
              Failed to load receiving details.
            </div>
          )}

          {receiving && !isLoading && !isError && (
            <div className="space-y-space-lg">
              {/* Header Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date Received</span>
                  <span className="text-body-md font-medium text-dark-slate">
                    {format(new Date(receiving.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reference Number</span>
                  <span className="text-body-md font-medium text-dark-slate font-mono bg-white px-2 py-0.5 border border-slate-200 rounded text-sm">
                    {receiving.receivingNumber}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier</span>
                  <span className="text-body-md font-medium text-dark-slate">
                    {receiving.supplier.name}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Branch</span>
                  <span className="text-body-md font-medium text-dark-slate">
                    {receiving.branch.name}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Invoice Number</span>
                  <span className="text-body-md font-medium text-dark-slate">
                    {receiving.invoiceNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Received By</span>
                  <span className="text-body-md font-medium text-dark-slate">
                    {receiving.receivedBy.name}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-title-md font-title-md text-on-surface mb-4">Received Items</h3>
                <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Unit Cost</th>
                        <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {receiving.items.map((item: any) => {
                        const lineTotal = Number(item.quantity) * Number(item.unitCost);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-medium text-dark-slate">{item.product.name}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">{item.product.sku}</div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-dark-slate">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-dark-slate">
                              ETB {Number(item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-dark-slate">
                              ETB {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Total Cost
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-dark-slate">
                          ETB {Number(receiving.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
