import { supabase } from "@/integrations/supabase/client";
import { Beneficiary, Allocation, FraudAlert, RegionalGoods, GoodsType } from "@/types/database";
import { Database } from "@/integrations/supabase/types";

// Helper function to validate UUIDs
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const registerBeneficiary = async (beneficiary: Omit<Database["public"]["Tables"]["beneficiaries"]["Insert"], "id" | "created_at" | "updated_at">): Promise<Beneficiary> => {
  // Ensure region_id is a valid UUID
  if (!beneficiary.region_id || !isValidUUID(beneficiary.region_id)) {
    throw new Error(`Invalid region ID: ${beneficiary.region_id}`);
  }

  const { data, error } = await supabase
    .from("beneficiaries")
    .insert(beneficiary)
    .select()
    .single();

  if (error) {
    console.error("Error registering beneficiary:", error);
    throw new Error(error.message);
  }

  return data as Beneficiary;
};

export const fetchBeneficiariesByRegion = async (regionId: string): Promise<Beneficiary[]> => {
  // Ensure regionId is a valid UUID
  if (!regionId || !isValidUUID(regionId)) {
    console.error("Invalid region ID:", regionId);
    return [];
  }

  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("region_id", regionId);

  if (error) {
    console.error("Error fetching beneficiaries:", error);
    throw new Error(error.message);
  }

  return data as Beneficiary[];
};

export const fetchBeneficiaryById = async (id: string): Promise<Beneficiary> => {
  if (!isValidUUID(id)) {
    throw new Error(`Invalid beneficiary ID: ${id}`);
  }

  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching beneficiary:", error);
    throw new Error(error.message);
  }

  return data as Beneficiary;
};

export const fetchRegionalGoods = async (regionId: string): Promise<RegionalGoods[]> => {
  if (!isValidUUID(regionId)) {
    throw new Error(`Invalid region ID: ${regionId}`);
  }
  
  const { data, error } = await supabase
    .from("regional_goods")
    .select(`
      *,
      goods_types:goods_type_id (id, name, description, created_at)
    `)
    .eq("region_id", regionId);

  if (error) {
    console.error("Error fetching regional goods:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const fetchGoodsTypes = async (): Promise<GoodsType[]> => {
  const { data, error } = await supabase
    .from("goods_types")
    .select("*");

  if (error) {
    console.error("Error fetching goods types:", error);
    throw new Error(error.message);
  }

  return data || [];
};

export const checkRecentAllocation = async (beneficiaryId: string, timeWindowMinutes = 5): Promise<boolean> => {
  if (!isValidUUID(beneficiaryId)) {
    throw new Error(`Invalid beneficiary ID: ${beneficiaryId}`);
  }
  
  // Calculate time threshold (now - X minutes)
  const threshold = new Date();
  threshold.setMinutes(threshold.getMinutes() - timeWindowMinutes);
  
  const { data, error } = await supabase
    .from("allocations")
    .select("id")
    .eq("beneficiary_id", beneficiaryId)
    .gt("allocated_at", threshold.toISOString())
    .limit(1);

  if (error) {
    console.error("Error checking recent allocations:", error);
    throw new Error(error.message);
  }

  // If data exists and has length > 0, there was a recent allocation
  return data && data.length > 0;
};

export const fetchAllocations = async (beneficiaryId?: string): Promise<Allocation[]> => {
  let query = supabase
    .from("allocations")
    .select(`
      *,
      beneficiaries:beneficiary_id (name),
      disbursers:disburser_id (name)
    `);

  if (beneficiaryId) {
    if (!isValidUUID(beneficiaryId)) {
      throw new Error(`Invalid beneficiary ID: ${beneficiaryId}`);
    }
    query = query.eq("beneficiary_id", beneficiaryId);
  }

  const { data, error } = await query.order("allocated_at", { ascending: false });

  if (error) {
    console.error("Error fetching allocations:", error);
    throw new Error(error.message);
  }

  return data as Allocation[];
};

export const createAllocation = async (allocation: Omit<Database["public"]["Tables"]["allocations"]["Insert"], "id" | "allocated_at">): Promise<Allocation> => {
  if (!isValidUUID(allocation.beneficiary_id)) {
    throw new Error(`Invalid beneficiary ID: ${allocation.beneficiary_id}`);
  }

  if (!isValidUUID(allocation.disburser_id)) {
    throw new Error(`Invalid disburser ID: ${allocation.disburser_id}`);
  }
  
  const { data, error } = await supabase
    .from("allocations")
    .insert(allocation)
    .select()
    .single();

  if (error) {
    console.error("Error creating allocation:", error);
    throw new Error(error.message);
  }

  return data as Allocation;
};

export const createFraudAlert = async (alert: Omit<Database["public"]["Tables"]["fraud_alerts"]["Insert"], "id" | "attempted_at">): Promise<FraudAlert> => {
  if (!isValidUUID(alert.beneficiary_id)) {
    throw new Error(`Invalid beneficiary ID: ${alert.beneficiary_id}`);
  }

  if (!isValidUUID(alert.disburser_id)) {
    throw new Error(`Invalid disburser ID: ${alert.disburser_id}`);
  }
  
  const { data, error } = await supabase
    .from("fraud_alerts")
    .insert(alert)
    .select()
    .single();

  if (error) {
    console.error("Error creating fraud alert:", error);
    throw new Error(error.message);
  }

  return data as FraudAlert;
};

export const fetchFraudAlerts = async (): Promise<FraudAlert[]> => {
  const { data, error } = await supabase
    .from("fraud_alerts")
    .select(`
      *,
      beneficiaries:beneficiary_id (name),
      disbursers:disburser_id (name)
    `)
    .order("attempted_at", { ascending: false });

  if (error) {
    console.error("Error fetching fraud alerts:", error);
    throw new Error(error.message);
  }

  return data as FraudAlert[];
};

export const updateRegionalGoodsQuantity = async (goodsId: string, quantity: number): Promise<void> => {
  if (!isValidUUID(goodsId)) {
    throw new Error(`Invalid goods ID: ${goodsId}`);
  }
  
  const { error } = await supabase
    .from("regional_goods")
    .update({ quantity })
    .eq("id", goodsId);

  if (error) {
    console.error("Error updating regional goods quantity:", error);
    throw new Error(error.message);
  }
};
