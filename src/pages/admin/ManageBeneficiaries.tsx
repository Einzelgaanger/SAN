/// <reference types="react" />
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
import { MoreVertical, Edit, Trash2, Plus, UserPlus, Phone, MapPin, ChevronRight, Search, RefreshCw, User, Calendar, FileText, Ruler, FileCheck, X, LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as adminService from "@/services/adminService";
import { Beneficiary, Region } from "@/types/database";
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

// Add type declarations for adminService functions
declare module "@/services/adminService" {
  export function fetchBeneficiaries(): Promise<Beneficiary[]>;
  export function createBeneficiary(
    beneficiary: Omit<Database["public"]["Tables"]["beneficiaries"]["Insert"], "id" | "created_at" | "updated_at">
  ): Promise<Beneficiary>;
  export function deleteBeneficiary(id: string): Promise<void>;
  export function updateBeneficiary(id: string, beneficiary: Beneficiary): Promise<Beneficiary>;
  export function fetchRegions(): Promise<Region[]>;
}

// Add type declarations for BeneficiaryCardProps
interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
  key?: string | number;
}

// Add type declarations for BeneficiaryFormProps
interface BeneficiaryFormProps {
  beneficiary?: Beneficiary;
  onSubmit: (data: Omit<Database["public"]["Tables"]["beneficiaries"]["Insert"], "id" | "created_at" | "updated_at">) => void;
  onCancel: () => void;
}

