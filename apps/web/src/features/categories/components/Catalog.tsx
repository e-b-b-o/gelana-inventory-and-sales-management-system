import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../auth/api/auth";
import { useCategories, useUpdateCategoryStatus, type Category } from "../api";
import { useProducts, useUpdateProductStatus, type Product } from "../../products/api";
import { CategoryFormModal } from "./CategoryFormModal";
import { ProductFormModal } from "../../products/components/ProductFormModal";

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

  if (isCatsLoading || isProdsLoading) {
    return <div className="p-8 text-center text-muted-text">Loading catalog...</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-slate mb-2">Product Catalog</h1>
          <p className="text-muted-text text-sm font-medium">Manage catalog items, base & alternate selling units, and multi-branch stock availability.</p>
        </div>
        <div className="flex gap-3">
          {isOwner && (
            <>
              <button
                onClick={() => setView(view === "products" ? "categories" : "products")}
                className="py-3 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold shadow-sm transition-all duration-150"
              >
                {view === "products" ? "Manage Categories" : "Back to Products"}
              </button>
              {view === "categories" ? (
                <button
                  onClick={handleAddCat}
                  className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm shadow-btn transition-all duration-150 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Category
                </button>
              ) : (
                <button
                  onClick={handleAddProd}
                  className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm shadow-btn transition-all duration-150 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Product
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {view === "products" ? "Products" : "Categories"}
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-neutral-200/60 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          {view === "categories" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Category Name</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Status</th>
                  {isOwner && (
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories?.map((category: Category) => (
                  <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-dark-slate">{category.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEditCat(category)}
                            className="text-sm font-bold text-primary hover:text-primary-hover"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleCatStatus(category)}
                            disabled={statusMutation.isPending}
                            className={`text-sm font-bold ${category.isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
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
                    <td colSpan={isOwner ? 3 : 2} className="py-8 text-center text-muted-text text-sm">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">SKU</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Product</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Category</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Price / Unit</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Status</th>
                  {isOwner && (
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products?.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-slate-500 font-medium">{product.sku}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-dark-slate">{product.name}</span>
                        {product.brand && <span className="text-xs text-muted-text">{product.brand}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-slate-600">{product.categoryName}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-bold text-slate-800">${Number(product.defaultSellingPrice).toFixed(2)}</span>
                      <span className="text-xs text-muted-text ml-1">/ {product.unit}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEditProd(product)}
                            className="text-sm font-bold text-primary hover:text-primary-hover"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleProdStatus(product)}
                            disabled={productStatusMutation.isPending}
                            className={`text-sm font-bold ${product.isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
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
                    <td colSpan={isOwner ? 6 : 5} className="py-8 text-center text-muted-text text-sm">
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
    </div>
  );
}
