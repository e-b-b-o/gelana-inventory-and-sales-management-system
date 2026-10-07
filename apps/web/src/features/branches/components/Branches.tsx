import { useState } from "react";
import { useBranches, useUpdateBranchStatus, type Branch } from "../api";
import { BranchFormModal } from "./BranchFormModal";

export function Branches() {
  const { data: branches, isLoading } = useBranches();
  const statusMutation = useUpdateBranchStatus();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const handleAdd = () => {
    setSelectedBranch(null);
    setIsFormOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (branch: Branch) => {
    const confirmMessage = branch.isActive 
      ? `Are you sure you want to deactivate ${branch.name}? Employees assigned to this branch may be affected.`
      : `Are you sure you want to reactivate ${branch.name}?`;
      
    if (window.confirm(confirmMessage)) {
      await statusMutation.mutateAsync({ id: branch.id, isActive: !branch.isActive });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-text">Loading branches...</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-slate mb-2">Branches</h1>
          <p className="text-muted-text text-sm font-medium">Manage locations and branch operational status</p>
        </div>
        <button
          onClick={handleAdd}
          className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm shadow-btn transition-all duration-150 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Branch
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-neutral-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Name</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Code</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Address</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Phone</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches?.map((branch: Branch) => (
                <tr key={branch.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-bold text-dark-slate">{branch.name}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600 font-mono">
                      {branch.code}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{branch.address || '-'}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{branch.phoneNumber || '-'}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      branch.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${branch.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="text-sm font-bold text-primary hover:text-primary-hover"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(branch)}
                        disabled={statusMutation.isPending}
                        className={`text-sm font-bold ${branch.isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                      >
                        {branch.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!branches || branches.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-text text-sm">
                    No branches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <BranchFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        branch={selectedBranch}
      />
    </div>
  );
}
