import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/api/auth";
import { useReceivings } from "../api";
import { useBranches } from "../../branches/api";
import { useSuppliers } from "../../suppliers/api";
import { format } from "date-fns";
import { ReceivingDetailsDrawer } from "./ReceivingDetailsDrawer";
import { Link } from "react-router-dom";

export function ReceivingsPage() {
  const { data: userResponse } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });
  const isOwner = userResponse?.user?.role === "OWNER";
  
  const { data: branches = [] } = useBranches({ enabled: isOwner });
  const { data: suppliersData } = useSuppliers({ enabled: isOwner });
  const suppliers = suppliersData || [];
  
  const [branchId, setBranchId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [page, setPage] = useState(1);
  const limit = 50;
  const [selectedReceivingId, setSelectedReceivingId] = useState<string | null>(null);

  const { data, isLoading } = useReceivings(
    { branchId, supplierId, page, limit },
    { enabled: isOwner }
  );
  
  const receivings = data?.data || [];
  const meta = data?.meta;

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="material-symbols-outlined text-[48px] text-error mb-4">lock</span>
        <h2 className="text-title-lg font-title-lg text-on-surface mb-2">Access Denied</h2>
        <p className="text-body-md font-body-md text-on-surface-variant max-w-md">
          You do not have permission to view receiving history. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* PAGE TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Receiving History</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">Audit log of all past stock receipts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/receivings/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Receiving
          </Link>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 mb-space-lg">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full">
          <div className="w-full lg:w-[220px] shrink-0">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={branchId}
              onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
            >
              <option value="">All Branches</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full lg:w-[220px] shrink-0">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              value={supplierId}
              onChange={(e) => { setSupplierId(e.target.value); setPage(1); }}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Active Filters:</span>
            <span className="text-dark-slate font-medium">{(branchId || supplierId) ? "Applied" : "None"}</span>
          </div>
          <div className="font-medium text-dark-slate">
            Showing <strong className="font-bold">{receivings.length}</strong> records
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date & Ref</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Branch</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Received By</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Total Cost</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                      Loading receivings...
                    </div>
                  </td>
                </tr>
              ) : receivings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="text-slate-400 mb-2">
                      <span className="material-symbols-outlined text-4xl">inbox</span>
                    </div>
                    <div className="text-body-md font-medium text-dark-slate">No receivings found</div>
                    <div className="text-sm text-slate-500 mt-1">Try adjusting your filters or record a new receiving.</div>
                  </td>
                </tr>
              ) : (
                receivings.map((rec: any) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-dark-slate">{format(new Date(rec.createdAt), "MMM d, yyyy h:mm a")}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{rec.receivingNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-dark-slate">
                      {rec.supplier.name}
                    </td>
                    <td className="px-4 py-3 text-dark-slate">
                      {rec.branch.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">
                      {rec.receivedBy.name}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-dark-slate">
                      ETB {Number(rec.totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedReceivingId(rec.id)}
                        className="text-primary hover:text-primary-hover font-medium text-sm transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500">
              Page <span className="font-medium text-dark-slate">{meta.page}</span> of <span className="font-medium text-dark-slate">{meta.totalPages}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-sm font-medium rounded border border-slate-300 text-dark-slate bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                className="px-3 py-1.5 text-sm font-medium rounded border border-slate-300 text-dark-slate bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ReceivingDetailsDrawer 
        receivingId={selectedReceivingId} 
        onClose={() => setSelectedReceivingId(null)} 
      />
    </>
  );
}
