import { Outlet } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, logout } from "../../features/auth/api/auth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
    }
  });

  const user = data?.user;
  if (!user) return null; // handled by router

  const isOwner = user.role === "OWNER";

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex">
      <Sidebar isOwner={isOwner} logoutMutation={logoutMutation} user={user} />
      <div className="flex-1 ml-64 h-screen flex flex-col bg-[#F6F8FB]">
        <Header user={user} />
        <div className="flex-1 overflow-y-auto">
          <main className="p-margin max-w-7xl w-full mx-auto pb-12">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
