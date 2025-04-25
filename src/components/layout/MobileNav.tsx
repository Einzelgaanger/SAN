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
  LogOut
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
    if (location.pathname.startsWith("/admin/disbursers")) return "Manage Disbursers";
    if (location.pathname.startsWith("/admin/beneficiaries")) return "Beneficiaries";
    if (location.pathname.startsWith("/admin/allocations")) return "Resource Allocation";
    if (location.pathname.startsWith("/admin/goods")) return "Goods Management";
    if (location.pathname.startsWith("/admin/alerts")) return "Fraud Alerts";
    if (location.pathname.startsWith("/disburser/register")) return "Register Beneficiary";
    if (location.pathname.startsWith("/disburser/allocate")) return "Allocate Resources";
    if (location.pathname === "/dashboard") return "Dashboard";
    
    return "Secure Aid Network";
  };

  const menuItems = isAdmin
    ? [
        { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
        { title: "Disbursers", url: "/admin/disbursers", icon: Users },
        { title: "Beneficiaries", url: "/admin/beneficiaries", icon: UserCheck },
        { title: "Allocations", url: "/admin/allocations", icon: Package },
        { title: "Goods", url: "/admin/goods", icon: Box },
        { title: "Alerts", url: "/admin/alerts", icon: AlertCircle },
      ]
    : [
        { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
        { title: "Register", url: "/disburser/register", icon: UserPlus },
        { title: "Allocate", url: "/disburser/allocate", icon: Package },
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-5 gap-1 p-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center p-2",
                location.pathname === item.url
                  ? "text-green-600"
                  : "text-gray-600"
              )}
            >
              <item.icon size={24} />
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};
