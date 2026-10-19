import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, logout } from "../../features/auth/api/auth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const SIDEBAR_COLLAPSED_KEY = "gelana_sidebar_collapsed";

export function AppShell() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Collapsed state persisted in localStorage (defaults to false / expanded)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
        return saved === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  // Mobile drawer state (defaults to closed)
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Close mobile drawer upon route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      queryClient.setQueryData(["me"], null);
      navigate("/login", { replace: true });
    },
  });

  const user = data?.user;
  if (!user) return null; // handled by router

  const isOwner = user.role === "OWNER";

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex">
      <Sidebar
        isOwner={isOwner}
        logoutMutation={logoutMutation}
        user={user}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div
        className={`flex-1 min-w-0 h-screen flex flex-col bg-[#F6F8FB] transition-all duration-200 ease-in-out ${
          isCollapsed ? "md:ml-[72px]" : "md:ml-64"
        } ml-0`}
      >
        <Header
          user={user}
          onOpenMobile={() => setIsMobileOpen(true)}
          onLogout={() => logoutMutation.mutate()}
        />
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 sm:p-6 md:p-margin max-w-7xl w-full mx-auto pb-12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
