import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../auth/api/auth";
import { useInventoryBalances } from "../api";
import { useBranches } from "../../branches/api";
import { useCategories } from "../../categories/api";
import { InventoryDrawer } from "./InventoryDrawer";
import { OpeningStockModal } from "./OpeningStockModal";
import { DisposalModal } from "./DisposalModal";

export function CurrentInventoryPage() {
  const { data: userResponse } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";
  const userBranchId = userResponse?.user?.branchId;
  const navigate = useNavigate();
  
  const [search, setSearch] = useState("");
  // Non-owners can only see their own branch, unless their branchId is null/undefined in which case they can't fetch anything safely anyway.
  // We'll initialize branchId if they aren't owners.
  const [branchId, setBranchId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isOpeningStockModalOpen, setIsOpeningStockModalOpen] = useState(false);
  const [disposalProduct, setDisposalProduct] = useState<any>(null);

  const { data: branchesData } = useBranches();
  const { data: categoriesData } = useCategories();

  // If not owner, enforce their branch
  const effectiveBranchId = isOwner ? branchId : (userBranchId || branchId);

  const { data, isLoading } = useInventoryBalances({ search, branchId: effectiveBranchId, categoryId, status });
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
    <>
      {/* PAGE TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Current Inventory</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            View current stock levels, availability, and branch-specific inventory.
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsOpeningStockModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm"
            >
              Add Opening Stock
            </button>
            <button 
              onClick={() => navigate('/receivings/new')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Receiving
            </button>
          </div>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-space-md mb-space-lg">
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between min-h-[24px]">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">Total Products</span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">inventory_2</span>
          </div>
          <div className="mt-3">
            <div className="text-headline-sm font-headline-sm text-on-surface">{totalProducts}</div>
            <div className="text-body-sm font-body-sm text-on-surface-variant mt-1">Tracked items</div>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between min-h-[24px]">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-success">In Stock</span>
            <span className="material-symbols-outlined text-[18px] text-success">check_circle</span>
          </div>
          <div className="mt-3">
            <div className="text-headline-sm font-headline-sm text-on-surface">{inStock}</div>
            <div className="text-body-sm font-body-sm text-on-surface-variant mt-1">Above threshold</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between min-h-[24px]">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-warning">Low Stock</span>
            <span className="material-symbols-outlined text-[18px] text-warning">warning</span>
          </div>
          <div className="mt-3">
            <div className="text-headline-sm font-headline-sm text-on-surface">{lowStock}</div>
            <div className="text-body-sm font-body-sm text-on-surface-variant mt-1">At or below min</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between min-h-[24px]">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-error">Out of Stock</span>
            <span className="material-symbols-outlined text-[18px] text-error">cancel</span>
          </div>
          <div className="mt-3">
            <div className="text-headline-sm font-headline-sm text-error">{outOfStock}</div>
            <div className="text-body-sm font-body-sm text-on-surface-variant mt-1">Zero sellable</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-space-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between min-h-[24px]">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-purple-600">Damaged</span>
            <span className="material-symbols-outlined text-[18px] text-purple-600">broken_image</span>
          </div>
          <div className="mt-3">
            <div className="text-headline-sm font-headline-sm text-on-surface">{damagedStock}</div>
            <div className="text-body-sm font-body-sm text-on-surface-variant mt-1">Non-sellable units</div>
          </div>
        </div>

        {isOwner && (
          <div className="bg-primary-container/20 border border-primary-container p-space-md rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between min-h-[24px]">
              <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface">Valuation</span>
              <span className="material-symbols-outlined text-[18px] text-primary">account_balance_wallet</span>
            </div>
            <div className="mt-3">
              <div className="text-headline-sm font-headline-sm text-on-surface font-mono">ETB {totalWacValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div className="text-body-sm font-body-sm text-on-surface-variant mt-1">Owner Cost (WAC)</div>
            </div>
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center w-full">
          <div className="relative w-full lg:flex-1 min-w-0">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-dark-slate placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 outline-none transition-all" 
              placeholder="Search by product name or SKU..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-[220px] shrink-0">
            <select 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={isOwner ? branchId : effectiveBranchId}
              onChange={(e) => setBranchId(e.target.value)}
              disabled={!isOwner}
            >
              {isOwner && <option value="">All Branches</option>}
              {branchesData?.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-[220px] shrink-0">
            <select 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {categoriesData?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="w-full lg:w-[160px] shrink-0">
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
    </>
  );
}
