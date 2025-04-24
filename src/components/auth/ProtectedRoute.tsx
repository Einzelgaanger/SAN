
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Log authentication status when this component mounts or auth state changes
    console.log("ProtectedRoute mounted/updated, auth status:", { 
      isAuthenticated, 
      role, 
      path: location.pathname,
      localStorage: {
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        userRole: localStorage.getItem("userRole"),
        hasUserInfo: !!localStorage.getItem("userInfo")
      }
    });
    
    // Mark auth as checked after a short delay to ensure all state is properly loaded
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, role, location]);
  
  // Don't render until we've checked auth state
  if (!authChecked) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-secure-DEFAULT border-t-transparent rounded-full"></div>
    </div>;
  }

  console.log("ProtectedRoute check (after delay):", { isAuthenticated, role, path: location.pathname });

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // User is authenticated, render the child routes
  console.log("Authenticated, rendering outlet");
  return <Outlet />;
};

export default ProtectedRoute;
