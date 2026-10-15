import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { useUnreadCountQuery } from "../../features/notifications/api";

interface SidebarProps {
  isOwner: boolean;
  logoutMutation: any;
  user: { name?: string; role?: string };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavGroupItem {
  to: string;
  label: string;
  icon: string;
  badge?: React.ReactNode;
  visible?: boolean;
}

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  badge?: React.ReactNode;
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
}

interface NavAccordionProps {
  label: string;
  icon: string;
  visibleItems: NavGroupItem[];
  isCollapsed?: boolean;
  isOpenFlyout: boolean;
  onToggleFlyout: () => void;
  onCloseFlyout: () => void;
  onCloseMobile?: () => void;
}

interface NavGroupProps {
  label: string;
  icon: string;
  items: NavGroupItem[];
  isCollapsed?: boolean;
  isOpenFlyout: boolean;
  onToggleFlyout: () => void;
  onCloseFlyout: () => void;
  onCloseMobile?: () => void;
}

function NavItem({
  to,
  icon,
  label,
  badge,
  isCollapsed = false,
  onCloseMobile,
}: NavItemProps) {
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/" && (location.pathname === to || location.pathname.startsWith(to + "/")));

  if (isCollapsed) {
    return (
      <div className="relative group flex justify-center py-0.5">
        <Link
          to={to}
          title={label}
          aria-label={label}
          onClick={onCloseMobile}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            isActive
              ? "bg-primary/10 text-primary font-semibold"
              : "text-on-surface-variant hover:bg-surface-container/70 hover:text-on-surface"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[20px] transition-colors shrink-0 ${
              isActive ? "text-primary" : "text-outline group-hover:text-on-surface"
            }`}
            style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {icon}
          </span>
          {badge && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-surface-container-lowest" />
          )}
        </Link>

        {/* Accessible Floating Tooltip */}
        <div
          role="tooltip"
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-2.5 py-1 bg-[#161C27] text-white text-[12px] font-medium rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150"
        >
          {label}
        </div>
      </div>
    );
  }

  return (
    <Link
      to={to}
      onClick={onCloseMobile}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-on-surface-variant font-medium hover:bg-surface-container/70 hover:text-on-surface"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[20px] shrink-0 transition-colors ${
          isActive ? "text-primary" : "text-outline group-hover:text-on-surface"
        }`}
        style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
      >
        {icon}
      </span>
      <span className="text-label-md font-label-md truncate">{label}</span>
      {badge && <div className="ml-auto">{badge}</div>}
    </Link>
  );
}

