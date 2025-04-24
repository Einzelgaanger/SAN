import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchGoods, createGood, updateGood } from "@/services/adminService";

interface Good {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  created_at: string;
}

const ManageGoods = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGood, setCurrentGood] = useState<Good | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [goods, setGoods] = useState<Good[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGoods();
  }, []);

  const loadGoods = async () => {
    try {
      setIsLoading(true);
      const data = await fetchGoods();
      setGoods(data);
    } catch (error) {
      console.error("Error loading goods:", error);
      toast({
        title: "Error",
        description: "Failed to load goods",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGoods = goods.filter(
    (good) =>
      good.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      good.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateGood = async (data: Omit<Good, "id" | "created_at">) => {
    try {
      await createGood(data);
      toast({
        title: "Success",
        description: "Goods created successfully",
      });
      loadGoods();
    } catch (error) {
      console.error("Error creating good:", error);
      toast({
        title: "Error",
        description: "Failed to create goods",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGood = async (data: Good) => {
    try {
      await updateGood(data);
      toast({
        title: "Success",
        description: "Goods updated successfully",
      });
      loadGoods();
    } catch (error) {
      console.error("Error updating good:", error);
      toast({
        title: "Error",
        description: "Failed to update goods",
        variant: "destructive",
      });
    }
  };

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
            Add Goods
          </Button>
        </div>

        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
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
              <Card key={good.id} className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600">📦</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{good.name}</h3>
                        <p className="text-sm text-gray-500">
                          {good.description || "No description"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Available Quantity</p>
                      <p className="text-lg font-medium text-gray-900">
                        {good.quantity}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <span className="text-4xl mb-4">📦</span>
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

      {/* Create Good Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goods</DialogTitle>
            <DialogDescription>
              Add new goods to the inventory
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              name: formData.get("name") as string,
              description: formData.get("description") as string,
              quantity: parseInt(formData.get("quantity") as string) || 0
            };
            await handleCreateGood(data);
            setIsCreating(false);
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Name</label>
                <Input
                  id="name"
                  name="name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Input
                  id="description"
                  name="description"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">Initial Quantity</label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue="0"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageGoods;
