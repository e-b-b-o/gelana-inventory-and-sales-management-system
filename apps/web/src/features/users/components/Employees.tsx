import { useState } from "react";
import { useUsers, useUpdateUserStatus, type User } from "../api";
import { EmployeeFormModal } from "./EmployeeFormModal";
import { BranchAssignmentModal } from "./BranchAssignmentModal";
import { useBranches, type Branch } from "../../branches/api";

export function Employees() {
  const { data: users, isLoading } = useUsers();
  const { data: branches } = useBranches();
  const statusMutation = useUpdateUserStatus();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleAssign = (user: User) => {
    setSelectedUser(user);
    setIsAssignmentOpen(true);
  };

  const handleToggleStatus = async (user: User) => {
    const confirmMessage = user.isActive 
      ? `Are you sure you want to deactivate ${user.name}? They will no longer be able to log in.`
      : `Are you sure you want to reactivate ${user.name}?`;
      
    if (window.confirm(confirmMessage)) {
      await statusMutation.mutateAsync({ id: user.id, isActive: !user.isActive });
    }
  };

  const getBranchName = (id: string | null) => {
    if (!id) return "-";
    const branch = branches?.find((b: Branch) => b.id === id);
    return branch ? branch.name : id;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-text">Loading employees...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-space-md">
        <h2 className="text-headline-sm font-headline-sm text-on-surface">Employee List</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-label-md font-label-md rounded bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Employee
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-outline-variant">
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Name</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Email</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Role</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Branch</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-label-sm font-label-sm text-on-surface-subtle uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users?.map((user: User) => (
                <tr key={user.id} className="hover:bg-surface transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-on-surface text-body-md font-body-md">{user.name}</span>
                  </td>
                  <td className="py-3 px-4 text-body-sm font-body-sm text-on-surface-variant">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      user.role === 'OWNER' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-body-sm font-body-sm text-on-surface-variant">{getBranchName(user.branchId)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      user.isActive ? 'bg-success-container text-success' : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-success' : 'bg-outline'}`}></span>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-label-sm font-label-sm text-primary hover:text-primary-hover px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAssign(user)}
                        className="text-label-sm font-label-sm text-primary hover:text-primary-hover px-2 py-1 rounded hover:bg-primary/10 transition-colors"
                      >
                        Change Branch
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={statusMutation.isPending}
                        className={`text-label-sm font-label-sm px-2 py-1 rounded transition-colors ${
                          user.isActive ? 'text-error hover:text-error hover:bg-error-container/40' : 'text-success hover:text-success hover:bg-success-container/40'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant text-body-md font-body-md">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        user={selectedUser}
      />
      
      <BranchAssignmentModal
        isOpen={isAssignmentOpen}
        onClose={() => setIsAssignmentOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
