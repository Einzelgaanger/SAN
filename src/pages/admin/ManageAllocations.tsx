import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Search, Calendar, MapPin, Filter, Download } from "lucide-react";
import { fetchAllocations, fetchGoodsTypes } from "@/services/disburserService";
import { Allocation, GoodsType } from "@/types/database";

// Predefined goods names mapping
const defaultGoodsNames: Record<string, string> = {
  "87f0aee4-d829-4f2c-afca-df8ecf474254": "Shelter Kit",
  "4ba5d1be-08d6-45ff-808a-187700bf7dce": "Water Container",
  "48b9f4c7-5c81-4c84-a438-4e5874465d70": "Hygiene Kit",
  "207b4bb0-50b5-43c2-9d8b-7cf94522638b": "Medical Kit",
  "2de4907a-634f-4eb1-aa4c-8c59e8a91d87": "Food Package",
  "831effb1-ffd5-44e9-b456-53a4b318e00b": "Emergency Blanket"
};

// Shared goods mapping state available throughout the application
let globalGoodsTypesMap: Record<string, string> = {};

// Utility function for getting good name from ID, accessible globally
export const getGoodNameFromId = (goodId: string): string => {
  // First check loaded mapping from the database
  if (globalGoodsTypesMap[goodId]) {
    return globalGoodsTypesMap[goodId];
  }
  
  // Fallback to predefined mapping
  if (defaultGoodsNames[goodId]) {
    return defaultGoodsNames[goodId];
  }
  
  // If all else fails, return a more user-friendly message
  return "Unknown Resource";
};

