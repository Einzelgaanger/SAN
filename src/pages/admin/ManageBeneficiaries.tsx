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
import { MoreVertical, Edit, Trash2, Plus, UserPlus, Phone, MapPin, ChevronRight, Search, RefreshCw, User, Calendar, FileText, Ruler } from "lucide-react";
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
    return <div className="text-white">Loading beneficiaries and regions...</div>;
  }

  if (isError) {
    return <div className="text-red-500">Error fetching data. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Beneficiaries</h1>
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

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-4">
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

      <div className="space-y-4">
        {isLoading ? (
          // Mobile-friendly loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-white border-gray-200 animate-pulse shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full" />
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
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
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
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Beneficiaries Found</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                {searchQuery 
                  ? "No beneficiaries match your search criteria."
                  : "No beneficiaries are registered yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mobile-optimized dialogs */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Edit Beneficiary</DialogTitle>
            <DialogDescription>
              Make changes to the beneficiary's information.
            </DialogDescription>
          </DialogHeader>
          {currentBeneficiary && (
            <div className="px-6 pb-6">
              <EditBeneficiaryForm
                beneficiary={currentBeneficiary}
                regions={regions || []}
                onUpdate={updateBeneficiary}
                onClose={() => {
                  setIsEditing(false);
                  setCurrentBeneficiary(null);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              beneficiary and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="sm:w-auto w-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="sm:w-auto w-full bg-red-600 hover:bg-red-700 text-white"
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get initials for avatar
  const initials = beneficiary.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Format unique identifiers
  const getUniqueIdentifierDisplay = () => {
    const identifiers = [];
    if (beneficiary.unique_identifiers.national_id) {
      identifiers.push(`National ID: ${beneficiary.unique_identifiers.national_id}`);
    }
    if (beneficiary.unique_identifiers.passport) {
      identifiers.push(`Passport: ${beneficiary.unique_identifiers.passport}`);
    }
    if (beneficiary.unique_identifiers.birth_certificate) {
      identifiers.push(`Birth Certificate: ${beneficiary.unique_identifiers.birth_certificate}`);
    }
    // Add any additional identifiers
    Object.entries(beneficiary.unique_identifiers).forEach(([key, value]) => {
      if (value && !['national_id', 'passport', 'birth_certificate'].includes(key)) {
        identifiers.push(`${key.replace('_', ' ').toUpperCase()}: ${value}`);
      }
    });
    return identifiers.length > 0 ? identifiers.join(', ') : "No unique identifiers";
  };

  return (
    <Card 
      className="bg-white border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500">
              <AvatarFallback className="text-white font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-gray-900">{beneficiary.name}</h3>
              <p className="text-sm text-gray-500">
                {beneficiary.phone_number || "No phone number"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-gray-500 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="truncate">{getUniqueIdentifierDisplay()}</span>
          </div>
          {beneficiary.estimated_age && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
              {beneficiary.estimated_age} years
            </div>
          )}
          {beneficiary.height && (
            <div className="flex items-center text-sm text-gray-600">
              <Ruler className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
              {beneficiary.height} cm
            </div>
          )}
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
            {REGIONS[parseInt(beneficiary.region_id) - 1]}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Details</h4>
                <div className="text-sm text-gray-600">
                  <p className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    {beneficiary.phone_number || "No phone number"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Info</h4>
                <div className="text-sm text-gray-600">
                  <p>Created: {new Date(beneficiary.created_at).toLocaleDateString()}</p>
                  <p>Last Updated: {new Date(beneficiary.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
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
  const [name, setName] = useState(beneficiary.name);
  const [phoneNumber, setPhoneNumber] = useState(beneficiary.phone_number);
  const [idNumber, setIdNumber] = useState(beneficiary.id_number);
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
        region_id: regionId,
      };
      await onUpdate(beneficiary.id, updatedBeneficiary);
      onClose();
    } catch (error: any) {
      console.error("Error updating beneficiary:", error);
    } finally {
      setIsLoading(false);
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
      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? "Updating..." : "Update"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ManageBeneficiaries;
