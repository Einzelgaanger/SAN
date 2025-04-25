import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardStats {
  beneficiaries: number;
  allocations: number;
  alerts: number;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    beneficiaries: 0,
    allocations: 0,
    alerts: 0
  });
  const { isMobile } = useIsMobile();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          beneficiaries: 150,
          allocations: 75,
          alerts: 3
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
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Beneficiaries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.beneficiaries}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.allocations}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.alerts}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 