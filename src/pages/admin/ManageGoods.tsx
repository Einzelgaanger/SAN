import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fetchGoods, createGood, updateGood, deleteGood, bulkCreateGoods } from "@/services/adminService";
import { Trash2, Plus, Minus, Search, Package, RefreshCw, Upload } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface Good {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  created_at: string;
}

interface CreateGoodData {
  name: string;
  description?: string;
}

const ManageGoods = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGood, setCurrentGood] = useState<Good | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [goods, setGoods] = useState<Good[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);

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

  const handleBulkImport = async (file: File) => {
    try {
      setIsBulkImporting(true);
      setImportProgress(0);
      
      // Read CSV file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        
        // Validate CSV format
        if (!headers.includes('name') || !headers.includes('description') || !headers.includes('quantity')) {
          toast({
            title: "Error",
            description: "Invalid CSV format. Required columns: name, description, quantity",
            variant: "destructive",
          });
          return;
        }

        // Process each line
        const goodsToImport = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          goodsToImport.push({
            name: values[headers.indexOf('name')].trim(),
            description: values[headers.indexOf('description')].trim(),
            quantity: parseInt(values[headers.indexOf('quantity')].trim(), 10) || 0
          });
          
          setImportProgress(Math.round((i / lines.length) * 100));
        }

        // Bulk create goods
        await bulkCreateGoods(goodsToImport);
        
        // Update local state without full refresh
        const newGoods = await fetchGoods();
        setGoods(newGoods);
        
        toast({
          title: "Success",
          description: `Successfully imported ${goodsToImport.length} goods`,
        });
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing goods:", error);
      toast({
        title: "Error",
        description: "Failed to import goods",
        variant: "destructive",
      });
    } finally {
      setIsBulkImporting(false);
      setImportProgress(0);
    }
  };

  const handleCreateGood = async (data: CreateGoodData) => {
    try {
      const newGood = await createGood(data);
      setGoods(prev => [...prev, newGood]);
      toast({
        title: "Success",
        description: "Goods created successfully",
      });
      setIsCreating(false);
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
      const updatedGood = await updateGood(data);
      setGoods(prev => prev.map(good => 
        good.id === updatedGood.id ? updatedGood : good
      ));
      toast({
        title: "Success",
        description: "Goods updated successfully",
      });
    } catch (error) {
      console.error("Error updating good:", error);
      toast({
        title: "Error",
        description: "Failed to update goods",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGood = async (id: string) => {
    try {
      await deleteGood(id);
      setGoods(prev => prev.filter(good => good.id !== id));
      toast({
        title: "Success",
        description: "Goods deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting good:", error);
      toast({
        title: "Error",
        description: "Failed to delete goods",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = async (good: Good, newQuantity: string) => {
    const quantity = parseInt(newQuantity, 10);
    if (isNaN(quantity) || quantity < 0) return;
    
    try {
      const updatedGood = await updateGood({
        ...good,
        quantity
      });
      setGoods(prev => prev.map(g => 
        g.id === updatedGood.id ? updatedGood : g
      ));
      toast({
        title: "Success",
        description: "Quantity updated successfully",
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
    <div className="p-3 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Goods Inventory</h1>
            <p className="text-sm text-gray-500 mt-1">Manage available goods and resources</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setIsCreating(true)}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goods
            </Button>
            <Button 
              onClick={() => setIsBulkImporting(true)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button 
              onClick={loadGoods} 
              variant="outline"
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Card */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
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

        {/* Goods List */}
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 animate-pulse shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-full" />
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
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">{good.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 max-w-[250px]">
                          {good.description || "No description"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Quantity</p>
                        <Input
                          type="number"
                          min="0"
                          value={good.quantity}
                          onChange={(e) => handleQuantityChange(good, e.target.value)}
                          className="w-24 h-8 text-center"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGood(good.id)}
                        className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Goods Found</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  {searchQuery 
                    ? "No goods match your search criteria."
                    : "No goods are registered yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Bulk Import Dialog */}
        <Dialog open={isBulkImporting} onOpenChange={setIsBulkImporting}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Import Goods</DialogTitle>
              <DialogDescription>
                Upload a CSV file with the following columns: name, description, quantity
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <p className="text-sm text-gray-500">
                  Download <a href="/templates/goods-template.csv" className="text-blue-600 hover:underline">template</a>
                </p>
              </div>
              {importProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBulkImporting(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => csvFile && handleBulkImport(csvFile)}
                disabled={!csvFile || isBulkImporting}
              >
                Import
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Good Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className={cn(
            "bg-white border-gray-200 shadow-lg",
            isMobile ? "w-[calc(100%-2rem)] p-4 max-w-md" : ""
          )}>
            <DialogHeader>
              <DialogTitle>Add New Goods</DialogTitle>
              <DialogDescription className="text-gray-500">
                Create a new goods item for inventory.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const description = formData.get('description') as string;
              
              if (name.trim()) {
                handleCreateGood({
                  name,
                  description: description.trim() || undefined
                });
              }
            }} className="grid gap-4 py-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter goods name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Enter description"
                />
              </div>
              <DialogFooter className={isMobile ? "flex-col-reverse space-y-2 space-y-reverse" : ""}>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Goods
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageGoods;
