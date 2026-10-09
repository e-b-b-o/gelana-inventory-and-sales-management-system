import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOwner: boolean;
  logoutMutation: any;
  user: { name?: string; role?: string };
}

export function Sidebar({ isOwner, logoutMutation, user }: SidebarProps) {
  const location = useLocation();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const NavItem = ({ to, icon, label, badge }: { to: string, icon: string, label: string, badge?: React.ReactNode }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 ease-in-out cursor-pointer ${
          isActive
            ? "bg-primary-fixed text-primary font-semibold border-l-4 border-primary"
            : "text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent"
        }`}
      >
        <span className={`material-symbols-outlined ${isActive ? "fill text-primary" : ""}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
          {icon}
        </span>
        <span className="text-label-md font-label-md">{label}</span>
        {badge && <div className="ml-auto">{badge}</div>}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant shadow-sm z-30 shrink-0">
      <div className="p-4 flex flex-col h-full overflow-hidden">
        {/* Brand Logo & Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <img 
            alt="Gelana Stationery Logo" 
            className="w-10 h-10 rounded-lg object-cover border border-outline-variant shrink-0" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrCz8TI1A3-WmdKOBQvk0udu5hvxEdTwtDZCU5bMzbqoJPYSidb1koE5LTZ5Z78FA-JfmDePDUroYdZJ9gyUnz0Usy52gaDcRQ-m7ZsBmpoe5MK0x4Zx5tdkIFxa1VeIqNxWZ9zPDZ12I02I7gKJIYoflJ3EjAewKeRfQROOSVgPYk2oqxjzZt4jl1_CtS7GtDJ4PLf9z834CkD7v8kzgWnbNta2P5o3A0Dvh-82GaoQ5OXsCYNCgWcodSZGerDxCY" 
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-headline-sm font-headline-sm font-bold text-on-surface truncate">Gelana Stationery</span>
            <span className="text-body-sm font-body-sm text-on-surface-variant truncate">Inventory & Sales</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          <NavItem to="/" label="Dashboard" icon="dashboard" />
          <NavItem to="/sales" label="Sales History" icon="receipt_long" />
          <NavItem to="/sales/new" label="New Sale" icon="add_shopping_cart" />
          <NavItem to="/inventory" label="Inventory" icon="inventory_2" />
          
          {isOwner && (
            <NavItem to="/inventory/movements" label="Movements" icon="timeline" />
          )}

          <NavItem to="/transfers" label="Transfers" icon="sync_alt" />
          <NavItem to="/catalog" label="Products & Categories" icon="category" />
          
          {isOwner && (
            <>
              <NavItem to="/suppliers" label="Suppliers" icon="local_shipping" />
              <NavItem to="/receivings" label="Receivings" icon="inbox" />
            </>
          )}

          <NavItem to="/daily-closing" label="Daily Closing" icon="lock_clock" />
          
          {isOwner && (
            <NavItem to="/reports" label="Reports" icon="bar_chart" />
          )}

          {isOwner && (
            <NavItem to="/users" label="Users & Branches" icon="badge" />
          )}

          <NavItem to="/notifications" label="Notifications" icon="notifications" badge={<span className="px-1.5 py-0.5 bg-primary-container text-on-primary text-[10px] font-bold rounded-full">3</span>} />
          
          {isOwner && (
            <NavItem to="/settings" label="Settings" icon="settings" />
          )}
        </nav>

        {/* Owner Profile Snippet in Drawer Bottom */}
        <div className="pt-4 border-t border-outline-variant mt-2 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-label-sm font-label-sm text-on-surface truncate">{user?.name || "User"}</span>
              <span className="text-[10px] text-on-surface-variant font-medium capitalize">{user?.role?.toLowerCase() || "Employee"}</span>
            </div>
          </div>
          <button 
            onClick={() => logoutMutation.mutate()}
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded transition-colors"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
