
import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DisburserSidebar } from "@/components/layout/DisburserSidebar";
import { useUserRole } from "@/hooks/useUserRole";
import { Shield } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserInfo } from "@/hooks/useUserInfo";
import { MobileNav } from "./MobileNav";

export function AppLayout() {
  const { role } = useUserRole();
  const { isMobile } = useIsMobile();
  const { user } = useUserInfo();
  
  // Get first letter of user's name for avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <SidebarProvider>
      <AnimatedIcons />
      <div className="min-h-screen flex w-full overflow-hidden bg-white">
        {!isMobile && (role === "admin" ? <AdminSidebar /> : <DisburserSidebar />)}
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-4 bg-white shadow-sm z-10">
            <h1 className="text-xl font-bold flex items-center gap-2 text-green-700">
              <Shield size={24} className="text-green-600" />
              <span className="text-green-700">
                SecureAid Network
              </span>
            </h1>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8 bg-blue-600 text-white">
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </div>
          </header>
          
          <main className="flex-1 p-3 sm:p-6 bg-gray-50 overflow-auto fade-in pb-20">
            <Outlet />
          </main>
          
          {isMobile && <MobileNav role={role} />}
        </div>
      </div>
    </SidebarProvider>
  );
}
