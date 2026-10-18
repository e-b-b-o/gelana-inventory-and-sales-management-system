import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCreateSale } from "./api";
import { useBranches } from "../branches/api";
import { getMe } from "../auth/api/auth";
import { useInventoryBalances } from "../inventory/api";
import { usePaymentMethods } from "../payment-methods/api";

export const NewSalePage = () => {
  const { data: userResponse } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });
  const isOwner = userResponse?.user?.role === "OWNER";
  const userBranchId = userResponse?.user?.branchId;

  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const { data: branches } = useBranches();

  useEffect(() => {
    if (isOwner && !selectedBranchId && branches && branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
  }, [isOwner, selectedBranchId, branches]);

  const activeBranchId = isOwner ? selectedBranchId : userBranchId || "";

  const isInventoryReady = Boolean(activeBranchId);
  const { data: inventoryData, isLoading: isInventoryLoading } = useInventoryBalances(
    { branchId: activeBranchId || undefined },
    { enabled: isInventoryReady }
  );
  const inventory = inventoryData?.data;
  const { data: rawPaymentMethods = [] } = usePaymentMethods();
  const paymentMethods = useMemo(() => rawPaymentMethods.filter((pm: any) => pm.isActive), [rawPaymentMethods]);
  const createSale = useCreateSale();

  const [cart, setCart] = useState<any[]>([]);
  const [payments, setPayments] = useState<{ id: string; methodId: string; amount: string }[]>([]);
  const [soldAt, setSoldAt] = useState<string>("");
  const [search, setSearch] = useState("");
  const [saleDiscount, setSaleDiscount] = useState<string>("");

  const grossSubtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + item.qty * parseFloat(item.currentUnitPrice || item.sellingPrice),
      0
    );
  }, [cart]);

  const totalLineDiscounts = useMemo(() => {
    if (!isOwner) return 0;
    return cart.reduce((sum, item) => sum + (parseFloat(item.lineDiscount) || 0), 0);
  }, [cart, isOwner]);

  const eligibleSaleTotal = Math.max(0, grossSubtotal - totalLineDiscounts);
  const parsedSaleDiscount = isOwner ? parseFloat(saleDiscount) || 0 : 0;
  const grandTotal = Math.max(0, eligibleSaleTotal - parsedSaleDiscount);

  const totalAllocated = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = grandTotal - totalAllocated;
  const isFullyAllocated = Math.abs(remaining) < 0.01;

  const isDiscountValid = useMemo(() => {
    if (!isOwner) return true;
    for (const item of cart) {
      const ld = parseFloat(item.lineDiscount) || 0;
      const gross = item.qty * parseFloat(item.currentUnitPrice || item.sellingPrice);
      if (ld < 0 || ld > gross) return false;
    }
    if (parsedSaleDiscount < 0 || parsedSaleDiscount > eligibleSaleTotal) return false;
    return true;
  }, [cart, isOwner, parsedSaleDiscount, eligibleSaleTotal]);

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && payments.length === 0) {
      setPayments([
        { id: crypto.randomUUID(), methodId: paymentMethods[0].id, amount: grandTotal.toFixed(2) },
      ]);
    }
  }, [paymentMethods, payments.length, grandTotal]);

  useEffect(() => {
    setPayments((prev) => {
      if (prev.length === 1) {
        return [{ ...prev[0], amount: grandTotal.toFixed(2) }];
      }
      return prev;
    });
  }, [grandTotal]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      const defaultUnit = product.units?.find((u: any) => u.isBase) || product.units?.[0];
      return [
        ...prev,
        {
          ...product,
          qty: 1,
          selectedUnitId: defaultUnit?.id,
          currentUnitName: defaultUnit?.name || product.baseUnit,
          currentUnitPrice: defaultUnit?.sellingPrice || product.sellingPrice,
          lineDiscount: "",
        },
      ];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const updateLineDiscount = (id: string, discount: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, lineDiscount: discount } : item))
    );
  };

  const updateUnit = (id: string, unitId: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const unit = item.units?.find((u: any) => u.id === unitId);
          if (unit) {
            return {
              ...item,
              selectedUnitId: unit.id,
              currentUnitName: unit.name,
              currentUnitPrice: unit.sellingPrice,
            };
          }
        }
        return item;
      })
    );
  };

  const removeRow = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const addPaymentMethod = () => {
    if (paymentMethods && paymentMethods.length > 0) {
      setPayments([
        ...payments,
        {
          id: crypto.randomUUID(),
          methodId: paymentMethods[0].id,
          amount: Math.max(0, remaining).toFixed(2),
        },
      ]);
    }
  };

  const updatePayment = (id: string, field: "methodId" | "amount", value: string) => {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePayment = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    if (!isFullyAllocated) {
      alert("Please allocate the full payment amount.");
      return;
    }
    if (!isDiscountValid) {
      alert("Please enter valid discount amounts.");
      return;
    }

    const validPayments = payments
      .map((p) => ({
        paymentMethodId: p.methodId,
        amount: parseFloat(p.amount),
      }))
      .filter((p) => p.amount > 0 && p.paymentMethodId);

    if (validPayments.length === 0) {
      alert("Please add at least one valid payment amount.");
      return;
    }

    const payload = {
      idempotencyKey: crypto.randomUUID(),
      branchId: activeBranchId,
      soldAt: soldAt ? new Date(soldAt).toISOString() : undefined,
      saleDiscount: isOwner && parsedSaleDiscount > 0 ? parsedSaleDiscount : 0,
      items: cart.map((item) => ({
        productId: item.id,
        unitId: item.selectedUnitId || "00000000-0000-0000-0000-000000000000",
        quantity: item.qty,
        unitPrice: parseFloat(item.currentUnitPrice || item.sellingPrice),
        lineDiscount:
          isOwner && parseFloat(item.lineDiscount) > 0 ? parseFloat(item.lineDiscount) : 0,
      })),
      payments: validPayments,
    };

    await createSale.mutateAsync(payload as any);
    setCart([]);
    setSaleDiscount("");
    if (paymentMethods && paymentMethods.length > 0) {
      setPayments([{ id: crypto.randomUUID(), methodId: paymentMethods[0].id, amount: "0.00" }]);
    } else {
      setPayments([]);
    }
  };

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    if (!search) return inventory;
    return inventory.filter(
      (p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [inventory, search]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">New Sale</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Record a point-of-sale customer transaction, select items, and process payments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/sales"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-label-md font-label-md rounded border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">history</span>
            Sales History
          </Link>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKFLOW */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* LEFT: Product Catalog & Selection */}
        <div className="flex-1 flex flex-col min-h-[360px] lg:min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm">
          {/* Catalog Toolbar */}
          <div className="p-3 sm:p-4 border-b border-slate-200 flex flex-wrap items-center gap-3 bg-slate-50">
            {isOwner && (
              <div className="w-full sm:w-56">
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-dark-slate focus:border-primary outline-none cursor-pointer"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  <option value="" disabled>
                    Select Branch...
                  </option>
                  {branches?.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative flex-1 min-w-[180px]">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm font-medium text-dark-slate placeholder:text-slate-400 focus:border-primary outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 max-h-[45vh] lg:max-h-none">
            {isInventoryLoading ? (
              <div className="col-span-full py-12 text-center text-slate-500">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                  Loading catalog products...
                </div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inventory_2</span>
                <p className="font-medium text-dark-slate">No products available</p>
                <p className="text-xs text-slate-400 mt-1">Try another search or select a different branch.</p>
              </div>
            ) : (
              filteredInventory.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="flex flex-col text-left p-3.5 rounded-xl border border-slate-200 hover:border-primary hover:shadow-md transition-all bg-white group cursor-pointer"
                >
                  <div className="font-semibold text-dark-slate text-sm mb-0.5 group-hover:text-primary transition-colors line-clamp-1">
                    {product.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mb-3">{product.sku}</div>
                  <div className="mt-auto flex justify-between items-end w-full pt-2 border-t border-slate-100">
                    <div className="text-sm font-bold text-primary font-mono">
                      ETB {Number(product.sellingPrice).toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {product.totalAvailable} in stock
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Cart & Checkout Panel */}
        <div className="w-full lg:w-[400px] xl:w-[420px] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">shopping_cart</span>
              <h2 className="text-sm font-bold text-dark-slate">Current Sale</h2>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
              {cart.length} {cart.length === 1 ? "item" : "items"}
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm py-12">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">shopping_bag</span>
                <p className="font-medium text-slate-500">Cart is empty</p>
                <p className="text-xs text-slate-400 mt-1">Select items from catalog to start a sale</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/60"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-semibold text-sm text-dark-slate line-clamp-1">{item.name}</div>
                    <button
                      onClick={() => removeRow(item.id)}
                      className="text-error text-xs hover:underline shrink-0 font-medium"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs font-mono font-medium text-slate-600">
                      ETB {Number(item.currentUnitPrice || item.sellingPrice).toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.units && item.units.length > 1 ? (
                        <select
                          className="text-xs border border-slate-200 rounded-md px-1.5 py-1 bg-white font-medium text-dark-slate"
                          value={item.selectedUnitId}
                          onChange={(e) => updateUnit(item.id, e.target.value)}
                        >
                          {item.units.map((u: any) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium mr-1">
                          {item.currentUnitName || item.baseUnit}
                        </span>
                      )}

                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-6 text-center font-mono text-dark-slate">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">Line Discount (ETB):</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={(item.qty * parseFloat(item.currentUnitPrice || item.sellingPrice)).toFixed(2)}
                        placeholder="0.00"
                        value={item.lineDiscount || ""}
                        onChange={(e) => updateLineDiscount(item.id, e.target.value)}
                        className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-md text-right font-mono text-xs text-dark-slate focus:border-primary outline-none"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Checkout & Totals Section */}
          <div className="p-4 border-t border-slate-200 bg-white space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Gross Subtotal</span>
                <span className="font-mono font-medium text-dark-slate">
                  ETB {grossSubtotal.toFixed(2)}
                </span>
              </div>

              {isOwner && totalLineDiscounts > 0 && (
                <div className="flex justify-between text-xs text-error">
                  <span>Line Discounts</span>
                  <span className="font-mono font-bold">-ETB {totalLineDiscounts.toFixed(2)}</span>
                </div>
              )}

              {isOwner && (
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-500 font-medium">Sale Discount (ETB)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={eligibleSaleTotal.toFixed(2)}
                    placeholder="0.00"
                    value={saleDiscount}
                    onChange={(e) => setSaleDiscount(e.target.value)}
                    className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-right font-mono text-xs text-dark-slate focus:border-primary outline-none"
                  />
                </div>
              )}

              <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2 items-baseline">
                <span className="text-dark-slate">Grand Total</span>
                <span className="text-primary font-mono text-xl">
                  ETB {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Time of Sale (Optional delayed sale entry) */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Time of Sale (Optional)
              </label>
              <input
                type="datetime-local"
                value={soldAt}
                onChange={(e) => setSoldAt(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-dark-slate focus:border-primary outline-none"
              />
            </div>

            {/* Payment Allocations */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Payments
                </label>
                <button
                  type="button"
                  onClick={addPaymentMethod}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  + Split Payment
                </button>
              </div>

              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <select
                      value={p.methodId}
                      onChange={(e) => updatePayment(p.id, "methodId", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-dark-slate focus:border-primary outline-none"
                    >
                      {paymentMethods?.map((pm: any) => (
                        <option key={pm.id} value={pm.id}>
                          {pm.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={p.amount}
                      onChange={(e) => updatePayment(p.id, "amount", e.target.value)}
                      className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-right text-dark-slate focus:border-primary outline-none"
                    />
                    {payments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePayment(p.id)}
                        className="text-error hover:bg-error/10 p-1 rounded-md text-xs font-bold"
                        title="Remove payment method"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs mt-2 pt-1 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Remaining Due:</span>
                <span
                  className={`font-mono font-bold ${
                    Math.abs(remaining) < 0.01 ? "text-primary" : "text-error"
                  }`}
                >
                  {Math.abs(remaining) < 0.01 ? "Fully Allocated" : `ETB ${remaining.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Charge Button */}
            <button
              onClick={handleSubmit}
              disabled={cart.length === 0 || createSale.isPending || !isFullyAllocated || !isDiscountValid}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-on-primary font-bold text-sm rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {createSale.isPending ? "Confirming Transaction..." : `Charge ETB ${grandTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
