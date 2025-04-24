
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar";
import {
  UserPlus,
  Package,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useAuth } from "@/hooks/useAuth";

export function DisburserSidebar() {
  const location = useLocation();
  const { user } = useUserInfo();
  const { logout } = useAuth();
  
  const menuItems = [
    {
      title: "Register Beneficiary",
      url: "/disburser/register",
      icon: UserPlus,
    },
    {
      title: "Allocate Resources",
      url: "/disburser/allocate",
      icon: Package,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarTrigger className="h-16 border-b flex items-center justify-center" />
        
        {user && (
          <div className="px-4 py-4 border-b">
            <p className="font-medium text-sm">Welcome,</p>
            <p className="font-bold text-secure-DEFAULT">{user.name}</p>
            <p className="text-xs text-gray-500">{user.region}</p>
          </div>
        )}
        
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3",
                        location.pathname === item.url ? "text-secure-DEFAULT font-medium" : ""
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left text-red-600"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
