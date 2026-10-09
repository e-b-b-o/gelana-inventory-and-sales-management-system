import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/api/auth";
import { useSuppliers, useToggleSupplierStatus } from "../api";
import type { Supplier } from "../api";
import { SupplierFormModal } from "./SupplierFormModal";

export function Suppliers() {
  const { data: userResponse } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";
  
  const { data: suppliers, isLoading, error } = useSuppliers();
  const statusMutation = useToggleSupplierStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (supplier.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || 
                          (statusFilter === "active" && supplier.isActive) ||
                          (statusFilter === "inactive" && !supplier.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (supplier: Supplier) => {
    const confirmMessage = supplier.isActive
      ? `Are you sure you want to deactivate the supplier '${supplier.name}'?`
      : `Are you sure you want to reactivate the supplier '${supplier.name}'?`;

    if (window.confirm(confirmMessage)) {
      try {
        await statusMutation.mutateAsync({ id: supplier.id, isActive: !supplier.isActive });
      } catch (err: any) {
        window.alert(err.message || "Failed to update status");
      }
    }
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Suppliers</h1>
              <p className="text-xs text-slate-500 mt-1">Manage suppliers, contacts, and related master data.</p>
            </div>
            
            {isOwner && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleAdd}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-md shadow-primary/20 flex items-center gap-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Supplier</span>
                </button>
              </div>
            )}
          </div>

          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-card overflow-hidden">
            <div className="p-5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-4 bg-white">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full max-w-xs">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Search by name or contact..."
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Status: All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span>Total <strong className="text-slate-800">{filteredSuppliers?.length || 0}</strong> suppliers</span>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-48 text-slate-500">Loading...</div>
              ) : error ? (
                <div className="flex items-center justify-center h-48 text-red-500">Failed to load suppliers</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-5">Supplier Name</th>
                      <th className="py-3.5 px-4">Contact Person</th>
                      <th className="py-3.5 px-4">Phone</th>
                      <th className="py-3.5 px-4 hidden md:table-cell">Address</th>
                      <th className="py-3.5 px-4">Status</th>
                      {isOwner && (
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredSuppliers?.map(supplier => (
                      <tr key={supplier.id} className="hover:bg-slate-50 transition group">
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-900 group-hover:text-primary transition">
                            {supplier.name}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-medium text-slate-700">
                          {supplier.contactPerson || <span className="text-slate-400 italic">None</span>}
                        </td>
                        <td className="py-4 px-4 font-mono text-slate-600">
                          {supplier.phone || <span className="text-slate-400 italic font-sans">None</span>}
                        </td>
                        <td className="py-4 px-4 text-slate-600 hidden md:table-cell max-w-[200px] truncate" title={supplier.address || ""}>
                          {supplier.address || <span className="text-slate-400 italic">None</span>}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            supplier.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${supplier.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {isOwner && (
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleEdit(supplier)}
                                className="text-primary hover:text-primary-hover font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(supplier)}
                                disabled={statusMutation.isPending}
                                className={`font-bold ${supplier.isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                              >
                                {supplier.isActive ? 'Deactivate' : 'Reactivate'}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    {filteredSuppliers?.length === 0 && (
                      <tr>
                        <td colSpan={isOwner ? 6 : 5} className="py-8 text-center text-slate-500 font-medium">
                          No suppliers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={editingSupplier}
      />
    </div>
  );
}
