import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBranches, type Branch } from "../../branches/api";
import { useBranchAssignments, useReassignBranch, type User } from "../api";

const schema = z.object({
  newBranchId: z.string().uuid("Please select a branch"),
  reason: z.string().max(500, "Reason is too long").optional(),
});

interface BranchAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function BranchAssignmentModal({ isOpen, onClose, user }: BranchAssignmentModalProps) {
  const { data: branches = [] } = useBranches();
  const activeBranches = branches.filter((b) => b.isActive);
  const { data: assignments = [], isLoading: isLoadingHistory } = useBranchAssignments(user?.id || "");
  const reassignMutation = useReassignBranch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      newBranchId: "",
      reason: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ newBranchId: "", reason: "" });
    }
  }, [isOpen, reset]);

  if (!isOpen || !user) return null;

  const currentBranch = branches.find((b) => b.id === user.branchId);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    if (data.newBranchId === user.branchId) {
      alert("Employee is already assigned to this branch.");
      return;
    }

    try {
      await reassignMutation.mutateAsync({
        userId: user.id,
        newBranchId: data.newBranchId,
        reason: data.reason || undefined,
      });
      onClose();
    } catch (error: any) {
      alert(error?.response?.data?.error?.message || "Failed to reassign branch");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-card border border-neutral-200/60 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-dark-slate">
            Branch Assignment
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2">
          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="text-sm font-bold text-dark-slate mb-1">{user.name}</h3>
            <p className="text-xs text-muted-text">
              Current Branch: <span className="font-semibold text-primary">{currentBranch?.name || "None"}</span>
            </p>
          </div>

          <form id="reassign-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-4">Reassign Employee</h3>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">New Branch</label>
              <select
                {...register("newBranchId")}
                className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Select a new branch</option>
                {activeBranches.map((b: Branch) => (
                  <option key={b.id} value={b.id} disabled={b.id === user.branchId}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              {errors.newBranchId && <p className="text-red-500 text-xs mt-1">{errors.newBranchId.message as string}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Reason (Optional)</label>
              <input
                {...register("reason")}
                className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                placeholder="Reason for branch change"
              />
              {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message as string}</p>}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="submit"
                form="reassign-form"
                disabled={isSubmitting}
                className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm shadow-btn transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Reassigning..." : "Change Branch"}
              </button>
            </div>
          </form>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-text mb-4">Assignment History</h3>
            {isLoadingHistory ? (
              <div className="text-sm text-slate-500 py-4">Loading history...</div>
            ) : assignments.length === 0 ? (
              <div className="text-sm text-slate-500 py-4">No assignment history found.</div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-dark-slate">Branch</th>
                      <th className="px-4 py-3 font-semibold text-dark-slate">Start Date</th>
                      <th className="px-4 py-3 font-semibold text-dark-slate">End Date</th>
                      <th className="px-4 py-3 font-semibold text-dark-slate">Assigned By</th>
                      <th className="px-4 py-3 font-semibold text-dark-slate">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className={!assignment.endDate ? "bg-primary/5" : ""}>
                        <td className="px-4 py-3 font-medium text-dark-slate">
                          {assignment.branchName}
                          {!assignment.endDate && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                              CURRENT
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{assignment.assignedByName}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[150px] truncate" title={assignment.reason || ""}>
                          {assignment.reason || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
