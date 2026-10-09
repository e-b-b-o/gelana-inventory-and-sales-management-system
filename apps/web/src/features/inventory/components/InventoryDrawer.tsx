import { useState } from "react";
import { type InventoryProduct } from "../api/schema";
import { StockAdjustmentModal } from "./StockAdjustmentModal";

interface Props {
  balanceId: string;
  balances: InventoryProduct[];
  isOwner: boolean;
  onClose: () => void;
}

export function InventoryDrawer({ balanceId, balances, isOwner, onClose }: Props) {
  const product = balances.find(b => b.id === balanceId);
  
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  if (!product) return null;

  const totalQuantity = product.totalAvailable;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full transform transition-transform">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            <h2 className="text-xl font-bold text-dark-slate tracking-tight">Product Details</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-dark-slate hover:bg-slate-50 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identity */}
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-dark-slate">{product.name}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">SKU: {product.sku} • Category: {product.category}</p>
              </div>
              {product.brand && (
                <span className="text-[10px] bg-blue-50 text-primary font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                  {product.brand}
                </span>
              )}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Base Stock Unit</div>
                <div className="text-sm font-bold text-dark-slate mt-0.5">{product.baseUnit}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Selling Price</div>
                <div className="text-sm font-bold text-dark-slate mt-0.5">{Number(product.sellingPrice).toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          {/* Multi-Branch Distribution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500">Multi-Branch Distribution</span>
              <span className="text-xs text-primary font-bold bg-blue-50 px-2 py-0.5 rounded-full">Total: {totalQuantity} {product.baseUnit}s</span>
            </div>
            
            <div className="space-y-2">
              {product.balances.map(cb => {
                const isOut = cb.availableQuantity === 0;
                const isLow = cb.availableQuantity > 0 && cb.availableQuantity <= 20;
                
                return (
                  <div key={cb.branchId} className={`p-3 rounded-xl border flex items-center justify-between ${
                    isOut ? 'border-red-200 bg-red-50/50' :
                    isLow ? 'border-amber-200 bg-amber-50/50' :
                    'border-slate-200 bg-white shadow-sm'
                  }`}>
                    <div>
                      <div className="text-sm font-bold text-dark-slate">{cb.branchName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Threshold: Min 20 {product.baseUnit}s</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold leading-none ${
                        isOut ? 'text-red-600' :
                        isLow ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {cb.availableQuantity} {product.baseUnit}s
                      </div>
                      <span className={`text-[10px] font-bold mt-1 block ${
                        isOut ? 'text-red-600' :
                        isLow ? 'text-amber-700' :
                        'text-emerald-600'
                      }`}>
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Owner Financial Valuation */}
          {isOwner && (
            <div className="p-4 bg-brand-warm rounded-xl border border-warm-border space-y-4">
              <div className="flex items-center justify-between border-b border-warm-border/60 pb-3">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                  Owner Valuation Metrics
                </span>
              </div>
              
              <div className="space-y-3">
                {product.balances.map(cb => {
                   return (
                     <div key={cb.branchId} className="grid grid-cols-2 gap-3 border-b border-warm-border/30 pb-2 last:border-0 last:pb-0">
                       <div className="col-span-2 text-[10px] text-slate-500 font-bold uppercase">{cb.branchName}</div>
                       <div>
                         <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">WAC</div>
                         <div className="text-sm font-bold text-dark-slate mt-1">ETB {Number(cb.wac || 0).toFixed(2)}</div>
                       </div>
                       <div>
                         <div className="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Value</div>
                         <div className="text-sm font-bold text-primary mt-1">
                           ETB {(Number(cb.wac || 0) * cb.availableQuantity).toLocaleString(undefined, {minimumFractionDigits: 2})}
                         </div>
                       </div>
                     </div>
                   );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Drawer Footer Actions */}
        {isOwner && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button 
              onClick={() => setIsAdjustOpen(true)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-dark-slate hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm"
            >
              Adjust Stock
            </button>
          </div>
        )}
      </div>

      <StockAdjustmentModal 
        isOpen={isAdjustOpen} 
        onClose={() => setIsAdjustOpen(false)} 
        initialProductId={product.id} 
      />
    </div>
  );
}
