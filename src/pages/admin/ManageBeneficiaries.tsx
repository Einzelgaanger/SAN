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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Beneficiaries</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage registered beneficiaries</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => fetchBeneficiaries()} 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
                placeholder="Search by name, phone, ID, region, age, or height..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white border-gray-200 animate-pulse shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full" />
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
      </div>

      {/* Edit Beneficiary Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-white border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Beneficiary</DialogTitle>
            <DialogDescription className="text-gray-500">
              Make changes to the selected beneficiary's information.
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

  return (
    <Card 
      className="bg-white border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12 border-2 border-gray-100">
            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {beneficiary.name}
              </h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              {beneficiary.age && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                  {beneficiary.age} years old
                </div>
              )}
              {beneficiary.height && (
                <div className="flex items-center text-sm text-gray-600">
                  <Ruler className="h-4 w-4 mr-2 text-orange-500" />
                  {beneficiary.height} cm
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-2 text-green-500" />
                ID: {beneficiary.id_number}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-blue-500" />
                {beneficiary.phone_number}
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Details</h4>
                    <div className="text-sm text-gray-600">
                      <p>Created: {new Date(beneficiary.created_at).toLocaleDateString()}</p>
                      <p>Last Updated: {new Date(beneficiary.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</h4>
                    <div className="text-sm text-gray-600">
                      <p>Region: {REGIONS[parseInt(beneficiary.region_id) - 1]}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
