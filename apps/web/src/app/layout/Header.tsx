import { useLocation, Link } from "react-router-dom";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import type { Product } from "../../features/products/api";
import { useUnreadCountQuery } from "../../features/notifications/api";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KNOWN_STATIC_SEGMENTS = new Set([
  "new",
  "movements",
  "stocktake",
  "returns",
  "employees",
  "branches",
  "categories",
  "history",
]);

function getBreadcrumbLabel(path: string, index: number, paths: string[], queryClient: QueryClient): string {
  const prevPath = index > 0 ? paths[index - 1] : undefined;
  const isUuid = UUID_REGEX.test(path);
  const isDynamicEntityId =
    isUuid ||
    (prevPath &&
      ["transfers", "sales", "returns", "catalog", "products", "inventory"].includes(prevPath) &&
      !KNOWN_STATIC_SEGMENTS.has(path));

  if (isDynamicEntityId) {
    // 1. Check Product Details
    if (prevPath === "catalog" || prevPath === "products" || prevPath === "inventory") {
      const products = queryClient.getQueryData<Product[]>(["products"]);
      const match = products?.find((p) => p.id === path);
      if (match?.name) return match.name;

      const singleProd = queryClient.getQueryData<any>(["product", path]);
      if (singleProd?.name) return singleProd.name;

      // Check inventory balances cache
      const balanceQueries = queryClient.getQueriesData({ queryKey: ["inventory", "balances"] });
      for (const [, data] of balanceQueries) {
        const balances = (data as any)?.data || (Array.isArray(data) ? data : []);
        const found = balances.find((b: any) => b.id === path || b.productId === path);
        if (found?.name) return found.name;
      }

      return "Product Details";
    }

    // 2. Check Transfer Details
    if (prevPath === "transfers") {
      const transfer = queryClient.getQueryData<any>(["transfer-details", path]);
      if (transfer?.transferNumber) return transfer.transferNumber;

      const transfersList = queryClient.getQueriesData({ queryKey: ["transfers"] });
      for (const [, data] of transfersList) {
        const list = (data as any)?.data || (Array.isArray(data) ? data : []);
        const found = list.find((t: any) => t.id === path);
        if (found?.transferNumber) return found.transferNumber;
      }

      return "Transfer Details";
    }

    // 3. Check Sale Details
    if (prevPath === "sales") {
      const sale = queryClient.getQueryData<any>(["sale-details", path]);
      if (sale?.saleNumber) return sale.saleNumber;

      const salesList = queryClient.getQueriesData({ queryKey: ["sales"] });
      for (const [, data] of salesList) {
        const list = (data as any)?.data || (Array.isArray(data) ? data : []);
        const found = list.find((s: any) => s.id === path);
        if (found?.saleNumber) return found.saleNumber;
      }

      return "Sale Details";
    }

    // 4. Check Return Details
    if (prevPath === "returns") {
      const ret = queryClient.getQueryData<any>(["return-details", path]);
      if (ret?.returnNumber) return ret.returnNumber;

      const returnsList = queryClient.getQueriesData({ queryKey: ["returns"] });
      for (const [, data] of returnsList) {
        const list = (data as any)?.data || (Array.isArray(data) ? data : []);
        const found = list.find((r: any) => r.id === path);
        if (found?.returnNumber) return found.returnNumber;
      }

      return "Return Details";
    }

    // Generic UUID fallback - never show raw UUID
    if (prevPath) {
      const cleanPrev = prevPath.replace(/s$/, "");
      return cleanPrev.charAt(0).toUpperCase() + cleanPrev.slice(1) + " Details";
    }
    return "Details";
  }

  // Known segment friendly names
  if (path === "catalog") return "Product Catalog";
  if (path === "receivings") return "Receiving History";
  if (path === "payment-methods") return "Payment Methods";
  if (path === "returns") return "Returns";
  if (path === "new") return "New";
  if (path === "movements") return "Movements";
  if (path === "stocktake") return "Stocktake";
  if (path === "daily-closing") return "Daily Closing";
  if (path === "notifications") return "Notifications";
  if (path === "audit-logs") return "Audit Log";
  if (path === "settings") return "Settings";

  return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
}

interface HeaderProps {
  user: { name?: string; role?: string };
  onOpenMobile?: () => void;
}

export function Header({ user, onOpenMobile }: HeaderProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: unreadData } = useUnreadCountQuery({ enabled: Boolean(user) });
  const unreadCount = (unreadData as any)?.unreadCount ?? (unreadData as any)?.data?.unreadCount ?? 0;

  // Robust breadcrumb generation supporting dynamic detail routes and query cache lookup
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter((p) => p);
    if (paths.length === 0) return <span className="text-primary font-semibold">Dashboard</span>;

    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-2">
        <Link to="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const targetUrl = "/" + paths.slice(0, index + 1).join("/");
          const label = getBreadcrumbLabel(path, index, paths, queryClient);

          return (
            <div key={targetUrl} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline-variant text-[16px]">
                chevron_right
              </span>
              {isLast ? (
                <span className="text-primary font-semibold truncate max-w-[120px] sm:max-w-xs" title={label}>
                  {label}
                </span>
              ) : (
                <Link to={targetUrl} className="hover:text-primary transition-colors truncate max-w-[80px] sm:max-w-[150px]">
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    );
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-surface-container-lowest border-b border-outline-variant px-4 sm:px-6 md:px-margin flex items-center justify-between shrink-0">
      {/* Breadcrumb Hierarchy */}
      <div className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant min-w-0 overflow-hidden mr-2">
        {onOpenMobile && (
          <button
            type="button"
            onClick={onOpenMobile}
            className="md:hidden p-1.5 -ml-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer shrink-0"
            title="Open navigation"
            aria-label="Open navigation"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}
        {generateBreadcrumbs()}
      </div>

      {/* Trailing Status, Branch and Notification Controls */}
      <div className="flex items-center gap-2 sm:gap-5 shrink-0">
        {/* Branch Selector / Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 bg-surface-container-low rounded border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">store</span>
          <span className="text-label-md font-label-md text-on-surface whitespace-nowrap">All Branches</span>
          <span className="hidden sm:inline text-[10px] text-on-surface-variant font-normal">({user?.role === 'OWNER' ? 'Owner view' : 'Employee view'})</span>
        </div>

        {/* Notification Bell Link */}
        <div className="pl-2 border-l border-outline-variant">
          <Link
            to="/notifications"
            className="relative p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            title="Notifications"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary text-on-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
