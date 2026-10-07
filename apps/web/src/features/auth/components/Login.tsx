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
    <div className="bg-warm-canvas min-h-screen text-dark-slate flex flex-col justify-between selection:bg-[#0047FF] selection:text-white antialiased">
      <header className="w-full pt-8 pb-2 px-6 flex justify-center items-center"></header>

      <main className="flex-grow flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[460px]">
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-neutral-200/60 relative">
            
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="p-2 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-neutral-100">
                <img 
                  alt="Gelana Logo" 
                  className="h-20 w-20 object-contain" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrCz8TI1A3-WmdKOBQvk0udu5hvxEdTwtDZCU5bMzbqoJPYSidb1koE5LTZ5Z78FA-JfmDePDUroYdZJ9gyUnz0Usy52gaDcRQ-m7ZsBmpoe5MK0x4Zx5tdkIFxa1VeIqNxWZ9zPDZ12I02I7gKJIYoflJ3EjAewKeRfQROOSVgPYk2oqxjzZt4jl1_CtS7GtDJ4PLf9z834CkD7v8kzgWnbNta2P5o3A0Dvh-82GaoQ5OXsCYNCgWcodSZGerDxCY" 
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-dark-slate sm:text-[26px]">
                Inventory &amp; Sales Management
              </h1>
              <p className="text-sm text-muted-text mt-2 font-medium">
                Internal business management system for 3 branches
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <input 
                    className="w-full rounded-xl border border-slate-200 bg-input-bg py-3.5 px-4 pl-11 text-sm font-semibold text-dark-slate placeholder:text-slate-400 placeholder:font-normal focus:border-[#0047FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047FF]/15 transition-all" 
                    id="email" 
                    placeholder="e.g. name@gelana.com" 
                    type="email"
                    {...register("email")}
                  />
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                    </svg>
                  </span>
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-text" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input 
                    className="w-full rounded-xl border border-slate-200 bg-input-bg py-3.5 px-4 pl-11 pr-11 text-sm font-semibold text-dark-slate placeholder:text-slate-400 focus:border-[#0047FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0047FF]/15 tracking-wider transition-all" 
                    id="password" 
                    placeholder="••••••••••••" 
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
                    </svg>
                  </span>
                  <button 
                    aria-label="Toggle password visibility" 
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password.message}</p>}
              </div>

              <div className="pt-1">
                {mutation.error && (
                  <div role="alert" className="mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center">
                    <p className="text-xs text-red-600 font-semibold text-center leading-tight">
                      {(mutation.error as any).message || "Login failed"}
                    </p>
                  </div>
                )}
                <button 
                  className="w-full py-4 px-6 rounded-xl bg-[#0047FF] hover:bg-[#0037C7] active:scale-[0.99] text-white font-bold text-sm shadow-btn transition-all duration-150 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={mutation.isPending}
                >
                  <span>{mutation.isPending ? "Signing in..." : "Sign In"}</span>
                  {!mutation.isPending && (
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full pb-8 pt-4 px-6 flex justify-center items-center">
        <div className="inline-flex items-center gap-2 bg-white/90 border border-neutral-200/70 px-4 py-2 rounded-full shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-dark-slate">System Status: <span className="text-emerald-600 font-bold">Online</span></span>
        </div>
      </footer>
    </div>
  );
}
