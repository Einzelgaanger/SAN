
import { Database as SupabaseDatabase } from "@/integrations/supabase/types";
import { Json } from "@/integrations/supabase/types";

export type Tables<T extends keyof SupabaseDatabase["public"]["Tables"]> = 
  SupabaseDatabase["public"]["Tables"][T]["Row"];

export interface Admin {
  id: string;
  username: string;
  password: string;
  name: string;
  created_at: string;
}

export interface Region {
  id: string;
  name: string;
  created_at: string;
}

export interface Disburser {
  id: string;
  name: string;
  phone_number: string;
  password: string;
  region_id: string;
  created_at: string;
  updated_at: string;
  regions?: { name: string };
}

export interface Beneficiary {
  id: string;
  name: string;
  height?: number;
  estimated_age?: number;
  unique_identifiers: Json;
  registered_by: string;
  region_id: string;
  created_at: string;
  updated_at: string;
}

export interface GoodsType {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface RegionalGoods {
  id: string;
  goods_type_id: string;
  region_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  goods_types?: {
    id: string;
    name: string;
    description?: string;
    created_at: string;
  };
}

export interface Allocation {
  id: string;
  beneficiary_id: string;
  disburser_id: string;
  goods: Json;
  location: Json;
  allocated_at: string;
  beneficiaries?: { name: string };
  disbursers?: { name: string };
}

export interface FraudAlert {
  id: string;
  beneficiary_id: string;
  disburser_id: string;
  location: Json;
  details?: string;
  attempted_at: string;
  beneficiaries?: { name: string };
  disbursers?: { name: string };
}

export interface LoginRequest {
  username?: string;
  phone_number?: string;
  password: string;
  role: 'admin' | 'disburser';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: Admin | Disburser;
  role?: 'admin' | 'disburser';
}
