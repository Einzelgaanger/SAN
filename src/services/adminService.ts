import { supabase } from "@/integrations/supabase/client";
import { Disburser, Region, Beneficiary, Good } from "@/types/database";
import { Database } from "@/integrations/supabase/types";

// Beneficiaries functions
export const fetchBeneficiaries = async (): Promise<Beneficiary[]> => {
  const { data, error } = await supabase
    .from("beneficiaries")
    .select(`
      *,
      regions:region_id (name)
    `);

  if (error) {
    console.error("Error fetching beneficiaries:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createBeneficiary = async (beneficiary: Omit<Database["public"]["Tables"]["beneficiaries"]["Insert"], "id" | "created_at" | "updated_at">): Promise<Beneficiary> => {
  const { data, error } = await supabase
    .from("beneficiaries")
    .insert(beneficiary)
    .select()
    .single();

  if (error) {
    console.error("Error creating beneficiary:", error);
    throw new Error(error.message);
  }

  return data;
};

export const updateBeneficiary = async (id: string, beneficiary: Beneficiary): Promise<Beneficiary> => {
  const { data, error } = await supabase
    .from("beneficiaries")
    .update(beneficiary)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating beneficiary:", error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteBeneficiary = async (id: string): Promise<void> => {
  // First delete related allocations
  const { error: allocationsError } = await supabase
    .from("allocations")
    .delete()
    .eq("beneficiary_id", id);

  if (allocationsError) {
    console.error("Error deleting related allocations:", allocationsError);
    throw new Error(allocationsError.message);
  }

  // Then delete related fraud alerts
  const { error: fraudAlertsError } = await supabase
    .from("fraud_alerts")
    .delete()
    .eq("beneficiary_id", id);

  if (fraudAlertsError) {
    console.error("Error deleting related fraud alerts:", fraudAlertsError);
    throw new Error(fraudAlertsError.message);
  }

  // Finally delete the beneficiary
  const { error } = await supabase
    .from("beneficiaries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting beneficiary:", error);
    throw new Error(error.message);
  }
};

// Disbursers functions
export const fetchDisbursers = async (): Promise<Disburser[]> => {
  const { data, error } = await supabase
    .from("disbursers")
    .select(`
      *,
      regions:region_id (name)
    `);

  if (error) {
    console.error("Error fetching disbursers:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const fetchRegions = async (): Promise<Region[]> => {
  const { data, error } = await supabase
    .from("regions")
    .select("*");

  if (error) {
    console.error("Error fetching regions:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createDisburser = async (disburser: Omit<Database["public"]["Tables"]["disbursers"]["Insert"], "id" | "created_at" | "updated_at">): Promise<Disburser> => {
  const { data, error } = await supabase
    .from("disbursers")
    .insert(disburser)
    .select()
    .single();

  if (error) {
    console.error("Error creating disburser:", error);
    throw new Error(error.message);
  }

  return data;
};

export const updateDisburser = async (id: string, disburser: Partial<Database["public"]["Tables"]["disbursers"]["Update"]>): Promise<Disburser> => {
  const { data, error } = await supabase
    .from("disbursers")
    .update(disburser)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating disburser:", error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteDisburser = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("disbursers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting disburser:", error);
    throw new Error(error.message);
  }
};

export const createRegion = async (region: Omit<Database["public"]["Tables"]["regions"]["Insert"], "id" | "created_at">): Promise<Region> => {
  const { data, error } = await supabase
    .from("regions")
    .insert(region)
    .select()
    .single();

  if (error) {
    console.error("Error creating region:", error);
    throw new Error(error.message);
  }

  return data;
};

// Goods functions
export const fetchGoods = async (): Promise<Good[]> => {
  const { data, error } = await supabase
    .from("goods_types")
    .select(`
      *,
      regional_goods (
        id,
        quantity,
        region_id
      )
    `);

  if (error) {
    console.error("Error fetching goods:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const createGood = async (good: Omit<Database["public"]["Tables"]["goods"]["Insert"], "id" | "created_at">): Promise<Good> => {
  const { data, error } = await supabase
    .from("goods")
    .insert(good)
    .select()
    .single();

  if (error) {
    console.error("Error creating good:", error);
    throw new Error(error.message);
  }

  return data;
};

export const updateGood = async (good: Good): Promise<Good> => {
  const { data, error } = await supabase
    .from("goods")
    .update(good)
    .eq("id", good.id)
    .select()
    .single();

  if (error) {
    console.error("Error updating good:", error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteGood = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("goods")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting good:", error);
    throw new Error(error.message);
  }
};
