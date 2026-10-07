import { Outlet } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, logout } from "../../features/auth/api/auth";

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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{ width: '250px', backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ color: 'var(--color-primary)', margin: 0 }}>Gelana</h2>
        </div>
        <nav style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', fontWeight: 500 }}>
          <div>Dashboard</div>
          <div>Sales</div>
          <div>Inventory</div>
          <div>Transfers</div>
          <div><a href="/catalog" style={{ textDecoration: 'none', color: 'inherit' }}>Products & Categories</a></div>
          {isOwner && (
            <>
              <div>Suppliers</div>
            </>
          )}
          <div>Daily Closing</div>
          {isOwner && <div>Reports</div>}
          {isOwner && (
            <>
              <div><a href="/employees" style={{ textDecoration: 'none', color: 'inherit' }}>Users</a></div>
              <div><a href="/branches" style={{ textDecoration: 'none', color: 'inherit' }}>Branches</a></div>
            </>
          )}
          <div>Notifications</div>
          {!isOwner && <div>Account / Security</div>}
          {isOwner && <div>Settings</div>}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ marginBottom: '4px', fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>{user.role}</div>
          <button 
            onClick={() => logoutMutation.mutate()} 
            style={{ padding: '8px', width: '100%', border: '1px solid var(--color-border)', backgroundColor: 'transparent', borderRadius: '4px', fontWeight: 500 }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--color-background)', padding: '32px' }}>
        <Outlet />
      </main>
    </div>
  );
}
