import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  ChevronLeft, 
  Home, 
  Users, 
  Package, 
  AlertTriangle, 
  LogOut, 
  UserPlus,
  BarChart3,
  Shield,
  AlertCircle,
  Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { role } = useUserRole();

  const isAdmin = role === "admin";
  const isDisburser = role === "disburser";

  const adminNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Manage Disbursers", href: "/admin/disbursers", icon: <Users className="h-5 w-5" /> },
    { label: "Beneficiaries", href: "/admin/beneficiaries", icon: <Users className="h-5 w-5" /> },
    { label: "Allocations", href: "/admin/allocations", icon: <Package className="h-5 w-5" /> },
    { label: "Goods", href: "/admin/goods", icon: <Box className="h-5 w-5" /> },
    { label: "Fraud Alerts", href: "/admin/alerts", icon: <AlertCircle className="h-5 w-5" /> },
  ];

  const disburserNavItems: NavItem[] = [
    { label: "Register Beneficiary", href: "/disburser/register", icon: <Users className="h-5 w-5" /> },
    { label: "Allocate Resources", href: "/disburser/allocate", icon: <Package className="h-5 w-5" /> },
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
    logout();
    setIsOpen(false);
  };

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.href === location.pathname);
    if (currentItem) return currentItem.label;
    
    // Check for derived paths
    if (location.pathname.startsWith("/admin/disbursers")) return "Manage Disbursers";
    if (location.pathname.startsWith("/admin/beneficiaries")) return "Beneficiaries";
    if (location.pathname.startsWith("/admin/allocations")) return "Resource Allocation";
    if (location.pathname.startsWith("/admin/goods")) return "Goods Management";
    if (location.pathname.startsWith("/admin/alerts")) return "Fraud Alerts";
    if (location.pathname.startsWith("/disburser/register")) return "Register Beneficiary";
    if (location.pathname.startsWith("/disburser/allocate")) return "Allocate Resources";
    
    return "Secure Aid Network";
  };

  const menuItems = isAdmin
    ? [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Disbursers", url: "/admin/disbursers", icon: Users },
        { title: "Beneficiaries", url: "/admin/beneficiaries", icon: Users },
        { title: "Allocations", url: "/admin/allocations", icon: Package },
        { title: "Goods", url: "/admin/goods", icon: Box },
        { title: "Alerts", url: "/admin/alerts", icon: AlertCircle },
      ]
    : [
        { title: "Dashboard", url: "/", icon: Home },
        { title: "Register", url: "/disburser/register", icon: Users },
        { title: "Allocate", url: "/disburser/allocate", icon: Package },
      ];

  return (
    <>
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-4 h-14">
          <div className="flex items-center space-x-2">
            {location.pathname !== "/" && location.pathname !== "/dashboard" && (
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
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-2" />
              <h1 className="text-base sm:text-lg font-semibold truncate max-w-[180px] sm:max-w-xs text-green-700">
                {getPageTitle()}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAdmin && location.pathname === "/admin/disbursers" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/admin/disbursers/add")}
                className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-1.5 px-2 sm:px-3 h-auto"
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
          {/* User info for mobile */}
          {user && (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="font-medium text-sm text-gray-600">Welcome,</p>
              <p className="font-bold text-green-700">{user.name}</p>
              {user.region && <p className="text-xs text-gray-500">{user.region}</p>}
            </div>
          )}
          
          <div className="flex-1 py-2">
            {isAdmin && (
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Menu</p>
              </div>
            )}
            
            {isDisburser && (
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Disburser Actions</p>
              </div>
            )}
            
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "flex items-center w-full px-4 py-3 text-left text-sm",
                  "hover:bg-gray-100 transition-colors active:bg-gray-200",
                  location.pathname === item.href ? "bg-green-50 text-green-700 font-medium" : "text-gray-700"
                )}
              >
                <div className="flex-shrink-0 w-6">
                  {item.icon}
                </div>
                <span className="ml-3">{item.label}</span>
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

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-5 gap-1 p-1">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center p-2 text-xs",
                location.pathname === item.url
                  ? "text-blue-600"
                  : "text-gray-600"
              )}
            >
              <item.icon size={18} />
              <span className="mt-1 text-center">{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};
