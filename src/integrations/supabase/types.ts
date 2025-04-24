export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      allocations: {
        Row: {
          allocated_at: string
          beneficiary_id: string
          disburser_id: string
          goods: Json
          id: string
          location: Json
        }
        Insert: {
          allocated_at?: string
          beneficiary_id: string
          disburser_id: string
          goods: Json
          id?: string
          location: Json
        }
        Update: {
          allocated_at?: string
          beneficiary_id?: string
          disburser_id?: string
          goods?: Json
          id?: string
          location?: Json
        }
        Relationships: [
          {
            foreignKeyName: "allocations_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allocations_disburser_id_fkey"
            columns: ["disburser_id"]
            isOneToOne: false
            referencedRelation: "disbursers"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          created_at: string
          estimated_age: number | null
          height: number | null
          id: string
          name: string
          region_id: string
          registered_by: string
          unique_identifiers: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_age?: number | null
          height?: number | null
          id?: string
          name: string
          region_id: string
          registered_by: string
          unique_identifiers: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_age?: number | null
          height?: number | null
          id?: string
          name?: string
          region_id?: string
          registered_by?: string
          unique_identifiers?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "disbursers"
            referencedColumns: ["id"]
          },
        ]
      }
      disbursers: {
        Row: {
          created_at: string
          id: string
          name: string
          password: string
          phone_number: string
          region_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          password: string
          phone_number: string
          region_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          password?: string
          phone_number?: string
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disbursers_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_alerts: {
        Row: {
          attempted_at: string
          beneficiary_id: string
          details: string | null
          disburser_id: string
          id: string
          location: Json
        }
        Insert: {
          attempted_at?: string
          beneficiary_id: string
          details?: string | null
          disburser_id: string
          id?: string
          location: Json
        }
        Update: {
          attempted_at?: string
          beneficiary_id?: string
          details?: string | null
          disburser_id?: string
          id?: string
          location?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_alerts_disburser_id_fkey"
            columns: ["disburser_id"]
            isOneToOne: false
            referencedRelation: "disbursers"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      regional_goods: {
        Row: {
          created_at: string
          goods_type_id: string
          id: string
          quantity: number
          region_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          goods_type_id: string
          id?: string
          quantity?: number
          region_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          goods_type_id?: string
          id?: string
          quantity?: number
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regional_goods_goods_type_id_fkey"
            columns: ["goods_type_id"]
            isOneToOne: false
            referencedRelation: "goods_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regional_goods_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
