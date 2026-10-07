import { useState, useEffect } from "react";
import { useCreateProduct, useUpdateProduct, type Product } from "../api";
import { useCategories } from "../../categories/api";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categories } = useCategories();

  const isEdit = !!product;

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    brand: "",
    description: "",
    imageUrl: "",
    unit: "",
    defaultSellingPrice: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name,
          categoryId: product.categoryId,
          brand: product.brand || "",
          description: product.description || "",
          imageUrl: product.imageUrl || "",
          unit: product.unit,
          defaultSellingPrice: product.defaultSellingPrice,
        });
      } else {
        setFormData({
          name: "",
          categoryId: "",
          brand: "",
          description: "",
          imageUrl: "",
          unit: "",
          defaultSellingPrice: "",
        });
      }
      setError("");
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const activeCategories = categories?.filter(c => c.isActive) || [];
  const categoryOptions = isEdit 
    ? categories // allow current category even if inactive
    : activeCategories; // only active for new

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!formData.categoryId) {
      setError("Category is required");
      return;
    }
    if (!formData.unit.trim()) {
      setError("Unit is required");
      return;
    }
    const price = Number(formData.defaultSellingPrice);
    if (isNaN(price) || price < 0) {
      setError("Valid default selling price is required (>= 0)");
      return;
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: product.id,
          data: {
            ...formData,
            brand: formData.brand || null,
            description: formData.description || null,
            imageUrl: formData.imageUrl || null,
            defaultSellingPrice: price,
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          brand: formData.brand || null,
          description: formData.description || null,
          imageUrl: formData.imageUrl || null,
          defaultSellingPrice: price,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to save product");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={isPending ? undefined : onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form id="productForm" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-slate-900"
                placeholder="e.g. Premium Coffee Beans"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-slate-900 appearance-none"
              >
                <option value="" disabled>Select a category</option>
                {categoryOptions?.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {!cat.isActive && isEdit ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-slate-900"
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-slate-900"
                  placeholder="e.g. Piece"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Default Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultSellingPrice}
                  onChange={(e) => setFormData({ ...formData, defaultSellingPrice: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-slate-900"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium text-slate-900 resize-none"
                placeholder="Optional product description"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="productForm"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white text-sm font-bold shadow-btn transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              isEdit ? "Save Changes" : "Create Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
