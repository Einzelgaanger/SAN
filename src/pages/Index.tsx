import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { isAuthenticated, role } = useAuth();
  
  console.log("Index page: Auth status:", isAuthenticated, "Role:", role);
  
  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === "disburser") {
      return <Navigate to="/disburser/register" replace />;
    }
  }
  
  // Otherwise, redirect to login
  return <Navigate to="/" replace />;
};

export default Index;
