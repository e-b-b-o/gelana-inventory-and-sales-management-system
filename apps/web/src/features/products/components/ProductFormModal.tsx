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
        className="absolute inset-0 bg-scrim/40 backdrop-blur-sm transition-opacity"
        onClick={isPending ? undefined : onClose}
      ></div>
      
      <div className="relative bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-outline-variant flex items-center justify-between shrink-0">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button 
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 rounded bg-error-container border border-error/20 flex items-start gap-3 text-on-error-container">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
              <span className="text-body-md font-body-md">{error}</span>
            </div>
          )}

          <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                Product Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                autoFocus
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="e.g. Premium Coffee Beans"
              />
            </div>
            
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                Category <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full h-[38px] px-3 pr-8 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none transition-colors"
                >
                  <option value="" disabled>Select a category</option>
                  {categoryOptions?.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {!cat.isActive && isEdit ? '(Inactive)' : ''}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Unit <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  placeholder="e.g. Piece"
                />
              </div>
              <div>
                <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                  Default Price <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultSellingPrice}
                  onChange={(e) => setFormData({ ...formData, defaultSellingPrice: e.target.value })}
                  className="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full p-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none transition-colors"
                placeholder="Optional product description"
              ></textarea>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-[38px] px-4 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="productForm"
            disabled={isPending}
            className="h-[38px] px-4 rounded bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