const ManageAllocations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [goodsTypesMap, setGoodsTypesMap] = useState<Record<string, string>>({});

  // Fetch all goods types once to create a mapping
  useEffect(() => {
    const loadGoodsTypes = async () => {
      try {
        console.log("Fetching goods types...");
        const types = await fetchGoodsTypes();
        console.log("Received goods types:", types);
        
        const map: Record<string, string> = {};
        types.forEach(type => {
          map[type.id] = type.name;
        });
        console.log("Created goodsTypesMap:", map);
        setGoodsTypesMap(map);
        
        // Update global map for use in other components
        globalGoodsTypesMap = map;
      } catch (error) {
        console.error("Error loading goods types mapping:", error);
      }
    };
    
    loadGoodsTypes();
  }, []);

  const { data: allocations = [], isLoading, error } = useQuery({
    queryKey: ['allocations'],
    queryFn: async () => {
      const data = await fetchAllocations();
      return data;
    },
  });

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter allocations based on search term and filter option
  const filteredAllocations = allocations.filter((allocation: Allocation) => {
    const matchesSearch = 
      (allocation.beneficiaries?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (allocation.disbursers?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === "recent") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return matchesSearch && new Date(allocation.allocated_at) >= sevenDaysAgo;
    } else if (filterBy === "month") {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      return matchesSearch && new Date(allocation.allocated_at) >= firstDayOfMonth;
    }
    
    return matchesSearch;
  });

  // Get good name from ID using the mapping
  const getGoodName = (goodId: string): string => {
    return getGoodNameFromId(goodId);
  };

  const getGoodsList = (goods: any) => {
    if (!goods) return "No items";
    
    try {
      if (typeof goods === 'string') {
        goods = JSON.parse(goods);
      }
      
      if (Array.isArray(goods)) {
        return goods.map(item => {
          if (typeof item === 'object' && item.name) {
            return item.name;
          }
          return getGoodName(item);
        }).join(", ");
      } else if (typeof goods === 'object') {
        return Object.values(goods).map(item => {
          if (typeof item === 'object' && (item as any).name) {
            return (item as any).name;
          }
          return getGoodName(item as string);
        }).join(", ");
      }
      
      return "No items";
    } catch (error) {
      console.error('Error parsing goods:', error);
      return "Error parsing items";
    }
  };

  const getLocationString = (location: any) => {
    if (!location) return "Not specified";
    
    try {
      if (typeof location === 'string') {
        location = JSON.parse(location);
      }
      
      if (location.latitude && location.longitude) {
        return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      }
    } catch (error) {
      console.error("Error parsing location data:", error);
    }
    
    return "Invalid location data";
  };

  const formatGoodsDisplay = (goods: any) => {
    try {
      let parsedGoods = Array.isArray(goods) ? goods : JSON.parse(goods);
      return parsedGoods.map((good: any) => {
        if (typeof good === 'object' && good.name) {
          return good.name;
        }
        if (typeof good === 'string') {
          return getGoodName(good);
        }
        return 'Unknown Item';
      });
    } catch (error) {
      console.error('Error parsing goods:', error);
      return [];
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Resource Allocations</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all resource allocations across regions
          </p>
        </div>
        
        <div className="flex gap-2 mt-4 lg:mt-0">
          <Button variant="outline" className="flex items-center gap-2 border-green-500 text-green-700">
            <Filter size={16} />
            <span>Advanced Filters</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2 border-green-500 text-green-700">
            <Download size={16} />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Card className="shadow-md border-green-200">
        <CardHeader className="bg-white border-b border-green-100">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-900">
              <Package className="h-5 w-5 text-green-600" />
              <CardTitle>Allocation Records</CardTitle>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search by beneficiary or disburser" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-green-200 focus-visible:ring-green-500"
                />
              </div>
              
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full md:w-40 border-green-200">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Allocations</SelectItem>
                  <SelectItem value="recent">Recent (7 days)</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : error ? (
            <div className="text-center p-12 text-red-500">
              An error occurred while fetching allocations
            </div>
          ) : filteredAllocations.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              {searchTerm || filterBy !== "all" 
                ? "No allocations match your search criteria" 
                : "No allocations have been recorded yet"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50">
                    <TableHead>Beneficiary</TableHead>
                    <TableHead>Disburser</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} className="text-blue-600" />
                        <span>Date & Time</span>
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} className="text-blue-600" />
                        <span>Location</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllocations.map((allocation: Allocation) => (
                    <TableRow key={allocation.id} className="hover:bg-green-50">
                      <TableCell className="font-medium">
                        {allocation.beneficiaries?.name || "Unknown Beneficiary"}
                      </TableCell>
                      <TableCell>
                        {allocation.disbursers?.name || "Unknown Disburser"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {formatGoodsDisplay(allocation.goods).map((good: string, index: number) => (
                            <span key={index} className="inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs">
                              <Package className="h-3 w-3 mr-1" />
                              {good}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatDate(allocation.allocated_at)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {getLocationString(allocation.location)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="bg-green-50 flex justify-between py-3 px-6">
          <p className="text-gray-600 text-sm">
            {filteredAllocations.length} allocation{filteredAllocations.length !== 1 ? 's' : ''} found
          </p>
          
          <div className="flex gap-2">
            {filteredAllocations.length > 10 && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white border-green-200 text-green-700"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">Page 1</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white border-green-200 text-green-700"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// Component to display allocation goods
const AllocationGoods = ({ goods }: { goods: any }) => {
  let parsedGoods: any[] = [];
  
  try {
    if (typeof goods === 'string') {
      parsedGoods = JSON.parse(goods);
    } else if (Array.isArray(goods)) {
      parsedGoods = goods;
    } else if (goods && typeof goods === 'object') {
      parsedGoods = Object.values(goods);
    }
  } catch (error) {
    console.error("Error parsing goods data:", error);
    return <Badge variant="outline" className="bg-gray-100 text-gray-600">No items</Badge>;
  }
  
  if (!parsedGoods || parsedGoods.length === 0) {
    return <Badge variant="outline" className="bg-gray-100 text-gray-600">No items</Badge>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {parsedGoods.slice(0, 3).map((item, index) => (
        <Badge key={index} variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          {typeof item === 'object' && item.name ? item.name : 
           typeof item === 'string' ? getGoodNameFromId(item) : "Unknown Item"}
        </Badge>
      ))}
      {parsedGoods.length > 3 && (
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          +{parsedGoods.length - 3} more
        </Badge>
      )}
    </div>
  );
};

export default ManageAllocations;
