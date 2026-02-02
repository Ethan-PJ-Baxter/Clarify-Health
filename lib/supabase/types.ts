export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      medications: {
        Row: {
          created_at: string | null
          dosage: string | null
          ended_at: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          reason: string | null
          started_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          ended_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          reason?: string | null
          started_at: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          ended_at?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          reason?: string | null
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          ai_model: string | null
          created_at: string | null
          date_range_end: string
          date_range_start: string
          executive_summary: string | null
          id: string
          nhs_links: Json | null
          patterns_detected: Json | null
          suggested_questions: string[] | null
          symptom_breakdown: Json | null
          symptom_count: number | null
          user_id: string | null
        }
        Insert: {
          ai_model?: string | null
          created_at?: string | null
          date_range_end: string
          date_range_start: string
          executive_summary?: string | null
          id?: string
          nhs_links?: Json | null
          patterns_detected?: Json | null
          suggested_questions?: string[] | null
          symptom_breakdown?: Json | null
          symptom_count?: number | null
          user_id?: string | null
        }
        Update: {
          ai_model?: string | null
          created_at?: string | null
          date_range_end?: string
          date_range_start?: string
          executive_summary?: string | null
          id?: string
          nhs_links?: Json | null
          patterns_detected?: Json | null
          suggested_questions?: string[] | null
          symptom_breakdown?: Json | null
          symptom_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          ai_characteristics: Json | null
          ai_conversation: Json | null
          body_coordinates: Json | null
          body_part: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          mapped_by_ai: boolean | null
          medications: string[] | null
          onset_date: string | null
          photo_urls: string[] | null
          relief_factors: string[] | null
          severity: number | null
          symptom_type: string
          triggers: string[] | null
          updated_at: string | null
          user_adjusted_location: boolean | null
          user_id: string | null
        }
        Insert: {
          ai_characteristics?: Json | null
          ai_conversation?: Json | null
          body_coordinates?: Json | null
          body_part: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          mapped_by_ai?: boolean | null
          medications?: string[] | null
          onset_date?: string | null
          photo_urls?: string[] | null
          relief_factors?: string[] | null
          severity?: number | null
          symptom_type: string
          triggers?: string[] | null
          updated_at?: string | null
          user_adjusted_location?: boolean | null
          user_id?: string | null
        }
        Update: {
          ai_characteristics?: Json | null
          ai_conversation?: Json | null
          body_coordinates?: Json | null
          body_part?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          mapped_by_ai?: boolean | null
          medications?: string[] | null
          onset_date?: string | null
          photo_urls?: string[] | null
          relief_factors?: string[] | null
          severity?: number | null
          symptom_type?: string
          triggers?: string[] | null
          updated_at?: string | null
          user_adjusted_location?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          conditions: string[] | null
          created_at: string | null
          date_of_birth: string | null
          gp_surgery: string | null
          id: string
          name: string | null
          onboarding_complete: boolean | null
          updated_at: string | null
        }
        Insert: {
          conditions?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          gp_surgery?: string | null
          id: string
          name?: string | null
          onboarding_complete?: boolean | null
          updated_at?: string | null
        }
        Update: {
          conditions?: string[] | null
          created_at?: string | null
          date_of_birth?: string | null
          gp_surgery?: string | null
          id?: string
          name?: string | null
          onboarding_complete?: boolean | null
          updated_at?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
