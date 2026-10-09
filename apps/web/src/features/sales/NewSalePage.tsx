import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../lib/api";
import { useCreateSale } from "./api";
import { useBranches } from "../branches/api";
import { getMe } from "../auth/api/auth";
import { useInventoryBalances } from "../inventory/api";

const usePaymentMethods = () => {
  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const res = await fetchApi("/payment-methods");
      return res.filter((pm: any) => pm.isActive);
    }
  });
};

export const NewSalePage = () => {
  const { data: userResponse } = useQuery<any>({ queryKey: ["me"], queryFn: getMe });
  const isOwner = userResponse?.user?.role === "OWNER";
  const userBranchId = userResponse?.user?.branchId;

  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  
  const { data: branches } = useBranches();
  
  useEffect(() => {
    if (isOwner && !selectedBranchId && branches && branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
  }, [isOwner, selectedBranchId, branches]);

  const activeBranchId = isOwner ? selectedBranchId : (userBranchId || "");

  const { data: inventoryData, isLoading: isInventoryLoading } = useInventoryBalances({
    branchId: activeBranchId || undefined,
  });
  const inventory = inventoryData?.data;
  const { data: paymentMethods } = usePaymentMethods();
  const createSale = useCreateSale();

  const [cart, setCart] = useState<any[]>([]);
  const [payments, setPayments] = useState<{ id: string, methodId: string, amount: string }[]>([]);
  const [soldAt, setSoldAt] = useState<string>("");
  const [search, setSearch] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + (item.qty * parseFloat(item.currentUnitPrice || item.sellingPrice)), 0);

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && payments.length === 0) {
      setPayments([{ id: crypto.randomUUID(), methodId: paymentMethods[0].id, amount: subtotal.toFixed(2) }]);
    }
  }, [paymentMethods, payments.length]);

  useEffect(() => {
    setPayments(prev => {
      if (prev.length === 1) {
        return [{ ...prev[0], amount: subtotal.toFixed(2) }];
      }
      return prev;
    });
  }, [subtotal]);

  const totalAllocated = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = subtotal - totalAllocated;
  const isFullyAllocated = Math.abs(remaining) < 0.01;

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      const defaultUnit = product.units?.find((u: any) => u.isBase) || product.units?.[0];
      return [...prev, { 
        ...product, 
        qty: 1,
        selectedUnitId: defaultUnit?.id,
        currentUnitName: defaultUnit?.name || product.baseUnit,
        currentUnitPrice: defaultUnit?.sellingPrice || product.sellingPrice
      }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const updateUnit = (id: string, unitId: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const unit = item.units?.find((u: any) => u.id === unitId);
        if (unit) {
          return {
            ...item,
            selectedUnitId: unit.id,
            currentUnitName: unit.name,
            currentUnitPrice: unit.sellingPrice
          };
        }
      }
      return item;
    }));
  };

  const removeRow = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const addPaymentMethod = () => {
    if (paymentMethods && paymentMethods.length > 0) {
      setPayments([...payments, { id: crypto.randomUUID(), methodId: paymentMethods[0].id, amount: Math.max(0, remaining).toFixed(2) }]);
    }
  };

  const updatePayment = (id: string, field: "methodId" | "amount", value: string) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    if (!isFullyAllocated) {
      alert("Please allocate the full payment amount.");
      return;
    }
    
    // Check for empty/invalid payment methods or amounts
    const validPayments = payments.map(p => ({
      paymentMethodId: p.methodId,
      amount: parseFloat(p.amount)
    })).filter(p => p.amount > 0 && p.paymentMethodId);

    if (validPayments.length === 0) {
      alert("Please add at least one valid payment amount.");
      return;
    }

    const payload = {
      idempotencyKey: crypto.randomUUID(),
      branchId: activeBranchId,
      soldAt: soldAt ? new Date(soldAt).toISOString() : undefined,
      items: cart.map(item => ({
        productId: item.id,
        unitId: item.selectedUnitId || "00000000-0000-0000-0000-000000000000",
        quantity: item.qty,
        unitPrice: parseFloat(item.currentUnitPrice || item.sellingPrice)
      })),
      payments: validPayments
    };

    await createSale.mutateAsync(payload as any);
    setCart([]);
    if (paymentMethods && paymentMethods.length > 0) {
      setPayments([{ id: crypto.randomUUID(), methodId: paymentMethods[0].id, amount: "0.00" }]);
    } else {
      setPayments([]);
    }
  };

  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    if (!search) return inventory;
    return inventory.filter((p: any) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [inventory, search]);

  return (
    <div className="flex-1 flex overflow-hidden gap-space-lg">
      
      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-outline-variant/30 shadow-sm">
        <div className="p-4 border-b border-outline-variant/30 flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-bold text-on-surface">New Sale</h1>
          
          {isOwner && (
            <select 
              className="px-3 py-2 border border-outline-variant/50 rounded-lg text-sm bg-white focus:border-primary outline-none"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              <option value="" disabled>Select Branch...</option>
              {branches?.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}

          <input 
            type="text" 
            placeholder="Search products..." 
            className="ml-auto px-4 py-2 border border-outline-variant/50 rounded-lg text-sm bg-surface-container-low"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isInventoryLoading ? (
            <div className="p-4 text-center text-sm text-outline">Loading products...</div>
          ) : (
            filteredInventory.map((product: any) => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="flex flex-col text-left p-4 rounded-xl border border-outline-variant/50 hover:border-primary hover:shadow-md transition-all bg-white"
              >
                <div className="font-bold text-on-surface text-sm mb-1">{product.name}</div>
                <div className="text-xs text-outline font-mono mb-3">{product.sku}</div>
                <div className="mt-auto flex justify-between items-end w-full">
                  <div className="text-sm font-bold text-primary">{Number(product.sellingPrice).toFixed(2)} ETB</div>
                  <div className="text-xs text-outline">{product.totalAvailable} in stock</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Cart & Checkout */}
      <div className="w-[400px] flex flex-col bg-white rounded-xl border border-outline-variant/30 shadow-sm shrink-0">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low/50">
          <h2 className="text-lg font-bold text-on-surface">Current Sale</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-outline text-sm">
              Cart is empty
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex flex-col gap-2 p-3 rounded-lg border border-outline-variant/40 bg-surface-container-lowest">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-sm text-on-surface">{item.name}</div>
                  <button onClick={() => removeRow(item.id)} className="text-error text-xs hover:underline">Remove</button>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs font-mono text-outline">{Number(item.currentUnitPrice || item.sellingPrice).toFixed(2)} ETB</div>
                  <div className="flex items-center gap-2">
                    {item.units && item.units.length > 1 ? (
                      <select 
                        className="text-xs border border-outline-variant/50 rounded p-1 bg-white"
                        value={item.selectedUnitId}
                        onChange={(e) => updateUnit(item.id, e.target.value)}
                      >
                        {item.units.map((u: any) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-outline mr-2">{item.currentUnitName || item.baseUnit}</span>
                    )}
                    <div className="flex items-center gap-2 border border-outline-variant/50 rounded-md">
                      <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1 text-on-surface hover:bg-surface-container-low">-</button>
                      <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1 text-on-surface hover:bg-surface-container-low">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-outline-variant/30 bg-surface-container-lowest space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-outline">Subtotal</span>
            <span className="font-bold text-on-surface">{subtotal.toFixed(2)} ETB</span>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-outline mb-1">Time of Sale (Optional for Delayed)</label>
            <input 
              type="datetime-local" 
              value={soldAt}
              onChange={e => setSoldAt(e.target.value)}
              className="w-full px-3 py-1.5 border border-outline-variant/50 rounded-lg text-sm bg-surface-container-low focus:border-primary focus:outline-none" 
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-outline-variant/30">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-outline">Payments</label>
              <button onClick={addPaymentMethod} className="text-xs text-primary hover:underline">
                + Split Payment
              </button>
            </div>
            
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <select 
                    value={p.methodId}
                    onChange={e => updatePayment(p.id, "methodId", e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-outline-variant/50 rounded text-sm bg-surface-container-low focus:border-primary focus:outline-none"
                  >
                    {paymentMethods?.map((pm: any) => (
                      <option key={pm.id} value={pm.id}>{pm.name}</option>
                    ))}
                  </select>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={p.amount}
                    onChange={e => updatePayment(p.id, "amount", e.target.value)}
                    className="w-24 px-2 py-1.5 border border-outline-variant/50 rounded text-sm bg-surface-container-low focus:border-primary focus:outline-none text-right font-mono"
                  />
                  {payments.length > 1 && (
                    <button onClick={() => removePayment(p.id)} className="text-error hover:bg-error/10 p-1 rounded">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xs mt-2">
              <span className="text-outline">Remaining Due:</span>
              <span className={`font-mono font-bold ${Math.abs(remaining) < 0.01 ? 'text-primary' : 'text-error'}`}>
                {Math.abs(remaining) < 0.01 ? 'Fully Allocated' : remaining.toFixed(2)}
              </span>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0 || createSale.isPending || !isFullyAllocated}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl shadow-sm disabled:opacity-50 transition-all mt-2"
          >
            {createSale.isPending ? "Confirming..." : `Charge ${subtotal.toFixed(2)} ETB`}
          </button>
        </div>
      </div>

    </div>
  );
};
