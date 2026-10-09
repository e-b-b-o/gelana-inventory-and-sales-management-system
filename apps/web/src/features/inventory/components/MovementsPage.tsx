import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/api/auth";
import { useInventoryMovements } from "../api";
import { format } from "date-fns";
import { useBranches, type Branch } from "../../branches/api";

export function MovementsPage() {
  const { data: userResponse } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";
  
  const { data: branches = [] } = useBranches();
  
  const [branchId, setBranchId] = useState("");
  const [movementType, setMovementType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;

  const { data, isLoading } = useInventoryMovements({ 
    branchId, 
    movementType, 
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
    page, 
    limit 
  });
  
  const movements = data?.data || [];
  const meta = data?.meta;

  const formatMovementType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case "OPENING_STOCK":
      case "RECEIVING":
      case "RETURN_GOOD":
      case "RETURN_DAMAGED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "SALE":
      case "DISPOSAL":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "ADJUSTMENT":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "TRANSFER_OUT":
      case "TRANSFER_IN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getQuantitySign = (qty: number) => {
    if (qty > 0) return `+${qty}`;
    return `${qty}`; // negative already has minus
  };

  return (
    <>
      {/* PAGE TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Inventory Movements</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Audit log of all material changes to inventory across branches.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Branch</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={branchId}
              onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
              disabled={!isOwner}
            >
              <option value="">{isOwner ? "All Branches" : "My Branch"}</option>
              {branches.map((b: Branch) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Movement Type</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={movementType}
              onChange={(e) => { setMovementType(e.target.value); setPage(1); }}
            >
              <option value="">All Types</option>
              <option value="OPENING_STOCK">Opening Stock</option>
              <option value="SALE">Sale</option>
              <option value="RECEIVING">Receiving</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="TRANSFER_OUT">Transfer Out</option>
              <option value="TRANSFER_IN">Transfer In</option>
              <option value="RETURN_GOOD">Return (Good)</option>
              <option value="RETURN_DAMAGED">Return (Damaged)</option>
              <option value="DISPOSAL">Disposal</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
            <input 
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-dark-slate focus:border-primary outline-none"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">End Date</label>
            <input 
              type="date"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-dark-slate focus:border-primary outline-none"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-muted-text">
          <div className="flex items-center gap-2">
            <span>Active Filters:</span>
            <span className="text-dark-slate font-medium">
              {movementType || startDate || endDate ? "Applied" : "None"}
            </span>
          </div>
          {meta && (
            <div className="font-medium text-dark-slate">
              Showing <strong className="font-bold">{movements.length}</strong> of {meta.totalItems} records
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction & Date</th>
                <th className="py-3 px-4">Product & Category</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Movement Type</th>
                <th className="py-3 px-4 text-right">Quantity Delta</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4">Reason / User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-dark-slate">
              {isLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-muted-text">Loading movements...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-muted-text">No inventory movements found.</td></tr>
              ) : movements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono text-xs font-bold text-slate-700">{m.transactionId || 'PENDING'}</div>
                    <div className="text-[11px] text-muted-text font-medium mt-1">
                      {format(new Date(m.createdAt), 'MMM d, yyyy HH:mm')}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-[13px] leading-tight">{m.productName}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="font-mono text-[10px] text-slate-500">{m.productSku}</span>
                      <span className="text-[10px] text-slate-300">•</span>
                      <span className="text-[10px] text-slate-500">{m.categoryName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[13px]">{m.branchName}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${getMovementColor(m.movementType)}`}>
                      {formatMovementType(m.movementType)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className={`font-bold text-[13px] ${m.quantity > 0 ? 'text-emerald-600' : m.quantity < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                      {getQuantitySign(m.quantity)} {m.baseUnit}s
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-medium text-[13px] text-slate-700">
                      {Number(m.unitCost) > 0 ? `${Number(m.unitCost).toFixed(2)}` : '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[12px] font-medium text-slate-700 line-clamp-1" title={m.reason || ''}>
                      {m.reason || <span className="text-slate-400 italic">No reason provided</span>}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {m.createdBy}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        {meta && meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-500">
              Page {page} of {meta.totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}
