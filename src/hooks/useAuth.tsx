
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUserRole } from "./useUserRole";
import { useUserInfo, UserInfo } from "./useUserInfo";

interface AuthContextType {
  isAuthenticated: boolean;
  role: "admin" | "disburser" | null;
  userInfo: UserInfo | null;
  login: (role: "admin" | "disburser", user: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  
  const { role, updateRole } = useUserRole();
  const { user, updateUser } = useUserInfo();

  useEffect(() => {
    console.log("Auth Provider state:", { isAuthenticated, role, user });
  }, [isAuthenticated, role, user]);

  const login = (newRole: "admin" | "disburser", userInfo: UserInfo) => {
    console.log("Login called with:", { newRole, userInfo });
    
    // Set auth state in specific order to prevent race conditions
    localStorage.setItem("isLoggedIn", "true");
    updateRole(newRole);
    updateUser(userInfo);
    setIsAuthenticated(true);
    
    console.log("Login completed, auth state updated");
  };

  const logout = () => {
    console.log("Logout called");
    
    // Clear storage first
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userInfo");
    
    // Then update state
    setIsAuthenticated(false);
    updateRole(null);
    updateUser(null);
    
    window.location.href = "/";
  };

  const value = {
    isAuthenticated,
    role,
    userInfo: user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
