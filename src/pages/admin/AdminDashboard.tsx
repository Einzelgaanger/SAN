import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchAllocations,
  fetchBeneficiariesByRegion,
  fetchFraudAlerts
} from "@/services/disburserService";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Package, 
  AlertTriangle, 
  BarChart3, 
  MapPin, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'] & {
  regions?: { name: string } | null;
};

type Allocation = Database['public']['Tables']['allocations']['Row'] & {
  beneficiaries?: { name: string; regions?: { name: string } | null } | null;
  goods_types?: { name: string } | null;
  disbursers?: { name: string } | null;
};

type FraudAlert = Database['public']['Tables']['fraud_alerts']['Row'] & {
  beneficiaries?: { name: string; regions?: { name: string } | null } | null;
};

interface DashboardStats {
  beneficiaries: {
    total: number;
    byRegion: Record<string, number>;
  };
  allocations: {
    total: number;
    byGoods: Record<string, number>;
    byRegion: Record<string, number>;
    byTime: Record<string, number>;
  };
  alerts: {
    total: number;
    recent: number;
  };
}

const AdminDashboard = () => {
  const { isMobile } = useIsMobile();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

  // Fetch all required data
  const { data: allocations = [], isLoading: isLoadingAllocations } = useQuery({
    queryKey: ['allocations'],
    queryFn: async () => {
      const data = await fetchAllocations();
      return data as unknown as Allocation[];
    }
  });

  const { data: beneficiaries = [], isLoading: isLoadingBeneficiaries } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*");
      
      if (error) {
        console.error("Error fetching beneficiaries:", error);
        throw new Error(error.message);
      }
      
      return data as unknown as Beneficiary[];
    }
  });

  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const data = await fetchFraudAlerts();
      return data as unknown as FraudAlert[];
    }
  });

  const isLoading = isLoadingAllocations || isLoadingBeneficiaries || isLoadingAlerts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Process data into statistics
  const stats: DashboardStats = {
    beneficiaries: {
      total: beneficiaries.length,
      byRegion: beneficiaries.reduce((acc, b) => {
        const region = b.regions?.name || 'unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    allocations: {
      total: allocations.length,
      byGoods: allocations.reduce((acc, a) => {
        const goods = a.goods_types?.name || 'unknown';
        acc[goods] = (acc[goods] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byRegion: allocations.reduce((acc, a) => {
        const region = a.beneficiaries?.regions?.name || 'unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byTime: allocations.reduce((acc, a) => {
        const date = new Date(a.allocated_at);
        const key = date.toISOString().split('T')[0];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    alerts: {
      total: alerts.length,
      recent: alerts.filter(a => {
        const alertDate = new Date(a.attempted_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return alertDate >= weekAgo;
      }).length
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Real-time analytics and monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as "day" | "week" | "month")}
              className="rounded-md border-gray-300 text-sm w-full sm:w-auto"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Beneficiaries Card */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Beneficiaries</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.beneficiaries.total}</div>
              <div className="text-xs text-gray-500 mt-1">
                Across {Object.keys(stats.beneficiaries.byRegion).length} regions
              </div>
            </CardContent>
          </Card>

          {/* Allocations Card */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.allocations.total}</div>
              <div className="text-xs text-gray-500 mt-1">
                {Object.keys(stats.allocations.byGoods).length} different items distributed
              </div>
            </CardContent>
          </Card>

          {/* Fraud Alerts Card */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.alerts.total}</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.alerts.recent} new alerts this week
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;