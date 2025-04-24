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
import { useQuery } from "react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GoodForm } from "@/components/ui/good-form";
import { adminService } from "@/services/adminService";

const ManageGoods = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGood, setCurrentGood] = useState<Good | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: goods, isLoading, refetch } = useQuery({
    queryKey: ["goods"],
    queryFn: adminService.fetchGoods,
  });

  const filteredGoods = goods?.filter(
    (good) =>
      good.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      good.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Goods Inventory</h1>
            <p className="text-sm text-gray-500 mt-1">Manage available goods and resources</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goods
          </Button>
        </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 animate-pulse shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredGoods.length > 0 ? (
            filteredGoods.map((good) => (
              <GoodCard 
                key={good.id} 
                good={good}
                onEdit={() => {
                  setIsEditing(true);
                  setCurrentGood(good);
                }}
              />
            ))
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Goods Found</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  {searchQuery 
                    ? "No goods match your search criteria."
                    : "No goods are registered yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Good Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          setCurrentGood(null);
        }
      }}>
        <DialogContent className="bg-white border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add New Goods" : "Edit Goods"}</DialogTitle>
            <DialogDescription>
              {isCreating ? "Add new goods to the inventory" : "Update existing goods information"}
            </DialogDescription>
          </DialogHeader>
          <GoodForm
            good={currentGood}
            onSubmit={async (data) => {
              try {
                if (isCreating) {
                  await createGoodMutation(data);
                } else if (currentGood) {
                  await updateGoodMutation({ id: currentGood.id, ...data });
                }
                setIsCreating(false);
                setIsEditing(false);
                setCurrentGood(null);
                refetch();
              } catch (error) {
                console.error("Error saving goods:", error);
              }
            }}
            onCancel={() => {
              setIsCreating(false);
              setIsEditing(false);
              setCurrentGood(null);
            }}
          />
        </DialogContent>
      </Dialog>
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
