import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../features/auth/api/auth";

export function NotFoundPage() {
  const navigate = useNavigate();
  const error = useRouteError();
  
  // Try to determine if the user is authenticated to route them properly
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false
  });

  const handleReturnHome = () => {
    if (data?.user) {
      navigate("/");
    } else {
      navigate("/login");
    }
  };

  let title = "Page not found";
  let message = "We couldn't find the page you're looking for. The link may be incorrect, or the page may have moved.";

  if (isRouteErrorResponse(error) && error.status === 401) {
    title = "Unauthorized access";
    message = "You don't have permission to access this page. Please log in to continue.";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant p-8 text-center">
        {/* Custom Illustration / Icon Group */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-primary">explore_off</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-surface-container-lowest rounded-full p-1.5 shadow-sm border border-outline-variant">
            <span className="material-symbols-outlined text-[16px] text-error">error</span>
          </div>
        </div>

        <h1 className="text-headline-md font-headline-md text-on-surface mb-3 tracking-tight">
          {title}
        </h1>
        
        <p className="text-body-md font-body-md text-on-surface-variant mb-8 leading-relaxed">
          {message}
        </p>

        <button
          onClick={handleReturnHome}
          className="w-full py-3 px-4 rounded bg-primary hover:bg-primary-hover active:scale-[0.99] text-on-primary font-label-lg text-label-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">
            {data?.user ? 'dashboard' : 'login'}
          </span>
          {data?.user ? "Back to Dashboard" : "Back to Login"}
        </button>
      </div>
    </div>
  );
}
