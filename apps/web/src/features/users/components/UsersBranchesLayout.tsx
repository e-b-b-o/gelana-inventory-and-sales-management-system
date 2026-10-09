import { Outlet, Link, useLocation } from "react-router-dom";

export function UsersBranchesLayout() {
  const location = useLocation();

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-space-lg">
        <div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Users & Branches</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-1">
            Manage staff accounts, branch records, and branch assignments.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant mb-space-md">
        <div className="flex items-center gap-6">
          <Link
            to="/users/employees"
            className={`pb-3 border-b-2 font-label-md text-label-md transition-colors ${
              location.pathname.includes('/users/employees')
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Employees
          </Link>
          <Link
            to="/users/branches"
            className={`pb-3 border-b-2 font-label-md text-label-md transition-colors ${
              location.pathname.includes('/users/branches')
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Branches
          </Link>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <Outlet />
      </div>
    </>
  );
}
