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
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-slate mb-2">Employees</h1>
          <p className="text-muted-text text-sm font-medium">Manage branch staff and system access</p>
        </div>
        <button
          onClick={handleAdd}
          className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm shadow-btn transition-all duration-150 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-neutral-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Name</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Email</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Role</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Branch</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-text text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users?.map((user: User) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-bold text-dark-slate">{user.name}</span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'OWNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{getBranchName(user.branchId)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-sm font-bold text-primary hover:text-primary-hover"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleAssign(user)}
                        className="text-sm font-bold text-primary hover:text-primary-hover"
                      >
                        Change Branch
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={statusMutation.isPending}
                        className={`text-sm font-bold ${user.isActive ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                      >
                        {user.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-text text-sm">
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
