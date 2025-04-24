
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { isAuthenticated, role } = useAuth();
  
  console.log("Index page: Auth status:", isAuthenticated, "Role:", role);
  
  // If user is authenticated, redirect to appropriate dashboard
  if (isAuthenticated) {
    if (role === "admin") {
      return <Navigate to="/admin/disbursers" replace />;
    } else if (role === "disburser") {
      return <Navigate to="/disburser/register" replace />;
    }
    
    // If role is not recognized but authenticated, go to dashboard
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise, redirect to login
  return <Navigate to="/" replace />;
};

export default Index;
