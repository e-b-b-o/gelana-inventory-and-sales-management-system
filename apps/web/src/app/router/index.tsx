import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { Login } from "../../features/auth/components/Login";
import { AppShell } from "../layout/AppShell";
import { Employees } from "../../features/users/components/Employees";
import { Branches } from "../../features/branches/components/Branches";
import { Catalog } from "../../features/categories/components/Catalog";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../features/auth/api/auth";

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
          }
        ]
      }
    ]
  }
]);
