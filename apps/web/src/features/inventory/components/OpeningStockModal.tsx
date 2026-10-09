import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateOpeningStockInputSchema, type CreateOpeningStockInput } from "../api/schema";
import { useCreateOpeningStock } from "../api";
import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "../../../lib/api";

type OpeningStockModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Simplified schemas to fetch options
import { useBranches } from "../../branches/api";
const fetchProducts = async () => fetchApi("/products");

export function OpeningStockModal({ isOpen, onClose }: OpeningStockModalProps) {
  const { mutateAsync: createOpeningStock, isPending } = useCreateOpeningStock();
  const [errorMsg, setErrorMsg] = useState("");

  const { data: branches } = useBranches();

  const { data: productsResponse } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const products = Array.isArray(productsResponse) ? productsResponse : productsResponse?.data || [];

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CreateOpeningStockInput>({
    resolver: zodResolver(CreateOpeningStockInputSchema),
    defaultValues: {
      quantity: 1,
      unitCost: 0,
    }
  });

  const selectedProductId = watch("productId");
  const selectedProduct = products.find((p: any) => p.id === selectedProductId);

  const onSubmit = async (data: CreateOpeningStockInput) => {
    try {
      setErrorMsg("");
      await createOpeningStock(data);
      reset();
      onClose();
    } catch (err: any) {
      if (err.message?.includes("already been recorded") || err.response?.status === 409) {
        setErrorMsg("Opening stock has already been recorded for this product in the selected branch.");
      } else {
        setErrorMsg(err.message || "Failed to save opening stock");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="font-bold text-lg text-dark-slate">Add Opening Stock</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Branch</label>
              <select 
                {...register("branchId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
              >
                <option value="">Select a branch...</option>
                {branches?.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Product</label>
              <select 
                {...register("productId")}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
              >
                <option value="">Select a product...</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
              {errors.productId && <p className="text-red-500 text-xs mt-1">{errors.productId.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="flex flex-col">
                <div className="min-h-[36px] flex flex-col justify-end mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Physical Quantity
                    <span className="block text-[10px] text-muted-text lowercase font-normal mt-0.5">({selectedProduct?.units?.find((u: any) => u.isBase)?.name || 'base unit'})</span>
                  </label>
                </div>
                <input 
                  type="number"
                  step="1"
                  {...register("quantity", { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-dark-slate focus:border-primary outline-none"
                  placeholder="0"
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
              </div>

              <div className="flex flex-col">
                <div className="min-h-[36px] flex flex-col justify-end mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Estimated Unit Cost
                  </label>
                </div>
                <input 
                  type="number"
                  step="0.01"
                  {...register("unitCost", { valueAsNumber: true })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-dark-slate focus:border-primary outline-none"
                  placeholder="0.00"
                />
                {errors.unitCost && <p className="text-red-500 text-xs mt-1">{errors.unitCost.message}</p>}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2">
              <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-[11px] text-amber-800 leading-tight">
                Opening stock can only be recorded <strong>once</strong> per product and branch. This establishes the initial base inventory and Weighted Average Cost (WAC).
              </p>
            </div>

          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={isPending}
            >
              {isPending && <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" className="opacity-20"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg>}
              Confirm Opening Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
