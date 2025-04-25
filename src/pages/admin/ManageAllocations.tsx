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
import { Package, Search, Calendar, MapPin, User, ChevronRight } from "lucide-react";
import { fetchAllocations, fetchGoodsTypes } from "@/services/disburserService";
import { Allocation, GoodsType } from "@/types/database";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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
  const { isMobile } = useIsMobile();

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
    <div className="p-3 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-green-700">Resource Allocations</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and manage all resource allocations across regions
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-md border-green-200">
          <CardHeader className="bg-white border-b border-green-100 p-4 sm:p-6">
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
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="recent">Last 7 Days</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-green-100 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2.5"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                Error loading allocations. Please try again.
              </div>
            ) : filteredAllocations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No allocations found matching your criteria.
              </div>
            ) : isMobile ? (
              // Mobile card view
              <div className="divide-y divide-gray-100">
                {filteredAllocations.map((allocation: Allocation) => (
                  <div key={allocation.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {allocation.beneficiaries?.name || "Unknown Beneficiary"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {allocation.disbursers?.name || "Unknown Disburser"}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Completed
                      </Badge>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Date
                        </p>
                        <p className="font-medium">{formatDate(allocation.allocated_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          Location
                        </p>
                        <p className="font-medium text-xs">{getLocationString(allocation.location)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Resources</p>
                      <div className="flex flex-wrap gap-1">
                        {formatGoodsDisplay(allocation.goods).map((good, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                            {good}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop table view
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
                      <TableRow 
                        key={allocation.id}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              {allocation.beneficiaries?.name || "Unknown Beneficiary"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{allocation.disbursers?.name || "Unknown Disburser"}</TableCell>
                        <TableCell>
                          <AllocationGoods goods={allocation.goods} />
                        </TableCell>
                        <TableCell>{formatDate(allocation.allocated_at)}</TableCell>
                        <TableCell>{getLocationString(allocation.location)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
      {parsedGoods.map((item, index) => (
        <Badge key={index} variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
          {typeof item === 'object' && item.name ? item.name : 
           typeof item === 'string' ? getGoodNameFromId(item) : "Unknown Item"}
        </Badge>
      ))}
    </div>
  );
};

export default ManageAllocations;
