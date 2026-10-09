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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl p-space-md w-full max-w-2xl shadow-sm border border-outline-variant max-h-[90vh] flex flex-col relative">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">
            Branch Assignment
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2">
          <div className="mb-6 p-4 bg-surface-container rounded-xl border border-outline-variant">
            <h3 className="text-label-md font-label-md text-on-surface mb-1">{user.name}</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              Current Branch: <span className="font-semibold text-primary">{currentBranch?.name || "None"}</span>
            </p>
          </div>

          <form id="reassign-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
            <h3 className="text-label-md font-label-md text-on-surface mb-4">Reassign Employee</h3>
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                New Branch <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("newBranchId")}
                  className={`w-full h-[38px] px-3 pr-8 rounded border ${errors.newBranchId ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none transition-colors`}
                >
                  <option value="">Select a new branch</option>
                  {activeBranches.map((b: Branch) => (
                    <option key={b.id} value={b.id} disabled={b.id === user.branchId}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
              </div>
              {errors.newBranchId && <p className="text-error text-label-sm font-label-sm mt-1">{errors.newBranchId.message as string}</p>}
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">Reason (Optional)</label>
              <input
                {...register("reason")}
                className="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                placeholder="Reason for branch change"
              />
              {errors.reason && <p className="text-error text-label-sm font-label-sm mt-1">{errors.reason.message as string}</p>}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="submit"
                form="reassign-form"
                disabled={isSubmitting}
                className="h-[38px] px-4 rounded bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? "Reassigning..." : "Change Branch"}
              </button>
            </div>
          </form>

          <div>
            <h3 className="text-label-md font-label-md text-on-surface mb-4">Assignment History</h3>
            {isLoadingHistory ? (
              <div className="text-body-sm text-on-surface-variant py-4">Loading history...</div>
            ) : assignments.length === 0 ? (
              <div className="text-body-sm text-on-surface-variant py-4">No assignment history found.</div>
            ) : (
              <div className="border border-outline-variant rounded-xl overflow-hidden">
                <table className="w-full text-left text-body-sm font-body-sm">
                  <thead className="bg-surface-container border-b border-outline-variant">
                    <tr>
                      <th className="px-4 py-3 font-label-sm text-on-surface-variant">Branch</th>
                      <th className="px-4 py-3 font-label-sm text-on-surface-variant">Start Date</th>
                      <th className="px-4 py-3 font-label-sm text-on-surface-variant">End Date</th>
                      <th className="px-4 py-3 font-label-sm text-on-surface-variant">Assigned By</th>
                      <th className="px-4 py-3 font-label-sm text-on-surface-variant">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className={!assignment.endDate ? "bg-primary-container/10" : ""}>
                        <td className="px-4 py-3 font-medium text-on-surface">
                          {assignment.branchName}
                          {!assignment.endDate && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-success/10 text-success border border-success/20">
                              CURRENT
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">{assignment.assignedByName}</td>
                        <td className="px-4 py-3 text-on-surface-variant max-w-[150px] truncate" title={assignment.reason || ""}>
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