function NavAccordion({
  label,
  icon,
  visibleItems,
  isCollapsed = false,
  isOpenFlyout,
  onToggleFlyout,
  onCloseFlyout,
  onCloseMobile,
}: NavAccordionProps) {
  const location = useLocation();

  const isChildActive = (to: string) => {
    if (location.pathname === to) return true;
    if (location.pathname.startsWith(to + "/")) {
      const hasMoreSpecific = visibleItems.some(
        (other) =>
          other.to !== to &&
          other.to.length > to.length &&
          (location.pathname === other.to || location.pathname.startsWith(other.to + "/"))
      );
      return !hasMoreSpecific;
    }
    return false;
  };

  const isGroupActive = visibleItems.some((item) => isChildActive(item.to));
  const [isExpanded, setIsExpanded] = useState<boolean>(() => isGroupActive);

  useEffect(() => {
    if (isGroupActive) {
      setIsExpanded(true);
    }
  }, [isGroupActive]);

  const groupId = `nav-group-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const flyoutId = `${groupId}-flyout`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [flyoutPosition, setFlyoutPosition] = useState<{ top: number; left: number }>({ top: 0, left: 76 });

  // Compute flyout position clamped within viewport boundaries
  useLayoutEffect(() => {
    if (!isOpenFlyout || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const left = Math.round(rect.right + 8);
      const flyoutHeight = flyoutRef.current?.offsetHeight || (visibleItems.length * 40 + 52);
      const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

      let top = Math.round(rect.top);
      if (top + flyoutHeight > viewportHeight - 12) {
        top = Math.max(12, viewportHeight - flyoutHeight - 12);
      }
      if (top < 12) {
        top = 12;
      }

      setFlyoutPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpenFlyout, visibleItems.length]);

  // Keyboard focus management inside flyout
  useEffect(() => {
    if (!isOpenFlyout || !flyoutRef.current) return;

    const activeItem = flyoutRef.current.querySelector<HTMLAnchorElement>('a[data-active="true"]');
    const firstItem = flyoutRef.current.querySelector<HTMLAnchorElement>('a[role="menuitem"]');
    (activeItem || firstItem)?.focus();
  }, [isOpenFlyout]);

  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onCloseFlyout();
      buttonRef.current?.focus();
      return;
    }

    const items = Array.from(flyoutRef.current?.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]') || []);
    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLAnchorElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = currentIndex === -1 || currentIndex === items.length - 1 ? 0 : currentIndex + 1;
      items[nextIndex]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
      items[prevIndex]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    } else if (e.key === "Tab") {
      onCloseFlyout();
    }
  };

  if (isCollapsed) {
    return (
      <div className="relative group flex justify-center py-0.5">
        <button
          ref={buttonRef}
          type="button"
          data-flyout-group={label}
          title={label}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={isOpenFlyout}
          aria-controls={flyoutId}
          onClick={onToggleFlyout}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
              if (!isOpenFlyout) {
                e.preventDefault();
                onToggleFlyout();
              }
            }
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            isGroupActive
              ? "bg-primary/10 text-primary font-semibold"
              : isOpenFlyout
              ? "bg-surface-container text-on-surface"
              : "text-on-surface-variant hover:bg-surface-container/70 hover:text-on-surface"
          }`}
        >
          <span
            className={`material-symbols-outlined text-[20px] shrink-0 ${
              isGroupActive ? "text-primary" : "text-outline group-hover:text-on-surface"
            }`}
            style={isGroupActive ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {icon}
          </span>
        </button>

        {/* Accessible Floating Tooltip (shown on hover only when flyout is closed) */}
        {!isOpenFlyout && (
          <div
            role="tooltip"
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 px-2.5 py-1 bg-[#161C27] text-white text-[12px] font-medium rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150"
          >
            {label}
          </div>
        )}

        {/* Compact Flyout Submenu Rendered Via Portal Beside Sidebar */}
        {isOpenFlyout &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={flyoutRef}
              id={flyoutId}
              role="menu"
              aria-label={`${label} sub-menu`}
              data-flyout-group={label}
              tabIndex={-1}
              onKeyDown={handleMenuKeyDown}
              style={{ top: `${flyoutPosition.top}px`, left: `${flyoutPosition.left}px` }}
              className="fixed z-50 min-w-[200px] max-w-[260px] bg-surface-container-lowest border border-outline-variant/80 rounded-xl shadow-xl p-1.5 focus:outline-none"
            >
              <div className="px-3 py-1.5 text-label-sm font-bold text-on-surface border-b border-outline-variant/50 mb-1 flex items-center justify-between">
                <span>{label}</span>
                <span className="text-[10px] font-normal text-on-surface-variant uppercase tracking-wider">
                  Menu
                </span>
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = isChildActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      role="menuitem"
                      data-active={active ? "true" : "false"}
                      tabIndex={0}
                      onClick={() => {
                        onCloseMobile?.();
                        onCloseFlyout();
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-label-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus:bg-surface-container focus:text-on-surface"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] shrink-0 ${
                          active ? "text-primary" : "text-outline"
                        }`}
                        style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                      {item.badge && <div className="ml-auto">{item.badge}</div>}
                    </Link>
                  );
                })}
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        aria-controls={groupId}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          isGroupActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-on-surface-variant font-medium hover:bg-surface-container/70 hover:text-on-surface"
        }`}
      >
        <div className="flex items-center gap-3 truncate">
          <span
            className={`material-symbols-outlined text-[20px] shrink-0 ${
              isGroupActive ? "text-primary" : "text-outline"
            }`}
            style={isGroupActive ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            {icon}
          </span>
          <span className="text-label-md font-label-md truncate">{label}</span>
        </div>
        <span
          className={`material-symbols-outlined text-[18px] text-outline transition-transform duration-200 shrink-0 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {isExpanded && (
        <div
          id={groupId}
          role="region"
          aria-label={`${label} sub-navigation`}
          className="space-y-1 pl-3 pt-0.5"
        >
          {visibleItems.map((item) => {
            const active = isChildActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={`flex items-center gap-2.5 pl-5 pr-3 py-2 rounded-xl transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-on-surface-variant font-medium hover:bg-surface-container/70 hover:text-on-surface"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[18px] shrink-0 ${
                    active ? "text-primary" : "text-outline"
                  }`}
                  style={active ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-label-md font-label-md truncate">{item.label}</span>
                {item.badge && <div className="ml-auto">{item.badge}</div>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavGroup({
  label,
  icon,
  items,
  isCollapsed = false,
  isOpenFlyout,
  onToggleFlyout,
  onCloseFlyout,
  onCloseMobile,
}: NavGroupProps) {
  const visibleItems = items.filter((item) => item.visible !== false);

  if (visibleItems.length === 0) return null;

  if (visibleItems.length === 1) {
    const single = visibleItems[0];
    return (
      <NavItem
        to={single.to}
        label={label}
        icon={icon}
        badge={single.badge}
        isCollapsed={isCollapsed}
        onCloseMobile={onCloseMobile}
      />
    );
  }

  return (
    <NavAccordion
      label={label}
      icon={icon}
      visibleItems={visibleItems}
      isCollapsed={isCollapsed}
      isOpenFlyout={isOpenFlyout}
      onToggleFlyout={onToggleFlyout}
      onCloseFlyout={onCloseFlyout}
      onCloseMobile={onCloseMobile}
    />
  );
}

export function Sidebar({
  isOwner,
  logoutMutation,
  user,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const location = useLocation();
  const { data: unreadData } = useUnreadCountQuery();
  const unreadCount = unreadData?.unreadCount ?? 0;
  const [openFlyoutGroup, setOpenFlyoutGroup] = useState<string | null>(null);

  // Close flyout on collapse change or route change
  useEffect(() => {
    setOpenFlyoutGroup(null);
  }, [isCollapsed, location.pathname]);

  // Handle outside click & Escape to close flyout
  useEffect(() => {
    if (!openFlyoutGroup) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(`[data-flyout-group="${openFlyoutGroup}"]`)) {
        return;
      }
      setOpenFlyoutGroup(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenFlyoutGroup(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openFlyoutGroup]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2) || "U"
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          role="presentation"
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed left-0 top-0 h-screen flex flex-col justify-between bg-surface-container-lowest border-r border-outline-variant/70 shadow-sm z-50 shrink-0 transition-[width] duration-200 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div
          className={`${
            isCollapsed ? "px-2.5 py-3" : "px-3.5 py-3"
          } flex flex-col h-full overflow-hidden w-full`}
        >
          {/* Header & Logo + Collapse Toggle */}
          <div className="mb-3 pb-3 border-b border-outline-variant/60">
            {isCollapsed ? (
              <div className="w-full flex flex-col items-center gap-2">
                <img
                  alt="Gelana Stationery Logo"
                  className="w-9 h-9 rounded-xl object-cover border border-outline-variant/60 shrink-0 shadow-xs"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrCz8TI1A3-WmdKOBQvk0udu5hvxEdTwtDZCU5bMzbqoJPYSidb1koE5LTZ5Z78FA-JfmDePDUroYdZJ9gyUnz0Usy52gaDcRQ-m7ZsBmpoe5MK0x4Zx5tdkIFxa1VeIqNxWZ9zPDZ12I02I7gKJIYoflJ3EjAewKeRfQROOSVgPYk2oqxjzZt4jl1_CtS7GtDJ4PLf9z834CkD7v8kzgWnbNta2P5o3A0Dvh-82GaoQ5OXsCYNCgWcodSZGerDxCY"
                />
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  title="Expand sidebar (Ctrl+B)"
                  aria-label="Expand sidebar"
                  className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">menu</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between min-h-[44px]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    alt="Gelana Stationery Logo"
                    className="w-9 h-9 rounded-xl object-cover border border-outline-variant/60 shrink-0 shadow-xs"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrCz8TI1A3-WmdKOBQvk0udu5hvxEdTwtDZCU5bMzbqoJPYSidb1koE5LTZ5Z78FA-JfmDePDUroYdZJ9gyUnz0Usy52gaDcRQ-m7ZsBmpoe5MK0x4Zx5tdkIFxa1VeIqNxWZ9zPDZ12I02I7gKJIYoflJ3EjAewKeRfQROOSVgPYk2oqxjzZt4jl1_CtS7GtDJ4PLf9z834CkD7v8kzgWnbNta2P5o3A0Dvh-82GaoQ5OXsCYNCgWcodSZGerDxCY"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-label-lg font-label-lg font-bold text-on-surface truncate tracking-tight">
                      Gelana Stationery
                    </span>
                    <span className="text-body-xs font-body-xs text-on-surface-variant truncate">
                      Inventory & Sales
                    </span>
                  </div>
                </div>

                {/* Desktop Collapse Button */}
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  title="Collapse sidebar (Ctrl+B)"
                  aria-label="Collapse sidebar"
                  className="hidden md:flex p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">menu_open</span>
                </button>

                {/* Mobile Close Button */}
                <button
                  type="button"
                  onClick={onCloseMobile}
                  title="Close navigation"
                  aria-label="Close navigation"
                  className="md:hidden p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden no-scrollbar pr-0 pb-2">
            <NavItem
              to="/"
              label="Dashboard"
              icon="dashboard"
              isCollapsed={isCollapsed}
              onCloseMobile={onCloseMobile}
            />

            <NavGroup
              label="Sales"
              icon="point_of_sale"
              isCollapsed={isCollapsed}
              isOpenFlyout={openFlyoutGroup === "Sales"}
              onToggleFlyout={() => setOpenFlyoutGroup((prev) => (prev === "Sales" ? null : "Sales"))}
              onCloseFlyout={() => setOpenFlyoutGroup(null)}
              onCloseMobile={onCloseMobile}
              items={[
                { to: "/sales/new", label: "New Sale", icon: "add_shopping_cart" },
                { to: "/sales", label: "Sales History", icon: "receipt_long" },
                { to: "/sales/returns", label: "Returns", icon: "assignment_return" },
              ]}
            />

            <NavGroup
              label="Inventory"
              icon="inventory_2"
              isCollapsed={isCollapsed}
              isOpenFlyout={openFlyoutGroup === "Inventory"}
              onToggleFlyout={() => setOpenFlyoutGroup((prev) => (prev === "Inventory" ? null : "Inventory"))}
              onCloseFlyout={() => setOpenFlyoutGroup(null)}
              onCloseMobile={onCloseMobile}
              items={[
                { to: "/inventory", label: "Current Inventory", icon: "inventory_2" },
                { to: "/inventory/movements", label: "Movements", icon: "timeline", visible: isOwner },
              ]}
            />

            <NavItem
              to="/transfers"
              label="Transfers"
              icon="sync_alt"
              isCollapsed={isCollapsed}
              onCloseMobile={onCloseMobile}
            />
            <NavItem
              to="/catalog"
              label="Products & Categories"
              icon="category"
              isCollapsed={isCollapsed}
              onCloseMobile={onCloseMobile}
            />

            {isOwner && (
              <>
                <NavItem
                  to="/suppliers"
                  label="Suppliers"
                  icon="local_shipping"
                  isCollapsed={isCollapsed}
                  onCloseMobile={onCloseMobile}
                />
                <NavItem
                  to="/receivings"
                  label="Receivings"
                  icon="inbox"
                  isCollapsed={isCollapsed}
                  onCloseMobile={onCloseMobile}
                />
              </>
            )}

            <NavGroup
              label="Daily Closing"
              icon="lock_clock"
              isCollapsed={isCollapsed}
              isOpenFlyout={openFlyoutGroup === "Daily Closing"}
              onToggleFlyout={() => setOpenFlyoutGroup((prev) => (prev === "Daily Closing" ? null : "Daily Closing"))}
              onCloseFlyout={() => setOpenFlyoutGroup(null)}
              onCloseMobile={onCloseMobile}
              items={[
                { to: "/daily-closing", label: "Current Closing", icon: "event_available" },
                { to: "/daily-closing/history", label: "Closing History", icon: "history" },
              ]}
            />

            <NavItem
              to="/reports"
              label="Reports"
              icon="bar_chart"
              isCollapsed={isCollapsed}
              onCloseMobile={onCloseMobile}
            />

            {isOwner && (
              <NavItem
                to="/users"
                label="Users & Branches"
                icon="badge"
                isCollapsed={isCollapsed}
                onCloseMobile={onCloseMobile}
              />
            )}

            {isOwner && (
              <NavItem
                to="/audit-logs"
                label="Audit Log"
                icon="policy"
                isCollapsed={isCollapsed}
                onCloseMobile={onCloseMobile}
              />
            )}

            <NavItem
              to="/notifications"
              label="Notifications"
              icon="notifications"
              isCollapsed={isCollapsed}
              onCloseMobile={onCloseMobile}
              badge={
                unreadCount > 0 ? (
                  <span className="px-1.5 py-0.2 bg-primary text-on-primary text-[10px] font-bold rounded-full">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : undefined
              }
            />

            <NavItem
              to="/settings"
              label="Settings"
              icon="settings"
              isCollapsed={isCollapsed}
              onCloseMobile={onCloseMobile}
            />
          </nav>

          {/* Profile & Logout Footer */}
          <div className="pt-3 border-t border-outline-variant/60 mt-auto">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <div
                  title={user?.name || "User"}
                  aria-label={user?.name || "User"}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold shrink-0 shadow-xs cursor-default"
                >
                  {getInitials(user?.name)}
                </div>
                <button
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                  title="Logout"
                  aria-label="Logout"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-xs font-bold shrink-0 shadow-xs">
                    {getInitials(user?.name)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-label-sm font-label-sm text-on-surface font-semibold truncate">
                      {user?.name || "User"}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium capitalize truncate">
                      {user?.role?.toLowerCase() || "Employee"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logoutMutation.mutate()}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Logout"
                  aria-label="Logout"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
