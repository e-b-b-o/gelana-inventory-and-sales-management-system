import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Login } from "../../features/auth/components/Login";
import { AppShell } from "../layout/AppShell";
import { Employees } from "../../features/users/components/Employees";
import { Branches } from "../../features/branches/components/Branches";
import { Catalog } from "../../features/categories/components/Catalog";
import { Suppliers } from "../../features/suppliers/components/Suppliers";
import { PaymentMethods } from "../../features/payment-methods/components/PaymentMethods";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../features/auth/api/auth";
import { CurrentInventoryPage } from "../../features/inventory/components/CurrentInventoryPage";
import { MovementsPage } from "../../features/inventory/components/MovementsPage";
import { StocktakePage } from "../../features/inventory/components/StocktakePage";

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

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <div><h1>Dashboard</h1><p>Welcome to Gelana Phase 1 Shell</p></div>
          },
          {
            path: "employees",
            element: <Employees />
          },
          {
            path: "branches",
            element: <Branches />
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
          }
        ]
      }
    ]
  }
]);
