import { useState, useEffect } from "react";
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

  const [view, setView] = useState<"products" | "categories">("products");

  // Product Filters
  const [productSearchInput, setProductSearchInput] = useState("");
  const [debouncedProductSearch, setDebouncedProductSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [productStatusFilter, setProductStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Category Filters
  const [categorySearchInput, setCategorySearchInput] = useState("");
  const [debouncedCategorySearch, setDebouncedCategorySearch] = useState("");
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Debounce product search (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductSearch(productSearchInput.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [productSearchInput]);

  // Debounce category search (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCategorySearch(categorySearchInput.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [categorySearchInput]);

  // Always fetch full category list for dropdown selector
  const { data: allCategories } = useCategories();

  // Filtered queries
  const {
    data: categories,
    isLoading: isCatsLoading,
    isError: isCatsError,
    refetch: refetchCats,
  } = useCategories({
    search: debouncedCategorySearch || undefined,
    isActive:
      categoryStatusFilter === "ACTIVE" ? true : categoryStatusFilter === "INACTIVE" ? false : undefined,
  });

  const {
    data: products,
    isLoading: isProdsLoading,
    isError: isProdsError,
    refetch: refetchProds,
  } = useProducts({
    search: debouncedProductSearch || undefined,
    categoryId: selectedCategoryId !== "ALL" ? selectedCategoryId : undefined,
    isActive:
      productStatusFilter === "ACTIVE" ? true : productStatusFilter === "INACTIVE" ? false : undefined,
  });

  const statusMutation = useUpdateCategoryStatus();
  const productStatusMutation = useUpdateProductStatus();

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

  const hasProductFilters =
    Boolean(productSearchInput.trim()) || selectedCategoryId !== "ALL" || productStatusFilter !== "ALL";
  const handleClearProductFilters = () => {
    setProductSearchInput("");
    setDebouncedProductSearch("");
    setSelectedCategoryId("ALL");
    setProductStatusFilter("ALL");
  };

  const hasCategoryFilters =
    Boolean(categorySearchInput.trim()) || categoryStatusFilter !== "ALL";
  const handleClearCategoryFilters = () => {
    setCategorySearchInput("");
    setDebouncedCategorySearch("");
    setCategoryStatusFilter("ALL");
  };

  return (
    <>
      {/* Header and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Product Catalog</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Manage catalog items, base & alternate selling units, and multi-branch stock availability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => setView(view === "products" ? "categories" : "products")}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {view === "products" ? "category" : "inventory_2"}
                </span>
                {view === "products" ? "Manage Categories" : "Back to Products"}
              </button>
              {view === "categories" ? (
                <button
                  type="button"
                  onClick={handleAddCat}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Category
                </button>
              ) : (
                <button
                  type="button"
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

      {/* View Switcher Bar & Search Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setView("products")}
              className={`px-3 py-1.5 rounded-lg text-label-md font-label-md transition-colors ${
                view === "products"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              Products ({products?.length ?? 0})
            </button>
            <button
              type="button"
              onClick={() => setView("categories")}
              className={`px-3 py-1.5 rounded-lg text-label-md font-label-md transition-colors ${
                view === "categories"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              Categories ({categories?.length ?? 0})
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        {view === "products" ? (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search products by name, SKU, or brand..."
                value={productSearchInput}
                onChange={(e) => setProductSearchInput(e.target.value)}
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-outline-variant bg-surface text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant"
                aria-label="Search products"
              />
              {productSearchInput && (
                <button
                  type="button"
                  onClick={() => setProductSearchInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-full"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Category Dropdown Filter */}
            <div className="sm:w-56">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary"
                aria-label="Filter by category"
              >
                <option value="ALL">All Categories</option>
                {allCategories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown Filter */}
            <div className="sm:w-36">
              <select
                value={productStatusFilter}
                onChange={(e) => setProductStatusFilter(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary"
                aria-label="Filter by status"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {hasProductFilters && (
              <button
                type="button"
                onClick={handleClearProductFilters}
                className="h-10 px-3 text-label-sm font-label-md text-primary hover:text-primary-hover hover:bg-primary-container/20 rounded-lg transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Reset
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input for Categories */}
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                search
              </span>
              <input
                type="text"
                placeholder="Search categories by name..."
                value={categorySearchInput}
                onChange={(e) => setCategorySearchInput(e.target.value)}
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-outline-variant bg-surface text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-on-surface-variant"
                aria-label="Search categories"
              />
              {categorySearchInput && (
                <button
                  type="button"
                  onClick={() => setCategorySearchInput("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1 rounded-full"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Status Dropdown Filter */}
            <div className="sm:w-44">
              <select
                value={categoryStatusFilter}
                onChange={(e) => setCategoryStatusFilter(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary"
                aria-label="Filter by category status"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {hasCategoryFilters && (
              <button
                type="button"
                onClick={handleClearCategoryFilters}
                className="h-10 px-3 text-label-sm font-label-md text-primary hover:text-primary-hover hover:bg-primary-container/20 rounded-lg transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Table Content */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          {view === "categories" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant">
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">
                    Category Name
                  </th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">
                    Status
                  </th>
                  {isOwner && (
                    <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md font-body-md">
                {isCatsLoading && (
                  <tr>
                    <td colSpan={isOwner ? 3 : 2} className="py-12 text-center text-on-surface-variant">
                      <div className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[20px] text-primary">
                          progress_activity
                        </span>
                        <span>Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {isCatsError && !isCatsLoading && (
                  <tr>
                    <td colSpan={isOwner ? 3 : 2} className="py-8 text-center text-error">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[28px]">error</span>
                        <p className="font-semibold text-body-md">Failed to load categories</p>
                        <button
                          type="button"
                          onClick={() => refetchCats()}
                          className="px-3 py-1 bg-surface-container border border-outline-variant rounded text-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!isCatsLoading && !isCatsError && categories?.map((category: Category) => (
                  <tr key={category.id} className="hover:bg-surface transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface">{category.name}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                          category.isActive
                            ? "bg-success-container text-success"
                            : "bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleEditCat(category)}
                            className="text-label-sm font-label-sm text-primary hover:text-primary-hover"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleCatStatus(category)}
                            disabled={statusMutation.isPending}
                            className={`text-label-sm font-label-sm ${
                              category.isActive
                                ? "text-error hover:text-red-700"
                                : "text-success hover:text-emerald-700"
                            }`}
                          >
                            {category.isActive ? "Deactivate" : "Reactivate"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {!isCatsLoading && !isCatsError && (!categories || categories.length === 0) && (
                  <tr>
                    <td colSpan={isOwner ? 3 : 2} className="py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-outline">
                          category
                        </span>
                        <p className="font-semibold text-body-md text-on-surface">No categories found</p>
                        {hasCategoryFilters && (
                          <p className="text-body-sm text-on-surface-variant">
                            No categories matched your search criteria.{" "}
                            <button
                              type="button"
                              onClick={handleClearCategoryFilters}
                              className="text-primary hover:underline font-medium"
                            >
                              Clear filters
                            </button>
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant">
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">
                    SKU
                  </th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">
                    Product
                  </th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">
                    Category
                  </th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">
                    Price / Unit
                  </th>
                  <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle">
                    Status
                  </th>
                  {isOwner && (
                    <th className="py-3 px-4 text-label-sm font-label-sm uppercase tracking-wider text-on-surface-subtle text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-body-md font-body-md">
                {isProdsLoading && (
                  <tr>
                    <td colSpan={isOwner ? 6 : 5} className="py-12 text-center text-on-surface-variant">
                      <div className="inline-flex items-center gap-2">
                        <span className="material-symbols-outlined animate-spin text-[20px] text-primary">
                          progress_activity
                        </span>
                        <span>Loading products...</span>
                      </div>
                    </td>
                  </tr>
                )}

                {isProdsError && !isProdsLoading && (
                  <tr>
                    <td colSpan={isOwner ? 6 : 5} className="py-8 text-center text-error">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[28px]">error</span>
                        <p className="font-semibold text-body-md">Failed to load products</p>
                        <button
                          type="button"
                          onClick={() => refetchProds()}
                          className="px-3 py-1 bg-surface-container border border-outline-variant rounded text-label-sm text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {!isProdsLoading && !isProdsError && products?.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-surface transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-label-sm font-label-sm text-on-surface-variant">
                        {product.sku}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{product.name}</span>
                        {product.brand && (
                          <span className="text-[11px] text-on-surface-variant">{product.brand}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-on-surface-variant">{product.categoryName || "Uncategorized"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-on-surface">
                        ${Number(product.defaultSellingPrice).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-on-surface-variant ml-1">/ {product.unit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-semibold ${
                          product.isActive
                            ? "bg-success-container text-success"
                            : "bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {isOwner && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => handleManageUnits(product)}
                            className="text-label-sm font-label-sm text-on-surface-variant hover:text-on-surface"
                          >
                            Units
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditProd(product)}
                            className="text-label-sm font-label-sm text-primary hover:text-primary-hover"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleProdStatus(product)}
                            disabled={productStatusMutation.isPending}
                            className={`text-label-sm font-label-sm ${
                              product.isActive
                                ? "text-error hover:text-red-700"
                                : "text-success hover:text-emerald-700"
                            }`}
                          >
                            {product.isActive ? "Deactivate" : "Reactivate"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {!isProdsLoading && !isProdsError && (!products || products.length === 0) && (
                  <tr>
                    <td colSpan={isOwner ? 6 : 5} className="py-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-outline">
                          inventory_2
                        </span>
                        <p className="font-semibold text-body-md text-on-surface">No products found</p>
                        {hasProductFilters && (
                          <p className="text-body-sm text-on-surface-variant">
                            No products matched your search or category filters.{" "}
                            <button
                              type="button"
                              onClick={handleClearProductFilters}
                              className="text-primary hover:underline font-medium"
                            >
                              Clear filters
                            </button>
                          </p>
                        )}
                      </div>
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
