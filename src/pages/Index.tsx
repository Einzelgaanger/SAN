import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { isAuthenticated, role } = useAuth();

  console.log("Index component state:", { isAuthenticated, role });

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }

  if (role === "admin") {
    console.log("Admin role detected, redirecting to admin dashboard");
    return <Navigate to="/admin/dashboard" replace />;
  }

  console.log("Disburser role detected, redirecting to register page");
  return <Navigate to="/disburser/register" replace />;
}
