
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserInfo } from "@/hooks/useUserInfo";
import { fetchBeneficiariesByRegion, fetchAllocations, fetchFraudAlerts } from "@/services/disburserService";
import { ShieldCheck, AlertTriangle, Users, Package } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";

const Dashboard = () => {
  const { role } = useUserRole();
  const { user } = useUserInfo();
  const { toast } = useToast();
  const [beneficiaryCount, setBeneficiaryCount] = useState(0);
  const [allocationCount, setAllocationCount] = useState(0);
  const [fraudAlertCount, setFraudAlertCount] = useState(0);
  const [dailyAllocations, setDailyAllocations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch data based on role
        if (role === "admin") {
          // Admin sees global data
          const allocations = await fetchAllocations();
          const fraudAlerts = await fetchFraudAlerts();
          
          setAllocationCount(allocations.length);
          setFraudAlertCount(fraudAlerts.length);
          
          // Calculate total beneficiaries (unique)
          const uniqueBeneficiaries = new Set(allocations.map(a => a.beneficiary_id));
          setBeneficiaryCount(uniqueBeneficiaries.size);
          
          // Calculate daily allocations for the chart
          const last7Days = getDailyData(allocations);
          setDailyAllocations(last7Days);
          
        } else if (role === "disburser" && user?.region_id) {
          // Disburser sees region-specific data
          const beneficiaries = await fetchBeneficiariesByRegion(user.region_id);
          const allocations = await fetchAllocations();
          
          // Filter allocations by disburser
          const myAllocations = allocations.filter(a => a.disburser_id === user.id);
          
          setBeneficiaryCount(beneficiaries.length);
          setAllocationCount(myAllocations.length);
          
          // Calculate daily allocations for the chart
          const last7Days = getDailyData(myAllocations);
          setDailyAllocations(last7Days);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [role, user, toast]);
  
  // Helper function to calculate daily data for the last 7 days
  const getDailyData = (allocations: any[]) => {
    const days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = date.toISOString().split('T')[0];
      
      // Count allocations for this day
      const count = allocations.filter(a => {
        const allocDate = new Date(a.allocated_at).toISOString().split('T')[0];
        return allocDate === dateStr;
      }).length;
      
      days.push({ name: dayStr, allocations: count });
    }
    
    return days;
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <AnimatedIcons className="opacity-20" />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Registered Beneficiaries</CardTitle>
                <Users className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{beneficiaryCount}</div>
                <p className="text-xs text-muted-foreground">
                  {role === "admin" ? "Total unique beneficiaries" : "Beneficiaries in your region"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Aid Allocations</CardTitle>
                <Package className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allocationCount}</div>
                <p className="text-xs text-muted-foreground">
                  {role === "admin" ? "Total aid packages distributed" : "Aid packages you've distributed"}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {role === "admin" ? "Fraud Alerts" : "Security Status"}
                </CardTitle>
                {role === "admin" ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                )}
              </CardHeader>
              <CardContent>
                {role === "admin" ? (
                  <>
                    <div className="text-3xl font-bold">{fraudAlertCount}</div>
                    <p className="text-xs text-muted-foreground">
                      Attempted duplicate allocations detected
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold text-green-600">Protected</div>
                    <p className="text-xs text-muted-foreground">
                      Fraud prevention system active
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Aid allocation activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyAllocations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="allocations" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
