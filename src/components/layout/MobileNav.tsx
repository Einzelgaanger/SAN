import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronLeft, Home, Users, Package, AlertTriangle, LogOut, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUserRole } from "@/hooks/useUserRole";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUserInfo();
  const { role } = useUserRole();

  const isAdmin = role === "admin";
  const isDisburser = role === "disburser";

  const adminNavItems: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: <Home className="h-5 w-5" /> },
    { label: "Manage Disbursers", href: "/admin/disbursers", icon: <UserPlus className="h-5 w-5" /> },
    { label: "Beneficiaries", href: "/admin/beneficiaries", icon: <Users className="h-5 w-5" /> },
    { label: "Resource Allocation", href: "/admin/allocations", icon: <Package className="h-5 w-5" /> },
    { label: "Fraud Alerts", href: "/admin/fraud-alerts", icon: <AlertTriangle className="h-5 w-5" /> },
  ];

  const disburserNavItems: NavItem[] = [
    { label: "Dashboard", href: "/disburser", icon: <Home className="h-5 w-5" /> },
    { label: "Allocate Resources", href: "/disburser/allocate", icon: <Package className="h-5 w-5" /> },
    { label: "Register Beneficiary", href: "/disburser/register", icon: <UserPlus className="h-5 w-5" /> },
  ];

  const navItems = isAdmin ? adminNavItems : isDisburser ? disburserNavItems : [];

  const handleBack = () => {
    navigate(-1);
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsOpen(false);
  };

  const handleLogout = () => {
    // Implement logout logic here
    navigate("/login");
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-4 h-14">
          <div className="flex items-center space-x-2">
            {location.pathname !== "/" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-0 h-10 w-10 text-gray-700 hover:bg-gray-100"
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            )}
            <h1 className="text-base sm:text-lg font-semibold truncate max-w-[200px] sm:max-w-xs">
              {navItems.find(item => item.href === location.pathname)?.label || "Secure Aid Network"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAdmin && location.pathname === "/admin/disbursers" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/admin/disbursers/add")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm py-1.5 px-2 sm:px-3 h-auto"
              >
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Add Disburser
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-0 h-9 w-9 sm:h-10 sm:w-10 text-gray-700 hover:bg-gray-100"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity backdrop-blur-sm",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed top-14 right-0 z-40 w-64 h-[calc(100vh-3.5rem)] bg-white transform transition-transform duration-200 ease-in-out overflow-y-auto shadow-lg",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 py-2">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex items-center w-full px-4 py-3.5 text-left text-sm",
                  "hover:bg-gray-100 transition-colors active:bg-gray-200",
                  location.pathname === item.href && "bg-blue-50 text-blue-600"
                )}
              >
                <div className="flex-shrink-0 w-6">
                  {item.icon}
                </div>
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <Button
              variant="ghost"
              className="flex items-center w-full py-3 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 font-medium"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
