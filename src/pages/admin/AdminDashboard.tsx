import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Package, AlertTriangle, BarChart3, Activity, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardStats {
  beneficiaries: {
    total: number;
    change: number;
  };
  allocations: {
    total: number;
    change: number;
  };
  alerts: {
    total: number;
    change: number;
  };
  recentActivity: {
    type: string;
    description: string;
    time: string;
  }[];
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    beneficiaries: { total: 0, change: 0 },
    allocations: { total: 0, change: 0 },
    alerts: { total: 0, change: 0 },
    recentActivity: []
  });
  const { isMobile } = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          beneficiaries: { total: 150, change: 12 },
          allocations: { total: 75, change: -5 },
          alerts: { total: 3, change: 1 },
          recentActivity: [
            { type: "allocation", description: "New allocation created for Region A", time: "2 minutes ago" },
            { type: "beneficiary", description: "New beneficiary registered in Region B", time: "15 minutes ago" },
            { type: "alert", description: "Fraud alert detected in Region C", time: "1 hour ago" },
            { type: "allocation", description: "Allocation completed for Region D", time: "2 hours ago" }
          ]
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-green-100 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2.5"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your secure aid management system</p>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Last updated: Just now</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Beneficiaries Card */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Total Beneficiaries
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.beneficiaries.total}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                {stats.beneficiaries.change > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stats.beneficiaries.change > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(stats.beneficiaries.change)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Allocations Card */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Total Allocations
              </CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.allocations.total}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                {stats.allocations.change > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stats.allocations.change > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(stats.allocations.change)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Card */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Fraud Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.alerts.total}</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                {stats.alerts.change > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-red-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                )}
                <span className={stats.alerts.change > 0 ? "text-red-500" : "text-green-500"}>
                  {Math.abs(stats.alerts.change)}% from last month
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Allocations Chart */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">
                Allocations Overview
              </CardTitle>
              <CardDescription>Distribution of allocations across regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Allocations chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-gray-900">
                Recent Activity
              </CardTitle>
              <CardDescription>Latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1">
                      {activity.type === "allocation" && <Package className="h-4 w-4 text-blue-500" />}
                      {activity.type === "beneficiary" && <Users className="h-4 w-4 text-green-500" />}
                      {activity.type === "alert" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 