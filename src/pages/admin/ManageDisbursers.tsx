import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Plus, UserPlus, Phone, MapPin, ChevronRight, Search, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as adminService from "@/services/adminService";
import { Disburser, Region } from "@/types/database";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";
import { REGIONS } from "@/constants/regions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ManageDisbursers = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentDisburser, setCurrentDisburser] = useState<Disburser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [disburserToDelete, setDisburserToDelete] = useState<Disburser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: disbursers,
    isLoading,
    isError,
    refetch: fetchDisbursers,
  } = useQuery({
    queryKey: ["disbursers"],
    queryFn: adminService.fetchDisbursers,
  });

  const { data: regions, isLoading: isRegionsLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: adminService.fetchRegions,
  });

  const { mutate: createDisburserMutation } = useMutation({
    mutationFn: (newDisburser: Omit<Database["public"]["Tables"]["disbursers"]["Insert"], "id" | "created_at" | "updated_at">) => 
      adminService.createDisburser(newDisburser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursers"] });
      toast({
        title: "Disburser Created",
        description: "New disburser has been created successfully.",
      });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create disburser",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteDisburserMutation } = useMutation({
    mutationFn: (id: string) => adminService.deleteDisburser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disbursers"] });
      toast({
        title: "Disburser Deleted",
        description: "Disburser has been deleted successfully.",
      });
      setIsDeleting(false);
      setDisburserToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete disburser",
        variant: "destructive",
      });
      setIsDeleting(false);
      setDisburserToDelete(null);
    },
  });

  const updateDisburser = async (id: string, data: Disburser) => {
    setIsUpdating(true);
    try {
      // Ensure password is included when updating a disburser
      const updatedData = {
        name: data.name,
        phone_number: data.phone_number,
        region_id: data.region_id,
        password: data.password || '' // Ensure password is always provided
      };
      
      await adminService.updateDisburser(id, updatedData);
      fetchDisbursers();
      toast({
        title: "Disburser Updated",
        description: `Disburser ${data.name} has been updated successfully.`,
      });
      setIsEditing(false);
      setCurrentDisburser(null);
    } catch (error) {
      console.error("Error updating disburser:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update disburser",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirmation = (disburser: Disburser) => {
    setDisburserToDelete(disburser);
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    if (disburserToDelete) {
      deleteDisburserMutation(disburserToDelete.id);
    }
  };

  const filteredDisbursers = disbursers?.filter(
    (disburser) =>
      disburser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disburser.phone_number.includes(searchQuery)
  ) || [];

  if (isLoading || isRegionsLoading) {
    return <div>Loading disbursers and regions...</div>;
  }

  if (isError) {
    return <div>Error fetching data. Please try again.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Disbursers</h1>
            <p className="text-sm text-emerald-200 mt-1">Manage and view registered disbursers</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => fetchDisbursers()} 
              variant="outline"
              className="bg-white/10 border-emerald-500/20 text-emerald-200 hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Disburser
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-emerald-950 border border-emerald-500/20 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Disburser</DialogTitle>
                  <DialogDescription className="text-emerald-200">
                    Create a new disburser account.
                  </DialogDescription>
                </DialogHeader>
                <CreateDisburserForm
                  regions={regions || []}
                  onCreate={createDisburserMutation}
                  onClose={() => setIsCreating(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-emerald-500/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400 h-4 w-4" />
              <Input
                placeholder="Search disbursers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-emerald-500/20 text-white placeholder:text-emerald-200/50"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-sm border-emerald-500/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-emerald-500/20 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-emerald-500/20 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-emerald-500/20 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredDisbursers.length > 0 ? (
            filteredDisbursers.map((disburser) => (
              <DisburserCard 
                key={disburser.id} 
                disburser={disburser}
                onEdit={() => {
                  setIsEditing(true);
                  setCurrentDisburser(disburser);
                }}
                onDelete={() => handleDeleteConfirmation(disburser)}
              />
            ))
          ) : (
            <Card className="col-span-full bg-white/10 backdrop-blur-sm border-emerald-500/20">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-emerald-400/50 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Disbursers Found</h3>
                <p className="text-sm text-emerald-200 text-center max-w-sm">
                  {searchQuery 
                    ? "No disbursers match your search criteria."
                    : "No disbursers are registered yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Disburser Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-emerald-950 border border-emerald-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit Disburser</DialogTitle>
            <DialogDescription className="text-emerald-200">
              Make changes to the selected disburser's account.
            </DialogDescription>
          </DialogHeader>
          {currentDisburser && (
            <EditDisburserForm
              disburser={currentDisburser}
              regions={regions || []}
              onUpdate={updateDisburser}
              onClose={() => {
                setIsEditing(false);
                setCurrentDisburser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="bg-emerald-950 border border-emerald-500/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-emerald-200">
              This action cannot be undone. This will permanently delete the
              disburser and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-emerald-500/20 text-emerald-200 hover:bg-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const DisburserCard = ({ 
  disburser, 
  onEdit, 
  onDelete 
}: { 
  disburser: Disburser; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get initials for avatar
  const initials = disburser.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className="bg-white/10 backdrop-blur-sm border-emerald-500/20 hover:border-emerald-500/40 transition-all"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-emerald-500/20 text-emerald-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white truncate">
                {disburser.name}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <ChevronRight className={`h-4 w-4 text-emerald-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </div>
            
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm text-emerald-200">
                <Phone className="h-4 w-4 mr-2" />
                {disburser.phone_number}
              </div>
              <div className="flex items-center text-sm text-emerald-200">
                <MapPin className="h-4 w-4 mr-2" />
                {REGIONS[parseInt(disburser.region_id) - 1]}
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-emerald-500/20">
                <div className="text-sm text-emerald-200">
                  <p>Created: {new Date(disburser.created_at).toLocaleDateString()}</p>
                  <p>Last Updated: {new Date(disburser.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CreateDisburserFormProps {
  regions: Region[];
  onCreate: (
    disburser: Omit<
      Database["public"]["Tables"]["disbursers"]["Insert"],
      "id" | "created_at" | "updated_at"
    >
  ) => void;
  onClose: () => void;
}

const CreateDisburserForm: React.FC<CreateDisburserFormProps> = ({
  regions,
  onCreate,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [regionId, setRegionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newDisburser = {
        name,
        phone_number: phoneNumber,
        password,
        region_id: regionId,
      };
      onCreate(newDisburser);
    } catch (error: any) {
      console.error("Error creating disburser:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label className="text-emerald-200">Name</Label>
        <Input
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/5 border-emerald-500/20 text-white placeholder:text-emerald-200/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-emerald-200">Phone Number</Label>
        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="bg-white/5 border-emerald-500/20 text-white placeholder:text-emerald-200/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-emerald-200">Password</Label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/5 border-emerald-500/20 text-white placeholder:text-emerald-200/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-emerald-200">Region</Label>
        <Select onValueChange={setRegionId} value={regionId}>
          <SelectTrigger className="bg-white/5 border-emerald-500/20 text-white">
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border border-emerald-500/20">
            {regions.map((region) => (
              <SelectItem 
                key={region.id} 
                value={region.id}
                className="text-white hover:bg-emerald-500/20"
              >
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="bg-white/10 border-emerald-500/20 text-emerald-200 hover:bg-white/20"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {isLoading ? "Creating..." : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface EditDisburserFormProps {
  disburser: Disburser;
  regions: Region[];
  onUpdate: (id: string, disburser: Disburser) => Promise<void>;
  onClose: () => void;
}

const EditDisburserForm: React.FC<EditDisburserFormProps> = ({
  disburser,
  regions,
  onUpdate,
  onClose,
}) => {
  const [name, setName] = useState(disburser.name);
  const [phoneNumber, setPhoneNumber] = useState(disburser.phone_number);
  const [password, setPassword] = useState(disburser.password);
  const [regionId, setRegionId] = useState(disburser.region_id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedDisburser = {
        ...disburser,
        name,
        phone_number: phoneNumber,
        password,
        region_id: regionId,
      };
      await onUpdate(disburser.id, updatedDisburser);
      onClose();
    } catch (error: any) {
      console.error("Error updating disburser:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label className="text-emerald-200">Name</Label>
        <Input
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white/5 border-emerald-500/20 text-white placeholder:text-emerald-200/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-emerald-200">Phone Number</Label>
        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="bg-white/5 border-emerald-500/20 text-white placeholder:text-emerald-200/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-emerald-200">Password</Label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/5 border-emerald-500/20 text-white placeholder:text-emerald-200/50"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-emerald-200">Region</Label>
        <Select onValueChange={setRegionId} value={regionId}>
          <SelectTrigger className="bg-white/5 border-emerald-500/20 text-white">
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent className="bg-emerald-950 border border-emerald-500/20">
            {regions.map((region) => (
              <SelectItem 
                key={region.id} 
                value={region.id}
                className="text-white hover:bg-emerald-500/20"
              >
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="bg-white/10 border-emerald-500/20 text-emerald-200 hover:bg-white/20"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {isLoading ? "Updating..." : "Update"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ManageDisbursers;
