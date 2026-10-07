import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useCreateBranch, useUpdateBranch, type Branch } from "../api";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
});

interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
}

export function BranchFormModal({ isOpen, onClose, branch }: BranchFormModalProps) {
  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (branch) {
        reset({
          name: branch.name,
          code: branch.code,
          address: branch.address || "",
          phoneNumber: branch.phoneNumber || "",
        });
      } else {
        reset({
          name: "",
          code: "",
          address: "",
          phoneNumber: "",
        });
      }
    }
  }, [isOpen, branch, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      if (branch) {
        await updateMutation.mutateAsync({ id: branch.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error: any) {
      alert(error?.statusCode === 400 && error?.message ? error.message : "Failed to save branch");
    }
  };

  const isEditing = !!branch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-card border border-neutral-200/60 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark-slate">
            {isEditing ? "Edit Branch" : "Add Branch"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Branch Name *</label>
            <input
              {...register("name")}
              className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="e.g. Main Branch"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Branch Code *</label>
            <input
              {...register("code")}
              className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="e.g. MAIN"
            />
            {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message as string}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Address / Location</label>
            <input
              {...register("address")}
              className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="e.g. Downtown Addis Ababa"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Phone Number</label>
            <input
              {...register("phoneNumber")}
              className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="e.g. +251 911 23 45 67"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-bold text-sm shadow-btn transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
