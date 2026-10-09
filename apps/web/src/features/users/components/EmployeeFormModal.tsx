import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useBranches, type Branch } from "../../branches/api";
import { useCreateUser, useUpdateUser, type User } from "../api";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  role: z.enum(["OWNER", "EMPLOYEE"]),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  branchId: z.string().optional().nullable(),
}).refine((data) => {
  if (!data.id && data.role === "EMPLOYEE") {
    // Only required for new employees
    return data.branchId !== null && data.branchId !== undefined && data.branchId !== "";
  }
  return true;
}, {
  message: "Branch is required for new employees",
  path: ["branchId"],
}).refine((data) => {
  if (!data.id && (!data.password || data.password.length < 6)) {
    return false; // password required for new users
  }
  return true;
}, {
  message: "Password is required for new users",
  path: ["password"],
});

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function EmployeeFormModal({ isOpen, onClose, user }: EmployeeFormModalProps) {
  const { data: branches = [] } = useBranches();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "EMPLOYEE",
      password: "",
      branchId: "",
    },
  });

  const role = watch("role");

  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId || "",
          password: "",
        });
      } else {
        reset({
          name: "",
          email: "",
          role: "EMPLOYEE",
          password: "",
          branchId: "",
        });
      }
    }
  }, [isOpen, user, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const payload = {
        ...data,
        branchId: data.branchId || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: user?.id as any,
      };

      if (user) {
        // Edit mode (don't send password or branchId)
        const updateData = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        await updateMutation.mutateAsync({ id: user.id, data: updateData });
      } else {
        // Create mode
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error: any) {
      // In a real app we'd map API errors to form fields or a global alert
      alert(error?.response?.data?.error?.message || "Failed to save user");
    }
  };

  const isEditing = !!user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl p-space-md w-full max-w-md shadow-sm border border-outline-variant relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-headline-sm font-headline-sm text-on-surface">
            {isEditing ? "Edit Employee" : "Add Employee"}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
              Name <span className="text-error">*</span>
            </label>
            <input
              {...register("name")}
              className={`w-full h-[38px] px-3 rounded border ${errors.name ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors`}
              placeholder="Full Name"
            />
            {errors.name && <p className="text-error text-label-sm font-label-sm mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
              Email <span className="text-error">*</span>
            </label>
            <input
              {...register("email")}
              className={`w-full h-[38px] px-3 rounded border ${errors.email ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors`}
              placeholder="email@example.com"
              type="email"
            />
            {errors.email && <p className="text-error text-label-sm font-label-sm mt-1">{errors.email.message as string}</p>}
          </div>

          {!isEditing && (
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                Password <span className="text-error">*</span>
              </label>
              <input
                {...register("password")}
                className={`w-full h-[38px] px-3 rounded border ${errors.password ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors`}
                placeholder="Minimum 6 characters"
                type="password"
              />
              {errors.password && <p className="text-error text-label-sm font-label-sm mt-1">{errors.password.message as string}</p>}
            </div>
          )}

          <div>
            <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
              Role <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                {...register("role")}
                className={`w-full h-[38px] px-3 pr-8 rounded border ${errors.role ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none transition-colors`}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="OWNER">Owner</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
            </div>
            {errors.role && <p className="text-error text-label-sm font-label-sm mt-1">{errors.role.message as string}</p>}
          </div>

          {!isEditing && role === "EMPLOYEE" && (
            <div>
              <label className="block text-label-sm font-label-sm text-on-surface mb-1.5">
                Initial Branch <span className="text-error">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("branchId")}
                  className={`w-full h-[38px] px-3 pr-8 rounded border ${errors.branchId ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 appearance-none transition-colors`}
                >
                  <option value="">Select a branch</option>
                  {branches.map((b: Branch) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-2.5 pointer-events-none text-on-surface-variant text-[18px]">expand_more</span>
              </div>
              {errors.branchId && <p className="text-error text-label-sm font-label-sm mt-1">{errors.branchId.message as string}</p>}
            </div>
          )}

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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
