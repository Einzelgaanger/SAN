
import React from "react";
import { Link } from "react-router-dom";
import { Shield, UserPlus, Package, BarChart3, Users, UserCheck, AlertTriangle } from "lucide-react";

interface MobileNavProps {
  role: string | null;
}

export function MobileNav({ role }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50 shadow-lg">
      {role === "admin" ? (
        <>
          <Link to="/dashboard" className="flex flex-col items-center p-2 text-xs text-secure-DEFAULT hover:text-secure-accent transition-colors">
            <BarChart3 size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/disbursers" className="flex flex-col items-center p-2 text-xs text-secure-DEFAULT hover:text-secure-accent transition-colors">
            <Users size={20} />
            <span>Disbursers</span>
          </Link>
          <Link to="/admin/beneficiaries" className="flex flex-col items-center p-2 text-xs text-secure-DEFAULT hover:text-secure-accent transition-colors">
            <UserCheck size={20} />
            <span>Beneficiaries</span>
          </Link>
          <Link to="/admin/alerts" className="flex flex-col items-center p-2 text-xs text-secure-DEFAULT hover:text-secure-accent transition-colors">
            <AlertTriangle size={20} />
            <span>Alerts</span>
          </Link>
        </>
      ) : (
        <>
          <Link to="/disburser/register" className="flex flex-col items-center p-2 text-xs text-secure-DEFAULT hover:text-secure-accent transition-colors">
            <UserPlus size={20} />
            <span>Register</span>
          </Link>
          <Link to="/disburser/allocate" className="flex flex-col items-center p-2 text-xs text-secure-DEFAULT hover:text-secure-accent transition-colors">
            <Package size={20} />
            <span>Allocate</span>
          </Link>
        </>
      )}
    </div>
  );
}
