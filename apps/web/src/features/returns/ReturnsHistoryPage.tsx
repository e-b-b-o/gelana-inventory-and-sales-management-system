import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { getMe } from "../auth/api/auth";
import { useReturns } from "./api";
import { useBranches } from "../branches/api";
import { ReturnDetailsDrawer } from "./ReturnDetailsDrawer";

export function ReturnsHistoryPage() {
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";

  const { data: branches = [] } = useBranches();

  const [branchId, setBranchId] = useState("");
  const [isUnlinked, setIsUnlinked] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useReturns({
    branchId: branchId || undefined,
    isUnlinked: isUnlinked === "" ? undefined : isUnlinked === "true",
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search || undefined,
    page,
    limit,
  });

  const returnsList = data?.data || [];
  const meta = data?.meta;

  const handleResetFilters = () => {
    setBranchId("");
    setIsUnlinked("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(branchId || isUnlinked !== "" || startDate || endDate || search);

  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Sales Returns</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Audit log of all sales returns, stock dispositions (sellable vs damaged), and customer refunds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/sales/returns/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Return
          </Link>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 mb-space-lg">
        <div className="flex flex-col lg:flex-row gap-3 items-center w-full">
          {/* Search by return # */}
          <div className="relative w-full lg:flex-1 min-w-0">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by return number (e.g. RET-000001)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-dark-slate placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
          </div>

          {/* Branch filter (Owner only) */}
          {isOwner && (
            <div className="w-full lg:w-[200px] shrink-0">
              <select
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              >
                <option value="">All Branches</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Return Type filter */}
          <div className="w-full lg:w-[180px] shrink-0">
            <select
              value={isUnlinked}
              onChange={(e) => {
                setIsUnlinked(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
            >
              <option value="">All Return Types</option>
              <option value="false">Linked to Sale</option>
              <option value="true">Unlinked (No Sale)</option>
            </select>
          </div>

          {/* Date range filters */}
          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
              title="Start Date"
            />
            <span className="text-slate-400 text-sm">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
              title="End Date"
            />
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-dark-slate hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-64 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
            <p className="text-sm font-medium">Loading sales returns...</p>
          </div>
        )}

        {isError && (
          <div className="p-8 text-center text-error bg-error/5">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p className="font-semibold text-sm">{(error as any)?.message || "Failed to load returns"}</p>
          </div>
        )}

        {!isLoading && !isError && returnsList.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">assignment_return</span>
            <p className="text-base font-semibold text-dark-slate">No returns found</p>
            <p className="text-sm text-slate-400 mt-1">
              {hasActiveFilters
                ? "Try adjusting your search filters to find returns."
                : "No customer returns have been recorded yet."}
            </p>
          </div>
        )}

        {!isLoading && !isError && returnsList.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4">Return #</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Branch</th>
                    <th className="py-3.5 px-4">Original Sale</th>
                    <th className="py-3.5 px-4">Items</th>
                    <th className="py-3.5 px-4 text-center">Stock Disposition</th>
                    <th className="py-3.5 px-4 text-right">Refund Total</th>
                    <th className="py-3.5 px-4">Authorized By</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnsList.map((ret: any) => {
                    const sellableCount = (ret.items || []).filter((i: any) => i.condition === "SELLABLE").length;
                    const damagedCount = (ret.items || []).filter((i: any) => i.condition === "DAMAGED").length;

                    return (
                      <tr
                        key={ret.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => setSelectedReturnId(ret.id)}
                      >
                        {/* Return # */}
                        <td className="py-3.5 px-4 font-mono font-bold text-primary group-hover:underline">
                          {ret.returnNumber}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                          {ret.createdAt ? format(new Date(ret.createdAt), "MMM d, yyyy h:mm a") : "-"}
                        </td>

                        {/* Branch */}
                        <td className="py-3.5 px-4 text-dark-slate font-medium">
                          {ret.branch?.name || "-"}
                        </td>

                        {/* Original Sale */}
                        <td className="py-3.5 px-4">
                          {ret.sale ? (
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-dark-slate border border-slate-200">
                              {ret.sale.saleNumber}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Unlinked
                            </span>
                          )}
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {ret.items?.length || 0} items
                        </td>

                        {/* Disposition */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {sellableCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {sellableCount} Sellable
                              </span>
                            )}
                            {damagedCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                {damagedCount} Damaged
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Refund Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-dark-slate">
                          ETB {parseFloat(ret.refundAmount).toFixed(2)}
                        </td>

                        {/* Authorized By */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {ret.createdBy?.name || "Staff"}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {ret.status || "COMPLETED"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedReturnId(ret.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-dark-slate transition-colors"
                            title="View Return Details"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                <div className="text-xs font-medium text-slate-500">
                  Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                  {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} returns
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={meta.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-dark-slate hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-600">
                    Page {meta.page} of {meta.totalPages}
                  </span>
                  <button
                    disabled={meta.page >= meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-dark-slate hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide-over Drawer for Return Details */}
      <ReturnDetailsDrawer
        returnId={selectedReturnId}
        onClose={() => setSelectedReturnId(null)}
      />
    </>
  );
}
