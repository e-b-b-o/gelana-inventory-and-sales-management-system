import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/api/auth";
import { useInventoryBalances } from "../api";
import { InventoryDrawer } from "./InventoryDrawer";
import { OpeningStockModal } from "./OpeningStockModal";
import { DisposalModal } from "./DisposalModal";

export function CurrentInventoryPage() {
  const { data: userResponse } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";
  
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isOpeningStockModalOpen, setIsOpeningStockModalOpen] = useState(false);
  const [disposalProduct, setDisposalProduct] = useState<any>(null);

  const { data, isLoading } = useInventoryBalances({ search, branchId, categoryId, status });
  const balances = data?.data || [];
  
  const totalProducts = balances.length;
  // Calculate fake statuses based on thresholds
  // In real app, thresholds might be configured per product
  const MIN_STOCK = 20;
  
  const inStock = balances.filter(b => b.totalAvailable > MIN_STOCK).length;
  const lowStock = balances.filter(b => b.totalAvailable > 0 && b.totalAvailable <= MIN_STOCK).length;
  const outOfStock = balances.filter(b => b.totalAvailable === 0).length;
  const damagedStock = balances.reduce((acc, b) => acc + (b.totalDamaged || 0), 0);
  
  // WAC Total
  const totalWacValue = balances.reduce((acc, b) => {
    const wacSum = b.balances.reduce((sum: number, branchBal: any) => sum + (Number(branchBal.wac) * branchBal.availableQuantity), 0);
    return acc + wacSum;
  }, 0);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto min-h-screen flex flex-col gap-6">
      {/* PAGE TITLE */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-slate tracking-tight">Current Inventory</h1>
          <p className="text-sm text-muted-text mt-1">View current stock levels, availability, and branch-specific inventory across branches.</p>
        </div>
        {isOwner && (
          <button 
            onClick={() => setIsOpeningStockModalOpen(true)}
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary-hover hover:shadow transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add Opening Stock
          </button>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
          <div className="mt-2">
            <div className="text-xl font-bold text-dark-slate">{totalProducts} Products</div>
            <div className="text-[11px] text-muted-text mt-1">Tracked inventory items</div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">In Stock</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-dark-slate">{inStock} Products</div>
            <div className="text-[11px] text-emerald-600 mt-1">Above minimum threshold</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Low Stock</span>
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-amber-900">{lowStock} Products</div>
            <div className="text-[11px] text-amber-700 mt-1">At or below branch minimum</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Out of Stock</span>
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-red-600">{outOfStock} Products</div>
            <div className="text-[11px] text-muted-text mt-1">Zero sellable units</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Damaged Stock</span>
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold text-dark-slate">{damagedStock} Units</div>
            <div className="text-[11px] text-muted-text mt-1">Segregated non-sellable</div>
          </div>
        </div>

        {isOwner && (
          <div className="bg-brand-warm border border-warm-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Valuation (WAC)</span>
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold text-slate-900">ETB {totalWacValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              <div className="text-[11px] text-slate-600 mt-1">Owner Cost Valuation</div>
            </div>
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          <div className="lg:col-span-5 relative">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-dark-slate placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 outline-none transition-all" 
              placeholder="Search by product name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="lg:col-span-3">
            <select 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            >
              <option value="">All Branches</option>
              {/* In a real app we'd fetch branches, here we leave it as string filter for backend */}
              {isOwner ? null : <option disabled>Locked to your branch</option>}
            </select>
          </div>
          <div className="lg:col-span-3">
            <select 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <select 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="instock">In Stock</option>
              <option value="lowstock">Low Stock</option>
              <option value="outofstock">Out of Stock</option>
              <option value="damaged">Damaged Stock</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-muted-text">
          <div className="flex items-center gap-2">
            <span>Active Filters:</span>
            <span className="text-dark-slate font-medium">{search || branchId || categoryId || status ? "Applied" : "None (Showing all inventory)"}</span>
          </div>
          <div className="font-medium text-dark-slate">
            Showing <strong className="font-bold">{balances.length}</strong> inventory records
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-5">Product & Brand</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Branch</th>
                <th className="py-4 px-4 text-right">Available Stock</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-right">Selling Price</th>
                <th className="py-4 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-dark-slate">
              {isLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-muted-text">Loading inventory...</td></tr>
              ) : balances.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-muted-text">No inventory records found.</td></tr>
              ) : balances.map(b => {
                const isOutOfStock = b.totalAvailable === 0;
                const isLowStock = b.totalAvailable > 0 && b.totalAvailable <= MIN_STOCK;
                const hasDamage = b.totalDamaged > 0;
                
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-5">
                      <div className="font-bold leading-tight">{b.name}</div>
                      <div className="text-[11px] text-muted-text font-medium mt-0.5">{b.brand || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 font-medium">{b.sku}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {b.balances.length === 1 ? b.balances[0].branchName : `${b.balances.length} Branches`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className={`font-bold text-[13px] ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-dark-slate'}`}>
                        {b.totalAvailable} {b.baseUnit}s
                      </div>
                      {hasDamage && (
                        <div className="inline-block px-1.5 py-0.5 rounded bg-purple-50 text-[10px] text-purple-700 font-bold border border-purple-200 mt-1">
                          {b.totalDamaged} Damaged
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold font-mono">
                      {Number(b.sellingPrice).toFixed(2)} <span className="text-[11px] font-normal text-muted-text">/ {b.baseUnit}</span>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {isOwner && hasDamage && (
                          <button 
                            onClick={() => setDisposalProduct(b)}
                            className="px-2.5 py-1 rounded bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors"
                          >
                            Dispose
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedProductId(b.id)}
                          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-primary text-primary font-bold text-xs transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProductId && (
        <InventoryDrawer 
          balanceId={selectedProductId}
          balances={balances}
          isOwner={isOwner}
          onClose={() => setSelectedProductId(null)} 
        />
      )}

      <OpeningStockModal 
        isOpen={isOpeningStockModalOpen}
        onClose={() => setIsOpeningStockModalOpen(false)}
      />

      {isOwner && disposalProduct && (
        <DisposalModal
          isOpen={!!disposalProduct}
          onClose={() => setDisposalProduct(null)}
          product={disposalProduct}
        />
      )}
    </div>
  );
}
