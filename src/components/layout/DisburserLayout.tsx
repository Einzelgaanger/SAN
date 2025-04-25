import React from "react";
import { Outlet } from "react-router-dom";
import { DisburserSidebar } from "./DisburserSidebar";
import { MobileNav } from "./MobileNav";

export function DisburserLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <div className="hidden md:flex">
        <DisburserSidebar />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="md:hidden">
          <MobileNav />
        </div>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 