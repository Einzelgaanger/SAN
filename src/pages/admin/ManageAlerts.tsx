import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchFraudAlerts } from "@/services/disburserService";
import { AlertTriangle, MapPin, RefreshCw, ShieldAlert, AlertCircle, Package } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { Badge } from "@/components/ui/badge";

const ManageAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const fetchedAlerts = await fetchFraudAlerts();
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error("Error fetching fraud alerts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch fraud alerts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAlerts();
    toast({
      title: "Refreshed",
      description: "Fraud alerts have been updated",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
  };

  const FraudAlertCard = ({ alert }: { alert: FraudAlert }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
    const [disburser, setDisburser] = useState<Disburser | null>(null);
    const [goods, setGoods] = useState<any[]>([]);

    useEffect(() => {
      const fetchDetails = async () => {
        try {
          const [beneficiaryData, disburserData, goodsData] = await Promise.all([
            getBeneficiaryById(alert.beneficiary_id),
            getDisburserById(alert.disburser_id),
            getGoodsByIds(alert.goods_ids || [])
          ]);
          setBeneficiary(beneficiaryData);
          setDisburser(disburserData);
          setGoods(goodsData);
        } catch (error) {
          console.error("Error fetching alert details:", error);
        }
      };

      fetchDetails();
    }, [alert]);

    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Attempted Allocation</h3>
                <p className="text-sm text-gray-500">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show Less" : "Show More"}
            </Button>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Beneficiary</h4>
                  <p className="text-gray-900">{beneficiary?.name || "Loading..."}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Disburser</h4>
                  <p className="text-gray-900">{disburser?.name || "Loading..."}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Attempted Goods</h4>
                <div className="mt-2 space-y-2">
                  {goods.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="text-gray-900">
                  {alert.location 
                    ? `Lat: ${alert.location.latitude}, Long: ${alert.location.longitude}`
                    : "Location not available"}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <AnimatedIcons className="opacity-20" />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fraud Alerts</h1>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      
      <Card className="bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Potential Fraud Incidents
          </CardTitle>
          <CardDescription>
            Showing all detected attempts at duplicate resource allocation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-6">
              {alerts.map((alert) => (
                <FraudAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <ShieldAlert className="h-16 w-16 text-green-300 mb-4" />
              <p className="text-center">No fraud alerts detected!</p>
              <p className="text-center text-sm mt-2">
                The system is working as expected and no duplicate allocation attempts have been made.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageAlerts;
