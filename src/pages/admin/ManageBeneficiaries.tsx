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
import { supabase } from "@/integrations/supabase/client";

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
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*");
      
      if (error) {
        console.error("Error fetching beneficiaries:", error);
        throw new Error(error.message);
      }
      
      return data as Beneficiary[];
    }
  });

  const { data: regions, isLoading: isRegionsLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*");
      
      if (error) {
        console.error("Error fetching regions:", error);
        throw new Error(error.message);
      }
      
      return data as Region[];
    }
  });

  const { mutate: createBeneficiaryMutation } = useMutation({
    mutationFn: async (newBeneficiary: Omit<Database["public"]["Tables"]["beneficiaries"]["Insert"], "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .insert(newBeneficiary)
        .select()
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Beneficiary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast({
        title: "Beneficiary Created",
        description: "New beneficiary has been created successfully.",
      });
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("beneficiaries")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }
    },
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
      const { error } = await supabase
        .from("beneficiaries")
        .update(data)
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }
      
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
      beneficiary?.unique_identifiers?.national_id?.includes(searchQuery) ||
      beneficiary?.unique_identifiers?.passport?.includes(searchQuery) ||
      beneficiary?.unique_identifiers?.birth_certificate?.includes(searchQuery) ||
      beneficiary?.region_id?.toString().includes(searchQuery) ||
      beneficiary?.estimated_age?.toString().includes(searchQuery) ||
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
  const renderFormContent = (type: 'edit') => {
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
        </div>

        {/* Search */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, ID number..."
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
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{beneficiary.name}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Age: {beneficiary.estimated_age}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Ruler className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Height: {beneficiary.height} cm</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Region: {beneficiary.regions?.name || 'Unknown'}</span>
          </div>
          {beneficiary.unique_identifiers?.national_id && (
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm">National ID: {beneficiary.unique_identifiers.national_id}</span>
            </div>
          )}
          {beneficiary.unique_identifiers?.passport && (
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Passport: {beneficiary.unique_identifiers.passport}</span>
            </div>
          )}
          {beneficiary.unique_identifiers?.birth_certificate && (
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Birth Certificate: {beneficiary.unique_identifiers.birth_certificate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
  const [formData, setFormData] = useState({
    name: beneficiary.name,
    estimated_age: beneficiary.estimated_age,
    height: beneficiary.height,
    region_id: beneficiary.region_id,
    unique_identifiers: {
      national_id: beneficiary.unique_identifiers?.national_id || '',
      passport: beneficiary.unique_identifiers?.passport || '',
      birth_certificate: beneficiary.unique_identifiers?.birth_certificate || '',
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(beneficiary.id, {
      ...beneficiary,
      ...formData,
      unique_identifiers: {
        ...beneficiary.unique_identifiers,
        ...formData.unique_identifiers
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="estimated_age">Estimated Age</Label>
        <Input
          id="estimated_age"
          type="number"
          value={formData.estimated_age}
          onChange={(e) => setFormData({ ...formData, estimated_age: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="height">Height (cm)</Label>
        <Input
          id="height"
          type="number"
          value={formData.height}
          onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label htmlFor="region">Region</Label>
        <Select
          value={formData.region_id}
          onValueChange={(value) => setFormData({ ...formData, region_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="national_id">National ID</Label>
        <Input
          id="national_id"
          value={formData.unique_identifiers.national_id}
          onChange={(e) => setFormData({
            ...formData,
            unique_identifiers: {
              ...formData.unique_identifiers,
              national_id: e.target.value
            }
          })}
        />
      </div>
      <div>
        <Label htmlFor="passport">Passport</Label>
        <Input
          id="passport"
          value={formData.unique_identifiers.passport}
          onChange={(e) => setFormData({
            ...formData,
            unique_identifiers: {
              ...formData.unique_identifiers,
              passport: e.target.value
            }
          })}
        />
      </div>
      <div>
        <Label htmlFor="birth_certificate">Birth Certificate</Label>
        <Input
          id="birth_certificate"
          value={formData.unique_identifiers.birth_certificate}
          onChange={(e) => setFormData({
            ...formData,
            unique_identifiers: {
              ...formData.unique_identifiers,
              birth_certificate: e.target.value
            }
          })}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ManageBeneficiaries;
