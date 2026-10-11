import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import { useCreateReturn } from "./api";
import { getSaleDetails } from "../sales/api";
import { usePaymentMethods } from "../payment-methods/api";
import { useBranches } from "../branches/api";
import { useInventoryBalances } from "../inventory/api";

type SelectedReturnItem = {
  saleItemId?: string;
  productId: string;
  productName: string;
  productSku: string;
  unitId: string;
  unitName: string;
  purchasedQty?: number;
  alreadyReturnedQty?: number;
  maxReturnableQty: number;
  returnQty: number;
  condition: "SELLABLE" | "DAMAGED";
  unitPrice: number;
};

export function NewReturnPage() {
  const navigate = useNavigate();
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const user = userResponse?.user;
  const isOwner = user?.role === "OWNER";

  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: branches = [] } = useBranches();
  const createReturnMutation = useCreateReturn();

  // Mode: "linked" | "unlinked"

  const [returnMode, setReturnMode] = useState<"linked" | "unlinked">("linked");

  // Linked Return State
  const [saleSearchInput, setSaleSearchInput] = useState("");
  const [searchedSaleNumber, setSearchedSaleNumber] = useState<string | null>(null);

  // Unlinked Return State
  const [unlinkedBranchId, setUnlinkedBranchId] = useState("");
  const { data: inventoryData } = useInventoryBalances({
    branchId: unlinkedBranchId || undefined,
  });
  const products = inventoryData?.data || [];

  const [unlinkedSelectedProductId, setUnlinkedSelectedProductId] = useState("");
  const [unlinkedSelectedUnitId, setUnlinkedSelectedUnitId] = useState("");
  const [unlinkedQuantity, setUnlinkedQuantity] = useState<number>(1);
  const [unlinkedCondition, setUnlinkedCondition] = useState<"SELLABLE" | "DAMAGED">("SELLABLE");
  const [unlinkedUnitPrice, setUnlinkedUnitPrice] = useState<number>(0);

  // Return Common State
  const [returnItems, setReturnItems] = useState<SelectedReturnItem[]>([]);
  const [reason, setReason] = useState("");
  const [refundPaymentMethodId, setRefundPaymentMethodId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Sale query when user searches
  const {
    data: saleData,
    isLoading: isSaleLoading,
    isError: isSaleError,
    error: saleError,
  } = useQuery({
    queryKey: ["sale-lookup", searchedSaleNumber],
    queryFn: () => getSaleDetails(searchedSaleNumber!),
    enabled: !!searchedSaleNumber,
    retry: false,
  });

  // Handle Search Sale
  const handleSearchSale = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!saleSearchInput.trim()) return;
    setSearchedSaleNumber(saleSearchInput.trim());
  };

  // Populate returnItems when saleData loads
  useMemo(() => {
    if (saleData && saleData.items) {
      // Calculate already returned quantities from existing returns on this sale
      const returnedMap: Record<string, number> = {};
      if (saleData.returns) {
        for (const ret of saleData.returns) {
          for (const it of ret.items || []) {
            if (it.saleItemId) {
              returnedMap[it.saleItemId] = (returnedMap[it.saleItemId] || 0) + (it.enteredQuantity || 0);
            }
          }
        }
      }

      const initialItems: SelectedReturnItem[] = saleData.items.map((it: any) => {
        const alreadyReturned = returnedMap[it.id] || 0;
        const maxReturnable = Math.max(0, it.enteredQuantity - alreadyReturned);
        return {
          saleItemId: it.id,
          productId: it.productId,
          productName: it.product?.name || "Product",
          productSku: it.product?.sku || "-",
          unitId: it.unitId,
          unitName: it.unit?.name || "Unit",
          purchasedQty: it.enteredQuantity,
          alreadyReturnedQty: alreadyReturned,
          maxReturnableQty: maxReturnable,
          returnQty: 0,
          condition: "SELLABLE",
          unitPrice: parseFloat(it.unitPrice) || 0,
        };
      });
      setReturnItems(initialItems);
    }
  }, [saleData]);

  // Update quantity for a linked item
  const handleItemQtyChange = (index: number, newQty: number) => {
    setReturnItems((prev) => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;
      const validQty = Math.max(0, Math.min(newQty, item.maxReturnableQty));
      copy[index] = { ...item, returnQty: validQty };
      return copy;
    });
  };

  // Update condition for a linked item
  const handleItemConditionChange = (index: number, condition: "SELLABLE" | "DAMAGED") => {
    setReturnItems((prev) => {
      const copy = [...prev];
      const item = copy[index];
      if (!item) return prev;
      copy[index] = { ...item, condition };
      return copy;
    });
  };

  // Add Item in Unlinked Mode
  const handleAddUnlinkedItem = () => {
    setFormError(null);
    if (!unlinkedSelectedProductId) {
      setFormError("Please select a product");
      return;
    }
    const product = products.find((p: any) => p.id === unlinkedSelectedProductId);
    if (!product) return;

    const unit = (product.units || []).find((u: any) => u.id === unlinkedSelectedUnitId) || product.units?.[0];
    if (!unit) {
      setFormError("Selected product has no available units");
      return;
    }

    if (unlinkedQuantity <= 0) {
      setFormError("Quantity must be greater than zero");
      return;
    }

    const newItem: SelectedReturnItem = {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      unitId: unit.id,
      unitName: unit.name,
      maxReturnableQty: 999999,
      returnQty: unlinkedQuantity,
      condition: unlinkedCondition,
      unitPrice: unlinkedUnitPrice,
    };

    setReturnItems((prev) => [...prev, newItem]);
    setUnlinkedSelectedProductId("");
    setUnlinkedSelectedUnitId("");
    setUnlinkedQuantity(1);
    setUnlinkedUnitPrice(0);
  };

  // Remove Unlinked Item
  const handleRemoveItem = (index: number) => {
    setReturnItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Active items being returned (> 0 qty)
  const activeItemsToReturn = returnItems.filter((i) => i.returnQty > 0);

  // Totals Calculation
  const totalReturnUnits = activeItemsToReturn.reduce((sum, i) => sum + i.returnQty, 0);
  const totalSellableUnits = activeItemsToReturn
    .filter((i) => i.condition === "SELLABLE")
    .reduce((sum, i) => sum + i.returnQty, 0);
  const totalDamagedUnits = activeItemsToReturn
    .filter((i) => i.condition === "DAMAGED")
    .reduce((sum, i) => sum + i.returnQty, 0);
  const totalRefundAmount = activeItemsToReturn.reduce((sum, i) => sum + i.returnQty * i.unitPrice, 0);

  // Submit Return
  const handleSubmitReturn = async () => {
    setFormError(null);

    if (activeItemsToReturn.length === 0) {
      setFormError("Please specify at least one item quantity to return.");
      return;
    }

    if (!reason.trim()) {
      setFormError("A mandatory return reason is required.");
      return;
    }

    if (!refundPaymentMethodId) {
      setFormError("Please select a refund payment method.");
      return;
    }

    if (returnMode === "unlinked") {
      if (!isOwner) {
        setFormError("Only owners are permitted to process unlinked returns.");
        return;
      }
      if (!unlinkedBranchId) {
        setFormError("Please select a branch for the unlinked return.");
        return;
      }
    }

    try {
      const payload = {
        saleId: returnMode === "linked" ? saleData?.id : undefined,
        branchId: returnMode === "unlinked" ? unlinkedBranchId : undefined,
        reason: reason.trim(),
        refundPaymentMethodId,
        isUnlinked: returnMode === "unlinked",
        items: activeItemsToReturn.map((i) => ({
          saleItemId: i.saleItemId,
          productId: i.productId,
          unitId: i.unitId,
          quantity: i.returnQty,
          condition: i.condition,
          unitPrice: i.unitPrice,
        })),
      };

      await createReturnMutation.mutateAsync(payload);
      alert("Return processed successfully!");
      navigate("/sales/returns");
    } catch (err: any) {
      setFormError(err?.message || "Failed to process return.");
    }
  };

  const isSaleVoided = saleData?.status === "VOIDED";

  return (
    <div className="max-w-6xl mx-auto space-y-space-lg pb-16">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">
            Process Sales Return
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Restock sellable items, quarantine damaged goods, and issue customer refunds.
          </p>
        </div>
        <Link
          to="/sales/returns"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm self-start"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Returns
        </Link>
      </div>

      {/* ERROR ALERT */}
      {formError && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-3">
          <span className="material-symbols-outlined text-[22px]">error</span>
          <span>{formError}</span>
        </div>
      )}

      {/* RETURN MODE TABS */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 inline-flex gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => {
            setReturnMode("linked");
            setReturnItems([]);
            setFormError(null);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
            returnMode === "linked"
              ? "bg-primary text-white shadow-sm"
              : "text-slate-600 hover:text-dark-slate hover:bg-slate-50"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          Linked Return (With Receipt / Sale #)
        </button>

        {isOwner && (
          <button
            type="button"
            onClick={() => {
              setReturnMode("unlinked");
              setReturnItems([]);
              setFormError(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              returnMode === "unlinked"
                ? "bg-primary text-white shadow-sm"
                : "text-slate-600 hover:text-dark-slate hover:bg-slate-50"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            Unlinked Return (Owner Authorized)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: ITEM SELECTION & DETAILS */}
        <div className="lg:col-span-2 space-y-6">
          {/* LINKED MODE: SEARCH SALE */}
          {returnMode === "linked" && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">search</span>
                Step 1: Look Up Original Sale
              </h2>
              <form onSubmit={handleSearchSale} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={saleSearchInput}
                    onChange={(e) => setSaleSearchInput(e.target.value)}
                    placeholder="Enter sale number (e.g. SAL-000001)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-dark-slate placeholder:text-slate-400 focus:border-primary focus:bg-white outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaleLoading || !saleSearchInput.trim()}
                  className="px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  {isSaleLoading ? (
                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  )}
                  Lookup Sale
                </button>
              </form>

              {isSaleError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs font-semibold">
                  {(saleError as any)?.message || "Sale transaction not found. Please verify the sale number."}
                </div>
              )}

              {saleData && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-dark-slate">{saleData.saleNumber}</span>
                        {isSaleVoided ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-error/10 text-error border border-error/20">
                            VOIDED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Branch: {saleData.branch?.name} • Sold by: {saleData.createdBy?.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Original Total</div>
                      <div className="font-mono font-bold text-dark-slate text-sm">
                        ETB {parseFloat(saleData.grandTotal).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {isSaleVoided && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-amber-600">warning</span>
                      <span>Cannot process return against a voided sale. This sale was already voided and inventory was reversed.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* UNLINKED MODE: BRANCH & PRODUCT SELECTOR */}
          {returnMode === "unlinked" && isOwner && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">add_shopping_cart</span>
                Owner Unlinked Return: Select Products
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Receiving Branch *
                  </label>
                  <select
                    value={unlinkedBranchId}
                    onChange={(e) => setUnlinkedBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Product *
                  </label>
                  <select
                    value={unlinkedSelectedProductId}
                    onChange={(e) => {
                      setUnlinkedSelectedProductId(e.target.value);
                      const prod = products.find((p: any) => p.id === e.target.value);
                      if (prod && prod.units?.[0]) {
                        setUnlinkedSelectedUnitId(prod.units[0].id);
                        setUnlinkedUnitPrice(parseFloat(prod.units[0].sellingPrice || "0"));
                      }

                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
                  >
                    <option value="">Select Product</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {unlinkedSelectedProductId && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Unit</label>
                    <select
                      value={unlinkedSelectedUnitId}
                      onChange={(e) => setUnlinkedSelectedUnitId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate outline-none"
                    >
                      {products
                        .find((p: any) => p.id === unlinkedSelectedProductId)
                        ?.units?.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={unlinkedQuantity}
                      onChange={(e) => setUnlinkedQuantity(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate outline-none font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Condition</label>
                    <select
                      value={unlinkedCondition}
                      onChange={(e) => setUnlinkedCondition(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate outline-none"
                    >
                      <option value="SELLABLE">Sellable (Restock)</option>
                      <option value="DAMAGED">Damaged (Quarantine)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Unit Refund Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={unlinkedUnitPrice}
                      onChange={(e) => setUnlinkedUnitPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate outline-none font-mono font-semibold"
                    />
                  </div>
                </div>
              )}

              {unlinkedSelectedProductId && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddUnlinkedItem}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white font-semibold text-xs hover:bg-primary-hover transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Add to Return List
                  </button>
                </div>
              )}
            </div>
          )}

          {/* RETURN ITEMS TABLE */}
          {returnItems.length > 0 && !isSaleVoided && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider">
                  Step 2: Specify Items & Quantities to Return
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {returnItems.length} available items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Item</th>
                      {returnMode === "linked" && <th className="py-3 px-3 text-center">Purchased</th>}
                      {returnMode === "linked" && <th className="py-3 px-3 text-center">Prev. Returned</th>}
                      <th className="py-3 px-3 text-center">Returnable</th>
                      <th className="py-3 px-3 text-center">Condition</th>
                      <th className="py-3 px-3 text-center w-28">Return Qty</th>
                      <th className="py-3 px-4 text-right">Refund Total</th>
                      {returnMode === "unlinked" && <th className="py-3 px-2 text-center"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {returnItems.map((item, index) => {
                      const isFullyReturned = item.maxReturnableQty === 0;
                      return (
                        <tr
                          key={item.saleItemId || index}
                          className={`transition-colors ${
                            isFullyReturned ? "bg-slate-50/50 opacity-60" : "hover:bg-slate-50/60"
                          }`}
                        >
                          {/* Item Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-dark-slate">{item.productName}</div>
                            <div className="text-xs text-slate-400 font-mono">{item.productSku} • {item.unitName}</div>
                          </td>

                          {/* Purchased Qty */}
                          {returnMode === "linked" && (
                            <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                              {item.purchasedQty}
                            </td>
                          )}

                          {/* Prev Returned */}
                          {returnMode === "linked" && (
                            <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                              {item.alreadyReturnedQty || 0}
                            </td>
                          )}

                          {/* Max Returnable */}
                          <td className="py-3.5 px-3 text-center font-mono font-semibold text-dark-slate">
                            {isFullyReturned ? (
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-500">
                                None Left
                              </span>
                            ) : (
                              item.maxReturnableQty
                            )}
                          </td>

                          {/* Condition Selector */}
                          <td className="py-3.5 px-3 text-center">
                            <select
                              disabled={isFullyReturned}
                              value={item.condition}
                              onChange={(e) => handleItemConditionChange(index, e.target.value as any)}
                              className={`text-xs font-semibold rounded-lg px-2 py-1 border outline-none cursor-pointer ${
                                item.condition === "SELLABLE"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              <option value="SELLABLE">Sellable (Restock)</option>
                              <option value="DAMAGED">Damaged (Quarantine)</option>
                            </select>
                          </td>

                          {/* Return Qty Input */}
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={item.maxReturnableQty}
                              disabled={isFullyReturned}
                              value={item.returnQty}
                              onChange={(e) => handleItemQtyChange(index, parseInt(e.target.value) || 0)}
                              className="w-20 text-center bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 font-mono font-bold text-dark-slate focus:bg-white focus:border-primary outline-none"
                            />
                          </td>

                          {/* Line Refund Total */}
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-dark-slate">
                            ETB {(item.returnQty * item.unitPrice).toFixed(2)}
                          </td>

                          {/* Remove button (Unlinked only) */}
                          {returnMode === "unlinked" && (
                            <td className="py-3.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-1 text-slate-400 hover:text-error rounded transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REASON, REFUND METHOD & SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-label-lg font-bold text-dark-slate uppercase tracking-wider">
              Step 3: Return & Refund Details
            </h3>

            {/* Mandatory Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Return Reason *
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe reason (e.g. Customer changed mind, wrong item, defective packaging)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-dark-slate placeholder:text-slate-400 focus:border-primary focus:bg-white outline-none resize-none"
              />
            </div>

            {/* Refund Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Refund Payment Method *
              </label>
              <select
                value={refundPaymentMethodId}
                onChange={(e) => setRefundPaymentMethodId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium text-dark-slate focus:border-primary outline-none"
              >
                <option value="">Select Method</option>
                {paymentMethods.filter((pm: any) => pm.isActive).map((pm: any) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Items Selected for Return</span>
                <span className="font-mono font-semibold text-dark-slate">{activeItemsToReturn.length} items</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Total Units</span>
                <span className="font-mono font-semibold text-dark-slate">{totalReturnUnits} units</span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-700">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Restocking Available Stock
                </span>
                <span className="font-mono font-semibold">{totalSellableUnits} units</span>
              </div>
              <div className="flex justify-between items-center text-xs text-amber-700">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Quarantining to Damaged Bucket
                </span>
                <span className="font-mono font-semibold">{totalDamagedUnits} units</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-bold text-dark-slate uppercase tracking-wider">Total Refund</span>
                <span className="text-2xl font-bold font-mono text-primary">
                  ETB {totalRefundAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="button"
              disabled={createReturnMutation.isPending || activeItemsToReturn.length === 0 || isSaleVoided}
              onClick={handleSubmitReturn}
              className="w-full py-3.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {createReturnMutation.isPending ? (
                <>
                  <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  Processing Return...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Complete & Issue Refund
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
