import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
type Disburser = Database['public']['Tables']['disbursers']['Row'];
type Region = Database['public']['Tables']['regions']['Row'];
type GoodsType = Database['public']['Tables']['goods_types']['Row'];
type RegionalGoods = Database['public']['Tables']['regional_goods']['Row'];
type Allocation = Database['public']['Tables']['allocations']['Row'];
type FraudAlert = Database['public']['Tables']['fraud_alerts']['Row'];

export const adminService = {
  async fetchBeneficiaries() {
    const { data, error } = await supabase
      .from("beneficiaries")
      .select(`
        *,
        regions (
          name
        )
      `);

    if (error) {
      console.error("Error fetching beneficiaries:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async createBeneficiary(data: Omit<Database['public']['Tables']['beneficiaries']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
    const { data: result, error } = await supabase
      .from("beneficiaries")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating beneficiary:", error);
      throw new Error(error.message);
    }

    return result;
  },

  async updateBeneficiary(id: string, data: Database['public']['Tables']['beneficiaries']['Update']) {
    const { data: result, error } = await supabase
      .from("beneficiaries")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating beneficiary:", error);
      throw new Error(error.message);
    }

    return result;
  },

  async deleteBeneficiary(id: string) {
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
  },

  async fetchAllocations() {
    const { data, error } = await supabase
      .from("allocations")
      .select(`
        *,
        beneficiaries (
          name,
          phone_number,
          regions (
            name
          )
        ),
        goods_types (
          name
        ),
        disbursers (
          name
        )
      `);

    if (error) {
      console.error("Error fetching allocations:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async fetchFraudAlerts() {
    const { data, error } = await supabase
      .from("fraud_alerts")
      .select(`
        *,
        beneficiaries (
          name,
          phone_number,
          regions (
            name
          )
        )
      `);

    if (error) {
      console.error("Error fetching fraud alerts:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async fetchGoodsTypes() {
    const { data, error } = await supabase
      .from("goods_types")
      .select("*");

    if (error) {
      console.error("Error fetching goods types:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async createGoodsType(data: Omit<Database['public']['Tables']['goods_types']['Insert'], 'id' | 'created_at'>) {
    const { data: result, error } = await supabase
      .from("goods_types")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("Error creating goods type:", error);
      throw new Error(error.message);
    }

    return result;
  },

  async updateGoodsType(id: string, data: Database['public']['Tables']['goods_types']['Update']) {
    const { data: result, error } = await supabase
      .from("goods_types")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating goods type:", error);
      throw new Error(error.message);
    }

    return result;
  },

  async fetchRegionalGoods() {
    const { data, error } = await supabase
      .from("regional_goods")
      .select(`
        *,
        goods_types (
          *
        ),
        regions (
          name
        )
      `);

    if (error) {
      console.error("Error fetching regional goods:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async updateRegionalGoods(id: string, data: Database['public']['Tables']['regional_goods']['Update']) {
    const { data: result, error } = await supabase
      .from("regional_goods")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating regional goods:", error);
      throw new Error(error.message);
    }

    return result;
  },

  async fetchDisbursers() {
    const { data, error } = await supabase
      .from("disbursers")
      .select(`
        *,
        regions (
          name
        )
      `);

    if (error) {
      console.error("Error fetching disbursers:", error);
      throw new Error(error.message);
    }

    return data || [];
  },

  async fetchRegions() {
    const { data, error } = await supabase
      .from("regions")
      .select("*");

    if (error) {
      console.error("Error fetching regions:", error);
      throw new Error(error.message);
    }

    return data || [];
  }
};
