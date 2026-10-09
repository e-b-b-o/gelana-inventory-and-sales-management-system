import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../api/auth";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="bg-surface min-h-screen text-on-surface flex flex-col justify-between selection:bg-primary selection:text-white antialiased">
      {/* Top spacer */}
      <div className="w-full pt-8 pb-2 px-6"></div>

      {/* Main login area */}
      <main className="flex-grow flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[440px]">
          {/* Login Card — styled like Owner Dashboard cards */}
          <div className="bg-surface-container-lowest rounded-xl p-8 sm:p-10 border border-outline-variant shadow-sm relative">
            
            {/* Logo — same Gelana emblem used in the sidebar brand header */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="p-2.5 bg-surface-container-lowest rounded-xl flex items-center justify-center border border-outline-variant">
                <img 
                  alt="Gelana Logo" 
                  className="h-16 w-16 object-contain rounded" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu6Zr8Gk5HIOVg__ITLmiHzUXJ0QouEIhyHgcos1hmSV1AXS9gD-vzZW0V8M9Wu4FWIlASLLIX0ztH8jREVntCu_sJg3BB-ZGCIMXsQVbXQY1Sr74WanQPYGundY4U3fpShEdX4llbEjWn6maw7Kk0pFsM0jLSlMxngiJQtgLKDLpIK1x0_6EMWk2g5CWSnIiqga8vAfcidFbdxMw5IGFqQJEwurgccDVy-xPULvj_oJaWyC4nwF-eN_3JKYdabUuW" 
                />
              </div>
            </div>

            {/* Title & Subtitle — same typography as dashboard headings */}
            <div className="text-center mb-8">
              <h1 className="text-headline-lg font-headline-lg tracking-tight text-on-surface">
                Gelana Management
              </h1>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1.5 font-medium">
                Inventory &amp; Sales — Sign in to continue
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {/* Email field */}
              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <input 
                    className="w-full rounded border border-outline-variant bg-surface py-3 px-4 pl-11 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-[3px] focus:ring-primary/20 transition-all" 
                    id="email" 
                    placeholder="e.g. name@gelana.com" 
                    type="email"
                    {...register("email")}
                  />
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-on-surface-variant pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                </div>
                {errors.email && <p className="text-error text-xs mt-1.5 font-semibold">{errors.email.message}</p>}
              </div>

              {/* Password field */}
              <div>
                <label className="block text-label-sm font-label-sm uppercase tracking-wider text-on-surface-variant mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input 
                    className="w-full rounded border border-outline-variant bg-surface py-3 px-4 pl-11 pr-11 text-body-md font-body-md text-on-surface placeholder:text-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:outline-none focus:ring-[3px] focus:ring-primary/20 tracking-wider transition-all" 
                    id="password" 
                    placeholder="••••••••••••" 
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-on-surface-variant pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <button 
                    aria-label="Toggle password visibility" 
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-on-surface-variant hover:text-on-surface focus:outline-none transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {errors.password && <p className="text-error text-xs mt-1.5 font-semibold">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <div className="pt-1">
                {mutation.error && (
                  <div role="alert" className="mb-3 px-3 py-2.5 bg-error-container border border-error-container rounded flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
                    <p className="text-xs text-error font-semibold text-center leading-tight">
                      {(mutation.error as any).message || "Login failed"}
                    </p>
                  </div>
                )}
                <button 
                  className="w-full py-3.5 px-6 rounded bg-primary hover:bg-primary-hover hover:translate-y-[-1px] active:translate-y-0 text-on-primary font-bold text-label-md shadow-sm transition-all duration-150 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none" 
                  type="submit"
                  disabled={mutation.isPending}
                >
                  <span>{mutation.isPending ? "Signing in..." : "Sign In"}</span>
                  {!mutation.isPending && (
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer status */}
      <footer className="w-full pb-8 pt-4 px-6 flex justify-center items-center">
        <div className="inline-flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-3 py-1.5 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span className="text-xs font-semibold text-on-surface-variant">System Status: <span className="text-success font-bold">Online</span></span>
        </div>
      </footer>
    </div>
  );
}
