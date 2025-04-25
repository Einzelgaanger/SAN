import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DisburserData {
  name: string;
  phone_number: string;
  password: string;
  region_id: string;
}

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [regionId, setRegionId] = useState("");
  const [regions, setRegions] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  // Fetch regions
  React.useEffect(() => {
    const fetchRegions = async () => {
      setIsLoadingRegions(true);
      try {
        const { data, error } = await supabase
          .from("regions")
          .select("id, name");
          
        if (error) throw error;
        setRegions(data || []);
        
        // Set default region if available
        if (data && data.length > 0) {
          setRegionId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
        toast({
          title: "Error",
          description: "Failed to load regions",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRegions(false);
      }
    };
    
    fetchRegions();
  }, [toast]);

  // Create disburser function
  const createDisburser = async (disburserData: DisburserData) => {
    const { data, error } = await supabase
      .from("disbursers")
      .insert(disburserData)
      .select()
      .single();

    if (error) {
      console.error("Error creating disburser:", error);
      throw new Error(error.message);
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!regionId) {
        throw new Error("Please select a region");
      }
      
      if (!password) {
        throw new Error("Password is required");
      }
      
      await createDisburser({
        name,
        phone_number: phoneNumber,
        password,
        region_id: regionId
      });
      
      toast({
        title: "Success",
        description: "Disburser registered successfully",
      });
      
      // Reset form
      setName("");
      setPhoneNumber("");
      setPassword("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register disburser",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-9rem)] p-2 md:p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-md rounded-lg">
        <CardHeader className="pb-3 md:pb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
          <CardTitle className="text-lg md:text-xl font-bold">Register Disburser</CardTitle>
          <CardDescription className="text-white/90 text-xs md:text-sm">Add a new disburser to the system</CardDescription>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="name" className="text-sm md:text-base font-medium">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter disburser's name"
                className="text-sm md:text-base py-2 h-auto"
                required
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="phone" className="text-sm md:text-base font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="text-sm md:text-base py-2 h-auto"
                required
              />
            </div>
            
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="password" className="text-sm md:text-base font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="text-sm md:text-base py-2 h-auto"
                required
              />
            </div>
            
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="region" className="text-sm md:text-base font-medium">Region</Label>
              <Select
                value={regionId}
                onValueChange={setRegionId}
                disabled={isLoadingRegions || regions.length === 0}
              >
                <SelectTrigger id="region" className="text-sm md:text-base py-2 h-auto">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id} className="text-sm md:text-base">
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingRegions && <p className="text-xs text-gray-500 mt-1">Loading regions...</p>}
              {!isLoadingRegions && regions.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No regions available. Please add regions first.</p>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || isLoadingRegions || regions.length === 0}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 h-auto text-sm md:text-base"
            >
              {isLoading ? "Registering..." : "Register Disburser"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm; 