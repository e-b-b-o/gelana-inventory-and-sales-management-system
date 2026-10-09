import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useInventoryBalances, useSubmitStocktake } from "../api";
import { fetchApi } from "../../../lib/api";

const fetchBranches = async () => fetchApi("/branches");

export function StocktakePage() {
  const [branchId, setBranchId] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { data: branchesResponse } = useQuery({ queryKey: ["branches"], queryFn: fetchBranches });
  const branches = Array.isArray(branchesResponse) ? branchesResponse : branchesResponse?.data || [];

  const { data, isLoading } = useInventoryBalances({ branchId });
  const balances = data?.data || [];
  
  const { mutateAsync: submitStocktake, isPending } = useSubmitStocktake();

  const handleCountChange = (productId: string, val: string) => {
    if (val === "") {
      const newCounts = { ...counts };
      delete newCounts[productId];
      setCounts(newCounts);
      return;
    }
    
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setCounts(prev => ({ ...prev, [productId]: parsed }));
    }
  };

  const getSystemQuantity = (productId: string) => {
    if (!branchId) return 0;
    const prod = balances.find(p => p.id === productId);
    if (!prod) return 0;
    
    const branchBal = prod.balances.find((b: any) => b.branchId === branchId);
    return branchBal ? branchBal.availableQuantity : 0;
  };

  const itemsToSubmit = Object.keys(counts).map(productId => {
    const physicalCount = counts[productId];
    const systemQty = getSystemQuantity(productId);
    const variance = physicalCount! - systemQty;
    return {
      productId,
      physicalCount: physicalCount!,
      systemQty,
      variance
    };
  });

  const variancesOnly = itemsToSubmit.filter(i => i.variance !== 0);

  const onSubmit = async () => {
    try {
      setErrorMsg("");
      if (!branchId) {
        setErrorMsg("Please select a branch first.");
        return;
      }
      
      if (itemsToSubmit.length === 0) {
        setErrorMsg("No physical counts entered.");
        return;
      }

      await submitStocktake({
        branchId,
        items: itemsToSubmit.map(i => ({ productId: i.productId, physicalCount: i.physicalCount })),
        reason: reason || undefined
      });
      
      // Reset form
      setCounts({});
      setReason("");
      
      alert("Stocktake submitted successfully. " + variancesOnly.length + " adjustments made.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit stocktake");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto min-h-screen flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-slate tracking-tight">Stocktake</h1>
          <p className="text-sm text-muted-text mt-1">Perform physical stock counts and automatically adjust inventory.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-end gap-4">
          <div className="w-64">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Branch</label>
            <select 
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setCounts({}); // clear counts on branch change
              }}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
            >
              <option value="">Select a branch...</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1"></div>
          {variancesOnly.length > 0 && (
            <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              {variancesOnly.length} variance(s) detected
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="m-5 mb-0 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {!branchId ? (
          <div className="p-16 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            <p className="text-lg font-medium">Please select a branch to begin stocktake.</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="p-4 pl-6">Product</th>
                  <th className="p-4 w-32">Base Unit</th>
                  <th className="p-4 w-40 text-right">System Qty</th>
                  <th className="p-4 w-48 text-right">Physical Count</th>
                  <th className="p-4 w-32 text-right pr-6">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Loading products...</td>
                  </tr>
                ) : balances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">No products found.</td>
                  </tr>
                ) : balances.map((product) => {
                  const systemQty = getSystemQuantity(product.id);
                  const countVal = counts[product.id];
                  const hasCount = countVal !== undefined;
                  const variance = hasCount ? countVal - systemQty : 0;
                  
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-dark-slate">{product.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">SKU: {product.sku}</div>
                      </td>
                      <td className="p-4 text-slate-500 font-medium">
                        {product.baseUnit}
                      </td>
                      <td className="p-4 text-right">
                        <span className="font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {systemQty}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <input 
                          type="number" 
                          min="0"
                          step="1"
                          placeholder="-"
                          className={`w-full max-w-[120px] ml-auto text-right border rounded-lg px-3 py-1.5 font-bold outline-none transition-colors ${
                            hasCount 
                              ? 'border-primary bg-blue-50/30 text-primary' 
                              : 'border-slate-300 text-dark-slate focus:border-primary focus:bg-white'
                          }`}
                          value={hasCount ? countVal : ""}
                          onChange={(e) => handleCountChange(product.id, e.target.value)}
                        />
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {!hasCount ? (
                          <span className="text-slate-300">-</span>
                        ) : variance > 0 ? (
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">+{variance}</span>
                        ) : variance < 0 ? (
                          <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">{variance}</span>
                        ) : (
                          <span className="text-slate-400 font-bold">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {branchId && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-end justify-between">
            <div className="w-1/2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason / Reference (Optional)</label>
              <input 
                type="text" 
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Monthly Audit Q3"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
              />
            </div>
            <button 
              onClick={onSubmit}
              disabled={isPending || itemsToSubmit.length === 0}
              className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" className="opacity-20"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg>}
              Submit {itemsToSubmit.length} Counts
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
