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
import { MoreVertical, Edit, Trash2, Plus, UserPlus, Phone, MapPin, ChevronRight, Search, RefreshCw, User, Calendar, FileText, Ruler, FileCheck } from "lucide-react";
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

  return (
    <div className="p-3 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Beneficiaries</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage registered beneficiaries</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => fetchBeneficiaries()} 
              variant="outline"
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, ID, age, or height..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Beneficiary List */}
        <div className="space-y-4">
          {isLoading ? (
            // Mobile-friendly loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 animate-pulse shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredBeneficiaries.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {filteredBeneficiaries.map((beneficiary) => (
                <BeneficiaryCard 
                  key={beneficiary.id} 
                  beneficiary={beneficiary}
                  onEdit={() => {
                    setIsEditing(true);
                    setCurrentBeneficiary(beneficiary);
                  }}
                  onDelete={() => handleDeleteConfirmation(beneficiary)}
                />
              ))}
            </div>
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Beneficiary Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className={cn(
          "bg-white border-gray-200 shadow-lg",
          isMobile ? "w-[calc(100%-2rem)] p-4 max-w-md" : ""
        )}>
          <DialogHeader>
            <DialogTitle>Edit Beneficiary</DialogTitle>
            <DialogDescription className="text-gray-500">
              Make changes to the selected beneficiary.
            </DialogDescription>
          </DialogHeader>
          {currentBeneficiary && (
            <EditBeneficiaryForm
              beneficiary={currentBeneficiary}
              regions={regions || []}
              onUpdate={updateBeneficiary}
              onClose={() => {
                setIsEditing(false);
                setCurrentBeneficiary(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className={cn(
          "bg-white border-gray-200 shadow-lg",
          isMobile ? "w-[calc(100%-2rem)] p-4 max-w-md" : ""
        )}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              This action cannot be undone. This will permanently delete the
              beneficiary and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
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
  
  return (
    <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{beneficiary.name}</h3>
              <div className="text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-3">
                <span className="flex items-center">
                  <FileText className="h-3 w-3 mr-1 inline" />
                  ID: {beneficiary.id_number}
                </span>
                {beneficiary.phone_number && (
                  <span className="flex items-center mt-0.5 sm:mt-0">
                    <Phone className="h-3 w-3 mr-1 inline" />
                    {beneficiary.phone_number}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size={isMobile ? "icon" : "sm"}
              onClick={onEdit}
              className="h-8 w-8 sm:h-9 sm:w-9"
              aria-label="Edit"
            >
              <Edit className="h-4 w-4" />
              {!isMobile && <span className="ml-1.5">Edit</span>}
            </Button>
            <Button
              variant="ghost"
              size={isMobile ? "icon" : "sm"}
              onClick={onDelete}
              className="h-8 w-8 sm:h-9 sm:w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
              {!isMobile && <span className="ml-1.5">Delete</span>}
            </Button>
          </div>
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
  const { isMobile } = useIsMobile();
  const [name, setName] = useState(beneficiary.name);
  const [phoneNumber, setPhoneNumber] = useState(beneficiary.phone_number);
  const [idNumber, setIdNumber] = useState(beneficiary.id_number);
  const [regionId, setRegionId] = useState(beneficiary.region_id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedBeneficiary = {
        ...beneficiary,
        name,
        phone_number: phoneNumber,
        id_number: idNumber,
        region_id: regionId,
      };
      await onUpdate(beneficiary.id, updatedBeneficiary);
      onClose();
    } catch (error: any) {
      console.error("Error updating beneficiary:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="space-y-2">
        <Label className="text-gray-400">Name</Label>
        <Input
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-400">Phone Number</Label>
        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-400">ID Number</Label>
        <Input
          placeholder="Enter ID number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
          required
        />
      </div>
      <div className="space-y-2">
        <Label className="text-gray-400">Region</Label>
        <Select onValueChange={setRegionId} value={regionId}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            {regions.map((region) => (
              <SelectItem 
                key={region.id} 
                value={region.id}
                className="text-white hover:bg-gray-800"
              >
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className={isMobile ? "flex-col-reverse space-y-2 space-y-reverse" : ""}>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ManageBeneficiaries;
