import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, User, MapPin, Calendar, Ruler, FileText } from "lucide-react";
import { fetchBeneficiariesByRegion } from "@/services/disburserService";
import { fetchRegions } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedIcons } from "@/components/ui/animated-icons";

interface Beneficiary {
  id: string;
  name: string;
  estimated_age: number;
  height: number;
  unique_identifiers: {
    national_id?: string;
    passport?: string;
    birth_certificate?: string;
  };
  region_id: string;
  registered_by: string;
  created_at: string;
}

const ManageBeneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Enhanced search functionality
  const filteredBeneficiaries = useMemo(() => {
    if (!searchTerm) return beneficiaries;
    
    const searchLower = searchTerm.toLowerCase();
    return beneficiaries.filter(b => {
      // Search in name
      if (b.name.toLowerCase().includes(searchLower)) return true;
      
      // Search in identifiers
      const identifiers = b.unique_identifiers;
      return Object.values(identifiers).some(value => 
        value?.toLowerCase().includes(searchLower)
      );
    });
  }, [beneficiaries, searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedRegions = await fetchRegions();
        setRegions(fetchedRegions);
        
        // If we have regions, select the first one by default
        if (fetchedRegions.length > 0) {
          setSelectedRegion(fetchedRegions[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch regions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  useEffect(() => {
    const loadBeneficiaries = async () => {
      if (!selectedRegion) return;
      
      setIsLoading(true);
      try {
        const fetchedBeneficiaries = await fetchBeneficiariesByRegion(selectedRegion);
        setBeneficiaries(fetchedBeneficiaries);
      } catch (error) {
        console.error("Error fetching beneficiaries:", error);
        toast({
          title: "Error",
          description: "Failed to fetch beneficiaries for this region",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBeneficiaries();
  }, [selectedRegion, toast]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter is done client-side for now
  };

  const handleRefresh = async () => {
    if (!selectedRegion) return;
    
    setIsLoading(true);
    try {
      const fetchedBeneficiaries = await fetchBeneficiariesByRegion(selectedRegion);
      setBeneficiaries(fetchedBeneficiaries);
      toast({
        title: "Refreshed",
        description: "Beneficiary list has been updated",
      });
    } catch (error) {
      console.error("Error refreshing beneficiaries:", error);
      toast({
        title: "Error",
        description: "Failed to refresh beneficiary data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDisburserName = async (disburserId: string) => {
    try {
      const { data, error } = await supabase
        .from("disbursers")
        .select("name")
        .eq("id", disburserId)
        .single();
        
      if (error) throw error;
      return data.name;
    } catch (error) {
      console.error("Error fetching disburser name:", error);
      return "Unknown";
    }
  };

  const createDisburser = async (disburser: TablesInsert<"disbursers">) => {
    try {
      const { data, error } = await supabase
        .from("disbursers")
        .insert(disburser)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating disburser:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to create disburser"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
            <p className="text-gray-500 mt-1">Manage and view registered beneficiaries</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Region
                  </label>
                  <Select
                    value={selectedRegion || ""}
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger className="w-full border-gray-300">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="text-sm text-blue-600">
                  <p className="font-medium">Total Beneficiaries: {filteredBeneficiaries.length}</p>
                  {selectedRegion && regions.find(r => r.id === selectedRegion) && (
                    <p className="mt-1">
                      Region: {regions.find(r => r.id === selectedRegion).name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-lg animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBeneficiaries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBeneficiaries.map((beneficiary) => (
                  <BeneficiaryCard 
                    key={beneficiary.id} 
                    beneficiary={beneficiary}
                    getDisburserName={getDisburserName}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <User className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No beneficiaries found
                  </h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    {selectedRegion 
                      ? "No beneficiaries are registered in this region."
                      : "Please select a region to view beneficiaries."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BeneficiaryCard = ({ beneficiary, getDisburserName }: { 
  beneficiary: Beneficiary;
  getDisburserName: (id: string) => Promise<string>;
}) => {
  const [disburserName, setDisburserName] = useState<string | null>(null);
  
  useEffect(() => {
    const loadDisburserName = async () => {
      if (beneficiary.registered_by) {
        const name = await getDisburserName(beneficiary.registered_by);
        setDisburserName(name);
      }
    };
    
    loadDisburserName();
  }, [beneficiary, getDisburserName]);

  // Parse unique identifiers properly
  const identifiers = useMemo(() => {
    try {
      if (typeof beneficiary.unique_identifiers === 'string') {
        return JSON.parse(beneficiary.unique_identifiers);
      }
      return beneficiary.unique_identifiers;
    } catch (error) {
      console.error('Error parsing identifiers:', error);
      return {};
    }
  }, [beneficiary.unique_identifiers]);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {beneficiary.name}
              </h3>
              <div className="mt-1 space-y-1">
                {beneficiary.estimated_age && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Age: {beneficiary.estimated_age}
                  </div>
                )}
                {beneficiary.height && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Ruler className="h-4 w-4 mr-2" />
                    Height: {beneficiary.height} cm
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Identifiers</h4>
            <div className="space-y-1">
              {Object.entries(identifiers).map(([key, value]) => (
                value && (
                  <div key={key} className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                    <FileText className="h-4 w-4 mr-2" />
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: {value}
                  </div>
                )
              ))}
            </div>
          </div>

          {disburserName && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Registered by: {disburserName}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(beneficiary.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageBeneficiaries;
