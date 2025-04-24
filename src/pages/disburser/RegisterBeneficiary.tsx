
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { registerBeneficiary, fetchBeneficiariesByRegion } from "@/services/disburserService";
import { Beneficiary } from "@/types/database";
import { List } from 'lucide-react';
import { useUserInfo } from "@/hooks/useUserInfo";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { useIsMobile } from "@/hooks/use-mobile";

const RegisterBeneficiary = () => {
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [uniqueIdentifiers, setUniqueIdentifiers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const { user } = useUserInfo();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const isMobile = useIsMobile();

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
        unique_identifiers: JSON.stringify(uniqueIdentifiers),
        region_id: user.region_id,
        registered_by: user.id,
        height: height,
        estimated_age: age
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
      setUniqueIdentifiers([]);
      
      fetchBeneficiaries();
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

  return (
    <div className="relative flex flex-col md:flex-row h-full p-4 gap-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <AnimatedIcons className="opacity-20" />
      
      <Card className="w-full md:w-1/2 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 border-green-200">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold">Register Beneficiary</CardTitle>
          <CardDescription className="text-white/90">Fill in the details to register a new beneficiary.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="beneficiaryName" className="text-lg font-medium">Beneficiary Name</Label>
              <Input
                type="text"
                id="beneficiaryName"
                placeholder="Enter beneficiary name"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                required
                className="border-green-200 focus:border-green-400 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-lg font-medium">Age (Estimated)</Label>
              <Input
                type="number"
                id="age"
                placeholder="Enter estimated age"
                value={age || ""}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="border-green-200 focus:border-green-400 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-lg font-medium">Height (cm)</Label>
              <Input
                type="number"
                id="height"
                placeholder="Enter height in cm"
                value={height || ""}
                onChange={(e) => setHeight(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="border-green-200 focus:border-green-400 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uniqueIdentifiers" className="text-lg font-medium">Unique Identifiers (e.g., ID, Passport)</Label>
              <Input
                type="text"
                id="uniqueIdentifiers"
                placeholder="Enter unique identifiers, comma separated"
                value={uniqueIdentifiers.join(", ")}
                onChange={(e) => setUniqueIdentifiers(e.target.value.split(",").map((item) => item.trim()))}
                className="border-green-200 focus:border-green-400 bg-white"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 font-bold py-3 text-lg shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full md:w-1/2 bg-white/90 backdrop-blur-sm shadow-lg rounded-lg hover:shadow-xl transition-all duration-300 mt-4 md:mt-0 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <List size={20} className="mr-1" />
            Registered Beneficiaries
          </CardTitle>
          <CardDescription className="text-white/90">List of all registered beneficiaries.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[400px] p-4">
          {beneficiaries.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {beneficiaries.map((beneficiary) => (
                <li key={beneficiary.id} className="py-4 px-2 hover:bg-blue-50 rounded-md transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-medium text-gray-800">{beneficiary.name}</p>
                      <p className="text-sm text-gray-500">
                        ID: {beneficiary.id?.substring(0, 8)}...
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(beneficiary.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <List size={48} className="mb-4 text-gray-300" />
              <p className="text-center">No beneficiaries registered yet.</p>
              <p className="text-sm text-center mt-2">Register your first beneficiary using the form.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterBeneficiary;
