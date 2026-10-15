import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Login } from "../../features/auth/components/Login";
import { AppShell } from "../layout/AppShell";
import { Employees } from "../../features/users/components/Employees";
import { UsersBranchesLayout } from "../../features/users/components/UsersBranchesLayout";
import { Branches } from "../../features/branches/components/Branches";
import { Catalog } from "../../features/categories/components/Catalog";
import { Suppliers } from "../../features/suppliers/components/Suppliers";
import { PaymentMethods } from "../../features/payment-methods/components/PaymentMethods";
import { NewReceivingPage } from "../../features/receivings/components/NewReceivingPage";
import { ReceivingsPage } from "../../features/receivings/components/ReceivingsPage";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../features/auth/api/auth";
import { CurrentInventoryPage } from "../../features/inventory/components/CurrentInventoryPage";
import { MovementsPage } from "../../features/inventory/components/MovementsPage";
import { StocktakePage } from "../../features/inventory/components/StocktakePage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { NewSalePage } from "../../features/sales/NewSalePage";
import { SalesHistoryPage } from "../../features/sales/SalesHistoryPage";
import { SaleDetailsPage } from "../../features/sales/SaleDetailsPage";
import { ReturnsHistoryPage } from "../../features/returns/ReturnsHistoryPage";
import { NewReturnPage } from "../../features/returns/NewReturnPage";
import { ReturnDetailsPage } from "../../features/returns/ReturnDetailsPage";
import { TransfersListPage } from "../../features/transfers/TransfersListPage";
import { NewTransferPage } from "../../features/transfers/NewTransferPage";
import { TransferDetailsPage } from "../../features/transfers/TransferDetailsPage";
import { CurrentClosingPage } from "../../features/closing/CurrentClosingPage";
import { ClosingHistoryPage } from "../../features/closing/ClosingHistoryPage";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { ReportsPage } from "../../features/reports/components/ReportsPage";
import { NotificationsPage } from "../../features/notifications/NotificationsPage";
import { AuditLogPage } from "../../features/audit/AuditLogPage";
import { SettingsPage } from "../../features/settings/SettingsPage";


function ProtectedRoute() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false
  });

  if (isLoading) return <div>Loading...</div>;
  
  if (!data?.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false
  });

  if (isLoading) return <div>Loading...</div>;
  
  if (data?.user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export const routes = [
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      }
    ]
  },
  {
    element: <ProtectedRoute />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />
          },
          {
            path: "reports",
            element: <ReportsPage />
          },
          {
            path: "reports/sales",
            element: <ReportsPage />
          },
          {
            path: "users",
            element: <UsersBranchesLayout />,
            children: [
              { index: true, element: <Navigate to="employees" replace /> },
              { path: "employees", element: <Employees /> },
              { path: "branches", element: <Branches /> }
            ]
          },
          {
            path: "catalog",
            element: <Catalog />
          },
          {
            path: "suppliers",
            element: <Suppliers />
          },
          {
            path: "payment-methods",
            element: <PaymentMethods />
          },
          {
            path: "inventory",
            element: <CurrentInventoryPage />
          },
          {
            path: "inventory/movements",
            element: <MovementsPage />
          },
          {
            path: "inventory/stocktake",
            element: <StocktakePage />
          },
          {
            path: "receivings/new",
            element: <NewReceivingPage />
          },
          {
            path: "receivings",
            element: <ReceivingsPage />
          },
          {
            path: "sales/new",
            element: <NewSalePage />
          },
          {
            path: "sales/returns/new",
            element: <NewReturnPage />
          },
          {
            path: "sales/returns",
            element: <ReturnsHistoryPage />
          },
          {
            path: "sales/returns/:id",
            element: <ReturnDetailsPage />
          },
          {
            path: "sales",
            element: <SalesHistoryPage />
          },
          {
            path: "sales/:id",
            element: <SaleDetailsPage />
          },
          {
            path: "transfers/new",
            element: <NewTransferPage />
          },
          {
            path: "transfers",
            element: <TransfersListPage />
          },
          {
            path: "transfers/:id",
            element: <TransferDetailsPage />
          },
          {
            path: "daily-closing",
            element: <CurrentClosingPage />
          },
          {
            path: "daily-closing/history",
            element: <ClosingHistoryPage />
          },
          {
            path: "notifications",
            element: <NotificationsPage />
          },
          {
            path: "audit-logs",
            element: <AuditLogPage />
          },
          {
            path: "settings",
            element: <SettingsPage />
          }
        ]

      }
    ]
  },

  {
    path: "*",
    element: <NotFoundPage />
  }
];

export const router = createBrowserRouter(routes);
