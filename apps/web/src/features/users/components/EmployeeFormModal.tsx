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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-card border border-neutral-200/60 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark-slate">
            {isEditing ? "Edit Employee" : "Add Employee"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Name</label>
            <input
              {...register("name")}
              className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="Full Name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Email</label>
            <input
              {...register("email")}
              className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="email@example.com"
              type="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
          </div>

          {!isEditing && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Password</label>
              <input
                {...register("password")}
                className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
                placeholder="Minimum 6 characters"
                type="password"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Role</label>
            <select
              {...register("role")}
              className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="OWNER">Owner</option>
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message as string}</p>}
          </div>

          {!isEditing && role === "EMPLOYEE" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2">Initial Branch</label>
              <select
                {...register("branchId")}
                className="w-full rounded-xl border border-slate-200 bg-input-bg py-3 px-4 text-sm font-semibold text-dark-slate focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Select a branch</option>
                {branches.map((b: Branch) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
              {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId.message as string}</p>}
            </div>
          )}

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
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
