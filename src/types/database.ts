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

export interface Good {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  created_at: string;
}

export interface Region {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Disburser {
  id: string;
  name: string;
  phone_number: string;
  region_id: string;
  password: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  regions?: {
    name: string;
  };
}

export interface Beneficiary {
  id: string;
  name: string;
  estimated_age: number;
  height: number;
  region_id: string;
  registered_by: string;
  unique_identifiers: {
    [key: string]: string;
    national_id?: string;
    passport?: string;
    birth_certificate?: string;
  };
  created_at: string;
  updated_at: string;
  regions?: {
    name: string;
  };
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
  goods_id: string;
  allocated_by: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  beneficiaries?: Beneficiary;
  location?: Region;
}

export interface FraudAlert {
  id: string;
  beneficiary_id: string;
  type: string;
  description: string;
  status: 'open' | 'resolved' | 'false_positive';
  created_at: string;
  updated_at: string;
  beneficiaries?: Beneficiary;
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

export interface Goods {
  id: string;
  name: string;
  description: string;
  unit: string;
  created_at: string;
  updated_at: string;
}
