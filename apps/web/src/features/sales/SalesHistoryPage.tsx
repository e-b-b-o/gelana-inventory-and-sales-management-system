import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { getMe } from "../auth/api/auth";
import { useSales } from "./api";
import { useBranches } from "../branches/api";
import { useUsers } from "../users/api";
import { SaleDetailsDrawer } from "./SaleDetailsDrawer";

export function SalesHistoryPage() {
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";

  const { data: branches = [] } = useBranches();
  const { data: users = [] } = useUsers();

  const [branchId, setBranchId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useSales({
    branchId: branchId || undefined,
    employeeId: employeeId || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: search || undefined,
    page,
    limit,
  });

  const salesList = data?.data || [];
  const meta = data?.meta;

  const handleResetFilters = () => {
    setBranchId("");
    setEmployeeId("");
    setStartDate("");
    setEndDate("");
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(branchId || employeeId || startDate || endDate || search);

  return (
    <>
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Sales History</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Audit log of all completed sales, discounts, and payment transactions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/sales/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Sale
          </Link>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 mb-space-lg">
        <div className="flex flex-col lg:flex-row gap-3 items-center w-full">
          {/* Search by sale # */}
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
              placeholder="Search by sale number (e.g. SAL-000001)..."
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

          {/* Employee filter (Owner only) */}
          {isOwner && (
            <div className="w-full lg:w-[180px] shrink-0">
              <select
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
              >
                <option value="">All Staff</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Start Date */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-500 shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-medium text-dark-slate focus:border-primary outline-none"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-slate-500 shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-medium text-dark-slate focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Filter Summary & Count */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Active Filters:</span>
            <span className="text-dark-slate font-medium">
              {hasActiveFilters ? "Applied" : "None"}
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-primary hover:underline font-medium ml-2 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="font-medium text-dark-slate">
            Showing <strong className="font-bold">{salesList.length}</strong> sales records
          </div>
        </div>
      </div>

      {/* TABLE / CONTENT */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
              Loading sales history...
            </div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-error">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <div className="text-body-md font-medium">Failed to load sales history</div>
            <div className="text-sm mt-1">{(error as any)?.message || "Network error. Please try again."}</div>
          </div>
        ) : salesList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="text-slate-400 mb-2">
              <span className="material-symbols-outlined text-4xl">receipt_long</span>
            </div>
            <div className="text-body-md font-medium text-dark-slate mb-1">No sales records found</div>
            <p className="text-sm text-slate-500 max-w-sm mb-4">
              {hasActiveFilters
                ? "No sales match the applied filters. Try adjusting your search or date criteria."
                : "No sales have been recorded yet. Click below to start your first sale."}
            </p>
            <Link
              to="/sales/new"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create First Sale
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sale #</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  {isOwner && (
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Branch</th>
                  )}
                  {isOwner && (
                    <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sold By</th>
                  )}
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Items</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Subtotal</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Discounts</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Grand Total</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {salesList.map((sale: any) => {
                  const itemsCount = sale.items?.length || 0;
                  const saleDiscountNum = parseFloat(sale.saleDiscount) || 0;
                  const totalLineDiscounts = (sale.items || []).reduce(
                    (sum: number, it: any) => sum + (parseFloat(it.lineDiscount) || 0),
                    0
                  );
                  const totalDiscounts = saleDiscountNum + totalLineDiscounts;
                  const paymentNames = (sale.payments || [])
                    .map((p: any) => p.paymentMethod?.name)
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSaleId(sale.id)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-primary">
                        {sale.saleNumber}
                      </td>
                      <td className="px-4 py-3 text-dark-slate whitespace-nowrap">
                        {sale.soldAt ? format(new Date(sale.soldAt), "MMM d, yyyy h:mm a") : "-"}
                      </td>
                      {isOwner && (
                        <td className="px-4 py-3 text-dark-slate">
                          <span className="font-medium">{sale.branch?.name || "Main Branch"}</span>
                          {sale.branch?.code && (
                            <span className="text-xs text-slate-500 block font-mono">{sale.branch.code}</span>
                          )}
                        </td>
                      )}
                      {isOwner && (
                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {sale.createdBy?.name || "Staff"}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700 font-medium">
                          {itemsCount} {itemsCount === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        ETB {parseFloat(sale.subtotal).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {totalDiscounts > 0 ? (
                          <span className="text-error font-medium">
                            -ETB {totalDiscounts.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-dark-slate">
                        ETB {parseFloat(sale.grandTotal).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px] truncate" title={paymentNames}>
                        {paymentNames || "Cash"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Completed
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSaleId(sale.id);
                          }}
                          className="text-primary hover:text-primary-hover font-medium text-sm transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION FOOTER */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-sm text-slate-500">
            <div>
              Showing page <span className="font-medium text-dark-slate">{meta.page}</span> of{" "}
              <span className="font-medium text-dark-slate">{meta.totalPages}</span> ({meta.total} total sales)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm font-medium rounded border border-slate-300 text-dark-slate bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="px-3 py-1.5 text-sm font-medium rounded border border-slate-300 text-dark-slate bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SALE DETAILS DRAWER */}
      <SaleDetailsDrawer
        saleId={selectedSaleId}
        onClose={() => setSelectedSaleId(null)}
      />
    </>
  );
}
