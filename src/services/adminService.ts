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
        quantity
      )
    `);

  if (error) {
    console.error("Error fetching goods:", error);
    throw new Error(error.message);
  }

  // Transform the data to include total quantity
  return data.map(good => ({
    ...good,
    quantity: good.regional_goods?.reduce((sum, rg) => sum + (rg.quantity || 0), 0) || 0
  }));
};

export const createGood = async (data: { name: string; description?: string; quantity: number }): Promise<Good> => {
  try {
    // First create the goods type
    const { data: good, error: goodError } = await supabase
      .from("goods_types")
      .insert([{ 
        name: data.name, 
        description: data.description
      }])
      .select()
      .single();

    if (goodError) throw goodError;

    // Create initial quantity in regional_goods
    const { error: quantityError } = await supabase
      .from("regional_goods")
      .insert([{
        goods_type_id: good.id,
        quantity: data.quantity
      }]);

    if (quantityError) throw quantityError;

    // Fetch the complete good data
    const { data: completeGood, error: fetchError } = await supabase
      .from("goods_types")
      .select(`
        *,
        regional_goods (
          quantity
        )
      `)
      .eq("id", good.id)
      .single();

    if (fetchError) throw fetchError;

    return {
      ...completeGood,
      quantity: completeGood.regional_goods?.reduce((sum, rg) => sum + (rg.quantity || 0), 0) || 0
    };
  } catch (error) {
    console.error("Error creating good:", error);
    throw error;
  }
};

export const updateGood = async (good: Good): Promise<Good> => {
  try {
    // Update the goods type
    const { data: updatedGood, error: goodError } = await supabase
      .from("goods_types")
      .update({
        name: good.name,
        description: good.description
      })
      .eq("id", good.id)
      .select()
      .single();

    if (goodError) throw goodError;

    // Update the quantity in regional_goods
    const { error: quantityError } = await supabase
      .from("regional_goods")
      .update({ quantity: good.quantity })
      .eq("goods_type_id", good.id);

    if (quantityError) throw quantityError;

    return {
      ...updatedGood,
      quantity: good.quantity
    };
  } catch (error) {
    console.error("Error updating good:", error);
    throw error;
  }
};

export const deleteGood = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("goods_types")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting good:", error);
    throw new Error(error.message);
  }
};
