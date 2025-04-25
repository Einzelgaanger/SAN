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
  Home,
  UserPlus,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function DisburserSidebar() {
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
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

  return (
    <Sidebar className="border-r bg-white">
      <SidebarContent>
        <SidebarTrigger className="h-16 border-b flex items-center justify-center border-blue-200" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-700">Disburser Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3",
                        location.pathname === item.url ? "text-blue-600 font-medium" : "text-gray-700"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
