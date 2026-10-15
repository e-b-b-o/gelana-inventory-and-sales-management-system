import { useQuery } from "@tanstack/react-query";
import { getMe } from "../auth/api/auth";
import { OwnerDashboard } from "./components/OwnerDashboard";
import { EmployeeDashboard } from "./components/EmployeeDashboard";

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div data-testid="dashboard-loading" className="space-y-6 animate-pulse">
        <div className="h-10 bg-surface-container-high rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-surface-container-high rounded-lg"></div>
          <div className="h-28 bg-surface-container-high rounded-lg"></div>
          <div className="h-28 bg-surface-container-high rounded-lg"></div>
          <div className="h-28 bg-surface-container-high rounded-lg"></div>
        </div>
        <div className="h-64 bg-surface-container-high rounded-lg"></div>
      </div>
    );
  }

  const user = data?.user;
  const isOwner = user?.role === "OWNER";

  return isOwner ? <OwnerDashboard /> : <EmployeeDashboard />;
}
