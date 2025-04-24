import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const FraudAlertCard = ({ alert }: { alert: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [beneficiary, setBeneficiary] = useState<any>(null);
    const [disburser, setDisburser] = useState<any>(null);
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
                <h3 className="font-medium text-gray-900">Attempted Duplicate Allocation</h3>
                <p className="text-sm text-gray-500">
                  {formatDate(alert.created_at)}
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Fraud Alerts</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage fraud detection alerts</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 animate-pulse shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : alerts.length > 0 ? (
            alerts.map((alert) => (
              <FraudAlertCard key={alert.id} alert={alert} />
            ))
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShieldAlert className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Fraud Alerts</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  No fraud attempts have been detected.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAlerts;
