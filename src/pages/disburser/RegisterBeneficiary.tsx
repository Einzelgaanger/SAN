import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { registerBeneficiary, fetchBeneficiariesByRegion } from "@/services/disburserService";
import { Beneficiary } from "@/types/database";
import { List, Menu } from 'lucide-react';
import { useUserInfo } from "@/hooks/useUserInfo";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { useIsMobile } from "@/hooks/use-mobile";

const RegisterBeneficiary = () => {
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"form" | "list">("form");
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const { user } = useUserInfo();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const { isMobile } = useIsMobile();

  const fetchBeneficiaries = async () => {
    try {
      if (user?.region_id && typeof user.region_id === 'string') {
        console.log("Fetching beneficiaries for region ID:", user.region_id);
        const fetchedBeneficiaries = await fetchBeneficiariesByRegion(user.region_id);
        setBeneficiaries(fetchedBeneficiaries);
      } else {
        console.error("No valid region_id available:", user?.region_id);
      }
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      toast({
        title: "Failed to Fetch Beneficiaries",
        description: error instanceof Error ? error.message : "Failed to retrieve beneficiaries.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.region_id) {
      fetchBeneficiaries();
    }
  }, [user?.region_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!user?.region_id || !user?.id) {
        throw new Error("User region_id or ID not available");
      }

      const newBeneficiary = {
        name: beneficiaryName,
        region_id: user.region_id,
        registered_by: user.id,
        height: height,
        estimated_age: age,
        unique_identifiers: {}
      };
      
      console.log("Registering beneficiary with data:", newBeneficiary);
      await registerBeneficiary(newBeneficiary);
      
      toast({
        title: "Registration Successful",
        description: `Beneficiary ${beneficiaryName} has been registered successfully.`,
      });
      
      setBeneficiaryName("");
      setAge(undefined);
      setHeight(undefined);
      
      fetchBeneficiaries();
      
      // Switch to list view on mobile after successful registration
      if (isMobile) {
        setSelectedTab("list");
      }
    } catch (error) {
      console.error("Error registering beneficiary:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // For mobile navigation between form and list
  const MobileTabNav = () => (
    <div className="flex w-full mb-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
      <button
        onClick={() => setSelectedTab("form")}
        className={`flex-1 py-2.5 px-3 rounded-l-lg text-sm font-medium transition-colors ${
          selectedTab === "form" 
            ? "bg-gradient-to-r from-green-500 to-blue-500 text-white" 
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        Register Form
      </button>
      <button
        onClick={() => setSelectedTab("list")}
        className={`flex-1 py-2.5 px-3 rounded-r-lg text-sm font-medium transition-colors ${
          selectedTab === "list" 
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white" 
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        Beneficiaries
      </button>
    </div>
  );

  return (
    <div className="relative flex flex-col h-full p-2 md:p-4 gap-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-[calc(100vh-9rem)]">
      <AnimatedIcons className="opacity-20" />
      
      {isMobile && <MobileTabNav />}
      
      <div className={`flex flex-col md:flex-row w-full gap-4 ${isMobile ? "h-[calc(100vh-13rem)]" : ""}`}>
        {(!isMobile || selectedTab === "form") && (
          <Card className={`${isMobile ? "w-full" : "w-full md:w-1/2"} bg-white/90 backdrop-blur-sm shadow-md rounded-lg hover:shadow-lg transition-all duration-300 border-green-200 ${isMobile ? "h-full" : ""}`}>
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg py-3 md:py-4">
              <CardTitle className="text-lg md:text-xl font-bold">Register Beneficiary</CardTitle>
              <CardDescription className="text-white/90 text-xs md:text-sm">Fill in the details to register a new beneficiary.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 md:pt-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="beneficiaryName" className="text-sm md:text-base font-medium">Beneficiary Name</Label>
                  <Input
                    type="text"
                    id="beneficiaryName"
                    placeholder="Enter beneficiary name"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    required
                    className="border-green-200 focus:border-green-400 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="age" className="text-sm md:text-base font-medium">Age (Estimated)</Label>
                  <Input
                    type="number"
                    id="age"
                    placeholder="Enter estimated age"
                    value={age || ""}
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="border-green-200 focus:border-green-400 bg-white text-sm"
                  />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="height" className="text-sm md:text-base font-medium">Height (cm)</Label>
                  <Input
                    type="number"
                    id="height"
                    placeholder="Enter height in cm"
                    value={height || ""}
                    onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="border-green-200 focus:border-green-400 bg-white text-sm"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 py-2 h-auto"
                >
                  {isSubmitting ? "Registering..." : "Register Beneficiary"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {(!isMobile || selectedTab === "list") && (
          <Card className={`${isMobile ? "w-full" : "w-full md:w-1/2"} bg-white/90 backdrop-blur-sm shadow-md rounded-lg hover:shadow-lg transition-all duration-300 border-blue-200 ${isMobile ? "h-full" : ""} ${isMobile ? "" : "mt-0 md:mt-0"}`}>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg py-3 md:py-4">
              <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                <List size={18} className="mr-1" />
                Registered Beneficiaries
              </CardTitle>
              <CardDescription className="text-white/90 text-xs md:text-sm">List of all registered beneficiaries.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto p-3 md:p-4" style={{maxHeight: isMobile ? "calc(100% - 88px)" : "350px"}}>
              {beneficiaries.length > 0 ? (
                <div className="overflow-x-auto">
                  <ul className="divide-y divide-gray-200 min-w-[300px]">
                    {beneficiaries.map((beneficiary) => (
                      <li key={beneficiary.id} className="py-3 px-2 hover:bg-blue-50 rounded-md transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-base font-medium text-gray-800">{beneficiary.name}</p>
                            <p className="text-xs text-gray-500">
                              ID: {beneficiary.id?.substring(0, 8)}...
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 mt-1 md:mt-0">
                            {new Date(beneficiary.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <List size={40} className="mb-3 text-gray-300" />
                  <p className="text-center text-sm">No beneficiaries registered yet.</p>
                  <p className="text-xs text-center mt-1">Register your first beneficiary using the form.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RegisterBeneficiary;
