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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl p-space-md w-full max-w-md shadow-sm border border-outline-variant relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">
            {isEditing ? "Edit Branch" : "Add Branch"}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
              Branch Name <span className="text-error">*</span>
            </label>
            <input
              {...register("name")}
              className={`w-full h-[38px] px-3 rounded border ${errors.name ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors`}
              placeholder="e.g. Main Branch"
            />
            {errors.name && <p className="text-error text-label-sm font-label-sm mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
              Branch Code <span className="text-error">*</span>
            </label>
            <input
              {...register("code")}
              className={`w-full h-[38px] px-3 rounded border ${errors.code ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors`}
              placeholder="e.g. MAIN"
            />
            {errors.code && <p className="text-error text-label-sm font-label-sm mt-1">{errors.code.message as string}</p>}
          </div>

          <div>
            <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">Address / Location</label>
            <input
              {...register("address")}
              className="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              placeholder="e.g. Downtown Addis Ababa"
            />
          </div>

          <div>
            <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">Phone Number</label>
            <input
              {...register("phoneNumber")}
              className="w-full h-[38px] px-3 rounded border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              placeholder="e.g. +251 911 23 45 67"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] px-4 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[38px] px-4 rounded bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Branch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
