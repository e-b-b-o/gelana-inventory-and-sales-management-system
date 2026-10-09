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
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-space-lg">
            <div>
              <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Suppliers</h1>
              <p className="text-body-md font-body-md text-on-surface-variant mt-1">Manage suppliers, contacts, and related master data.</p>
            </div>
            
            {isOwner && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleAdd}
                  className="px-3.5 py-2 rounded bg-primary hover:bg-primary-hover text-on-primary text-label-md font-label-md shadow-sm flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Add Supplier</span>
                </button>
              </div>
            )}
          </div>

          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex flex-wrap items-center justify-between gap-4 bg-surface">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full max-w-xs">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded text-body-md font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-on-surface-subtle"
                    placeholder="Search by name or contact..."
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-2 px-3 bg-surface border border-outline-variant rounded text-body-md font-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Status: All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-3 text-label-sm font-label-sm text-on-surface-variant">
                <span>Total <strong className="text-on-surface">{filteredSuppliers?.length || 0}</strong> suppliers</span>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-48 text-on-surface-variant font-body-md">Loading...</div>
              ) : error ? (
                <div className="flex items-center justify-center h-48 text-error font-body-md">Failed to load suppliers</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface border-b border-outline-variant">
                      <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Supplier Name</th>
                      <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Contact Person</th>
                      <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Phone</th>
                      <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle hidden md:table-cell">Address</th>
                      <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Status</th>
                      {isOwner && (
                        <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-md font-body-md">
                    {filteredSuppliers?.map(supplier => (
                      <tr key={supplier.id} className="hover:bg-surface transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-on-surface">
                          {supplier.name}
                        </td>
                        <td className="py-3.5 px-4">
                          {supplier.contactPerson || <span className="text-on-surface-subtle italic">None</span>}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {supplier.phone || <span className="text-on-surface-subtle italic font-sans">None</span>}
                        </td>
                        <td className="py-3.5 px-4 hidden md:table-cell max-w-[200px] truncate" title={supplier.address || ""}>
                          {supplier.address || <span className="text-on-surface-subtle italic">None</span>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                            supplier.isActive ? 'bg-success-container text-success' : 'bg-surface-container-low text-on-surface-variant'
                          }`}>
                            {supplier.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {isOwner && (
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleEdit(supplier)}
                                className="text-label-sm font-label-sm text-primary hover:text-primary-hover"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleStatus(supplier)}
                                disabled={statusMutation.isPending}
                                className={`text-label-sm font-label-sm ${supplier.isActive ? 'text-error hover:text-red-700' : 'text-success hover:text-emerald-700'}`}
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
                        <td colSpan={isOwner ? 6 : 5} className="py-8 text-center text-on-surface-variant font-body-md">
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
    </>
  );
}
