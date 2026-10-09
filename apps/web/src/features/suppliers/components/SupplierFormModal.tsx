import React, { useState, useEffect } from "react";
import { useCreateSupplier, useUpdateSupplier } from "../api";
import type { Supplier } from "../api";

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export function SupplierFormModal({ isOpen, onClose, supplier }: SupplierFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    contactPerson: "",
    notes: "",
  });
  const [error, setError] = useState("");

  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();

  useEffect(() => {
    if (isOpen) {
      if (supplier) {
        setFormData({
          name: supplier.name,
          phone: supplier.phone || "",
          address: supplier.address || "",
          contactPerson: supplier.contactPerson || "",
          notes: supplier.notes || "",
        });
      } else {
        setFormData({
          name: "",
          phone: "",
          address: "",
          contactPerson: "",
          notes: "",
        });
      }
      setError("");
    }
  }, [isOpen, supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Supplier name is required");
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        contactPerson: formData.contactPerson.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (supplier) {
        await updateMutation.mutateAsync({ id: supplier.id, data });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/30 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <h2 className="text-headline-sm font-headline-sm text-on-surface tracking-tight">
            {supplier ? "Edit Supplier" : "Add Supplier"}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="mb-6 p-4 bg-error-container border border-error-container rounded text-error text-body-md font-bold">
              {error}
            </div>
          )}

          <form id="supplier-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Supplier Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded border border-outline-variant bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g. Acme Supplies"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-4 py-3 rounded border border-outline-variant bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded border border-outline-variant bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g. +1 555-0123"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded border border-outline-variant bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Enter full address..."
              />
            </div>

            <div>
              <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded border border-outline-variant bg-surface text-body-md font-body-md text-on-surface focus:outline-none focus:ring-[3px] focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Additional details..."
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant bg-surface flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded border border-outline-variant bg-surface-container-lowest text-on-surface font-label-md shadow-sm hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="supplier-form"
            disabled={isPending}
            className="px-5 py-2.5 rounded bg-primary hover:bg-primary-hover text-on-primary font-bold text-label-md shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : (supplier ? "Save Changes" : "Add Supplier")}
          </button>
        </div>
      </div>
    </div>
  );
}
