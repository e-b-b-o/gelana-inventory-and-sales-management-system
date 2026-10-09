import { useLocation, Link } from "react-router-dom";

interface HeaderProps {
  user: { name?: string; role?: string };
}

export function Header({ user }: HeaderProps) {
  const location = useLocation();

  // Basic breadcrumb generation for demonstration
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length === 0) return <span className="text-primary font-semibold">Dashboard</span>;
    
    return (
      <>
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        {paths.map((path, index) => {
          const isLast = index === paths.length - 1;
          const formattedPath = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
          return (
            <div key={path} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline-variant text-[16px]">chevron_right</span>
              {isLast ? (
                <span className="text-primary font-semibold">{formattedPath}</span>
              ) : (
                <span className="">{formattedPath}</span>
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-surface-container-lowest border-b border-outline-variant px-margin flex items-center justify-between shrink-0">
      {/* Breadcrumb Hierarchy */}
      <div className="flex items-center gap-2 text-body-sm font-body-sm text-on-surface-variant capitalize">
        {generateBreadcrumbs()}
      </div>

      {/* Trailing Status, Branch and Notification Controls */}
      <div className="flex items-center gap-5">
        {/* Branch Selector / Indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded border border-outline-variant">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">store</span>
          <span className="text-label-md font-label-md text-on-surface">All Branches</span>
          <span className="text-[10px] text-on-surface-variant font-normal">({user?.role === 'OWNER' ? 'Owner view' : 'Employee view'})</span>
        </div>

        {/* Notification Bell Icon Button */}
        <div className="pl-2 border-l border-outline-variant">
          <button className="relative p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded transition-colors" title="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
