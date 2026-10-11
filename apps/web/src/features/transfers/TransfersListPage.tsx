import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { getMe } from "../auth/api/auth";
import { useBranches } from "../branches/api";
import { useTransfers } from "./api";

export function TransfersListPage() {
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";

  const { data: branches = [] } = useBranches();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sourceBranchId, setSourceBranchId] = useState("");
  const [destinationBranchId, setDestinationBranchId] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error } = useTransfers({
    search: search || undefined,
    status: status || undefined,
    sourceBranchId: sourceBranchId || undefined,
    destinationBranchId: destinationBranchId || undefined,
    page,
    limit,
  });

  const transfers = data?.data || [];
  const pagination = data?.pagination;

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setSourceBranchId("");
    setDestinationBranchId("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || status || sourceBranchId || destinationBranchId);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "REQUESTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Requested
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[14px]">check</span>
            Approved
          </span>
        );
      case "DISPATCHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
            Dispatched (In Transit)
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="material-symbols-outlined text-[14px]">cancel</span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {s}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Transfers</h1>
          <p className="text-sm text-slate-500 mt-1">
            Request, authorize, and dispatch product transfers between physical branches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/transfers/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Transfer
          </Link>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* Search by transfer # */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              placeholder="Search by TRF number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:bg-white focus:border-primary outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="REQUESTED">Requested (Pending Approval)</option>
              <option value="APPROVED">Approved (Ready for Dispatch)</option>
              <option value="DISPATCHED">Dispatched (In Transit)</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Source Branch filter (Owner only) */}
          {isOwner && (
            <div>
              <select
                value={sourceBranchId}
                onChange={(e) => {
                  setSourceBranchId(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:bg-white focus:border-primary outline-none cursor-pointer"
              >
                <option value="">All Source Branches</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    Source: {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Destination Branch filter (Owner only) */}
          {isOwner && (
            <div>
              <select
                value={destinationBranchId}
                onChange={(e) => {
                  setDestinationBranchId(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:bg-white focus:border-primary outline-none cursor-pointer"
              >
                <option value="">All Destination Branches</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    Dest: {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Filtered view active</span>
            <button
              onClick={handleResetFilters}
              className="text-primary hover:underline font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* TABLE / LIST CONTENT */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium">Loading stock transfers...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-rose-600">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p className="text-sm font-medium">Failed to load transfers: {(error as any)?.message || "Unknown error"}</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">sync_alt</span>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">No transfers found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {hasActiveFilters
                ? "No transfer records match your current filter settings. Try adjusting your search."
                : "No inter-branch transfers have been recorded yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Transfer Number</th>
                  <th className="py-3.5 px-4">Movement Route</th>
                  <th className="py-3.5 px-4 text-center">Items & Units</th>
                  <th className="py-3.5 px-4">Requested By</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transfers.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/transfers/${t.id}`}
                        className="font-mono font-bold text-primary hover:underline text-xs bg-slate-100 px-2.5 py-1 rounded border border-slate-200"
                      >
                        {t.transferNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <span className="text-slate-900">{t.sourceBranch?.name || "Source"}</span>
                        <span className="material-symbols-outlined text-[16px] text-primary">arrow_forward</span>
                        <span className="text-slate-900">{t.destinationBranch?.name || "Destination"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-semibold text-slate-800">{t.itemCount} items</span>
                      <span className="text-slate-500 text-xs block">
                        ({t.totalRequestedQuantity} requested units)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{t.createdBy?.name || "Staff"}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {t.createdAt ? format(new Date(t.createdAt), "MMM d, yyyy h:mm a") : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-center">{getStatusBadge(t.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/transfers/${t.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors shadow-xs"
                      >
                        View Details
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Showing {transfers.length} of {pagination.total} transfers (Page {pagination.page} of {pagination.totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
