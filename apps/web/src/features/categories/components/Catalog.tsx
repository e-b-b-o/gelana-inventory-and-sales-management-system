import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/api/auth";
import { useCategories, useUpdateCategoryStatus, type Category } from "../api";
import { useProducts, useUpdateProductStatus, type Product } from "../../products/api";
import { CategoryFormModal } from "./CategoryFormModal";
import { ProductFormModal } from "../../products/components/ProductFormModal";
import { ProductUnitsModal } from "../../products/components/ProductUnitsModal";

export function Catalog() {
  const { data: userResponse } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";

  const { data: categories, isLoading: isCatsLoading } = useCategories();
  const { data: products, isLoading: isProdsLoading } = useProducts();
  const statusMutation = useUpdateCategoryStatus();
  const productStatusMutation = useUpdateProductStatus();

  const [view, setView] = useState<"products" | "categories">("products");

  const [isCatFormOpen, setIsCatFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [isProdFormOpen, setIsProdFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isUnitsModalOpen, setIsUnitsModalOpen] = useState(false);
  const [selectedProductForUnits, setSelectedProductForUnits] = useState<Product | null>(null);

  const handleAddCat = () => {
    setSelectedCategory(null);
    setIsCatFormOpen(true);
  };
  const handleEditCat = (category: Category) => {
    setSelectedCategory(category);
    setIsCatFormOpen(true);
  };
  const handleToggleCatStatus = async (category: Category) => {
    const confirmMessage = category.isActive 
      ? `Are you sure you want to deactivate ${category.name}? It will no longer be available for new products.`
      : `Are you sure you want to reactivate ${category.name}?`;
      
    if (window.confirm(confirmMessage)) {
      await statusMutation.mutateAsync({ id: category.id, isActive: !category.isActive });
    }
  };

  const handleAddProd = () => {
    setSelectedProduct(null);
    setIsProdFormOpen(true);
  };
  const handleEditProd = (product: Product) => {
    setSelectedProduct(product);
    setIsProdFormOpen(true);
  };
  const handleToggleProdStatus = async (product: Product) => {
    const confirmMessage = product.isActive 
      ? `Are you sure you want to deactivate ${product.name}?`
      : `Are you sure you want to reactivate ${product.name}?`;
      
    if (window.confirm(confirmMessage)) {
      await productStatusMutation.mutateAsync({ id: product.id, isActive: !product.isActive });
    }
  };

  const handleManageUnits = (product: Product) => {
    setSelectedProductForUnits(product);
    setIsUnitsModalOpen(true);
  };

  if (isCatsLoading || isProdsLoading) {
    return <div className="p-8 text-center text-on-surface-variant font-body-md">Loading catalog...</div>;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Product Catalog</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Manage catalog items, base & alternate selling units, and multi-branch stock availability.
          </p>
        </div>
        <div className="flex gap-3">
          {isOwner && (
            <>
              <button
                onClick={() => setView(view === "products" ? "categories" : "products")}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm"
              >
                {view === "products" ? "Manage Categories" : "Back to Products"}
              </button>
              {view === "categories" ? (
                <button
                  onClick={handleAddCat}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Category
                </button>
              ) : (
                <button
                  onClick={handleAddProd}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Product
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <span className="text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant">
          {view === "products" ? "Products" : "Categories"}
        </span>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          {view === "categories" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant">
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Category Name</th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Status</th>
                  {isOwner && (
                    <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md font-body-md">
                {categories?.map((category: Category) => (
                  <tr key={category.id} className="hover:bg-surface transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      {category.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                        category.isActive ? 'bg-success-container text-success' : 'bg-surface-container-low text-on-surface-variant'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEditCat(category)}
                            className="text-label-sm font-label-sm text-primary hover:text-primary-hover"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleCatStatus(category)}
                            disabled={statusMutation.isPending}
                            className={`text-label-sm font-label-sm ${category.isActive ? 'text-error hover:text-red-700' : 'text-success hover:text-emerald-700'}`}
                          >
                            {category.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {(!categories || categories.length === 0) && (
                  <tr>
                    <td colSpan={isOwner ? 3 : 2} className="py-8 text-center text-on-surface-variant">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant">
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">SKU</th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Product</th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Category</th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Price / Unit</th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">Status</th>
                  {isOwner && (
                    <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md font-body-md">
                {products?.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-surface transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-label-sm font-label-sm text-on-surface-variant">{product.sku}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{product.name}</span>
                        {product.brand && <span className="text-[11px] text-on-surface-variant">{product.brand}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-on-surface-variant">{product.categoryName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-on-surface">${Number(product.defaultSellingPrice).toFixed(2)}</span>
                      <span className="text-[11px] text-on-surface-variant ml-1">/ {product.unit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                        product.isActive ? 'bg-success-container text-success' : 'bg-surface-container-low text-on-surface-variant'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleManageUnits(product)}
                            className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface"
                          >
                            Units
                          </button>
                          <button
                            onClick={() => handleEditProd(product)}
                            className="text-label-sm font-label-sm text-primary hover:text-primary-hover"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleProdStatus(product)}
                            disabled={productStatusMutation.isPending}
                            className={`text-label-sm font-label-sm ${product.isActive ? 'text-error hover:text-red-700' : 'text-success hover:text-emerald-700'}`}
                          >
                            {product.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {(!products || products.length === 0) && (
                  <tr>
                    <td colSpan={isOwner ? 6 : 5} className="py-8 text-center text-on-surface-variant">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CategoryFormModal
        isOpen={isCatFormOpen}
        onClose={() => setIsCatFormOpen(false)}
        category={selectedCategory}
      />
      <ProductFormModal
        isOpen={isProdFormOpen}
        onClose={() => setIsProdFormOpen(false)}
        product={selectedProduct}
      />
      <ProductUnitsModal
        isOpen={isUnitsModalOpen}
        onClose={() => setIsUnitsModalOpen(false)}
        product={selectedProductForUnits}
      />
    </>
  );
}
