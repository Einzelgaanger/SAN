
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, RefreshCw, Store, Truck, Save, Pencil, X } from "lucide-react";
import { AnimatedIcons } from "@/components/ui/animated-icons";
import { fetchRegions } from "@/services/adminService";
import { fetchGoodsTypes, fetchRegionalGoods, updateRegionalGoodsQuantity } from "@/services/disburserService";
import { supabase } from "@/integrations/supabase/client";

const ManageGoods = () => {
  const [regions, setRegions] = useState<any[]>([]);
  const [goodsTypes, setGoodsTypes] = useState<any[]>([]);
  const [regionalGoods, setRegionalGoods] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newGoodsType, setNewGoodsType] = useState({ name: "", description: "" });
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedRegions, fetchedGoodsTypes] = await Promise.all([
          fetchRegions(),
          fetchGoodsTypes()
        ]);
        
        setRegions(fetchedRegions);
        setGoodsTypes(fetchedGoodsTypes);
        
        // If we have regions, select the first one by default
        if (fetchedRegions.length > 0) {
          setSelectedRegion(fetchedRegions[0].id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch initial data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  useEffect(() => {
    const loadRegionalGoods = async () => {
      if (!selectedRegion) return;
      
      setIsLoading(true);
      try {
        const fetchedGoods = await fetchRegionalGoods(selectedRegion);
        
        // Add missing goods types for this region (with quantity 0)
        const existingGoodsTypeIds = fetchedGoods.map(g => g.goods_type_id);
        const missingGoodsTypes = goodsTypes.filter(gt => !existingGoodsTypeIds.includes(gt.id));
        
        // Create entries for missing goods in regional goods
        for (const goodsType of missingGoodsTypes) {
          try {
            const { data, error } = await supabase
              .from("regional_goods")
              .insert({
                goods_type_id: goodsType.id,
                region_id: selectedRegion,
                quantity: 0
              })
              .select();
              
            if (error) throw error;
            if (data) fetchedGoods.push(data[0]);
          } catch (err) {
            console.error("Error creating regional goods entry:", err);
          }
        }
        
        // Fetch again to get the complete data with relations
        const updatedGoods = await fetchRegionalGoods(selectedRegion);
        setRegionalGoods(updatedGoods);
      } catch (error) {
        console.error("Error fetching regional goods:", error);
        toast({
          title: "Error",
          description: "Failed to fetch goods for this region",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (goodsTypes.length > 0) {
      loadRegionalGoods();
    }
  }, [selectedRegion, goodsTypes, toast]);

  const handleRefresh = async () => {
    if (!selectedRegion) return;
    
    setIsLoading(true);
    try {
      const [fetchedGoodsTypes, fetchedGoods] = await Promise.all([
        fetchGoodsTypes(),
        fetchRegionalGoods(selectedRegion)
      ]);
      
      setGoodsTypes(fetchedGoodsTypes);
      setRegionalGoods(fetchedGoods);
      
      toast({
        title: "Refreshed",
        description: "Goods inventory has been updated",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh inventory data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoodsType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoodsType.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for the goods type",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("goods_types")
        .insert({
          name: newGoodsType.name.trim(),
          description: newGoodsType.description.trim() || null
        })
        .select();
        
      if (error) throw error;
      
      // Add the new goods type to our state
      if (data) {
        setGoodsTypes([...goodsTypes, data[0]]);
        toast({
          title: "Success",
          description: "New goods type created successfully",
        });
        
        // Reset form
        setNewGoodsType({ name: "", description: "" });
        setIsCreating(false);
        
        // Refresh regional goods to include the new type
        if (selectedRegion) {
          const fetchedGoods = await fetchRegionalGoods(selectedRegion);
          setRegionalGoods(fetchedGoods);
        }
      }
    } catch (error) {
      console.error("Error creating goods type:", error);
      toast({
        title: "Error",
        description: "Failed to create new goods type",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuantity = async (id: string, quantity: number) => {
    if (quantity < 0) {
      toast({
        title: "Validation Error",
        description: "Quantity cannot be negative",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateRegionalGoodsQuantity(id, quantity);
      
      // Update local state
      setRegionalGoods(regionalGoods.map(g => 
        g.id === id ? { ...g, quantity } : g
      ));
      
      toast({
        title: "Updated",
        description: "Inventory quantity updated successfully",
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <AnimatedIcons className="opacity-20" />
      
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Inventory</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Goods Type
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Select Region</CardTitle>
            <CardDescription>Manage inventory for a specific region</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Region</label>
              <Select
                value={selectedRegion || ""}
                onValueChange={setSelectedRegion}
              >
                <SelectTrigger>
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
            
            {isCreating && (
              <Card className="mt-4 border-blue-200">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex justify-between items-center">
                    <span>Create New Goods Type</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setIsCreating(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Cancel</span>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateGoodsType} className="space-y-3">
                    <div>
                      <Label htmlFor="goodsName">Name</Label>
                      <Input
                        id="goodsName"
                        value={newGoodsType.name}
                        onChange={(e) => setNewGoodsType({ ...newGoodsType, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="goodsDescription">Description</Label>
                      <Textarea
                        id="goodsDescription"
                        value={newGoodsType.description}
                        onChange={(e) => setNewGoodsType({ ...newGoodsType, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Create
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Regional Inventory
            </CardTitle>
            <CardDescription>
              {selectedRegion && regions.find(r => r.id === selectedRegion) ? (
                <>Managing inventory for {regions.find(r => r.id === selectedRegion).name}</>
              ) : (
                <>Select a region to manage inventory</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : regionalGoods.length > 0 ? (
              <div className="space-y-4">
                {regionalGoods.map((goods) => (
                  <InventoryItem 
                    key={goods.id} 
                    goods={goods} 
                    onUpdateQuantity={handleUpdateQuantity} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Package className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-center">No inventory items found.</p>
                {selectedRegion ? (
                  <p className="text-center text-sm mt-2">
                    Create goods types to start managing inventory.
                  </p>
                ) : (
                  <p className="text-center text-sm mt-2">
                    Please select a region to view inventory.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface InventoryItemProps {
  goods: any;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
}

const InventoryItem = ({ goods, onUpdateQuantity }: InventoryItemProps) => {
  const [quantity, setQuantity] = useState<number>(goods.quantity);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  useEffect(() => {
    setQuantity(goods.quantity);
  }, [goods]);
  
  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdateQuantity(goods.id, quantity);
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mr-4 mt-1">
            <Truck className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium">{goods.goods_types?.name || "Unknown"}</h3>
            {goods.goods_types?.description && (
              <p className="text-sm text-gray-600 mt-1">{goods.goods_types.description}</p>
            )}
          </div>
        </div>
        <div className="text-right flex items-center space-x-2">
          {isEditing ? (
            <>
              <div className="w-24">
                <Input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min="0" 
                  className="text-right h-9"
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={isUpdating}
                className="h-9"
              >
                {isUpdating ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="sr-only">Save</span>
              </Button>
            </>
          ) : (
            <>
              <div className="text-right mr-2">
                <div className="text-2xl font-bold">{goods.quantity}</div>
                <div className="text-xs text-gray-500">in stock</div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsEditing(true)}
                className="h-9"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageGoods;
