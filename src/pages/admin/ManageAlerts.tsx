import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchFraudAlerts } from "@/services/disburserService";
import { AlertTriangle, MapPin, RefreshCw, ShieldAlert, AlertCircle, Package, User, ChevronDown, ChevronUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const ManageAlerts = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

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
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const FraudAlertCard = ({ alert }: { alert: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Attempted Duplicate Allocation</h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatDate(alert.attempted_at || alert.created_at)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              aria-label={isExpanded ? "Show Less" : "Show More"}
            >
              {isExpanded ? 
                <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                <ChevronDown className="h-5 w-5 text-gray-500" />
              }
            </Button>
          </div>
          
          {isExpanded && (
            <div className="mt-4 space-y-4 border-t pt-4 border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">Beneficiary</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{alert.beneficiaries?.name || "Unknown"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">Disburser</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{alert.disbursers?.name || "Unknown"}</p>
                  </div>
                </div>
              </div>
              
              {alert.location && (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">Location</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-yellow-600" />
                    </div>
                    <p className="text-sm text-gray-900">
                      {alert.location 
                        ? `Lat: ${alert.location.latitude}, Long: ${alert.location.longitude}`
                        : "Location not available"}
                    </p>
                  </div>
                </div>
              )}

              {alert.details && (
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-gray-500 uppercase">Details</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{alert.details}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-3 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 mr-2" />
              Fraud Alerts
            </h1>
            <p className="text-sm text-gray-500 mt-1">View and manage fraud detection alerts</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline"
            className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 animate-pulse shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
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
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <ShieldAlert className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Fraud Alerts</h3>
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
