
import { useState, useEffect } from "react";

type UserRole = "admin" | "disburser" | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem("userRole");
    return (savedRole === "admin" || savedRole === "disburser") ? savedRole : null;
  });

  const updateRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole) {
      localStorage.setItem("userRole", newRole);
    } else {
      localStorage.removeItem("userRole");
    }
  };

  return { role, updateRole };
}