const ManageBeneficiaries = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentBeneficiary, setCurrentBeneficiary] = useState<Beneficiary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState<Beneficiary | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { isMobile } = useIsMobile();
  const { logout } = useAuth();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: beneficiaries,
    isLoading,
    isError,
    refetch: fetchBeneficiaries,
  } = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: adminService.fetchBeneficiaries,
  });

  const { data: regions, isLoading: isRegionsLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: adminService.fetchRegions,
  });

  const { mutate: createBeneficiaryMutation } = useMutation({
    mutationFn: (newBeneficiary: Omit<Database["public"]["Tables"]["beneficiaries"]["Insert"], "id" | "created_at" | "updated_at">) => 
      adminService.createBeneficiary(newBeneficiary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast({
        title: "Beneficiary Created",
        description: "New beneficiary has been created successfully.",
      });
      setIsCreating(false);
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create beneficiary",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteBeneficiaryMutation } = useMutation({
    mutationFn: (id: string) => adminService.deleteBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast({
        title: "Beneficiary Deleted",
        description: "Beneficiary has been deleted successfully.",
      });
      setIsDeleting(false);
      setBeneficiaryToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete beneficiary",
        variant: "destructive",
      });
      setIsDeleting(false);
      setBeneficiaryToDelete(null);
    },
  });

  const updateBeneficiary = async (id: string, data: Beneficiary) => {
    setIsUpdating(true);
    try {
      const updatedBeneficiary = {
        ...data,
        id,
      };
      await adminService.updateBeneficiary(id, updatedBeneficiary);
      fetchBeneficiaries();
      toast({
        title: "Beneficiary Updated",
        description: `Beneficiary ${data.name} has been updated successfully.`,
      });
      setIsEditing(false);
      setCurrentBeneficiary(null);
    } catch (error) {
      console.error("Error updating beneficiary:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update beneficiary",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConfirmation = (beneficiary: Beneficiary) => {
    setBeneficiaryToDelete(beneficiary);
    setIsDeleting(true);
  };

  const handleConfirmDelete = () => {
    if (beneficiaryToDelete) {
      deleteBeneficiaryMutation(beneficiaryToDelete.id);
    }
  };

  const filteredBeneficiaries = beneficiaries?.filter(
    (beneficiary) =>
      beneficiary?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary?.phone_number?.includes(searchQuery) ||
      beneficiary?.id_number?.includes(searchQuery) ||
      beneficiary?.region_id?.toString().includes(searchQuery) ||
      beneficiary?.age?.toString().includes(searchQuery) ||
      beneficiary?.height?.toString().includes(searchQuery)
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
        onClick={() => fetchBeneficiaries()} 
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
        <CreateBeneficiaryForm
          regions={regions || []}
          onCreate={createBeneficiaryMutation}
          onClose={() => setIsCreating(false)}
        />
      );
    } else {
      return currentBeneficiary && (
        <EditBeneficiaryForm
          beneficiary={currentBeneficiary}
          regions={regions || []}
          onUpdate={updateBeneficiary}
          onClose={() => {
            setIsEditing(false);
            setCurrentBeneficiary(null);
          }}
        />
      );
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-16 sm:pb-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
            <p className="text-gray-600">Manage beneficiary accounts and information</p>
          </div>
          {!isMobile && (
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Beneficiary
            </Button>
          )}
        </div>

        {/* Search */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, phone, ID number..."
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

        {/* Beneficiary List */}
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
          ) : filteredBeneficiaries.length > 0 ? (
            filteredBeneficiaries.map((beneficiary) => (
              <BeneficiaryCard 
                key={beneficiary.id} 
                beneficiary={beneficiary}
                onEdit={() => {
                  setIsEditing(true);
                  setCurrentBeneficiary(beneficiary);
                }}
                onDelete={() => handleDeleteConfirmation(beneficiary)}
              />
            ))
          ) : (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                <UserPlus className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Beneficiaries Found</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  {searchQuery 
                    ? "No beneficiaries match your search criteria."
                    : "No beneficiaries are registered yet."}
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
          {/* Mobile Edit Beneficiary Drawer */}
          <Drawer open={isEditing} onOpenChange={setIsEditing}>
            <DrawerContent className="max-h-[90vh] px-4 pb-6 pt-4">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Edit Beneficiary</DrawerTitle>
                <DrawerDescription className="text-gray-500">
                  Make changes to the selected beneficiary's information.
                </DrawerDescription>
              </DrawerHeader>
              {renderFormContent('edit')}
            </DrawerContent>
          </Drawer>

          {/* Mobile Create Beneficiary Drawer */}
          <Drawer open={isCreating} onOpenChange={setIsCreating}>
            <DrawerContent className="max-h-[90vh] px-4 pb-6 pt-4">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Add New Beneficiary</DrawerTitle>
                <DrawerDescription className="text-gray-500">
                  Register a new beneficiary in the system.
                </DrawerDescription>
              </DrawerHeader>
              {renderFormContent('create')}
            </DrawerContent>
          </Drawer>

          {/* Mobile Delete Confirmation */}
          <Drawer open={isDeleting} onOpenChange={setIsDeleting}>
            <DrawerContent className="px-4 pb-6 pt-4">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Delete Beneficiary</DrawerTitle>
                <DrawerDescription className="text-gray-500">
                  This action cannot be undone. This will permanently delete the
                  beneficiary and remove their data from the system.
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
          {/* Desktop Edit Beneficiary Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="bg-white border-gray-200 shadow-lg">
              <DialogHeader>
                <DialogTitle>Edit Beneficiary</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Make changes to the selected beneficiary's information.
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
                  beneficiary and remove their data from the system.
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

          {/* Desktop Create Beneficiary Dialog */}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent className="bg-white border-gray-200 shadow-lg">
              <DialogHeader>
                <DialogTitle>Add New Beneficiary</DialogTitle>
                <DialogDescription className="text-gray-500">
                  Register a new beneficiary in the system.
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

const BeneficiaryCard = ({ 
  beneficiary, 
  onEdit, 
  onDelete 
}: { 
  beneficiary: Beneficiary; 
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
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{beneficiary.name}</h3>
              <div className="text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-3">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1 inline" />
                  {beneficiary.estimated_age} years
                </span>
                <span className="flex items-center mt-0.5 sm:mt-0">
                  <Ruler className="h-3 w-3 mr-1 inline" />
                  {beneficiary.height} cm
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0">
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

interface CreateBeneficiaryFormProps {
  regions: Region[];
  onCreate: (
    beneficiary: Omit<
      Database["public"]["Tables"]["beneficiaries"]["Insert"],
      "id" | "created_at" | "updated_at"
    >
  ) => void;
  onClose: () => void;
}

const CreateBeneficiaryForm: React.FC<CreateBeneficiaryFormProps> = ({
  regions,
  onCreate,
  onClose,
}) => {
  const { isMobile } = useIsMobile();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [regionId, setRegionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newBeneficiary = {
        name,
        phone_number: phoneNumber,
        id_number: idNumber,
        age: parseInt(age) || 0,
        height: parseFloat(height) || 0,
        region_id: regionId
      };
      await onCreate(newBeneficiary);
      onClose();
    } catch (error: any) {
      console.error("Error creating beneficiary:", error);
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
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>ID Number</Label>
        <Input
          placeholder="Enter ID number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
            : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          }
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Age</Label>
          <Input
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={isMobile 
              ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
              : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Height (cm)</Label>
          <Input
            type="number"
            placeholder="Enter height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className={isMobile 
              ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
              : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            }
            required
          />
        </div>
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
            {isLoading ? "Creating..." : "Create Beneficiary"}
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
            {isLoading ? "Creating..." : "Create Beneficiary"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );
};

interface EditBeneficiaryFormProps {
  beneficiary: Beneficiary;
  regions: Region[];
  onUpdate: (id: string, beneficiary: Beneficiary) => Promise<void>;
  onClose: () => void;
}

const EditBeneficiaryForm: React.FC<EditBeneficiaryFormProps> = ({
  beneficiary,
  regions,
  onUpdate,
  onClose,
}) => {
  const { isMobile } = useIsMobile();
  const [name, setName] = useState(beneficiary.name);
  const [phoneNumber, setPhoneNumber] = useState(beneficiary.phone_number);
  const [idNumber, setIdNumber] = useState(beneficiary.id_number);
  const [age, setAge] = useState(beneficiary.age?.toString() || "");
  const [height, setHeight] = useState(beneficiary.height?.toString() || "");
  const [regionId, setRegionId] = useState(beneficiary.region_id);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedBeneficiary = {
        ...beneficiary,
        name,
        phone_number: phoneNumber,
        id_number: idNumber,
        age: parseInt(age) || 0,
        height: parseFloat(height) || 0,
        region_id: regionId,
      };
      await onUpdate(beneficiary.id, updatedBeneficiary);
    } catch (error: any) {
      console.error("Error updating beneficiary:", error);
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
        <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>ID Number</Label>
        <Input
          placeholder="Enter ID number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className={isMobile 
            ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
            : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          }
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Age</Label>
          <Input
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={isMobile 
              ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
              : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label className={isMobile ? "text-gray-700" : "text-gray-400"}>Height (cm)</Label>
          <Input
            type="number"
            placeholder="Enter height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className={isMobile 
              ? "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12"
              : "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            }
            required
          />
        </div>
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
            {isLoading ? "Updating..." : "Update Beneficiary"}
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
            {isLoading ? "Updating..." : "Update Beneficiary"}
          </Button>
        </DialogFooter>
      )}
    </form>
  );
};

export default ManageBeneficiaries;
