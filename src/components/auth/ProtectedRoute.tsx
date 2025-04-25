import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only check auth if we haven't already
    if (!authChecked) {
      // Mark auth as checked immediately
      setAuthChecked(true);
    }
  }, [authChecked]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user is accessing the correct role-based route
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isDisburserRoute = location.pathname.startsWith("/disburser");

  if (isAdminRoute && role !== "admin") {
    return <Navigate to="/disburser/register" replace />;
  }

  if (isDisburserRoute && role !== "disburser") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
