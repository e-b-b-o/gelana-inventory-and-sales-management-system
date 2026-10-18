import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "../api";
import {
  useProductUnits,
  useCreateProductUnit,
  useUpdateProductUnit,
  useUpdateProductUnitStatus,
  type ProductUnit,
} from "../api";
import { getMe } from "../../auth/api/auth";
import { PriceHistoryModal } from "./PriceHistoryModal";

interface ProductUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function ProductUnitsModal({ isOpen, onClose, product }: ProductUnitsModalProps) {
  const { data: userResponse } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";

  const { data: units, isLoading: isUnitsLoading } = useProductUnits(product?.id || "");
  const createMutation = useCreateProductUnit(product?.id || "");
  const updateMutation = useUpdateProductUnit(product?.id || "");
  const statusMutation = useUpdateProductUnitStatus(product?.id || "");

  const [isAdding, setIsAdding] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyUnit, setHistoryUnit] = useState<ProductUnit | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    conversionQuantity: "",
    sellingPrice: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setIsAdding(false);
      setEditingUnitId(null);
      setError("");
      setFormData({ name: "", conversionQuantity: "", sellingPrice: "" });
    }
  }, [isOpen]);

  const handleStartAdd = () => {
    setError("");
    setFormData({ name: "", conversionQuantity: "", sellingPrice: "" });
    setEditingUnitId(null);
    setIsAdding(true);
  };

  const handleStartEdit = (unit: ProductUnit) => {
    setError("");
    setFormData({
      name: unit.name,
      conversionQuantity: unit.conversionQuantity.toString(),
      sellingPrice: unit.sellingPrice ? unit.sellingPrice.toString() : "",
    });
    setIsAdding(false);
    setEditingUnitId(unit.id);
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingUnitId(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Unit name is required");
      return;
    }

    const qty = Number(formData.conversionQuantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Conversion quantity must be a number greater than 0");
      return;
    }

    const price = Number(formData.sellingPrice);
    if (isNaN(price) || price < 0) {
      setError("Price must be a number greater than or equal to 0");
      return;
    }

    try {
      if (isAdding) {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          conversionQuantity: qty,
          sellingPrice: price,
          isActive: true,
        });
      } else if (editingUnitId) {
        const updateData: any = {
          name: formData.name.trim(),
        };
        
        // Base units must maintain conversion Qty 1
        const unit = units?.find(u => u.id === editingUnitId);
        if (!unit?.isBase) {
          updateData.conversionQuantity = qty;
        }

        updateData.sellingPrice = price;

        await updateMutation.mutateAsync({
          unitId: editingUnitId,
          data: updateData,
        });
      }
      setIsAdding(false);
      setEditingUnitId(null);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  };

  const handleToggleStatus = async (unit: ProductUnit) => {
    if (unit.isBase && unit.isActive) {
      // Trying to deactivate base unit
      if (product?.isActive) {
        window.alert("Cannot deactivate the BASE unit of an active product.");
        return;
      }
    }

    const confirmMessage = unit.isActive
      ? `Are you sure you want to deactivate the unit '${unit.name}'?`
      : `Are you sure you want to reactivate the unit '${unit.name}'?`;

    if (window.confirm(confirmMessage)) {
      try {
        await statusMutation.mutateAsync({ unitId: unit.id, isActive: !unit.isActive });
      } catch (err: any) {
        window.alert(err.message || "Failed to update status");
      }
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-card border border-neutral-200/60 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-dark-slate">Units: {product.name}</h2>
            <p className="text-sm text-slate-500 font-medium">SKU: {product.sku}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {isUnitsLoading ? (
            <div className="text-center py-8 text-slate-500 text-sm font-medium">Loading units...</div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Unit Name</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Conversion (to Base)</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Price</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Type</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text">Status</th>
                      <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-text text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {units?.map((unit) => (
                      <tr key={unit.id} className="hover:bg-slate-100/50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-dark-slate">{unit.name}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-slate-700">{Number(unit.conversionQuantity)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-slate-800">${unit.sellingPrice ? Number(unit.sellingPrice).toFixed(2) : '0.00'}</span>
                        </td>
                        <td className="py-3 px-4">
                          {unit.isBase ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-blue-100 text-blue-700 uppercase">Base</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-200 text-slate-600 uppercase">Alternate</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                            unit.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${unit.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {unit.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => {
                                setHistoryUnit(unit);
                                setIsHistoryOpen(true);
                              }}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800"
                            >
                              History
                            </button>
                            {isOwner && (
                              <>
                                <button
                                  onClick={() => handleStartEdit(unit)}
                                  className="text-xs font-bold text-primary hover:text-primary-hover"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(unit)}
                                  disabled={statusMutation.isPending}
                                  className={`text-xs font-bold ${unit.isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                                >
                                  {unit.isActive ? 'Deactivate' : 'Reactivate'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {units?.length === 0 && (
                      <tr>
                        <td colSpan={isOwner ? 6 : 5} className="py-6 text-center text-muted-text text-sm">
                          No units found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {isOwner && !isAdding && !editingUnitId && (
                <div className="flex justify-end">
                  <button
                    onClick={handleStartAdd}
                    className="py-2.5 px-5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Alternate Unit
                  </button>
                </div>
              )}

              {(isAdding || editingUnitId) && (
                <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-dark-slate mb-4">
                    {isAdding ? "Add New Unit" : "Edit Unit"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Unit Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                        placeholder="e.g. Box, Dozen"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Conversion Qty</label>
                      <input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        value={formData.conversionQuantity}
                        onChange={(e) => setFormData({ ...formData, conversionQuantity: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium disabled:opacity-50 disabled:bg-slate-50"
                        placeholder="Qty relative to base unit"
                        disabled={editingUnitId ? units?.find(u => u.id === editingUnitId)?.isBase : false}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Selling Price</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-slate-400 font-bold">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.sellingPrice}
                          onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                          className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                    >
                      {isAdding ? "Add Unit" : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
      <PriceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        product={product}
        unit={historyUnit}
      />
    </div>
  );
}
