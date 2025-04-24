import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserInfo } from "@/hooks/useUserInfo";
import { fetchBeneficiariesByRegion, fetchAllocations, fetchFraudAlerts } from "@/services/disburserService";
import { ShieldCheck, AlertTriangle, Users, Package, TrendingUp, Activity } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-indigo-200 mt-1">
              {role === "admin" ? "Global Overview" : "Regional Overview"}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-indigo-200">
            <Activity className="h-5 w-5" />
            <span className="text-sm">Real-time Data</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-white/10 backdrop-blur-sm border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium text-white">Registered Beneficiaries</CardTitle>
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{beneficiaryCount}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-indigo-300" />
                    <p className="text-sm text-indigo-200">
                      {role === "admin" ? "Total unique beneficiaries" : "Beneficiaries in your region"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-purple-500/20 hover:border-purple-500/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium text-white">Aid Allocations</CardTitle>
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Package className="h-5 w-5 text-purple-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{allocationCount}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <TrendingUp className="h-4 w-4 text-purple-300" />
                    <p className="text-sm text-purple-200">
                      {role === "admin" ? "Total aid packages distributed" : "Aid packages you've distributed"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-rose-500/20 hover:border-rose-500/40 transition-all">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium text-white">
                    {role === "admin" ? "Fraud Alerts" : "Security Status"}
                  </CardTitle>
                  <div className="p-2 bg-rose-500/20 rounded-lg">
                    {role === "admin" ? (
                      <AlertTriangle className="h-5 w-5 text-rose-300" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 text-emerald-300" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {role === "admin" ? (
                    <>
                      <div className="text-3xl font-bold text-white">{fraudAlertCount}</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <AlertTriangle className="h-4 w-4 text-rose-300" />
                        <p className="text-sm text-rose-200">
                          Attempted duplicate allocations detected
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-emerald-400">Protected</div>
                      <div className="flex items-center space-x-2 mt-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        <p className="text-sm text-emerald-200">
                          Fraud prevention system active
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-white/10 backdrop-blur-sm border-indigo-500/20 hover:border-indigo-500/40 transition-all">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="text-indigo-200">
                  Aid allocation activity over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyAllocations}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#4f46e5" opacity={0.2} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#a5b4fc"
                        tick={{ fill: '#a5b4fc' }}
                      />
                      <YAxis 
                        allowDecimals={false}
                        stroke="#a5b4fc"
                        tick={{ fill: '#a5b4fc' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(17, 24, 39, 0.8)',
                          border: '1px solid rgba(79, 70, 229, 0.2)',
                          borderRadius: '0.5rem',
                          color: '#fff'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#a5b4fc' }}
                      />
                      <Bar 
                        dataKey="allocations" 
                        fill="#818cf8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
