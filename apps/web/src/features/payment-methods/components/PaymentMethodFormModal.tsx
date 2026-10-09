import React, { useState, useEffect } from "react";
import { useCreatePaymentMethod, useUpdatePaymentMethod } from "../api";
import type { PaymentMethod } from "../api";

interface PaymentMethodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  method?: PaymentMethod | null;
}

export function PaymentMethodFormModal({ isOpen, onClose, method }: PaymentMethodFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    details: "",
  });
  const [error, setError] = useState("");

  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod();

  useEffect(() => {
    if (isOpen) {
      if (method) {
        setFormData({
          name: method.name,
          details: method.details || "",
        });
      } else {
        setFormData({
          name: "",
          details: "",
        });
      }
      setError("");
    }
  }, [isOpen, method]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Payment method name is required");
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        details: formData.details.trim() || null,
      };

      if (method) {
        await updateMutation.mutateAsync({ id: method.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-card border border-neutral-200/60 w-full max-w-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-dark-slate">
            {method ? "Edit Payment Method" : "Add Payment Method"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form id="pm-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="e.g. Cash, Credit Card"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Configuration / Details (Optional)
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium resize-none"
                placeholder="e.g. Account number or business instructions"
                rows={3}
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-200/50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="pm-form"
            disabled={isPending}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-btn transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : (method ? "Save Changes" : "Add Method")}
          </button>
        </div>
      </div>
    </div>
  );
}
