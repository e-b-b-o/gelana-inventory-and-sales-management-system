import { useState, useMemo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import { useBranches } from "../branches/api";
import { useProducts, type Product } from "../products/api";
import { useInventoryBalances } from "../inventory/api";
import { useCreateTransfer } from "./api";

interface SelectedItem {
  product: Product;
  requestedQuantity: number;
}

export function NewTransferPage() {
  const navigate = useNavigate();

  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const user = userResponse?.user;
  const isOwner = user?.role === "OWNER";

  const { data: rawBranches } = useBranches();
  const branches = useMemo(() => (Array.isArray(rawBranches) ? rawBranches : []), [rawBranches]);

  const { data: rawProducts } = useProducts();
  const products = useMemo(() => (Array.isArray(rawProducts) ? rawProducts : []), [rawProducts]);

  const [sourceBranchId, setSourceBranchId] = useState("");
  const [destinationBranchId, setDestinationBranchId] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedProductId, setSelectedProductId] = useState("");
  const [enteredQuantity, setEnteredQuantity] = useState<number>(1);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [validationError, setValidationError] = useState<string | null>(null);

  // If employee, set default destination branch to employee's assigned branch
  useEffect(() => {
    if (user && !isOwner && user.branchId) {
      setDestinationBranchId(user.branchId);
    }
  }, [user, isOwner]);

  // Fetch balances for source branch to show real-time stock
  const { data: sourceBalancesData } = useInventoryBalances({
    branchId: sourceBranchId || undefined,
  });

  const sourceStockMap = useMemo(() => {
    const map = new Map<string, number>();
    if (sourceBalancesData?.data && Array.isArray(sourceBalancesData.data)) {
      sourceBalancesData.data.forEach((b: any) => {
        const prodId = b.id || b.product?.id;
        if (!prodId) return;

        let available = 0;
        if (sourceBranchId && Array.isArray(b.balances) && b.balances.length > 0) {
          const branchBalance = b.balances.find((bal: any) => bal.branchId === sourceBranchId);
          available = branchBalance ? Number(branchBalance.availableQuantity || 0) : Number(b.totalAvailable || 0);
        } else {
          available = Number(b.totalAvailable ?? b.availableQuantity ?? 0);
        }
        map.set(prodId, available);
      });
    }
    return map;
  }, [sourceBalancesData, sourceBranchId]);

  const createTransferMutation = useCreateTransfer();

  const handleAddItem = () => {
    setValidationError(null);
    if (!selectedProductId) {
      setValidationError("Please select a product to add.");
      return;
    }

    if (!enteredQuantity || enteredQuantity <= 0) {
      setValidationError("Requested quantity must be at least 1.");
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (selectedItems.some((item) => item.product.id === selectedProductId)) {
      setValidationError("This product is already added. Adjust its quantity in the list below.");
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        product: prod,
        requestedQuantity: enteredQuantity,
      },
    ]);

    setSelectedProductId("");
    setEnteredQuantity(1);
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item.product.id === productId ? { ...item, requestedQuantity: qty } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!sourceBranchId) {
      setValidationError("Please select a source branch.");
      return;
    }

    if (!destinationBranchId) {
      setValidationError("Please select a destination branch.");
      return;
    }

    if (sourceBranchId === destinationBranchId) {
      setValidationError("Source and destination branches cannot be the same branch.");
      return;
    }

    if (selectedItems.length === 0) {
      setValidationError("Please add at least one product item to the transfer request.");
      return;
    }

    createTransferMutation.mutate(
      {
        sourceBranchId,
        destinationBranchId,
        notes: notes.trim() || undefined,
        items: selectedItems.map((item) => ({
          productId: item.product.id,
          requestedQuantity: item.requestedQuantity,
        })),
      },
      {
        onSuccess: (data: any) => {
          navigate(`/transfers/${data.id}`);
        },
        onError: (err: any) => {
          setValidationError(err?.message || "Failed to submit transfer request.");
        },
      }
    );
  };

  const totalRequestedUnits = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.requestedQuantity, 0);
  }, [selectedItems]);

  const sourceBranchObj = branches.find((b: any) => b.id === sourceBranchId);
  const destBranchObj = branches.find((b: any) => b.id === destinationBranchId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Transfer Request</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create an inter-branch stock request. Does not deduct stock until authorized and dispatched.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/transfers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Transfers
          </Link>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-rose-600 text-xl shrink-0">error</span>
          <div>
            <p className="font-semibold">Validation Error</p>
            <p className="mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BRANCH SELECTION & ROUTE */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">1</span>
            <h2 className="text-base font-bold text-slate-900">Transfer Route</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Source Branch (Stock Sender) <span className="text-rose-500">*</span>
              </label>
              <select
                value={sourceBranchId}
                onChange={(e) => {
                  setSourceBranchId(e.target.value);
                  setValidationError(null);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-primary outline-none cursor-pointer"
              >
                <option value="">Select source branch...</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id} disabled={b.id === destinationBranchId}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Branch from which products will physically be dispatched.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Destination Branch (Stock Receiver) <span className="text-rose-500">*</span>
              </label>
              <select
                value={destinationBranchId}
                onChange={(e) => {
                  setDestinationBranchId(e.target.value);
                  setValidationError(null);
                }}
                disabled={!isOwner && Boolean(user?.branchId)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:border-primary outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Select destination branch...</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id} disabled={b.id === sourceBranchId}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {!isOwner
                  ? "Defaulted to your assigned branch."
                  : "Branch that will receive the goods."}
              </span>
            </div>
          </div>

          {sourceBranchObj && destBranchObj && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">storefront</span>
                <span className="text-sm font-bold text-slate-800">{sourceBranchObj.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span>Sending to</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">{destBranchObj.name}</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">store</span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: PRODUCT LINE ITEMS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">2</span>
              <h2 className="text-base font-bold text-slate-900">Transfer Items</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {selectedItems.length} {selectedItems.length === 1 ? "product" : "products"} added
            </span>
          </div>

          {/* Add product line bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-8">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 focus:border-primary outline-none cursor-pointer"
                >
                  <option value="">Choose a product...</option>
                  {products.map((p) => {
                    const srcStock = sourceStockMap.get(p.id) ?? 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) {sourceBranchId ? `— ${srcStock} avail at source` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={enteredQuantity}
                  onChange={(e) => setEnteredQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:border-primary outline-none text-right"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Line
                </button>
              </div>
            </div>

            {selectedProductId && (
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                <span>
                  Source Branch Available Stock:{" "}
                  <strong>{sourceStockMap.get(selectedProductId) ?? 0} units</strong>
                </span>
              </div>
            )}
          </div>

          {/* Table of Added Items */}
          {selectedItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
              <span className="material-symbols-outlined text-3xl mb-1">inventory_2</span>
              <p className="text-sm font-medium">No product items added yet.</p>
              <p className="text-xs text-slate-400 mt-0.5">Use the selector above to add products to this transfer request.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Source Avail</th>
                    <th className="py-2.5 px-3 text-right">Requested Qty</th>
                    <th className="py-2.5 px-3 text-center">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedItems.map((item) => {
                    const avail = sourceStockMap.get(item.product.id) ?? 0;
                    const isExceeding = avail < item.requestedQuantity && sourceBranchId !== "";

                    return (
                      <tr key={item.product.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {item.product.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-500">
                          {item.product.sku}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              avail > 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {avail} avail
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.requestedQuantity}
                              onChange={(e) =>
                                handleUpdateQuantity(item.product.id, parseInt(e.target.value, 10) || 1)
                              }
                              className="w-20 px-2 py-1 text-right border border-slate-200 rounded text-sm font-bold text-slate-900 focus:border-primary outline-none"
                            />
                            {isExceeding && (
                              <span
                                title="Requested quantity exceeds currently available source stock. Note: stock will be validated upon dispatch."
                                className="material-symbols-outlined text-amber-500 text-[18px] cursor-help"
                              >
                                warning
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 3: REASON / NOTES */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">3</span>
            <h2 className="text-base font-bold text-slate-900">Request Notes (Optional)</h2>
          </div>
          <div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide a reason or reference for this transfer request (e.g. Low stock alert, weekend event prep)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* SUMMARY & SUBMIT BAR */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Request</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {selectedItems.length} Products · {totalRequestedUnits} Total Units
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/transfers"
              className="w-full md:w-auto px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-center transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={createTransferMutation.isPending || selectedItems.length === 0}
              className="w-full md:w-auto px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-hover shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTransferMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Transfer Request</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
