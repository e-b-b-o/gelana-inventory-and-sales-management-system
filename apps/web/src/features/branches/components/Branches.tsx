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
    <div>
      <div className="flex justify-between items-center mb-space-md">
        <h2 className="text-headline-sm font-headline-sm text-on-surface">Branch Records</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Branch
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline-variant">
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Code</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Address</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Phone</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {branches?.map((branch: Branch) => (
                <tr key={branch.id} className="hover:bg-surface transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-on-surface text-body-md font-body-md">{branch.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container-high text-on-surface-variant font-mono">
                      {branch.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-body-sm font-body-sm text-on-surface-variant">{branch.address || '-'}</td>
                  <td className="py-3 px-4 text-body-sm font-body-sm text-on-surface-variant">{branch.phoneNumber || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      branch.isActive ? 'bg-success-container text-success' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${branch.isActive ? 'bg-success' : 'bg-outline'}`}></span>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="text-label-sm font-label-sm text-primary hover:text-primary-hover px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(branch)}
                        disabled={statusMutation.isPending}
                        className={`text-label-sm font-label-sm px-2 py-1 rounded transition-colors ${
                          branch.isActive ? 'text-error hover:text-error hover:bg-error-container/40' : 'text-success hover:text-success hover:bg-success-container/40'
                        }`}
                      >
                        {branch.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!branches || branches.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant text-body-md font-body-md">
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
