import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, User, MapPin, Calendar, Ruler, FileText, ChevronRight } from "lucide-react";
import { fetchBeneficiariesByRegion } from "@/services/disburserService";
import { fetchRegions } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
            <p className="text-sm text-gray-500">Manage and view registered beneficiaries</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        
        <div className="flex gap-4">
          <div className="w-64 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-4">
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
            
            <Card className="border-0 shadow-sm bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="text-sm text-blue-600">
                  <p className="font-medium">Total: {filteredBeneficiaries.length}</p>
                  {selectedRegion && regions.find(r => r.id === selectedRegion) && (
                    <p className="mt-1">
                      Region: {regions.find(r => r.id === selectedRegion).name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBeneficiaries.length > 0 ? (
              <div className="space-y-2">
                {filteredBeneficiaries.map((beneficiary) => (
                  <BeneficiaryCard 
                    key={beneficiary.id} 
                    beneficiary={beneficiary}
                    getDisburserName={getDisburserName}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <User className="h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No beneficiaries found
                  </h3>
                  <p className="text-sm text-gray-500 text-center max-w-sm">
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
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  // Get initials for avatar
  const initials = beneficiary.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {beneficiary.name}
              </h3>
              <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
            
            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
              {beneficiary.estimated_age && (
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {beneficiary.estimated_age} years
                </span>
              )}
              {beneficiary.height && (
                <span className="flex items-center">
                  <Ruler className="h-3 w-3 mr-1" />
                  {beneficiary.height} cm
                </span>
              )}
            </div>

            {isExpanded && (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(identifiers).map(([key, value]) => (
                    value && (
                      <span key={key} className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: {value}
                      </span>
                    )
                  ))}
                </div>

                {disburserName && (
                  <div className="text-xs text-gray-500">
                    <p>Registered by: {disburserName}</p>
                    <p>{new Date(beneficiary.created_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageBeneficiaries;
