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
import { MoreVertical, Edit, Trash2, Plus, UserPlus, Phone, MapPin, ChevronRight, Search, RefreshCw, FileText, User, X, LogOut } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useAuth } from "@/hooks/useAuth";

const ManageDisbursers = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentDisburser, setCurrentDisburser] = useState<Disburser | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [disburserToDelete, setDisburserToDelete] = useState<Disburser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isMobile } = useIsMobile();
  const { logout } = useAuth();

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
      disburser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disburser?.phone_number?.includes(searchQuery) ||
      disburser?.region_id?.toString().includes(searchQuery)
  ) || [];

  if (isLoading || isRegionsLoading) {
    return <div className="flex justify-center items-center p-8">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-green-100 rounded-full mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mb-2.5"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>;
  }

  if (isError) {
    return <div className="p-6 text-center">
      <div className="text-red-500 mb-2">Error fetching data</div>
      <Button 
        onClick={() => fetchDisbursers()} 
        variant="outline"
        size="sm"
        className="mx-auto"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </div>;
  }

  // Mobile & Desktop Content Rendering Components
  const renderFormContent = (type: 'create' | 'edit') => {
    if (type === 'create') {
      return (
        <CreateDisburserForm
          regions={regions || []}
          onCreate={createDisburserMutation}
          onClose={() => setIsCreating(false)}
        />
      );
    } else {
      return currentDisburser && (
        <EditDisburserForm
          disburser={currentDisburser}
          regions={regions || []}
          onUpdate={updateDisburser}
          onClose={() => {
            setIsEditing(false);
            setCurrentDisburser(null);
          }}
        />
      );
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-16 sm:pb-6">
        {/* Fixed mobile action buttons at bottom of screen */}
        {isMobile && (
          <div className="fixed bottom-4 right-4 z-10 flex flex-col gap-2 items-end">
            <Button
              onClick={() => setIsCreating(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Disbursers</h1>
            <p className="text-gray-600">Manage disburser accounts and permissions</p>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, phone, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 h-11"
              />
              {searchQuery && (
                <Button
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Disburser List */}
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
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Disbursers Found</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  {searchQuery 
                    ? "No disbursers match your search criteria."
                    : "No disbursers are registered yet."}
                </p>
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dynamic dialog rendering based on device type */}
      {isMobile ? (
        <>
          {/* Mobile Edit Disburser Drawer */}
          <Drawer open={isEditing} onOpenChange={setIsEditing}>
            <DrawerContent className="max-h-[90vh] px-4 pb-6 pt-4">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Edit Disburser</DrawerTitle>
                <DrawerDescription className="text-gray-500">
                  Make changes to the selected disburser's account.
                </DrawerDescription>
              </DrawerHeader>
              {renderFormContent('edit')}
            </DrawerContent>
          </Drawer>

          {/* Mobile Create Disburser Drawer */}
          <Drawer open={isCreating} onOpenChange={setIsCreating}>
            <DrawerContent className="max-h-[90vh] px-4 pb-6 pt-4">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Add New Disburser</DrawerTitle>
                <DrawerDescription className="text-gray-500">
                  Create a new disburser account.
                </DrawerDescription>
              </DrawerHeader>
              {renderFormContent('create')}
            </DrawerContent>
          </Drawer>

          {/* Mobile Delete Confirmation */}
          <Drawer open={isDeleting} onOpenChange={setIsDeleting}>
            <DrawerContent className="px-4 pb-6 pt-4">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Delete Disburser</DrawerTitle>
                <DrawerDescription className="text-gray-500">
                  This action cannot be undone. This will permanently delete the
                  disburser and remove their data from the system.
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex flex-col gap-2 pt-2 px-1">
                <Button 
                  onClick={handleConfirmDelete} 
                  className="bg-red-600 hover:bg-red-700 text-white h-12"
                >
                  Delete
                </Button>
                <Button 
                  onClick={() => setIsDeleting(false)} 
                  variant="outline" 
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      ) : (
        <>
          {/* Desktop Edit Disburser Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="bg-white border-gray-200 shadow-lg">
              <DialogHeader>
                <DialogTitle>Edit Disburser</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Make changes to the selected disburser's account.
                </DialogDescription>
              </DialogHeader>
              {renderFormContent('edit')}
            </DialogContent>
          </Dialog>

          {/* Desktop Delete Confirmation Dialog */}
          <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
            <AlertDialogContent className="bg-white border-gray-200 shadow-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500">
                  This action cannot be undone. This will permanently delete the
                  disburser and remove their data from the system.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleConfirmDelete} 
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Desktop Create Disburser Dialog */}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent className="bg-white border-gray-200 shadow-lg">
              <DialogHeader>
                <DialogTitle>Add New Disburser</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Create a new disburser account.
                </DialogDescription>
              </DialogHeader>
              {renderFormContent('create')}
            </DialogContent>
          </Dialog>
        </>
      )}
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
  const { isMobile } = useIsMobile();
  const { data: regions } = useQuery({
    queryKey: ["regions"],
    queryFn: adminService.fetchRegions,
  });
  
  return (
    <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow active:bg-gray-50">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1" onClick={onEdit}>
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex-shrink-0">
              <AvatarFallback className="text-blue-600 bg-blue-100">
                {disburser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900 text-sm sm:text-base">{disburser.name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                  <Phone className="h-3 w-3 mr-1 inline flex-shrink-0" />
                  {disburser.phone_number}
                </p>
                <p className="text-xs text-gray-400 hidden sm:inline">•</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  <MapPin className="h-3 w-3 mr-1 inline flex-shrink-0" />
                  {regions?.find(r => r.id === disburser.region_id)?.name || 'Unknown Region'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
            <Button
              variant="ghost"
              size={isMobile ? "icon" : "sm"}
              onClick={onEdit}
              className="h-10 w-10 sm:h-9 sm:w-9 rounded-full sm:rounded-md"
              aria-label="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size={isMobile ? "icon" : "sm"}
              onClick={onDelete}
              className="h-10 w-10 sm:h-9 sm:w-9 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full sm:rounded-md"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
  const { isMobile } = useIsMobile();
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
        region_id: regionId
      };
      await onCreate(newDisburser);
      onClose();
    } catch (error: any) {
      console.error("Error creating disburser:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Name</Label>
        <Input
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
            : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Phone Number</Label>
        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
            : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Password</Label>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
            : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          }
        />
      </div>
      <div className="space-y-2">
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Region</Label>
        <Select onValueChange={setRegionId} value={regionId}>
          <SelectTrigger className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 h-12" 
            : "bg-gray-800 border-gray-700 text-white"
          }>
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent className={isMobile 
            ? "bg-white border border-gray-300" 
            : "bg-gray-900 border border-gray-800"
          }>
            {regions.map((region) => (
              <SelectItem 
                key={region.id} 
                value={region.id}
                className={isMobile ? "text-gray-900" : "text-white hover:bg-gray-800"}
              >
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isMobile ? (
        <div className="flex flex-col gap-2 mt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? "Creating..." : "Create Disburser"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="h-12"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Disburser"}
          </Button>
        </DialogFooter>
      )}
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
  const { isMobile } = useIsMobile();
  const [name, setName] = useState(disburser.name);
  const [phoneNumber, setPhoneNumber] = useState(disburser.phone_number);
  const [password, setPassword] = useState(disburser.password || "");
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
    } catch (error: any) {
      console.error("Error updating disburser:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Name</Label>
        <Input
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
            : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Phone Number</Label>
        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
            : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>
          {password ? "Change Password" : "Set Password"}
        </Label>
        <Input
          type="password"
          placeholder={password ? "Enter new password" : "Enter password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
            : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          }
        />
      </div>
      <div className="space-y-2">
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Region</Label>
        <Select onValueChange={setRegionId} value={regionId}>
          <SelectTrigger className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 h-12" 
            : "bg-gray-800 border-gray-700 text-white"
          }>
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent className={isMobile 
            ? "bg-white border border-gray-300" 
            : "bg-gray-900 border border-gray-800"
          }>
            {regions.map((region) => (
              <SelectItem 
                key={region.id} 
                value={region.id}
                className={isMobile ? "text-gray-900" : "text-white hover:bg-gray-800"}
              >
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isMobile ? (
        <div className="flex flex-col gap-2 mt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? "Updating..." : "Update Disburser"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="h-12"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Disburser"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );
};

export default ManageDisbursers;
