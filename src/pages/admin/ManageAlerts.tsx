
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { fetchFraudAlerts } from "@/services/disburserService";
import { AlertTriangle, MapPin, RefreshCw, ShieldAlert } from "lucide-react";
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
                <div key={alert.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-red-800">
                          Duplicate allocation attempt
                        </h3>
                        <div className="mt-1 text-sm text-red-700">
                          <p>
                            <span className="font-semibold">Beneficiary:</span>{" "}
                            {alert.beneficiaries?.name || "Unknown"}
                          </p>
                          <p>
                            <span className="font-semibold">Attempted by:</span>{" "}
                            {alert.disbursers?.name || "Unknown"}
                          </p>
                          {alert.details && (
                            <p className="mt-1">{alert.details}</p>
                          )}
                          {alert.location && (
                            <div className="flex items-center mt-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-xs">
                                Lat: {alert.location.latitude?.toFixed(6)}, 
                                Lng: {alert.location.longitude?.toFixed(6)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">FRAUD ATTEMPT</Badge>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(alert.attempted_at)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(alert.attempted_at)}
                      </p>
                    </div>
                  </div>
                </div>
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
