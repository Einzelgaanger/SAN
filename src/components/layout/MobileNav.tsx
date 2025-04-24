import React, { useState } from "react";
import { useRouter } from "next/router";
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
  const router = useRouter();
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
    router.back();
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const handleLogout = () => {
    // Implement logout logic here
    router.push("/login");
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-3">
            {router.pathname !== "/" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-0 h-12 w-12 hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            <h1 className="text-lg font-semibold truncate max-w-[200px]">
              {navItems.find(item => item.href === router.pathname)?.label || "Secure Aid Network"}
            </h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-0 h-12 w-12 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed top-16 right-0 z-40 w-72 h-[calc(100vh-4rem)] bg-white transform transition-all duration-300 ease-out shadow-xl",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 py-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex items-center w-full px-4 py-4 text-left text-sm",
                  "hover:bg-gray-50 active:bg-gray-100 transition-colors",
                  "border-l-4",
                  router.pathname === item.href 
                    ? "border-blue-600 bg-blue-50 text-blue-600" 
                    : "border-transparent"
                )}
              >
                <span className="flex items-center">
                  {item.icon}
                  <span className="ml-3 font-medium">{item.label}</span>
                </span>
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="flex items-center w-full py-4 text-red-600 hover:text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
