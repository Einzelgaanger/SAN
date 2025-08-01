import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  ChevronLeft, 
  BarChart3, 
  Users, 
  Package, 
  UserPlus,
  UserCheck,
  Box,
  AlertCircle,
  Shield,
  LogOut,
  LayoutDashboard,
  UserCog,
  ClipboardList,
  Boxes,
  BellRing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { role } = useUserRole();

  const isAdmin = role === "admin";
  const isDisburser = role === "disburser";

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const getPageTitle = () => {
    if (location.pathname.startsWith("/admin/alerts")) return "Fraud Alerts";
    if (location.pathname.startsWith("/admin/dashboard")) return "Dashboard";
    if (location.pathname.startsWith("/disburser/register")) return "Register Beneficiary";
    if (location.pathname.startsWith("/disburser/allocate")) return "Allocate Resources";
    
    return "Secure Aid Network";
  };

  const menuItems = isAdmin
    ? [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          description: "Overview of all activities"
        },
        {
          label: "Alerts",
          href: "/admin/alerts",
          icon: BellRing,
          description: "View fraud alerts"
        }
      ]
    : [
        { icon: <UserPlus className="h-6 w-6" />, label: "Register", path: "/disburser/register" },
        { icon: <Package className="h-6 w-6" />, label: "Allocate", path: "/disburser/allocate" },
      ];

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-4 h-14">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <h1 className="text-base sm:text-lg font-semibold truncate max-w-[180px] sm:max-w-xs text-green-700">
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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

      {/* Mobile Menu Panel - Only Logout Button */}
      <div
        className={cn(
          "fixed top-14 right-0 z-40 w-64 h-auto bg-white transform transition-transform duration-200 ease-in-out shadow-lg",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-3">
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

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                location.pathname === item.path
                  ? "text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
