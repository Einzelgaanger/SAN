import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useUserInfo } from "@/hooks/useUserInfo";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { CheckCircle, AlertCircle, Package, MapPin, User } from "lucide-react";
import { 
  fetchBeneficiariesByRegion, 
  fetchRegionalGoods,
  checkRecentAllocation,
  createAllocation,
  createFraudAlert,
  updateRegionalGoodsQuantity
} from "@/services/disburserService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Beneficiary as DBBeneficiary } from "@/types/database";

// Local interface matching the shape of data we're working with
interface Beneficiary {
  id: string;
  name: string;
  estimated_age?: number;
  height?: number;
  unique_identifiers?: {
    national_id?: string;
    passport?: string;
    birth_certificate?: string;
  };
  region_id: string;
  created_at: string;
}

const AllocateResources = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [regionalGoods, setRegionalGoods] = useState<any[]>([]);
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFraudDetected, setIsFraudDetected] = useState(false);
  const { toast } = useToast();
  const { user } = useUserInfo();
  const { isMobile } = useIsMobile();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user?.region_id) {
          const [fetchedBeneficiaries, fetchedGoods] = await Promise.all([
            fetchBeneficiariesByRegion(user.region_id),
            fetchRegionalGoods(user.region_id)
          ]);
          
          // Convert the fetched beneficiaries to match our local interface
          setBeneficiaries(fetchedBeneficiaries as unknown as Beneficiary[]);
          setRegionalGoods(fetchedGoods);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    getLocation();
  }, [user, toast]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Failed to retrieve location. Ensure location services are enabled.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    setIsFraudDetected(false);

    try {
      if (!selectedBeneficiary) {
        throw new Error("Please select a beneficiary");
      }
      
      if (selectedGoods.length === 0) {
        throw new Error("Please select at least one aid item");
      }
      
      if (!user?.id) {
        throw new Error("User ID not available");
      }
      
      // Check for previous allocations to detect fraud
      const hasPreviousAllocation = await checkRecentAllocation(selectedBeneficiary.id);
      
      if (hasPreviousAllocation) {
        // Get the goods names for the fraud alert
        const attemptedGoods = selectedGoods.map(goodsId => {
          const goodsItem = regionalGoods.find(g => g.id === goodsId);
          return goodsItem?.goods_types?.name || "Unknown Item";
        });

        // Record fraud attempt with goods information
        await createFraudAlert({
          beneficiary_id: selectedBeneficiary.id,
          disburser_id: user.id,
          location: location ? { 
            latitude: location.latitude, 
            longitude: location.longitude
          } : null,
          details: `Attempted duplicate allocation of: ${attemptedGoods.join(", ")}`,
        });
        
        setIsFraudDetected(true);
        toast({
          title: "Fraud Alert",
          description: "This beneficiary has recently received an allocation. Duplicate prevented.",
          variant: "destructive",
        });
        return;
      }
      
      // Get the full goods information for the allocation
      const goodsWithDetails = selectedGoods.map(goodsId => {
        const goodsItem = regionalGoods.find(g => g.id === goodsId);
        return {
          id: goodsId,
          name: goodsItem?.goods_types?.name || "Unknown Item",
          quantity: 1
        };
      });
      
      // Process allocation with full goods information
      await createAllocation({
        beneficiary_id: selectedBeneficiary.id,
        disburser_id: user.id,
        goods: goodsWithDetails,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null,
      });
      
      // Update stock levels for each allocated item
      for (const goodsId of selectedGoods) {
        const goodsItem = regionalGoods.find(g => g.id === goodsId);
        if (goodsItem) {
          const newQuantity = Math.max(0, goodsItem.quantity - 1);
          await updateRegionalGoodsQuantity(goodsId, newQuantity);
        }
      }
      
      setIsSuccess(true);
      toast({
        title: "Resources Allocated",
        description: `Resources have been successfully allocated to ${selectedBeneficiary?.name}.`,
      });
      
      // Reset form after success
      setTimeout(() => {
        setSelectedBeneficiary(null);
        setSelectedGoods([]);
      }, 2000);
      
    } catch (error) {
      console.error("Error allocating resources:", error);
      toast({
        title: "Allocation Failed",
        description: error instanceof Error ? error.message : "An error occurred while allocating resources.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatusCard = () => {
    if (isSuccess) {
      return (
        <Card className="border-green-300 bg-green-50 mb-4 md:mb-6">
          <CardContent className="p-4 md:p-6 flex items-center">
            <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600 mr-3 md:mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-800 text-sm md:text-base">Allocation Successful</h3>
              <p className="text-xs md:text-sm text-green-700">Resources successfully allocated to {selectedBeneficiary?.name}</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (isFraudDetected) {
      return (
        <Card className="border-red-300 bg-red-50 mb-4 md:mb-6">
          <CardContent className="p-4 md:p-6 flex items-center">
            <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-red-600 mr-3 md:mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 text-sm md:text-base">Fraud Alert</h3>
              <p className="text-xs md:text-sm text-red-700">This beneficiary has already received an allocation recently.</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  const getBeneficiaryDisplayString = (beneficiary: Beneficiary) => {
    const details = [];
    if (beneficiary.estimated_age) details.push(`${beneficiary.estimated_age} years`);
    if (beneficiary.height) details.push(`${beneficiary.height} cm`);
    return `${beneficiary.name}${details.length ? ` (${details.join(', ')})` : ''}`;
  };

  return (
    <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-2 md:px-4 py-4 md:py-6 min-h-[calc(100vh-9rem)]">
      <AnimatedIcons className="opacity-20" />
      
      <div className="w-full max-w-lg">
        {(isSuccess || isFraudDetected) && <StatusCard />}
        
        <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg py-3 md:py-4">
            <CardTitle className="text-lg md:text-2xl font-bold">Allocate Resources</CardTitle>
            <CardDescription className="text-white/90 text-xs md:text-sm">Select a beneficiary and allocate resources</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 md:space-y-6 pt-4 md:pt-6 px-3 md:px-6">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="beneficiary" className="text-sm md:text-base font-medium">Select Beneficiary</Label>
                <Select
                  value={selectedBeneficiary?.id}
                  onValueChange={(value) => {
                    const beneficiary = beneficiaries.find(b => b.id === value);
                    setSelectedBeneficiary(beneficiary || null);
                  }}
                >
                  <SelectTrigger className="w-full text-sm md:text-base py-2 h-auto">
                    <SelectValue placeholder="Select a beneficiary" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[40vh] overflow-y-auto">
                    {beneficiaries.map((beneficiary) => (
                      <SelectItem key={beneficiary.id} value={beneficiary.id} className="text-sm md:text-base">
                        {getBeneficiaryDisplayString(beneficiary)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-sm md:text-base font-medium">Select Aid Items</Label>
                <div className="grid grid-cols-1 gap-2 max-h-[30vh] overflow-y-auto pr-1 border rounded-md border-gray-200 p-2">
                  {regionalGoods.map((goods) => (
                    <div key={goods.id} className="flex items-center space-x-2 py-1.5">
                      <Checkbox
                        id={goods.id}
                        checked={selectedGoods.includes(goods.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGoods([...selectedGoods, goods.id]);
                          } else {
                            setSelectedGoods(selectedGoods.filter(id => id !== goods.id));
                          }
                        }}
                        className="h-4 w-4 md:h-5 md:w-5"
                      />
                      <Label htmlFor={goods.id} className="flex-1 text-sm md:text-base cursor-pointer">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{goods.goods_types.name}</span>
                          <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">Available: {goods.quantity}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <Label className="text-sm md:text-base font-medium">Location</Label>
                <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-600 bg-gray-50 p-2 rounded-md overflow-x-auto whitespace-nowrap">
                  <MapPin className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span>
                    {location ? (
                      `Latitude: ${location.latitude?.toFixed(6)}, Longitude: ${location.longitude?.toFixed(6)}`
                    ) : (
                      "Getting location..."
                    )}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-2 p-3 md:p-4 pt-2 md:pt-0">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedBeneficiary || selectedGoods.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-sm md:text-base py-2 h-auto"
              >
                {isSubmitting ? "Allocating..." : "Allocate Resources"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AllocateResources;
