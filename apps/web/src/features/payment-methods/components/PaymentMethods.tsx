import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/api/auth";
import { usePaymentMethods, useTogglePaymentMethodStatus } from "../api";
import type { PaymentMethod } from "../api";
import { PaymentMethodFormModal } from "./PaymentMethodFormModal";

export function PaymentMethods() {
  const { data: userResponse } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";
  
  const { data: methods, isLoading, error } = usePaymentMethods();
  const statusMutation = useTogglePaymentMethodStatus();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const handleToggleStatus = async (method: PaymentMethod) => {
    const confirmMessage = method.isActive
      ? `Are you sure you want to deactivate the payment method '${method.name}'?`
      : `Are you sure you want to reactivate the payment method '${method.name}'?`;

    if (window.confirm(confirmMessage)) {
      try {
        await statusMutation.mutateAsync({ id: method.id, isActive: !method.isActive });
      } catch (err: any) {
        window.alert(err.message || "Failed to update status");
      }
    }
  };

  const handleAdd = () => {
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payment Methods</h1>
          <p className="text-xs text-slate-500 mt-1">Configure accepted payment methods for sales and daily closing.</p>
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
              <span>Add Method</span>
            </button>
          </div>
        )}
      </div>

      <section className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-card overflow-hidden">
        <div className="p-5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <h2 className="text-sm font-bold text-slate-800">All Payment Methods</h2>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>Total <strong className="text-slate-800">{methods?.length || 0}</strong> methods</span>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-slate-500">Loading...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-48 text-red-500">Failed to load payment methods</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  {isOwner && (
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {methods?.map(method => (
                  <tr key={method.id} className="hover:bg-slate-50 transition group">
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 group-hover:text-primary transition">
                        {method.name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {method.details || <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        method.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${method.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEdit(method)}
                            className="text-primary hover:text-primary-hover font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(method)}
                            disabled={statusMutation.isPending}
                            className={`font-bold ${method.isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                          >
                            {method.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {methods?.length === 0 && (
                  <tr>
                    <td colSpan={isOwner ? 4 : 3} className="py-8 text-center text-slate-500 font-medium">
                      No payment methods found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <PaymentMethodFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        method={editingMethod}
      />
    </div>
  );
}
