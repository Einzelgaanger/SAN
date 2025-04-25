import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log("ProtectedRoute mounted/updated:", { 
      isAuthenticated, 
      role, 
      path: location.pathname,
      localStorage: {
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        userRole: localStorage.getItem("userRole"),
        hasUserInfo: !!localStorage.getItem("userInfo")
      }
    });
    
    // Mark auth as checked immediately if we have the required data
    if (isAuthenticated !== undefined && role !== undefined) {
      setAuthChecked(true);
    } else {
      // Fallback timer in case data is delayed
      const timer = setTimeout(() => {
        setAuthChecked(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, role, location]);
  
  // Don't render until we've checked auth state
  if (!authChecked) {
    console.log("Auth check pending...");
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-secure-DEFAULT border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check if user is accessing the correct role-based route
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isDisburserRoute = location.pathname.startsWith("/disburser");

  if (isAdminRoute && role !== "admin") {
    console.log("Non-admin attempting to access admin route, redirecting");
    return <Navigate to="/disburser/register" replace />;
  }

  if (isDisburserRoute && role !== "disburser") {
    console.log("Non-disburser attempting to access disburser route, redirecting");
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log("Access granted, rendering protected route");
  return <Outlet />;
};

export default ProtectedRoute;
