import { useProductUnitPrices } from "../api";
import { format } from "date-fns";
import type { Product, ProductUnit } from "../api";

interface PriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  unit: ProductUnit | null;
}

export function PriceHistoryModal({ isOpen, onClose, product, unit }: PriceHistoryModalProps) {
  const { data: prices, isLoading, error } = useProductUnitPrices(product?.id || "", unit?.id || "");

  if (!isOpen || !product || !unit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-card border border-neutral-200/60 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-dark-slate">Price History</h2>
            <p className="text-sm text-slate-500 font-medium">
              {product.name} — {unit.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              Failed to load price history.
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-slate-500 text-sm font-medium">Loading history...</div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Price</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Effective From</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Effective Until</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prices?.map((price) => {
                    const isCurrent = !price.effectiveUntil;
                    return (
                      <tr key={price.id} className={`transition-colors ${isCurrent ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-100/50'}`}>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${isCurrent ? 'text-primary' : 'text-slate-700'}`}>
                            ${Number(price.sellingPrice).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-600">
                          {format(new Date(price.effectiveFrom), "MMM d, yyyy HH:mm")}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-600">
                          {price.effectiveUntil ? format(new Date(price.effectiveUntil), "MMM d, yyyy HH:mm") : "—"}
                        </td>
                        <td className="py-3 px-4">
                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-100 text-emerald-700 uppercase">Current</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-200 text-slate-600 uppercase">Historical</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {prices?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-text text-sm">
                        No price history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
