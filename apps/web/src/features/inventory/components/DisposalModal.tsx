import { useState } from "react";
import { useCreateDisposal } from "../api";

interface DisposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    sku: string;
    baseUnit: string;
    balances: Array<{
      branchId: string;
      branchName: string;
      damagedQuantity: number;
    }>;
  };
}

export function DisposalModal({ isOpen, onClose, product }: DisposalModalProps) {
  const [branchId, setBranchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { mutateAsync: createDisposal, isPending } = useCreateDisposal();

  if (!isOpen) return null;

  // Filter branches that actually have damaged stock for this product
  const eligibleBranches = product.balances.filter(b => b.damagedQuantity > 0);

  const selectedBranch = eligibleBranches.find(b => b.branchId === branchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedQty = parseInt(quantity, 10);

    if (!branchId) {
      setErrorMsg("Please select a branch.");
      return;
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setErrorMsg("Quantity must be a positive integer.");
      return;
    }
    if (selectedBranch && parsedQty > selectedBranch.damagedQuantity) {
      setErrorMsg(`Cannot dispose more than ${selectedBranch.damagedQuantity} units.`);
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Reason is required.");
      return;
    }

    try {
      await createDisposal({
        branchId,
        productId: product.id,
        quantity: parsedQty,
        reason: reason.trim(),
      });
      alert("Stock disposed successfully.");
      handleClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispose stock.");
    }
  };

  const handleClose = () => {
    setBranchId("");
    setQuantity("");
    setReason("");
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col my-auto relative">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            <h2 className="text-lg font-bold">Dispose Damaged Stock</h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 flex gap-2">
            <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <p>Disposal permanently removes the stock from the damaged bucket. This action cannot be undone.</p>
          </div>

          <div>
            <div className="font-bold text-dark-slate">{product.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">SKU: {product.sku}</div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Branch</label>
            <select 
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
              required
            >
              <option value="">Select branch with damaged stock...</option>
              {eligibleBranches.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName} ({b.damagedQuantity} damaged)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Quantity to Dispose ({product.baseUnit}s)</label>
            <div className="relative">
              <input 
                type="number" 
                min="1"
                step="1"
                max={selectedBranch?.damagedQuantity || ""}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none"
                placeholder="0"
                required
              />
              {selectedBranch && (
                <div className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                  Max: {selectedBranch.damagedQuantity}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason</label>
            <textarea 
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={2}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-dark-slate focus:border-primary outline-none resize-none"
              placeholder="e.g., Expired, Broken during transit, etc."
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 mt-2">
            <button 
              type="button" 
              onClick={handleClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-dark-slate hover:bg-slate-100 rounded-lg transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              disabled={isPending || eligibleBranches.length === 0}
            >
              {isPending ? "Disposing..." : "Confirm Disposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
