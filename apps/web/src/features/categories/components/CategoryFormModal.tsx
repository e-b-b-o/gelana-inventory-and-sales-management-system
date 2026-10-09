import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useCreateCategory, useUpdateCategory, type Category } from "../api";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
});

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function CategoryFormModal({ isOpen, onClose, category }: CategoryFormModalProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({ name: category.name });
      } else {
        reset({ name: "" });
      }
    }
  }, [isOpen, category, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      if (category) {
        await updateMutation.mutateAsync({ id: category.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error: any) {
      alert(error?.response?.data?.error?.message || "Failed to save category");
    }
  };

  const isEditing = !!category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl p-space-md w-full max-w-sm shadow-sm border border-outline-variant relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">
            {isEditing ? "Edit Category" : "Add Category"}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
              Category Name <span className="text-error">*</span>
            </label>
            <input
              {...register("name")}
              className={`w-full h-[38px] px-3 rounded border ${errors.name ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20`}
              placeholder="e.g. Writing"
              autoFocus
            />
            {errors.name && <p className="text-error text-label-sm font-label-sm mt-1">{errors.name.message as string}</p>}
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
              className="h-[38px] px-4 rounded bg-primary hover:bg-primary-hover text-on-primary font-label-md text-label-md shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
