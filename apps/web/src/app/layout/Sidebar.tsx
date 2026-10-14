import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOwner: boolean;
  logoutMutation: any;
  user: { name?: string; role?: string };
}

interface NavGroupItem {
  to: string;
  label: string;
  icon: string;
  badge?: React.ReactNode;
  visible?: boolean;
}

interface NavGroupProps {
  label: string;
  icon: string;
  items: NavGroupItem[];
}

export function Sidebar({ isOwner, logoutMutation, user }: SidebarProps) {
  const location = useLocation();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
  };

  const NavItem = ({ to, icon, label, badge }: { to: string; icon: string; label: string; badge?: React.ReactNode }) => {
    const isActive = location.pathname === to || (to !== '/' && (location.pathname === to || location.pathname.startsWith(to + "/")));
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 ease-in-out cursor-pointer ${
          isActive
            ? "bg-primary-fixed text-primary font-semibold border-l-4 border-primary"
            : "text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent"
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${isActive ? "fill text-primary" : ""}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
          {icon}
        </span>
        <span className="text-label-md font-label-md">{label}</span>
        {badge && <div className="ml-auto">{badge}</div>}
      </Link>
    );
  };

  interface NavAccordionProps {
    label: string;
    icon: string;
    visibleItems: NavGroupItem[];
  }

  const NavAccordion = ({ label, icon, visibleItems }: NavAccordionProps) => {
    const isChildActive = (to: string) => {
      if (location.pathname === to) return true;
      if (location.pathname.startsWith(to + "/")) {
        const hasMoreSpecific = visibleItems.some(
          other =>
            other.to !== to &&
            other.to.length > to.length &&
            (location.pathname === other.to || location.pathname.startsWith(other.to + "/"))
        );
        return !hasMoreSpecific;
      }
      return false;
    };

    const isGroupActive = visibleItems.some(item => isChildActive(item.to));
    const [isExpanded, setIsExpanded] = useState<boolean>(() => isGroupActive);

    useEffect(() => {
      if (isGroupActive) {
        setIsExpanded(true);
      }
    }, [isGroupActive]);

    const groupId = `nav-group-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          aria-expanded={isExpanded}
          aria-controls={groupId}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded transition-all duration-150 ease-in-out cursor-pointer ${
            isGroupActive
              ? "bg-primary-fixed/40 text-primary font-semibold border-l-4 border-primary"
              : "text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent"
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`material-symbols-outlined text-[20px] ${isGroupActive ? "fill text-primary" : ""}`}
              style={isGroupActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            <span className="text-label-md font-label-md">{label}</span>
          </div>
          <span
            className={`material-symbols-outlined text-[18px] text-outline transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            expand_more
          </span>
        </button>

        {isExpanded && (
          <div id={groupId} role="region" aria-label={`${label} sub-navigation`} className="space-y-1 pl-3">
            {visibleItems.map(item => {
              const active = isChildActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 pl-6 pr-3 py-2 rounded transition-all duration-150 ease-in-out cursor-pointer ${
                    active
                      ? "bg-primary-fixed text-primary font-semibold border-l-4 border-primary"
                      : "text-on-surface-variant font-normal hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${active ? "fill text-primary" : "text-outline"}`}
                    style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-label-md font-label-md">{item.label}</span>
                  {item.badge && <div className="ml-auto">{item.badge}</div>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const NavGroup = ({ label, icon, items }: NavGroupProps) => {
    const visibleItems = items.filter(item => item.visible !== false);

    if (visibleItems.length === 0) return null;

    if (visibleItems.length === 1) {
      const single = visibleItems[0];
      return <NavItem to={single.to} label={label} icon={icon} badge={single.badge} />;
    }

    return <NavAccordion label={label} icon={icon} visibleItems={visibleItems} />;
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
          
          <NavGroup
            label="Sales"
            icon="point_of_sale"
            items={[
              { to: "/sales/new", label: "New Sale", icon: "add_shopping_cart" },
              { to: "/sales", label: "Sales History", icon: "receipt_long" },
              { to: "/sales/returns", label: "Returns", icon: "assignment_return" },
            ]}
          />


          <NavGroup
            label="Inventory"
            icon="inventory_2"
            items={[
              { to: "/inventory", label: "Current Inventory", icon: "inventory_2" },
              { to: "/inventory/movements", label: "Movements", icon: "timeline", visible: isOwner },
            ]}
          />

          <NavItem to="/transfers" label="Transfers" icon="sync_alt" />
          <NavItem to="/catalog" label="Products & Categories" icon="category" />
          
          {isOwner && (
            <>
              <NavItem to="/suppliers" label="Suppliers" icon="local_shipping" />
              <NavItem to="/receivings" label="Receivings" icon="inbox" />
            </>
          )}

          <NavGroup
            label="Daily Closing"
            icon="lock_clock"
            items={[
              { to: "/daily-closing", label: "Current Closing", icon: "event_available" },
              { to: "/daily-closing/history", label: "Closing History", icon: "history" },
            ]}
          />
          
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
