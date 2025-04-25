import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Package, Activity } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";

const DisburserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    beneficiaries: 0,
    allocations: 0,
    securityStatus: "Secure",
  });

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        // Simulate API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          beneficiaries: 45,
          allocations: 12,
          securityStatus: "Secure",
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Disburser Dashboard</h1>
            <p className="text-sm text-indigo-200 mt-1">Regional Overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/10 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-200">
                My Beneficiaries
              </CardTitle>
              <Users className="h-4 w-4 text-indigo-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.beneficiaries}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-200">
                My Allocations
              </CardTitle>
              <Package className="h-4 w-4 text-indigo-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.allocations}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-200">
                Security Status
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-indigo-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.securityStatus}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-indigo-200">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {/* Activity chart would go here */}
              <div className="flex items-center justify-center h-full text-indigo-200">
                Activity chart placeholder
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisburserDashboard; 