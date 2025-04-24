import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronLeft, Home, Users, Package, AlertTriangle, LogOut, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";

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

  const isAdmin = user?.role === "admin";
  const isDisburser = user?.role === "disburser";

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
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center space-x-3">
            {location.pathname !== "/" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-0 h-10 w-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <h1 className="text-lg font-semibold">
              {navItems.find(item => item.href === location.pathname)?.label || "Secure Aid Network"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAdmin && location.pathname === "/admin/disbursers" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/admin/disbursers/add")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Disburser
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-0 h-10 w-10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed top-14 right-0 z-40 w-64 h-[calc(100vh-3.5rem)] bg-white transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 py-4">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex items-center w-full px-4 py-3 text-left text-sm",
                  "hover:bg-gray-100 transition-colors",
                  location.pathname === item.href && "bg-blue-50 text-blue-600"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="flex items-center w-full text-red-600 hover:text-red-700 hover:bg-red-50"
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
