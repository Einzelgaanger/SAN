import React from "react";
import { MobileNav } from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNav />
      
      {/* Main Content Area */}
      <main className="pt-14 min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}; 